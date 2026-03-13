from django.urls import path

from .views import CurrentUserView, RegisterView

app_name = "users-api"

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("me/", CurrentUserView.as_view(), name="me"),
]

