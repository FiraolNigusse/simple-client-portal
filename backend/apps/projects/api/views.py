from rest_framework import generics, permissions

from ..models import Project
from .serializers import ProjectSerializer
from apps.users.permissions import PlanLimitMixin


class ProjectListCreateView(PlanLimitMixin, generics.ListCreateAPIView):
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]
    plan_resource = "projects"

    def get_plan_count(self) -> int:
        return Project.objects.filter(client__freelancer=self.request.user).count()

    def get_queryset(self):
        return Project.objects.select_related("client", "client__freelancer").filter(
            client__freelancer=self.request.user
        )

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx["request"] = self.request
        return ctx



class ProjectDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]

    http_method_names = ["get", "patch", "head", "options"]

    def get_queryset(self):
        return Project.objects.select_related("client", "client__freelancer").filter(
            client__freelancer=self.request.user
        )

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx["request"] = self.request
        return ctx

