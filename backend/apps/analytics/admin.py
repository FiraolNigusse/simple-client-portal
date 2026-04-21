from django.contrib import admin
from .models import AuditLog, Event

@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ("client", "action", "resource_type", "created_at")
    list_filter = ("action", "resource_type")
    search_fields = ("client__name", "resource_type")
    readonly_fields = ("created_at",)

@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ("user", "type", "created_at")
    list_filter = ("type",)
    search_fields = ("user__email", "type")
    readonly_fields = ("created_at",)
