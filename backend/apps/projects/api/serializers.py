from rest_framework import serializers

from apps.clients.models import Client
from ..models import Project


class ProjectSerializer(serializers.ModelSerializer):
    client_name = serializers.ReadOnlyField(source="client.name")

    class Meta:
        model = Project
        fields = ("id", "client", "client_name", "title", "description", "status", "created_at")
        read_only_fields = ("id", "client_name", "created_at")

    def validate_client(self, value: Client) -> Client:
        request = self.context.get("request")
        if not request or request.user.is_anonymous:
            raise serializers.ValidationError("Invalid user.")
        if value.freelancer_id != request.user.id:
            raise serializers.ValidationError("You cannot assign projects to this client.")
        return value

