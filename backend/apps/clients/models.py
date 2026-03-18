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
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ["-created_at"]
        unique_together = ("freelancer", "email")

    def __str__(self) -> str:
        return f"{self.name} ({self.email})"

