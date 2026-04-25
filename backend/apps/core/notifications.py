import logging
import resend
from django.conf import settings
from django.template.loader import render_to_string
from django.utils import timezone

logger = logging.getLogger(__name__)

# Configure Resend
resend.api_key = getattr(settings, "RESEND_API_KEY", "")

def send_invoice_email(invoice, email_type="new_invoice"):
    """
    Sends various types of invoice emails (new, reminder, overdue).
    """
    if not resend.api_key:
        logger.warning("No RESEND_API_KEY configured. Skipping email.")
        return False

    client = invoice.client
    freelancer = client.freelancer
    
    # Public payment URL (Phase 4)
    payment_url = f"{settings.FRONTEND_ORIGIN}/pay/{invoice.uuid}"
    
    context = {
        "client_name": client.name,
        "invoice_number": invoice.invoice_number,
        "balance_due": invoice.balance_due,
        "currency": invoice.currency,
        "due_date": invoice.due_date.strftime("%b %d, %Y") if invoice.due_date else "N/A",
        "payment_url": payment_url,
        "freelancer_name": freelancer.get_full_name() or freelancer.username,
        "year": timezone.now().year,
    }

    templates = {
        "new_invoice": {
            "subject": f"New Invoice {invoice.invoice_number} from {context['freelancer_name']}",
            "template": "emails/invoices/new_invoice.html", # To be created or fallback
        },
        "reminder_upcoming": {
            "subject": f"Upcoming Payment Reminder: {invoice.invoice_number}",
            "template": "emails/invoices/reminder_upcoming.html",
        },
        "reminder_urgent": {
            "subject": f"Urgent: Payment Due Tomorrow ({invoice.invoice_number})",
            "template": "emails/invoices/reminder_urgent.html",
        },
        "overdue_notice": {
            "subject": f"OVERDUE NOTICE: Invoice {invoice.invoice_number}",
            "template": "emails/invoices/overdue_notice.html",
        },
    }

    config = templates.get(email_type)
    if not config:
        logger.error(f"Invalid email type: {email_type}")
        return False

    try:
        # Fallback to text if template fails
        try:
            html_content = render_to_string(config["template"], context)
        except Exception as te:
            logger.error(f"Template error for {email_type}: {te}")
            html_content = None

        from_email = getattr(settings, "RESEND_FROM_EMAIL", "onboarding@resend.dev")
        params = {
            "from": from_email,
            "to": [client.email],
            "subject": config["subject"],
        }
        
        if html_content:
            params["html"] = html_content
        else:
            # Basic text fallback
            params["text"] = f"Invoice {invoice.invoice_number} is {email_type.replace('_', ' ')}. View it at: {payment_url}"

        resend.Emails.send(params)
        logger.info(f"Invoice email ({email_type}) sent to {client.email} for {invoice.invoice_number}")
        
        # Track reminder sent
        if "reminder" in email_type or "overdue" in email_type:
            invoice.reminder_sent_at = timezone.now()
            invoice.save(update_fields=["reminder_sent_at"])
            
        return True
    except Exception as e:
        logger.error(f"Failed to send {email_type} to {client.email}: {e}", exc_info=True)
        return False

# Keep old function name for backward compatibility if needed, but redirect to new one
def send_invoice_notification(invoice):
    return send_invoice_email(invoice, "new_invoice")
