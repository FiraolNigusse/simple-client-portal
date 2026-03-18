from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.mail import send_mail
from django.conf import settings
from .models import Message

@receiver(post_save, sender=Message)
def notify_new_message(sender, instance, created, **kwargs):
    if created:
        if instance.sender_type == Message.SENDER_FREELANCER:
            # Notify client
            subject = f"New message regarding {instance.project.title}"
            message = (
                f"Hello {instance.project.client.name},\n\n"
                f"You have a new message from {instance.project.client.freelancer.name}:\n\n"
                f"\"{instance.content[:100]}...\"\n\n"
                f"View it in your portal: {settings.FRONTEND_URL}/portal/{instance.project.client.portal_token}\n"
            )
            recipient = instance.project.client.email
        else:
            # Notify freelancer
            subject = f"Client message for {instance.project.title}"
            message = (
                f"Hello {instance.project.client.freelancer.name},\n\n"
                f"Your client {instance.project.client.name} sent a message:\n\n"
                f"\"{instance.content[:100]}...\"\n\n"
                f"View project: {settings.FRONTEND_URL}/projects/{instance.project.id}\n"
            )
            recipient = instance.project.client.freelancer.email

        try:
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [recipient],
                fail_silently=True,
            )
        except Exception:
            pass
