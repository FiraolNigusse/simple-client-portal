from django.db import models
from django.conf import settings
from django.core.validators import FileExtensionValidator
from django.core.exceptions import ValidationError
from apps.projects.models import Project


def validate_file_size(value):
    limit = 10 * 1024 * 1024 # 10MB
    if value.size > limit:
        raise ValidationError('File too large. Size should not exceed 10 MiB.')



class ProjectFile(models.Model):
    project = models.ForeignKey(
        Project, 
        on_delete=models.CASCADE, 
        related_name="files"
    )
    file = models.FileField(
        upload_to="project_files/%Y/%m/%d/",
        validators=[
            FileExtensionValidator(allowed_extensions=['pdf', 'docx', 'png', 'jpg', 'zip']),
            validate_file_size
        ]
    )
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE,
        related_name="uploaded_files"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.file.name} - {self.project.title}"

