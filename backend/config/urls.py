from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from rest_framework_simplejwt.views import TokenRefreshView

from apps.users.api.views import CustomTokenObtainPairView
from apps.users.api.dashboard import DashboardSummaryView
from apps.clients.portal_views import (
    PortalInfoView,
    PortalProjectFilesView,
    PortalMessagesView,
    PortalInvoicesView,
    PortalTasksView,
)

api_urlpatterns = [
    path("auth/token/", CustomTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("users/", include("apps.users.api.urls")),
    path("clients/", include("apps.clients.api.urls")),
    path("projects/", include("apps.projects.api.urls")),
    path("tasks/", include("apps.tasks.api.urls")),
    path("files/", include("apps.files.api.urls")),
    path("invoices/", include("apps.invoices.api.urls")),
    path("messaging/", include("apps.messaging.api.urls")),
    path("dashboard/summary/", DashboardSummaryView.as_view(), name="dashboard-summary"),
    # Client portal (token-authenticated, no JWT needed)
    path("portal/<str:token>/", PortalInfoView.as_view(), name="portal-info"),
    path("portal/<str:token>/files/", PortalProjectFilesView.as_view(), name="portal-files"),
    path("portal/<str:token>/messages/", PortalMessagesView.as_view(), name="portal-messages"),
    path("portal/<str:token>/invoices/", PortalInvoicesView.as_view(), name="portal-invoices"),
    path("portal/<str:token>/tasks/", PortalTasksView.as_view(), name="portal-tasks"),
]

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include((api_urlpatterns, "api"), namespace="api")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

