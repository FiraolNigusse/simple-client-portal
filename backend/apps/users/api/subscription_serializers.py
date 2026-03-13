from rest_framework import serializers
from ..models import Subscription, PLAN_LIMITS


class SubscriptionSerializer(serializers.ModelSerializer):
    plan_label = serializers.CharField(source="get_plan_display", read_only=True)
    status_label = serializers.CharField(source="get_status_display", read_only=True)
    limits = serializers.SerializerMethodField()

    class Meta:
        model = Subscription
        fields = [
            "id",
            "plan",
            "plan_label",
            "status",
            "status_label",
            "started_at",
            "limits",
        ]
        read_only_fields = ["started_at", "status"]

    def get_limits(self, obj):
        raw = obj.limits
        # Replace None (unlimited) with a display-friendly value
        return {k: (v if v is not None else "unlimited") for k, v in raw.items()}


class PlanInfoSerializer(serializers.Serializer):
    """Read-only serializer for the plans comparison table."""
    plan = serializers.CharField()
    label = serializers.CharField()
    limits = serializers.DictField()

    @staticmethod
    def all_plans():
        plan_labels = dict(Subscription.PLAN_CHOICES)
        return [
            {
                "plan": plan,
                "label": plan_labels.get(plan, plan.title()),
                "limits": {
                    k: (v if v is not None else "unlimited")
                    for k, v in limits.items()
                },
            }
            for plan, limits in PLAN_LIMITS.items()
        ]
