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

    def validate_client(self, value):
        request = self.context.get("request")
        if request and request.user and not request.user.is_anonymous:
            if value.freelancer_id != request.user.id:
                raise serializers.ValidationError("You cannot create invoices for this client.")
        return value

    def validate_project(self, value):
        if value is None:
            return value
        request = self.context.get("request")
        if request and request.user and not request.user.is_anonymous:
            if value.client.freelancer_id != request.user.id:
                raise serializers.ValidationError("This project does not belong to you.")
        return value
