from django.urls import path
from .views import SendMessageView, ProjectMessageListView

urlpatterns = [
    path("", SendMessageView.as_view(), name="message-send"),
    path("project/<int:project_id>/", ProjectMessageListView.as_view(), name="project-messages"),
]


