import logging
import resend
from django.conf import settings

logger = logging.getLogger(__name__)

# Configure Resend
resend.api_key = getattr(settings, "RESEND_API_KEY", "")

def send_invoice_notification(invoice):
    """
    Sends an email notification to the client when a new invoice is created.
    """
    if not resend.api_key:
        logger.warning("No RESEND_API_KEY configured. Skipping notification.")
        return

    client = invoice.client
    portal_link = f"{settings.FRONTEND_ORIGIN}/portal/{client.portal_token}"

    subject = "New Invoice from Mela"
    
    body = (
        f"Hello {client.name},\n\n"
        f"You have a new invoice.\n\n"
        f"View it here:\n"
        f"{portal_link}\n\n"
        f"Amount: ${invoice.amount}\n"
        f"Due Date: {invoice.due_date or 'N/A'}"
    )

    try:
        from_email = getattr(settings, "RESEND_FROM_EMAIL", "onboarding@resend.dev")
        params = {
            "from": from_email,
            "to": [client.email],
            "subject": subject,
            "text": body,
        }
        resend.Emails.send(params)
        logger.info(f"Invoice notification sent to {client.email} for invoice #{invoice.id}")
    except Exception as e:
        logger.error(f"Failed to send invoice notification to {client.email}: {e}", exc_info=True)
