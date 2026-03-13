from django.db import models


class Task(models.Model):
    # Placeholder model so the app can migrate; extend later.
    created_at = models.DateTimeField(auto_now_add=True)

