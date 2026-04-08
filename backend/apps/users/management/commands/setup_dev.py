from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.users.models import Subscription

User = get_user_model()

class Command(BaseCommand):
    help = 'Create a developer account with Agency plan'

    def add_arguments(self, parser):
        parser.add_argument('--email', type=str, help='Email for the dev account', default='dev@example.com')
        parser.add_argument('--password', type=str, help='Password for the dev account', default='devpassword123')
        parser.add_argument('--name', type=str, help='Name for the dev account', default='Developer Admin')

    def handle(self, *args, **options):
        email = options['email']
        password = options['password']
        name = options['name']

        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                'name': name,
                'is_staff': True,
                'is_superuser': True,
            }
        )

        if created:
            user.set_password(password)
            user.save()
            self.stdout.write(self.style.SUCCESS(f'Successfully created dev user: {email}'))
        else:
            self.stdout.write(self.style.WARNING(f'User {email} already exists. Promoting to superuser...'))
            user.is_staff = True
            user.is_superuser = True
            user.save()

        # Set subscription to Agency
        user.plan = Subscription.PLAN_AGENCY
        user.plan_status = Subscription.STATUS_ACTIVE
        user.save()

        self.stdout.write(self.style.SUCCESS(f'Subscription set to AGENCY and status set to ACTIVE for {email}'))
        self.stdout.write(self.style.NOTICE(f'Login with: {email} / {password}'))
