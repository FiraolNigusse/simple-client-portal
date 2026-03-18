import uuid
from django.db import migrations


def gen_uuid(apps, schema_editor):
    Client = apps.get_model('clients', 'Client')
    for row in Client.objects.all():
        row.portal_token = uuid.uuid4()
        row.save(update_fields=['portal_token'])


class Migration(migrations.Migration):

    dependencies = [
        ('clients', '0002_client_portal_token'),
    ]

    operations = [
        migrations.RunPython(gen_uuid, reverse_code=migrations.RunPython.noop),
    ]
