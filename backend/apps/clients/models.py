import secrets
import uuid

from django.conf import settings
from django.db import models
from django.utils import timezone


class Client(models.Model):
    id = models.BigAutoField(primary_key=True)
    freelancer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="clients",
    )
    name = models.CharField(max_length=255)
    email = models.EmailField()
    company = models.CharField(max_length=255, blank=True)
    portal_token = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    portal_token_expires_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ["-created_at"]
        unique_together = ("freelancer", "email")

    def regenerate_portal_token(self):
        self.portal_token = uuid.uuid4()
        # Tokens expire in 30 days by default
        self.portal_token_expires_at = timezone.now() + timezone.timedelta(days=30)
        self.save()

    def is_portal_token_valid(self):
        if not self.portal_token_expires_at:
            return True # If never set, consider it valid (legacy)
        return timezone.now() < self.portal_token_expires_at

    def __str__(self) -> str:
        return f"{self.name} ({self.email})"

