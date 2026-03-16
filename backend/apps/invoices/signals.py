from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.mail import send_mail
from django.conf import settings
from .models import Invoice

@receiver(post_save, sender=Invoice)
def notify_client_invoice_created(sender, instance, created, **kwargs):
    if created:
        freelancer_name = instance.client.freelancer.name or instance.client.freelancer.email
        portal = getattr(instance.client, 'portal', None)
        
        subject = f"New Invoice from {freelancer_name}"
        message = (
            f"Hello {instance.client.name},\n\n"
            f"An invoice for ${instance.amount} has been created for you.\n"
            f"Due date: {instance.due_date}\n\n"
        )
        
        if portal:
            portal_url = getattr(settings, "FRONTEND_URL", "http://localhost:5173")
            message += f"You can view and pay it here: {portal_url}/portal/{portal.access_token}/\n\n"
        
        message += "Thank you!"
        
        try:
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [instance.client.email],
                fail_silently=True,
            )
        except Exception:
            pass
