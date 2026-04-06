from django.urls import path
from .views import (
    FileUploadView,
    ProjectFileListView,
    FileDownloadView,
    FilePreviewView,
    FileDeleteView,
)

urlpatterns = [
    path("upload/", FileUploadView.as_view(), name="file-upload"),
    path("project/<int:project_id>/", ProjectFileListView.as_view(), name="project-files"),
    path("<int:file_id>/download/", FileDownloadView.as_view(), name="file-download"),
    path("<int:file_id>/preview/", FilePreviewView.as_view(), name="file-preview"),
    path("<int:file_id>/", FileDeleteView.as_view(), name="file-delete"),
]
