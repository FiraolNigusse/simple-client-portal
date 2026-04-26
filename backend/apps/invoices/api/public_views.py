from rest_framework import generics, permissions, status, parsers
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
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]
    
    def post(self, request, uuid):
        invoice = get_object_or_404(Invoice, uuid=uuid)
        amount = request.data.get("amount")
        reference = request.data.get("reference", "Manual confirmation")
        proof = request.FILES.get("proof_of_payment")
        
        if not amount:
            return Response({"error": "Amount is required"}, status=status.HTTP_400_BAD_REQUEST)
            
        # Create a payment record
        Payment.objects.create(
            invoice=invoice,
            amount=amount,
            payment_method="manual",
            transaction_reference=reference,
            proof_of_payment=proof,
            notes=f"Client confirmed payment via portal: {request.data.get('notes', '')}"
        )
        
        return Response({"message": "Payment confirmed and recorded."}, status=status.HTTP_201_CREATED)


import urllib.request
from django.http import StreamingHttpResponse

from django.http import FileResponse
from ..utils import get_invoice_pdf_buffer

class PublicInvoicePDFDownloadView(APIView):
    """
    Publicly accessible PDF download via UUID.
    Generates and streams the PDF on-the-fly to ensure 100% reliability.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request, uuid):
        try:
            invoice = Invoice.objects.filter(uuid=uuid).first()
            if not invoice:
                return Response({"error": "Invoice not found"}, status=404)
            
            # Generate the PDF in memory
            buffer = get_invoice_pdf_buffer(invoice)
            if not buffer:
                return Response({"error": "Failed to generate PDF"}, status=500)

            filename = f"invoice_{invoice.invoice_number}.pdf"
            return FileResponse(buffer, as_attachment=False, filename=filename, content_type='application/pdf')
            
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Public PDF Streaming failed: {str(e)}")
            return Response({"error": "Internal server error"}, status=500)
