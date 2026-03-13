from django.contrib.auth.base_user import AbstractBaseUser, BaseUserManager
from django.contrib.auth.models import PermissionsMixin
from django.db import models
from django.conf import settings
from django.utils import timezone


class UserManager(BaseUserManager):
    use_in_migrations = True

    def _create_user(self, email: str, password: str | None, **extra_fields):
        if not email:
            raise ValueError("The email address must be set")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_user(self, email: str, password: str | None = None, **extra_fields):
        extra_fields.setdefault("is_staff", False)
        extra_fields.setdefault("is_superuser", False)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email: str, password: str | None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        return self._create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    id = models.BigAutoField(primary_key=True)
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=255, blank=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS: list[str] = []

    class Meta:
        verbose_name = "user"
        verbose_name_plural = "users"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return self.email


# ---------------------------------------------------------------------------
# Subscription — one per user, created lazily on first access
# ---------------------------------------------------------------------------

PLAN_LIMITS = {
    "starter":      {"clients": 5,    "projects": 10,  "invoices": 10},
    "professional": {"clients": 25,   "projects": 50,  "invoices": 100},
    "agency":       {"clients": None, "projects": None, "invoices": None},
}


class Subscription(models.Model):
    PLAN_STARTER = "starter"
    PLAN_PROFESSIONAL = "professional"
    PLAN_AGENCY = "agency"

    PLAN_CHOICES = [
        (PLAN_STARTER, "Starter"),
        (PLAN_PROFESSIONAL, "Professional"),
        (PLAN_AGENCY, "Agency"),
    ]

    STATUS_ACTIVE = "active"
    STATUS_CANCELLED = "cancelled"
    STATUS_PAST_DUE = "past_due"

    STATUS_CHOICES = [
        (STATUS_ACTIVE, "Active"),
        (STATUS_CANCELLED, "Cancelled"),
        (STATUS_PAST_DUE, "Past Due"),
    ]

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="subscription",
    )
    plan = models.CharField(
        max_length=20,
        choices=PLAN_CHOICES,
        default=PLAN_STARTER,
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_ACTIVE,
    )
    started_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ["-started_at"]

    def __str__(self) -> str:
        return f"{self.user.email} — {self.plan} ({self.status})"

    @property
    def limits(self) -> dict:
        return PLAN_LIMITS.get(self.plan, PLAN_LIMITS[self.PLAN_STARTER])

    def is_within_limit(self, resource: str, current_count: int) -> bool:
        limit = self.limits.get(resource)
        if limit is None:
            return True
        return current_count < limit

    @classmethod
    def get_or_create_for_user(cls, user) -> "Subscription":
        sub, _ = cls.objects.get_or_create(user=user)
        return sub

