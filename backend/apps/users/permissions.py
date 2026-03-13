"""
Reusable permission classes and mixins for plan-limit enforcement.
"""
from rest_framework.exceptions import PermissionDenied
from apps.users.models import Subscription


class PlanLimitMixin:
    """
    Mix into a CreateAPIView / ListCreateAPIView to enforce plan limits.

    Subclass must set:
        plan_resource = "clients"   # key in PLAN_LIMITS
        plan_count_qs  = None       # callable(user) -> int  OR  override get_plan_count()
    """
    plan_resource: str = ""

    def get_plan_count(self) -> int:
        raise NotImplementedError("Subclasses must implement get_plan_count()")

    def check_plan_limit(self):
        user = self.request.user
        sub = Subscription.get_or_create_for_user(user)
        current = self.get_plan_count()
        if not sub.is_within_limit(self.plan_resource, current):
            limit = sub.limits.get(self.plan_resource)
            raise PermissionDenied(
                {
                    "detail": (
                        f"You have reached the {self.plan_resource} limit "
                        f"({limit}) for your {sub.plan} plan. "
                        "Upgrade to add more."
                    ),
                    "code": "plan_limit_reached",
                    "plan": sub.plan,
                    "limit": limit,
                    "resource": self.plan_resource,
                }
            )

    def create(self, request, *args, **kwargs):
        self.check_plan_limit()
        return super().create(request, *args, **kwargs)
