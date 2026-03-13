from django.contrib import admin
from .models import Invoice


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ["id", "client", "project", "amount", "status", "due_date", "created_at"]
    list_filter = ["status"]
    search_fields = ["client__name", "project__title"]
    raw_id_fields = ["client", "project"]
