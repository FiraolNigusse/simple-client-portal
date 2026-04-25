from rest_framework import generics, permissions, status
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from ..models import Invoice
from .serializers import InvoiceSerializer
from apps.clients.models import Client

class ClientPortalInvoiceListView(generics.ListAPIView):
    """
    List invoices for a client via their portal token.
    """
    serializer_class = InvoiceSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        token = self.kwargs.get("token")
        client = get_object_or_404(Client, portal_token=token)
        
        # Check if token is valid
        if not client.is_portal_token_valid():
            return Invoice.objects.none()
            
        return Invoice.objects.filter(client=client).exclude(status=Invoice.STATUS_DRAFT)

class ClientPortalInvoiceDetailView(generics.RetrieveAPIView):
    """
    Detail view for a specific invoice in the client portal.
    """
    serializer_class = InvoiceSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = "uuid"
    
    def get_queryset(self):
        token = self.kwargs.get("token")
        client = get_object_or_404(Client, portal_token=token)
        
        if not client.is_portal_token_valid():
            return Invoice.objects.none()
            
        return Invoice.objects.filter(client=client)
