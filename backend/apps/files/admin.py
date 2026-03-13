from django.contrib import admin
from .models import ProjectFile


@admin.register(ProjectFile)
class ProjectFileAdmin(admin.ModelAdmin):
    list_display = ["id", "project", "file", "uploaded_by", "created_at"]
    list_filter = ["project"]
    raw_id_fields = ["project", "uploaded_by"]
