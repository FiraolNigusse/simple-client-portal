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

import urllib.request
from django.http import StreamingHttpResponse
from django.shortcuts import get_object_or_404

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
            # Ensure we have the latest data including the saved pdf_file
            invoice.refresh_from_db()
            # Return our local proxy URL instead of direct Cloudinary URL
            from django.urls import reverse
            proxy_url = request.build_absolute_uri(
                reverse("api:invoice-pdf-download", kwargs={"pk": invoice.id})
            )
            return Response({"message": "PDF generated successfully", "pdf_url": proxy_url})
        return Response({"error": "PDF generation failed"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class InvoicePDFDownloadView(APIView):
    """
    GET /api/invoices/{id}/download/
    Proxies the PDF from storage to avoid domain/auth issues.
    """
    permission_classes = [permissions.IsAuthenticated, IsOwner]

    def get_queryset(self):
        return Invoice.objects.filter(client__freelancer=self.request.user)

    def get(self, request, pk):
        invoice = get_object_or_404(self.get_queryset(), pk=pk)
        
        if not invoice.pdf_file:
            return Response({"error": "PDF not generated yet"}, status=404)

        url = invoice.pdf_file.url
        
        # Proxy the request
        try:
            req = urllib.request.Request(url)
            response = urllib.request.urlopen(req)
            
            django_response = StreamingHttpResponse(
                (chunk for chunk in iter(lambda: response.read(8192), b"")),
                content_type="application/pdf"
            )
            
            filename = f"invoice_{invoice.invoice_number}.pdf"
            django_response["Content-Disposition"] = f'inline; filename="{filename}"'
            return django_response
            
        except Exception as e:
            logger.error(f"PDF Proxy error for invoice {pk}: {str(e)}")
            return Response({"error": "Failed to fetch PDF from storage"}, status=502)


class InvoiceMetricsView(APIView):
    """
    GET /invoices/metrics/ — return financial metrics for the dashboard
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        now = timezone.now()
        start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        
        print(f"DEBUG: Invoice Metrics request for user {user.email}")
        
        # Base queryset for this user's invoices
        invoices = Invoice.objects.filter(client__freelancer=user)
        print(f"DEBUG: Found {invoices.count()} total invoices for user {user.email}")
        
        # 1. Total Outstanding
        from django.db.models.functions import Coalesce
        from decimal import Decimal
        total_outstanding = invoices.exclude(
            status__in=[Invoice.STATUS_PAID, Invoice.STATUS_CANCELLED]
        ).aggregate(
            res=Sum(Coalesce(F("total_amount"), Decimal("0.00")) - F("amount_paid"))
        )["res"] or 0
        
        # 2. Overdue Balance
        overdue_balance = invoices.filter(
            status=Invoice.STATUS_OVERDUE
        ).aggregate(
            res=Sum(Coalesce(F("total_amount"), Decimal("0.00")) - F("amount_paid"))
        )["res"] or 0
        
        # 3. Paid this month
        paid_this_month = Payment.objects.filter(
            invoice__client__freelancer=user,
            payment_date__gte=start_of_month
        ).aggregate(res=Sum("amount"))["res"] or 0
        
        # 4. Invoices sent this month
        invoices_sent_this_month = invoices.filter(
            issue_date__gte=start_of_month.date()
        ).count()
        
        # 5. Collection Rate (%)
        totals = invoices.aggregate(
            total_invoiced=Sum(Coalesce("total_amount", Decimal("0.00"))),
            total_paid=Sum("amount_paid")
        )
        total_invoiced = float(totals["total_invoiced"] or 0)
        total_paid_all = float(totals["total_paid"] or 0)
        collection_rate = (total_paid_all / total_invoiced * 100) if total_invoiced > 0 else 0
        
        # 6. Average Payment Time (Days)
        payments_qs = Payment.objects.filter(invoice__client__freelancer=user)
        avg_days = 0
        if payments_qs.exists():
            avg_payment_time = payments_qs.annotate(
                days_to_pay=F("payment_date") - F("invoice__issue_date")
            ).aggregate(res=Avg("days_to_pay"))["res"]
            
            if avg_payment_time:
                # Handle both timedelta and potentially raw seconds/days depending on DB backend
                if hasattr(avg_payment_time, "days"):
                    avg_days = avg_payment_time.days
                elif isinstance(avg_payment_time, (int, float)):
                    avg_days = int(avg_payment_time)

        return Response({
            "total_outstanding": float(total_outstanding),
            "overdue_balance": float(overdue_balance),
            "paid_this_month": float(paid_this_month),
            "invoices_sent_this_month": invoices_sent_this_month,
            "collection_rate": round(collection_rate, 2),
            "average_payment_time_days": avg_days,
            "currency": "USD",
        })