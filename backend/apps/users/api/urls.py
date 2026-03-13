from django.urls import path

from .views import CurrentUserView, RegisterView
from .subscription_views import MySubscriptionView, PlansListView

app_name = "users-api"

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("me/", CurrentUserView.as_view(), name="me"),
    path("subscriptions/me/", MySubscriptionView.as_view(), name="subscription-me"),
    path("subscriptions/plans/", PlansListView.as_view(), name="subscription-plans"),
]

