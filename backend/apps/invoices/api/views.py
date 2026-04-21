from rest_framework import generics, permissions

from ..models import Invoice
from .serializers import InvoiceSerializer
from apps.users.permissions import PlanLimitMixin
from apps.core.permissions import IsOwner



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
            metadata={"invoice_id": invoice.id, "amount": float(invoice.amount), "client": invoice.client.name}
        )

        # Logging
        import logging
        logger = logging.getLogger("apps.invoices")
        logger.info(f"User {self.request.user.id} created invoice {invoice.id} for amount {invoice.amount}")

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
