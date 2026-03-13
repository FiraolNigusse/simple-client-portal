from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from rest_framework_simplejwt.views import TokenRefreshView

from apps.users.api.views import CustomTokenObtainPairView
from apps.users.api.dashboard import DashboardSummaryView

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
]

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include((api_urlpatterns, "api"), namespace="api")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

