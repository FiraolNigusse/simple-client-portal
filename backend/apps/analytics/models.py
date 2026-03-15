from django.db import models
from django.conf import settings
from apps.clients.models import Client

class AuditLog(models.Model):
    ACTION_VIEW = "view"
    ACTION_DOWNLOAD = "download"
    ACTION_UPLOAD = "upload"
    
    ACTION_CHOICES = [
        (ACTION_VIEW, "View"),
        (ACTION_DOWNLOAD, "Download"),
        (ACTION_UPLOAD, "Upload"),
    ]

    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name="audit_logs")
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    resource_type = models.CharField(max_length=50)  # e.g. "invoice", "file"
    resource_id = models.IntegerField()
    metadata = models.JSONField(default=dict, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.client.name} - {self.action} {self.resource_type} ({self.created_at})"
