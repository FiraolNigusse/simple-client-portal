from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from ..models import ProjectFile
from .serializers import ProjectFileSerializer
from apps.projects.models import Project


class FileUploadView(generics.CreateAPIView):
    queryset = ProjectFile.objects.all()
    serializer_class = ProjectFileSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def perform_create(self, serializer):
        project_id = self.request.data.get("project")
        # Ensure the project belongs to the authenticated freelancer
        try:
            project = Project.objects.get(
                id=project_id, client__freelancer=self.request.user
            )
        except Project.DoesNotExist:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Project not found or access denied.")
        serializer.save(uploaded_by=self.request.user, project=project)


class ProjectFileListView(generics.ListAPIView):
    serializer_class = ProjectFileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        project_id = self.kwargs.get('project_id')
        return ProjectFile.objects.filter(
            project_id=project_id,
            project__client__freelancer=self.request.user
        )
