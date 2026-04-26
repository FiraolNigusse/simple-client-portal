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


import urllib.request
from django.http import StreamingHttpResponse

class PublicInvoicePDFDownloadView(APIView):
    """
    Publicly accessible PDF download via UUID.
    Used for browser window.open() which doesn't support headers.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request, uuid):
        try:
            invoice = get_object_or_404(Invoice, uuid=uuid)
            
            if not invoice.pdf_file:
                return Response({"error": "PDF not generated yet"}, status=404)

            url = invoice.pdf_file.url
            
            try:
                # Add a User-Agent to avoid being blocked by some CDNs
                req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
                response = urllib.request.urlopen(req)
                
                django_response = StreamingHttpResponse(
                    (chunk for chunk in iter(lambda: response.read(8192), b"")),
                    content_type="application/pdf"
                )
                
                filename = f"invoice_{invoice.invoice_number}.pdf"
                django_response["Content-Disposition"] = f'inline; filename="{filename}"'
                return django_response
                
            except Exception as e:
                import traceback
                return Response({
                    "error": f"Failed to fetch PDF from storage: {str(e)}",
                    "trace": traceback.format_exc(),
                    "url_attempted": url
                }, status=502)
        except Exception as e:
            import traceback
            return Response({
                "error": str(e),
                "trace": traceback.format_exc()
            }, status=500)
