from django.utils import timezone
from django.db import models

class UserActivityMiddleware:
    """
    Middleware to update 'last_active' timestamp for authenticated users.
    Efficiently updates only the 'last_active' field.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.user.is_authenticated:
            # We use update_fields to minimize DB write impact
            # and only update every minute to avoid excessive writes
            last_active = request.user.last_active
            now = timezone.now()
            
            if not last_active or (now - last_active).total_seconds() > 60:
                request.user.last_active = now
                request.user.save(update_fields=["last_active"])
        
        return self.get_response(request)
