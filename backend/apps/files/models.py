from django.db import models
from django.conf import settings
from django.core.validators import FileExtensionValidator
from django.core.exceptions import ValidationError
from apps.projects.models import Project


def validate_file_size(value):
    limit = 10 * 1024 * 1024  # 10MB
    if value.size > limit:
        raise ValidationError('File too large. Size should not exceed 10 MiB.')


def validate_file_type(value):
    """
    Validate MIME type to prevent extension spoofing.
    """
    allowed_mimes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/png',
        'image/jpeg',
        'application/zip',
        'application/x-zip-compressed',
    ]
    content_type = getattr(value, 'content_type', None)
    if content_type and content_type not in allowed_mimes:
        raise ValidationError(f'File type {content_type} is not allowed.')



import uuid
import os
from django.utils import timezone

def get_project_file_path(instance, filename):
    ext = filename.split('.')[-1]
    # Randomized filename to prevent snooping/collisions
    filename = f"{uuid.uuid4().hex}.{ext}"
    date_path = timezone.now().strftime("%Y/%m/%d")
    return os.path.join(f"project_files/{date_path}/", filename)


class ProjectFile(models.Model):
    project = models.ForeignKey(
        Project, 
        on_delete=models.CASCADE, 
        related_name="files"
    )
    # Legacy FileField — kept for backward compatibility with existing local/cloud files
    file = models.FileField(
        upload_to=get_project_file_path,
        validators=[
            FileExtensionValidator(allowed_extensions=['pdf', 'docx', 'png', 'jpg', 'zip']),
            validate_file_size,
            validate_file_type
        ],
        blank=True,
        null=True,
    )
    # Cloudinary authenticated upload fields
    public_id = models.CharField(
        max_length=500,
        blank=True,
        default="",
        help_text="Cloudinary public_id for authenticated uploads",
    )
    resource_type = models.CharField(
        max_length=20,
        default="auto",
        help_text="Cloudinary resource_type (image, video, raw, auto)",
    )
    file_size = models.BigIntegerField(
        default=0,
        help_text="File size in bytes, stored at upload time",
    )
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE,
        related_name="uploaded_files"
    )
    original_name = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    @property
    def is_cloudinary_authenticated(self):
        """True if this file was uploaded via Cloudinary authenticated upload."""
        return bool(self.public_id)

    @property
    def extension(self):
        name = self.original_name or (self.file.name if self.file else "")
        return name.rsplit(".", 1)[-1].lower() if "." in name else ""

    @property
    def is_previewable(self):
        return self.extension in ("jpg", "jpeg", "png", "svg", "gif", "webp", "pdf")

    def __str__(self) -> str:
        name = self.original_name or (self.file.name if self.file else self.public_id)
        return f"{name} - {self.project.title}"
