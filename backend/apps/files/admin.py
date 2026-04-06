from django.contrib import admin
from .models import ProjectFile


@admin.register(ProjectFile)
class ProjectFileAdmin(admin.ModelAdmin):
    list_display = ["id", "project", "original_name", "resource_type", "is_cloudinary_authenticated", "uploaded_by", "created_at"]
    list_filter = ["project", "resource_type"]
    search_fields = ["original_name", "public_id"]
    raw_id_fields = ["project", "uploaded_by"]
    readonly_fields = ["public_id", "resource_type", "file_size"]

    fieldsets = (
        (None, {
            "fields": ("project", "uploaded_by", "original_name", "file"),
        }),
        ("Cloudinary (Authenticated)", {
            "fields": ("public_id", "resource_type", "file_size"),
            "classes": ("collapse",),
        }),
    )
