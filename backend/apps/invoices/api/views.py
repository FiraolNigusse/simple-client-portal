from rest_framework import generics, permissions

from ..models import Invoice
from .serializers import InvoiceSerializer
from apps.users.permissions import PlanLimitMixin


class InvoiceListCreateView(PlanLimitMixin, generics.ListCreateAPIView):
    """
    GET  /invoices/   — list all invoices for the authenticated freelancer
    POST /invoices/   — create a new invoice (plan-limited)
    """
    serializer_class = InvoiceSerializer
    permission_classes = [permissions.IsAuthenticated]
    plan_resource = "invoices"

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
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Invoice.objects.filter(
            client__freelancer=self.request.user
        ).select_related("client", "project")
