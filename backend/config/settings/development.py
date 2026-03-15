from .base import *

DEBUG = True

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": config("POSTGRES_DB", default="client_portal_db"),
        "USER": config("POSTGRES_USER", default="client_portal"),
        "PASSWORD": config("POSTGRES_PASSWORD", default="strongpassword"),
        "HOST": config("POSTGRES_HOST", default="127.0.0.1"),
        "PORT": config("POSTGRES_PORT", default="5432"),
        "CONN_MAX_AGE": 600,
    }
}

MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"
