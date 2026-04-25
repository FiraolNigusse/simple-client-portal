from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from ..models import Invoice, Payment
from .serializers import InvoiceSerializer, PaymentSerializer

class PublicInvoiceDetailView(generics.RetrieveAPIView):
    """
    Publicly accessible invoice detail via UUID.
    No authentication required.
    """
    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = "uuid"
    
    def get_object(self):
        obj = super().get_object()
        # Track last viewed
        from django.utils import timezone
        obj.last_viewed_at = timezone.now()
        obj.save(update_fields=["last_viewed_at"])
        return obj

class PublicPaymentConfirmView(APIView):
    """
    Endpoint for clients to confirm they have made a payment (manual flow).
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request, uuid):
        invoice = get_object_or_404(Invoice, uuid=uuid)
        amount = request.data.get("amount")
        reference = request.data.get("reference", "Manual confirmation")
        
        if not amount:
            return Response({"error": "Amount is required"}, status=status.HTTP_400_BAD_REQUEST)
            
        # Create a payment record (marked as pending/manual if we had a status on Payment)
        # For now, we assume this confirm flow records it directly as per "manual payment confirmation flow"
        Payment.objects.create(
            invoice=invoice,
            amount=amount,
            payment_method="manual",
            transaction_reference=reference,
            notes=f"Client confirmed payment via portal: {request.data.get('notes', '')}"
        )
        
        return Response({"message": "Payment confirmed and recorded."}, status=status.HTTP_201_CREATED)
