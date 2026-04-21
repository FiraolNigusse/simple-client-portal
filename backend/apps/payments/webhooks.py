import stripe
from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import get_user_model

User = get_user_model()

@csrf_exempt
def stripe_webhook(request):
    payload = request.body
    sig_header = request.META.get("HTTP_STRIPE_SIGNATURE")
    endpoint_secret = settings.STRIPE_WEBHOOK_SECRET

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, endpoint_secret
        )
    except ValueError as e:
        # Invalid payload
        return JsonResponse({"error": "Invalid payload"}, status=400)
    except stripe.error.SignatureVerificationError as e:
        # Invalid signature
        return JsonResponse({"error": "Invalid signature"}, status=400)

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]

        user_id = session["metadata"].get("user_id")
        plan = session["metadata"].get("plan")

        try:
            from apps.users.models import Subscription
            user = User.objects.get(id=user_id)
            subscription, _ = Subscription.objects.get_or_create(user=user)
            subscription.plan = plan
            subscription.status = "active"
            subscription.stripe_customer_id = session.get("customer")
            subscription.stripe_subscription_id = session.get("subscription")
            subscription.save()
            
            # Keep User fields for now if they are still used elsewhere
            user.plan = plan
            user.plan_status = "active"
            user.stripe_customer_id = session.get("customer")
            user.subscription_id = session.get("subscription")
            user.save()
        except User.DoesNotExist:
            return JsonResponse({"error": "User not found"}, status=404)

    elif event["type"] == "invoice.payment_succeeded":
        invoice_obj = event["data"]["object"]
        subscription_id = invoice_obj.get("subscription")
        if subscription_id:
            from apps.users.models import Subscription
            Subscription.objects.filter(stripe_subscription_id=subscription_id).update(status="active")

    elif event["type"] == "customer.subscription.deleted":
        subscription_obj = event["data"]["object"]
        subscription_id = subscription_obj.get("id")
        if subscription_id:
            from apps.users.models import Subscription
            Subscription.objects.filter(stripe_subscription_id=subscription_id).update(status="canceled")

    return JsonResponse({"status": "success"})
