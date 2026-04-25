from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from apps.invoices.models import Invoice
from apps.core.notifications import send_invoice_email

class Command(BaseCommand):
    help = "Sends scheduled invoice reminders based on due dates."

    def handle(self, *args, **options):
        today = timezone.now().date()
        
        # 1. 7 days before due date -> reminder email
        upcoming_7 = today + timedelta(days=7)
        invoices_7 = Invoice.objects.filter(
            due_date=upcoming_7,
            status__in=[Invoice.STATUS_SENT, Invoice.STATUS_PARTIAL],
            is_demo_data=False
        )
        for inv in invoices_7:
            self.stdout.write(f"Sending 7-day reminder for {inv.invoice_number}")
            send_invoice_email(inv, "reminder_upcoming")

        # 2. 1 day before due date -> urgent reminder
        upcoming_1 = today + timedelta(days=1)
        invoices_1 = Invoice.objects.filter(
            due_date=upcoming_1,
            status__in=[Invoice.STATUS_SENT, Invoice.STATUS_PARTIAL],
            is_demo_data=False
        )
        for inv in invoices_1:
            self.stdout.write(f"Sending urgent reminder for {inv.invoice_number}")
            send_invoice_email(inv, "reminder_urgent")

        # 3. 3 days after overdue -> overdue notice
        overdue_3 = today - timedelta(days=3)
        invoices_overdue = Invoice.objects.filter(
            due_date=overdue_3,
            status=Invoice.STATUS_OVERDUE,
            is_demo_data=False
        )
        for inv in invoices_overdue:
            self.stdout.write(f"Sending overdue notice for {inv.invoice_number}")
            send_invoice_email(inv, "overdue_notice")

        self.stdout.write(self.style.SUCCESS("Successfully processed invoice reminders"))
