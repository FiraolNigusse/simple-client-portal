from django.urls import path

from .views import (
    ClientDetailView,
    ClientListCreateView,
    ClientPortalRegenerateView,
)

app_name = "clients-api"

urlpatterns = [
    path("", ClientListCreateView.as_view(), name="client-list-create"),
    path("<int:pk>/", ClientDetailView.as_view(), name="client-detail"),
    path("portal/regenerate/", ClientPortalRegenerateView.as_view(), name="client-portal-regenerate"),
]

