from django.conf import settings
from django.utils import timezone
from rest_framework import serializers

from ..models import Client


class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = ("id", "name", "email", "company", "portal_token", "created_at")
        read_only_fields = ("id", "portal_token", "created_at")


class ClientDetailSerializer(ClientSerializer):
    portal_link = serializers.SerializerMethodField()

    class Meta(ClientSerializer.Meta):
        fields = ClientSerializer.Meta.fields + ("portal_link",)

    def get_portal_link(self, obj: Client) -> str | None:
        frontend_origin = getattr(settings, "FRONTEND_ORIGIN", "http://localhost:5173")
        return f"{frontend_origin}/portal/{obj.portal_token}"


class ClientPortalRegenerateSerializer(serializers.Serializer):
    client_id = serializers.IntegerField()

    def validate_client_id(self, value: int) -> int:
        request = self.context.get("request")
        qs = Client.objects.filter(id=value, freelancer=request.user)
        if not qs.exists():
            raise serializers.ValidationError("Client not found.")
        return value

    def save(self, **kwargs):
        client_id = self.validated_data["client_id"]
        client = Client.objects.get(id=client_id)
        client.regenerate_portal_token()
        return client

