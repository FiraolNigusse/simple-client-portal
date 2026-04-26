import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from django.contrib.auth import get_user_model
from apps.clients.models import Client
from apps.projects.models import Project
from apps.invoices.models import Invoice

User = get_user_model()
users = User.objects.all()

print(f"Total users: {users.count()}")
for user in users:
    clients = Client.objects.filter(freelancer=user)
    projects = Project.objects.filter(client__freelancer=user)
    invoices = Invoice.objects.filter(client__freelancer=user)
    print(f"User: {user.email} (Name: {getattr(user, 'name', 'N/A')})")
    print(f"  - Clients: {clients.count()}")
    print(f"  - Projects: {projects.count()}")
    print(f"  - Invoices: {invoices.count()}")
