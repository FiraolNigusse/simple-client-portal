import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from apps.users.models import User

if not User.objects.filter(email='admin@example.com').exists():
    User.objects.create_superuser('admin@example.com', 'admin123')
    print("Superuser created")
else:
    print("Superuser already exists")
