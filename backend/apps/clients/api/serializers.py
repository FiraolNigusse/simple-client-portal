from django.conf import settings
from django.utils import timezone
from rest_framework import serializers

from ..models import Client, ClientPortal


class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = ("id", "name", "email", "company", "created_at")
        read_only_fields = ("id", "created_at")


class ClientDetailSerializer(ClientSerializer):
    portal_link = serializers.SerializerMethodField()

    class Meta(ClientSerializer.Meta):
        fields = ClientSerializer.Meta.fields + ("portal_link",)

    def get_portal_link(self, obj: Client) -> str | None:
        request = self.context.get("request")
        if not hasattr(obj, "portal"):
            return None
        base = getattr(settings, "SITE_DOMAIN", "localhost:8000")
        scheme = "https"
        if request is not None:
            scheme = request.scheme
        return f"{scheme}://{base}/portal/{obj.portal.access_token}"


class ClientPortalGenerateSerializer(serializers.Serializer):
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
        portal, created = ClientPortal.objects.get_or_create(client=client)
        if not created:
            portal.access_token = ClientPortal.generate_secure_token()
            portal.created_at = timezone.now()
            portal.save(update_fields=["access_token", "created_at"])
        return portal

