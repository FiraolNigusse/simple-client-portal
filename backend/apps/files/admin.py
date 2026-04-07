from django.contrib import admin
from .models import ProjectFile


@admin.register(ProjectFile)
class ProjectFileAdmin(admin.ModelAdmin):
    list_display = ["id", "workspace", "project", "name", "resource_type", "is_cloudinary_authenticated", "uploaded_by", "created_at"]
    list_filter = ["workspace", "project", "resource_type"]
    search_fields = ["name", "public_id"]
    raw_id_fields = ["workspace", "project", "uploaded_by"]
    readonly_fields = ["public_id", "resource_type", "file_size"]

    fieldsets = (
        (None, {
            "fields": ("workspace", "project", "uploaded_by", "name", "file"),
        }),
        ("Cloudinary (Authenticated)", {
            "fields": ("public_id", "resource_type", "file_size"),
            "classes": ("collapse",),
        }),
    )
