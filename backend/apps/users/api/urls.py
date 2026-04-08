from django.urls import path

from .views import (
    CurrentUserView,
    LogoutView,
    PasswordResetConfirmView,
    PasswordResetRequestView,
    RegisterView,
)
from .subscription_views import MySubscriptionView, PlansListView
from .billing_views import AdminChangePlanView, CreateCheckoutSessionView, PaymentSuccessView

app_name = "users-api"

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("me/", CurrentUserView.as_view(), name="me"),
    path("password/reset/", PasswordResetRequestView.as_view(), name="password_reset"),
    path("password/reset/confirm/", PasswordResetConfirmView.as_view(), name="password_reset_confirm"),
    path("subscriptions/me/", MySubscriptionView.as_view(), name="subscription-me"),
    path("subscriptions/plans/", PlansListView.as_view(), name="subscription-plans"),
    
    # Billing endpoints
    path("admin/change-plan/", AdminChangePlanView.as_view(), name="admin-change-plan"),
    path("create-checkout-session/", CreateCheckoutSessionView.as_view(), name="create-checkout-session"),
    path("billing/payment-success/", PaymentSuccessView.as_view(), name="payment-success"),
]
