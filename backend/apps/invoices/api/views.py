from rest_framework import generics, permissions
from ..models import Invoice
from .serializers import InvoiceSerializer


class InvoiceListCreateView(generics.ListCreateAPIView):
    """
    GET  /invoices/   — list all invoices for the authenticated freelancer
    POST /invoices/   — create a new invoice
    """
    serializer_class = InvoiceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Only return invoices belonging to the freelancer's own clients
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
