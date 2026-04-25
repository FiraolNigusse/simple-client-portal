from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
from django.utils import timezone
from django.db.models import Sum, Avg, F
import logging

from ..models import Invoice, Payment
from .serializers import InvoiceSerializer
from apps.users.permissions import PlanLimitMixin
from apps.core.permissions import IsOwner
from ..utils import generate_invoice_pdf

logger = logging.getLogger("apps.invoices")


class InvoiceListCreateView(PlanLimitMixin, generics.ListCreateAPIView):
    """
    GET  /invoices/   — list all invoices for the authenticated freelancer
    POST /invoices/   — create a new invoice (plan-limited)
    """
    serializer_class = InvoiceSerializer
    permission_classes = [permissions.IsAuthenticated]
    plan_resource = "invoices"

    def perform_create(self, serializer):
        invoice = serializer.save()
        # Non-blocking notification
        from apps.core.notifications import send_invoice_notification
        send_invoice_notification(invoice)
        
        # Analytics
        from apps.analytics.utils import track_event
        track_event(
            user=self.request.user,
            event_type="invoice_sent",
            metadata={"invoice_id": invoice.id, "amount": float(invoice.total_amount), "client": invoice.client.name}
        )

        logger.info(f"User {self.request.user.id} created invoice {invoice.id} for amount {invoice.total_amount}")

    def get_plan_count(self) -> int:
        return Invoice.objects.filter(client__freelancer=self.request.user).count()

    def get_queryset(self):
        return Invoice.objects.filter(
            client__freelancer=self.request.user
        ).select_related("client", "project")


class InvoiceDetailView(generics.RetrieveUpdateAPIView):
    """
    GET   /invoices/{id}/  — retrieve a single invoice
    PATCH /invoices/{id}/  — update status (e.g. mark as paid)
    """
    serializer_class = InvoiceSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]

    def get_queryset(self):
        return Invoice.objects.filter(
            client__freelancer=self.request.user
        ).select_related("client", "project")

    def patch(self, request, *args, **kwargs):
        response = super().patch(request, *args, **kwargs)
        if "generate_pdf" in request.data:
            invoice = self.get_object()
            generate_invoice_pdf(invoice)
        return response

    def post(self, request, *args, **kwargs):
        # Allow POST to /invoices/{id}/ to trigger PDF generation
        invoice = self.get_object()
        success = generate_invoice_pdf(invoice)
        if success:
            return Response({"message": "PDF generated successfully", "pdf_url": invoice.pdf_file.url})
        return Response({"error": "PDF generation failed"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class InvoiceMetricsView(APIView):
    """
    GET /invoices/metrics/ — return financial metrics for the dashboard
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        now = timezone.now()
        start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        
        # Base queryset for this user's invoices (excluding demo data)
        invoices = Invoice.objects.filter(client__freelancer=user, is_demo_data=False)
        
        # 1. Total Outstanding
        total_outstanding = invoices.exclude(
            status__in=[Invoice.STATUS_PAID, Invoice.STATUS_CANCELLED]
        ).aggregate(
            res=Sum(F("total_amount") - F("amount_paid"))
        )["res"] or 0
        
        # 2. Overdue Balance
        overdue_balance = invoices.filter(
            status=Invoice.STATUS_OVERDUE
        ).aggregate(
            res=Sum(F("total_amount") - F("amount_paid"))
        )["res"] or 0
        
        # 3. Paid this month
        paid_this_month = Payment.objects.filter(
            invoice__client__freelancer=user,
            invoice__is_demo_data=False,
            payment_date__gte=start_of_month
        ).aggregate(res=Sum("amount"))["res"] or 0
        
        # 4. Invoices sent this month
        invoices_sent_this_month = invoices.filter(
            issue_date__gte=start_of_month.date()
        ).count()
        
        # 5. Collection Rate (%)
        totals = invoices.aggregate(
            total_invoiced=Sum("total_amount"),
            total_paid=Sum("amount_paid")
        )
        total_invoiced = totals["total_invoiced"] or 1
        total_paid_all = totals["total_paid"] or 0
        collection_rate = (total_paid_all / total_invoiced) * 100
        
        # 6. Average Payment Time (Days)
        avg_payment_time = Payment.objects.filter(
            invoice__client__freelancer=user,
            invoice__is_demo_data=False
        ).annotate(
            days_to_pay=F("payment_date") - F("invoice__issue_date")
        ).aggregate(res=Avg("days_to_pay"))["res"]
        
        avg_days = avg_payment_time.days if avg_payment_time else 0

        return Response({
            "total_outstanding": float(total_outstanding),
            "overdue_balance": float(overdue_balance),
            "paid_this_month": float(paid_this_month),
            "invoices_sent_this_month": invoices_sent_this_month,
            "collection_rate": round(float(collection_rate), 2),
            "average_payment_time_days": avg_days,
            "currency": "USD",
        })