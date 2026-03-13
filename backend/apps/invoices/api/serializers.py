from rest_framework import serializers
from ..models import Invoice


class InvoiceSerializer(serializers.ModelSerializer):
    client_name = serializers.ReadOnlyField(source="client.name")
    project_title = serializers.ReadOnlyField(source="project.title")
    status_label = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = Invoice
        fields = [
            "id",
            "client",
            "client_name",
            "project",
            "project_title",
            "amount",
            "status",
            "status_label",
            "due_date",
            "created_at",
        ]
        read_only_fields = ["created_at"]
