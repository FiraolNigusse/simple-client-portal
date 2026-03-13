from rest_framework import generics, permissions
from ..models import Message
from .serializers import MessageSerializer


class SendMessageView(generics.CreateAPIView):
    """
    POST /messages/
    Body: { project, sender_type, content }
    Authenticated freelancer sends a message; clients post via portal token auth.
    """
    queryset = Message.objects.all()
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]


class ProjectMessageListView(generics.ListAPIView):
    """
    GET /messages/project/{project_id}/
    Returns messages for a project in chronological order.
    """
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        project_id = self.kwargs.get("project_id")
        return Message.objects.filter(project_id=project_id)
