from rest_framework import generics, permissions
from rest_framework.exceptions import PermissionDenied
from ..models import Message
from .serializers import MessageSerializer
from apps.projects.models import Project


class SendMessageView(generics.CreateAPIView):
    """
    POST /messaging/
    Body: { project, sender_type, content }
    Validates that the project belongs to the authenticated freelancer.
    """
    queryset = Message.objects.all()
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        project_id = self.request.data.get("project")
        try:
            Project.objects.get(id=project_id, client__freelancer=self.request.user)
        except Project.DoesNotExist:
            raise PermissionDenied("Project not found or access denied.")
        serializer.save()


class ProjectMessageListView(generics.ListAPIView):
    """
    GET /messaging/project/{project_id}/
    Returns messages for a project scoped to the authenticated freelancer.
    """
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        project_id = self.kwargs.get("project_id")
        return Message.objects.filter(
            project_id=project_id,
            project__client__freelancer=self.request.user
        )
