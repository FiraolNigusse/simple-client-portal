from rest_framework import serializers
from ..models import Invoice, Payment
from decimal import Decimal


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = [
            "id", 
            "amount", 
            "payment_date", 
            "payment_method", 
            "transaction_reference", 
            "notes", 
            "created_at"
        ]
        read_only_fields = ["created_at"]


class InvoiceSerializer(serializers.ModelSerializer):
    client_name = serializers.ReadOnlyField(source="client.name")
    project_title = serializers.ReadOnlyField(source="project.title")
    status_label = serializers.CharField(source="get_status_display", read_only=True)
    
    balance_due = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    is_overdue = serializers.BooleanField(read_only=True)
    payment_progress_percent = serializers.FloatField(read_only=True)
    
    payments = PaymentSerializer(many=True, read_only=True)

    class Meta:
        model = Invoice
        fields = [
            "id",
            "uuid",
            "invoice_number",
            "title",
            "description",
            "client",
            "client_name",
            "project",
            "project_title",
            "issue_date",
            "due_date",
            "total_amount",
            "amount_paid",
            "balance_due",
            "currency",
            "status",
            "status_label",
            "payment_link",
            "pdf_file",
            "reminder_sent_at",
            "last_viewed_at",
            "is_overdue",
            "payment_progress_percent",
            "is_demo_data",
            "payments",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "uuid", 
            "invoice_number", 
            "amount_paid", 
            "balance_due", 
            "is_overdue", 
            "payment_progress_percent", 
            "created_at", 
            "updated_at"
        ]

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
