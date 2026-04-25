from django.contrib import admin
from .models import Invoice, Payment


class PaymentInline(admin.TabularInline):
    model = Payment
    extra = 0
    readonly_fields = ["created_at"]


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = [
        "invoice_number", 
        "client", 
        "total_amount", 
        "amount_paid", 
        "status", 
        "due_date", 
        "is_demo_data"
    ]
    list_filter = ["status", "is_demo_data", "issue_date", "due_date"]
    search_fields = ["invoice_number", "client__name", "project__title", "title"]
    raw_id_fields = ["client", "project"]
    readonly_fields = ["uuid", "invoice_number", "amount_paid", "created_at", "updated_at"]
    inlines = [PaymentInline]


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ["invoice", "amount", "payment_date", "payment_method"]
    list_filter = ["payment_date", "payment_method"]
    search_fields = ["invoice__invoice_number", "transaction_reference"]
    raw_id_fields = ["invoice"]
