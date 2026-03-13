from rest_framework import generics, permissions

from ..models import Task
from .serializers import TaskSerializer


class TaskListCreateView(generics.ListCreateAPIView):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = Task.objects.select_related("project", "project__client", "project__client__freelancer").filter(
            project__client__freelancer=self.request.user
        )
        project_id = self.request.query_params.get("project")
        if project_id:
            qs = qs.filter(project_id=project_id)
        return qs

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx["request"] = self.request
        return ctx


class TaskDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    http_method_names = ["get", "patch", "delete", "head", "options"]

    def get_queryset(self):
        return Task.objects.select_related(
            "project",
            "project__client",
            "project__client__freelancer",
        ).filter(project__client__freelancer=self.request.user)

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx["request"] = self.request
        return ctx

