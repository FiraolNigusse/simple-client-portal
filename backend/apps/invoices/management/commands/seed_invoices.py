from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from apps.invoices.models import Invoice, Payment
from apps.clients.models import Client
from decimal import Decimal
import random

class Command(BaseCommand):
    help = "Seeds the database with demo invoices for testing metrics and UI."

    def handle(self, *args, **options):
        client = Client.objects.first()
        if not client:
            self.stdout.write(self.style.ERROR("No clients found. Please create a client first."))
            return

        today = timezone.now().date()
        
        demo_data = [
            {
                "title": "Branding & Identity Package",
                "total_amount": Decimal("2500.00"),
                "issue_date": today - timedelta(days=45),
                "due_date": today - timedelta(days=15),
                "status": Invoice.STATUS_PAID,
                "amount_paid": Decimal("2500.00"),
            },
            {
                "title": "Website Development - Milestone 1",
                "total_amount": Decimal("5000.00"),
                "issue_date": today - timedelta(days=10),
                "due_date": today + timedelta(days=20),
                "status": Invoice.STATUS_PARTIAL,
                "amount_paid": Decimal("1500.00"),
            },
            {
                "title": "Monthly SEO Retainer - March",
                "total_amount": Decimal("800.00"),
                "issue_date": today - timedelta(days=25),
                "due_date": today - timedelta(days=5),
                "status": Invoice.STATUS_OVERDUE,
                "amount_paid": Decimal("0.00"),
            },
            {
                "title": "UI/UX Consultation",
                "total_amount": Decimal("1200.00"),
                "issue_date": today - timedelta(days=2),
                "due_date": today + timedelta(days=28),
                "status": Invoice.STATUS_SENT,
                "amount_paid": Decimal("0.00"),
            }
        ]

        for data in demo_data:
            invoice = Invoice.objects.create(
                client=client,
                title=data["title"],
                total_amount=data["total_amount"],
                issue_date=data["issue_date"],
                due_date=data["due_date"],
                status=data["status"],
                amount_paid=data["amount_paid"],
                is_demo_data=True,
                description=f"Demo invoice for {data['title']}. This is sample data used for testing the system."
            )
            
            # Add some payments to partial/paid ones
            if data["amount_paid"] > 0:
                Payment.objects.create(
                    invoice=invoice,
                    amount=data["amount_paid"],
                    payment_date=timezone.now() - timedelta(days=random.randint(1, 10)),
                    payment_method="Stripe",
                    transaction_reference=f"demo_txn_{random.randint(1000, 9999)}"
                )

        self.stdout.write(self.style.SUCCESS(f"Successfully seeded {len(demo_data)} demo invoices."))
