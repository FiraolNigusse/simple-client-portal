from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from ..models import Subscription
from .subscription_serializers import SubscriptionSerializer

User = get_user_model()

class AdminChangePlanView(APIView):
    """
    PHASE 3: Allow admin to upgrade instantly.
    Only staff users can access this.
    """
    permission_classes = [permissions.IsAdminUser]

    def post(self, request):
        user_id = request.data.get("user_id")
        new_plan = request.data.get("plan")
        
        if not user_id or not new_plan:
            return Response({"error": "user_id and plan are required"}, status=status.HTTP_400_BAD_REQUEST)
            
        user = get_object_or_404(User, id=user_id)
        user.plan = new_plan
        user.plan_status = "active"
        user.save()
        
        # Sync Subscription model
        sub = Subscription.get_or_create_for_user(user)
        sub.plan = new_plan
        sub.status = "active"
        sub.save()
        
        return Response(SubscriptionSerializer(sub).data)

class CreateCheckoutSessionView(APIView):
    """
    PHASE 4: Create mock checkout session.
    Only non-admin users use this.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        if request.user.is_staff:
            return Response({"error": "Admins do not need payment"}, status=status.HTTP_400_BAD_REQUEST)

        plan = request.data.get("plan")
        if not plan:
            return Response({"error": "plan is required"}, status=status.HTTP_400_BAD_REQUEST)

        request.user.plan_status = "pending"
        request.user.save()

        # TEMP mock (replace with Stripe later)
        return Response({
            "message": "Redirect to payment page",
            "fake_payment_url": f"/api/users/billing/payment-success/?plan={plan}" # Adjusted to match absolute URL if needed or relative
        })

class PaymentSuccessView(APIView):
    """
    PHASE 5: Mock payment success.
    Simulates successful payment and upgrades plan.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        plan = request.query_params.get("plan")
        if not plan:
            return Response({"error": "plan is required"}, status=status.HTTP_400_BAD_REQUEST)
            
        user = request.user
        user.plan = plan
        user.plan_status = "active"
        user.save()
        
        # Sync Subscription model
        sub = Subscription.get_or_create_for_user(user)
        sub.plan = plan
        sub.status = "active"
        sub.save()
        
        return Response({"status": "payment successful, plan updated", "subscription": SubscriptionSerializer(sub).data})
