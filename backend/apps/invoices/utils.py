import os
from io import BytesIO
from django.template.loader import get_template
from xhtml2pdf import pisa
from django.conf import settings
from django.core.files.base import ContentFile

def generate_invoice_pdf(invoice):
    """
    Generates a professional PDF for the given invoice and saves it to the model.
    """
    template = get_template("invoices/invoice_pdf.html")
    
    # Public payment URL for QR code (though we'd need a QR lib, let's just show the link)
    payment_url = f"{settings.FRONTEND_ORIGIN}/pay/{invoice.uuid}"
    
    context = {
        "invoice": invoice,
        "client": invoice.client,
        "freelancer": invoice.client.freelancer,
        "payment_url": payment_url,
        "static_url": settings.STATIC_URL,
    }
    
    html = template.render(context)
    result = BytesIO()
    
    # Create PDF
    pdf = pisa.pisaDocument(BytesIO(html.encode("UTF-8")), result)
    
    if not pdf.err:
        filename = f"invoice_{invoice.invoice_number}.pdf"
        invoice.pdf_file.save(filename, ContentFile(result.getvalue()), save=True)
        return True
    
    return False
