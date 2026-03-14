from django.db import models
from apps.projects.models import Project


class Message(models.Model):
    SENDER_FREELANCER = "freelancer"
    SENDER_CLIENT = "client"

    SENDER_TYPE_CHOICES = [
        (SENDER_FREELANCER, "Freelancer"),
        (SENDER_CLIENT, "Client"),
    ]

    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name="messages",
    )
    sender_type = models.CharField(
        max_length=20,
        choices=SENDER_TYPE_CHOICES,
    )
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self) -> str:
        return f"[{self.sender_type}] {self.project.title}: {self.content[:40]}"


