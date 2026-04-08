import stripe
from django.conf import settings

stripe.api_key = settings.STRIPE_SECRET_KEY

PRICE_IDS = {
    "pro": "REPLACE_WITH_STRIPE_PRICE_ID",
    "agency": "REPLACE_WITH_STRIPE_PRICE_ID",
}
