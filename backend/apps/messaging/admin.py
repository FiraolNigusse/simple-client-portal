from django.contrib import admin
from .models import Message


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ["id", "project", "sender_type", "content", "created_at"]
    list_filter = ["sender_type", "project"]
    search_fields = ["content"]
