from django.db import models
from django.conf import settings

class Lead(models.Model):
    WARMTH_CHOICES = [
        ('cold', 'Cold'),
        ('warm', 'Warm'),
        ('hot', 'Hot'),
    ]
    
    STAGE_CHOICES = [
        ('lead', 'Lead'),
        ('sent', 'Sent'),
        ('replied', 'Replied'),
        ('demo', 'Demo'),
        ('converted', 'Converted'),
        ('lost', 'Lost'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="leads"
    )
    name = models.CharField(max_length=255)
    platform = models.CharField(max_length=100, blank=True)
    role = models.CharField(max_length=255, blank=True)
    niche = models.CharField(max_length=255, blank=True)
    contact = models.CharField(max_length=255, blank=True)
    audience_size = models.CharField(max_length=50, blank=True)
    warmth = models.CharField(
        max_length=10, 
        choices=WARMTH_CHOICES, 
        default='cold'
    )
    stage = models.CharField(
        max_length=20, 
        choices=STAGE_CHOICES, 
        default='lead'
    )
    notes = models.TextField(blank=True)
    
    # Flags for pipeline visualization
    sent = models.BooleanField(default=False)
    replied = models.BooleanField(default=False)
    demo = models.BooleanField(default=False)
    converted = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.name} ({self.stage})"

    def save(self, *args, **kwargs):
        # Automatically update flags based on stage
        if self.stage == 'sent':
            self.sent = True
        elif self.stage == 'replied':
            self.sent = True
            self.replied = True
        elif self.stage == 'demo':
            self.sent = True
            self.replied = True
            self.demo = True
        elif self.stage == 'converted':
            self.sent = True
            self.replied = True
            self.demo = True
            self.converted = True
        elif self.stage == 'lead':
            self.sent = False
            self.replied = False
            self.demo = False
            self.converted = False
        
        super().save(*args, **kwargs)
