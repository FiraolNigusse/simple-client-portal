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

    def validate_project(self, value):
        request = self.context.get("request")
        if not request:
            return value
            
        # If freelancer is authenticated
        if request.user and not request.user.is_anonymous:
            if value.client.freelancer_id != request.user.id:
                raise serializers.ValidationError("This project does not belong to you.")
        
        # If client is authenticated via portal token (request.auth is Client)
        from apps.clients.models import Client
        if isinstance(request.auth, Client):
            if value.client_id != request.auth.id:
                raise serializers.ValidationError("Access denied to this project.")
                
        return value
