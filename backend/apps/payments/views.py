from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.http import JsonResponse
from django.conf import settings
import stripe
from .stripe import PRICE_IDS

stripe.api_key = settings.STRIPE_SECRET_KEY

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_checkout_session(request):
    user = request.user

    # ADMIN BYPASS
    if user.is_staff:
        plan = request.data.get("plan")
        if plan in ["starter", "pro", "agency"]:
            user.plan = plan
            user.plan_status = "active"
            user.save()
            return JsonResponse({"message": "Admin plan updated", "plan": user.plan})
        return JsonResponse({"error": "Invalid plan"}, status=400)

    plan = request.data.get("plan")

    if plan not in PRICE_IDS:
        return JsonResponse({"error": "Invalid plan or plan not available for subscription"}, status=400)

    try:
        session = stripe.checkout.Session.create(
            customer_email=user.email,
            payment_method_types=["card"],
            line_items=[{
                "price": PRICE_IDS[plan],
                "quantity": 1,
            }],
            mode="subscription",
            success_url=f"{settings.FRONTEND_URL}/payment-success?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{settings.FRONTEND_URL}/dashboard",
            metadata={
                "user_id": user.id,
                "plan": plan
            }
        )
        return JsonResponse({"url": session.url})
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
