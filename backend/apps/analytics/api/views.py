from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.db.models import Count, Q, Sum
from apps.users.models import Subscription
from datetime import timedelta

User = get_user_model()

class AdminDashboardAnalyticsView(APIView):
    """
    API view for the admin dashboard providing key metrics.
    Only accessible to staff/admin users.
    """
    permission_classes = [IsAdminUser]

    def get(self, request):
        now = timezone.now()
        seven_days_ago = now - timedelta(days=7)

        # Basic Stats
        total_users = User.objects.count()
        active_users = User.objects.filter(last_active__gte=seven_days_ago).count()
        
        # Subscription Stats
        subscriptions = Subscription.objects.all()
        paying_users = subscriptions.filter(status="active").count()
        
        # Plan distribution
        plan_counts = subscriptions.values("plan").annotate(count=Count("plan"))
        plans = {
            "starter": 0,
            "pro": 0,
            "agency": 0
        }
        for item in plan_counts:
            plans[item["plan"]] = item["count"]

        # MRR Calculation (Example pricing: starter=19, pro=49, agency=99)
        # In a real app, these would come from settings or database
        pricing = {
            "starter": 19.0,
            "pro": 49.0,
            "agency": 99.0
        }
        
        mrr = 0.0
        for plan, count in plans.items():
            mrr += count * pricing.get(plan, 0.0)

        data = {
            "total_users": total_users,
            "active_users": active_users,
            "paying_users": paying_users,
            "mrr": mrr,
            "plans": plans
        }

        return Response(data)
