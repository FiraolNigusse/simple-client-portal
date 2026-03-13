from rest_framework import serializers
from ..models import Message


class MessageSerializer(serializers.ModelSerializer):
    sender_label = serializers.CharField(
        source="get_sender_type_display", read_only=True
    )

    class Meta:
        model = Message
        fields = [
            "id",
            "project",
            "sender_type",
            "sender_label",
            "content",
            "created_at",
        ]
        read_only_fields = ["created_at"]
