from django.contrib import admin
from .models import Lead

@admin.register(Lead)
class LeadAdmin(admin.ModelAdmin):
    list_display = ("name", "platform", "role", "warmth", "stage", "user", "created_at")
    list_filter  = ("warmth", "stage", "platform")
    search_fields = ("name", "contact", "niche", "role")
