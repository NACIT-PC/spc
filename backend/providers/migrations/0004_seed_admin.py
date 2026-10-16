import os

from django.db import migrations


def seed_admin(apps, schema_editor):
    User = apps.get_model("auth", "User")
    if User.objects.filter(is_superuser=True).exists():
        return
    # ponytail: demo seed only; set DJANGO_ADMIN_PASSWORD on real hosts
    User.objects.create_superuser(
        username="admin",
        email="admin@example.com",
        password=os.environ.get("DJANGO_ADMIN_PASSWORD", "admin12345"),
    )


def unseed_admin(apps, schema_editor):
    apps.get_model("auth", "User").objects.filter(username="admin").delete()


class Migration(migrations.Migration):

    dependencies = [
        ("auth", "__latest__"),
        ("providers", "0003_alter_providermodel_phone"),
    ]

    operations = [
        migrations.RunPython(seed_admin, unseed_admin),
    ]
