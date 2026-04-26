import uuid
from django.db import models
from django.utils import timezone
from django.core.validators import MinValueValidator
from decimal import Decimal
from apps.clients.models import Client
from apps.projects.models import Project


class Invoice(models.Model):
    STATUS_DRAFT = "draft"
    STATUS_SENT = "sent"
    STATUS_PARTIAL = "partial"
    STATUS_PAID = "paid"
    STATUS_OVERDUE = "overdue"
    STATUS_CANCELLED = "cancelled"

    STATUS_CHOICES = [
        (STATUS_DRAFT, "Draft"),
        (STATUS_SENT, "Sent"),
        (STATUS_PARTIAL, "Partial"),
        (STATUS_PAID, "Paid"),
        (STATUS_OVERDUE, "Overdue"),
        (STATUS_CANCELLED, "Cancelled"),
    ]

    # Unique token for secure public links
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, null=True)
    
    invoice_number = models.CharField(max_length=50, unique=True, db_index=True, null=True, blank=True)
    title = models.CharField(max_length=255, default="Untitled Invoice")
    description = models.TextField(blank=True)
    
    client = models.ForeignKey(
        Client,
        on_delete=models.CASCADE,
        related_name="invoices",
    )
    project = models.ForeignKey(
        Project,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="invoices",
    )
    
    issue_date = models.DateField(default=timezone.now)
    due_date = models.DateField(null=True, blank=True, db_index=True)
    
    total_amount = models.DecimalField(
        max_digits=12, 
        decimal_places=2, 
        validators=[MinValueValidator(Decimal("0.01"))],
        null=True, blank=True
    )
    amount_paid = models.DecimalField(
        max_digits=12, 
        decimal_places=2, 
        default=Decimal("0.00")
    )
    currency = models.CharField(max_length=3, default="USD")
    
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_DRAFT,
        db_index=True,
    )
    
    # Files & Links
    payment_link = models.URLField(max_length=500, blank=True, null=True)
    pdf_file = models.FileField(upload_to="invoices/pdfs/", null=True, blank=True)
    
    # Tracking
    reminder_sent_at = models.DateTimeField(null=True, blank=True)
    last_viewed_at = models.DateTimeField(null=True, blank=True)
    is_demo_data = models.BooleanField(default=False, db_index=True)
    
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.invoice_number} — {self.client} ({self.status})"

    @property
    def balance_due(self) -> Decimal:
        if self.total_amount is None:
            return Decimal("0.00")
        return self.total_amount - self.amount_paid

    @property
    def is_overdue(self) -> bool:
        if not self.due_date:
            return False
        return self.status != self.STATUS_PAID and self.due_date < timezone.now().date()

    @property
    def payment_progress_percent(self) -> float:
        if not self.total_amount or self.total_amount <= 0:
            return 0.0
        return float((self.amount_paid / self.total_amount) * 100)

    def update_status(self):
        """
        Intelligence Engine: Automatically determine status based on payments and due dates.
        """
        if self.status == self.STATUS_CANCELLED:
            return

        today = timezone.now().date()
        
        # Safety check for None total_amount
        total = self.total_amount or Decimal("0.00")
        
        if self.amount_paid >= total and total > 0:
            self.status = self.STATUS_PAID
        elif self.amount_paid > 0:
            if self.due_date and self.due_date < today:
                self.status = self.STATUS_OVERDUE
            else:
                self.status = self.STATUS_PARTIAL
        elif self.due_date and self.due_date < today:
            self.status = self.STATUS_OVERDUE
        elif self.status == self.STATUS_DRAFT:
            # Stay in draft until manually sent or marked as sent
            pass
        else:
            self.status = self.STATUS_SENT
            
    def save(self, *args, **kwargs):
        # Generate invoice number if not set
        if not self.invoice_number:
            prefix = "INV"
            count = Invoice.objects.count() + 1
            self.invoice_number = f"{prefix}-{timezone.now().year}-{count:04d}"
            
        self.update_status()
        super().save(*args, **kwargs)


class Payment(models.Model):
    invoice = models.ForeignKey(
        Invoice,
        on_delete=models.CASCADE,
        related_name="payments",
    )
    amount = models.DecimalField(
        max_digits=12, 
        decimal_places=2, 
        validators=[MinValueValidator(Decimal("0.01"))]
    )
    payment_date = models.DateTimeField(default=timezone.now)
    payment_method = models.CharField(max_length=50, blank=True)
    transaction_reference = models.CharField(max_length=100, blank=True)
    notes = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-payment_date"]

    def __str__(self) -> str:
        return f"Payment of {self.amount} for {self.invoice.invoice_number}"

    def save(self, *args, **kwargs):
        is_new = self._state.adding
        super().save(*args, **kwargs)
        
        if is_new:
            # Update invoice amount_paid
            invoice = self.invoice
            total_paid = Payment.objects.filter(invoice=invoice).aggregate(
                total=models.Sum("amount")
            )["total"] or Decimal("0.00")
            invoice.amount_paid = total_paid
            invoice.save()

