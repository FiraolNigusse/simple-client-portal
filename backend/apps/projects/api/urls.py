from django.urls import path

from .views import ProjectDetailView, ProjectListCreateView

app_name = "projects-api"

urlpatterns = [
    path("", ProjectListCreateView.as_view(), name="project-list-create"),
    path("<int:pk>/", ProjectDetailView.as_view(), name="project-detail"),
]

