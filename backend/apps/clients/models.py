import secrets

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
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ["-created_at"]
        unique_together = ("freelancer", "email")

    def __str__(self) -> str:
        return f"{self.name} ({self.email})"


class ClientPortal(models.Model):
    id = models.BigAutoField(primary_key=True)
    client = models.OneToOneField(
        Client,
        on_delete=models.CASCADE,
        related_name="portal",
    )
    access_token = models.CharField(max_length=128, unique=True)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"Portal for {self.client}"

    @staticmethod
    def generate_secure_token() -> str:
        # URL-safe random token, long enough to be hard to guess.
        return secrets.token_urlsafe(32)

