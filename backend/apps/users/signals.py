"""
Django signals — auto-create Subscription when a new User registers.
"""
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings

from .models import Subscription


@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_subscription_for_new_user(sender, instance, created, **kwargs):
    if created:
        Subscription.objects.get_or_create(
            user=instance,
            defaults={
                "plan": getattr(instance, "plan", "starter"),
                "status": "active" if getattr(instance, "plan_status", "active") == "active" else "incomplete"
            }
        )

@receiver(post_save, sender=Subscription)
def sync_subscription_to_user(sender, instance, **kwargs):
    """
    Sync subscription data back to User model for legacy support/frontend parity.
    """
    user = instance.user
    changed = False
    
    if user.plan != instance.plan:
        user.plan = instance.plan
        changed = True
        
    # Sync status to plan_status
    if instance.status == Subscription.STATUS_ACTIVE and user.plan_status != "active":
        user.plan_status = "active"
        changed = True
    elif instance.status != Subscription.STATUS_ACTIVE and user.plan_status == "active":
        user.plan_status = "pending"  # or mapping appropriate status
        changed = True
        
    if changed:
        user.save()
