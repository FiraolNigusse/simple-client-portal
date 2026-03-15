from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.mail import send_mail
from django.conf import settings
from .models import Invoice

@receiver(post_save, sender=Invoice)
def notify_client_invoice_created(sender, instance, created, **kwargs):
    if created:
        subject = f"New Invoice from {instance.client.freelancer.name}"
        message = (
            f"Hello {instance.client.name},\n\n"
            f"An invoice for ${instance.amount} has been created for you.\n"
            f"Due date: {instance.due_date}\n\n"
            f"You can view and pay it here: {settings.FRONTEND_URL}/portal/{instance.client.portal.access_token}/\n\n"
            f"Thank you!"
        )
        # In a real app, we would use an async task worker like Celery
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
