from rest_framework import serializers
from .models import Lead

class LeadSerializer(serializers.ModelSerializer):
    warmth_label = serializers.CharField(source="get_warmth_display", read_only=True)
    stage_label = serializers.CharField(source="get_stage_display", read_only=True)

    class Meta:
        model = Lead
        fields = (
            "id", "user", "name", "platform", "role", "niche", "contact", 
            "audience_size", "warmth", "warmth_label", "stage", "stage_label",
            "notes", "sent", "replied", "demo", "converted", 
            "created_at", "updated_at"
        )
        read_only_fields = ("id", "user", "created_at", "updated_at", "sent", "replied", "demo", "converted")
