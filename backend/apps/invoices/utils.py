import os
from io import BytesIO
from django.template.loader import get_template
from xhtml2pdf import pisa
from django.conf import settings
from django.core.files.base import ContentFile

def get_invoice_pdf_buffer(invoice):
    """
    Generates a professional PDF in memory and returns the BytesIO buffer.
    Bypasses storage entirely for reliable on-the-fly streaming.
    """
    template = get_template("invoices/invoice_pdf.html")
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
    pdf = pisa.pisaDocument(BytesIO(html.encode("UTF-8")), result)
    
    if not pdf.err:
        result.seek(0)
        return result
    return None

def generate_invoice_pdf(invoice):
    """
    Legacy helper: Generates PDF and saves to model.
    """
    try:
        buffer = get_invoice_pdf_buffer(invoice)
        if buffer:
            filename = f"invoice_{invoice.invoice_number}.pdf"
            invoice.pdf_file.save(filename, ContentFile(buffer.read()), save=True)
            return True
    except Exception as e:
        print(f"PDF Generation Exception: {str(e)}")
    return False
