from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.users.models import Subscription
from .subscription_serializers import PlanInfoSerializer, SubscriptionSerializer


class MySubscriptionView(APIView):
    """
    GET  /subscriptions/me/   — return the authenticated user's subscription
    PATCH /subscriptions/me/  — upgrade/change plan
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        sub = Subscription.get_or_create_for_user(request.user)
        return Response(SubscriptionSerializer(sub).data)

    def patch(self, request):
        sub = Subscription.get_or_create_for_user(request.user)
        serializer = SubscriptionSerializer(sub, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class PlansListView(APIView):
    """
    GET /subscriptions/plans/  — return all available plans with limits
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(PlanInfoSerializer.all_plans())
