import logging

from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.views import APIView
from rest_framework.exceptions import PermissionDenied

from django.conf import settings
from django.shortcuts import get_object_or_404

from ..models import ProjectFile
from .serializers import ProjectFileSerializer
from apps.projects.models import Project

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _get_cloudinary_available():
    """Check if cloudinary SDK is available & configured."""
    try:
        import cloudinary
        import cloudinary.utils
        import cloudinary.uploader
        return True
    except ImportError:
        return False


def _generate_signed_url(file_obj, as_attachment=False):
    """
    Generate a signed Cloudinary URL for the given ProjectFile.
    Falls back to the legacy FileField URL if the file has no public_id.
    """
    if file_obj.public_id and _get_cloudinary_available():
        import cloudinary.utils

        options = {
            "resource_type": file_obj.resource_type or "auto",
            "type": "authenticated",
            "sign_url": True,
            "secure": True,
        }
        if as_attachment:
            options["flags"] = "attachment"

        url, _ = cloudinary.utils.cloudinary_url(file_obj.public_id, **options)
        return url

    # Fallback: legacy FileField
    if file_obj.file:
        url = file_obj.file.url
        if as_attachment and "/image/upload/" in url:
            url = url.replace("/image/upload/", "/image/upload/fl_attachment/")
        return url

    return None


def _check_file_ownership(file_obj, user):
    """
    Verify the requesting user owns the workspace (freelancer) for this file.
    The ownership chain: ProjectFile → Project → Client → freelancer.
    """
    return file_obj.project.client.freelancer == user


# ---------------------------------------------------------------------------
# Upload
# ---------------------------------------------------------------------------

class FileUploadView(generics.CreateAPIView):
    queryset = ProjectFile.objects.all()
    serializer_class = ProjectFileSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def perform_create(self, serializer):
        project_id = self.request.data.get("project")
        try:
            project = Project.objects.get(
                id=project_id, client__freelancer=self.request.user
            )
        except Project.DoesNotExist:
            raise PermissionDenied("Project not found or access denied.")

        uploaded_file = self.request.FILES.get("file")
        original_name = uploaded_file.name if uploaded_file else ""
        file_size = uploaded_file.size if uploaded_file else 0

        # ------------------------------------------------------------------
        # Attempt Cloudinary authenticated upload (production)
        # ------------------------------------------------------------------
        if _get_cloudinary_available() and hasattr(settings, 'CLOUDINARY_STORAGE'):
            try:
                import cloudinary.uploader

                result = cloudinary.uploader.upload(
                    uploaded_file,
                    folder="project_files/",
                    resource_type="auto",
                    type="authenticated",
                )
                serializer.save(
                    uploaded_by=self.request.user,
                    project=project,
                    original_name=original_name,
                    public_id=result.get("public_id", ""),
                    resource_type=result.get("resource_type", "auto"),
                    file_size=result.get("bytes", file_size),
                    file=None,  # Don't store in FileField when using Cloudinary
                )
                logger.info(
                    "Cloudinary authenticated upload: %s (public_id=%s)",
                    original_name,
                    result.get("public_id"),
                )
                return
            except Exception as exc:
                logger.warning(
                    "Cloudinary upload failed, falling back to FileField: %s", exc
                )

        # ------------------------------------------------------------------
        # Fallback: standard Django FileField upload (development / no Cloudinary)
        # ------------------------------------------------------------------
        try:
            serializer.save(
                uploaded_by=self.request.user,
                project=project,
                original_name=original_name,
                file_size=file_size,
            )
        except TypeError:
            # original_name / file_size columns may not exist if migration hasn't run
            serializer.save(uploaded_by=self.request.user, project=project)


# ---------------------------------------------------------------------------
# List
# ---------------------------------------------------------------------------

class ProjectFileListView(generics.ListAPIView):
    serializer_class = ProjectFileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        project_id = self.kwargs.get('project_id')
        return ProjectFile.objects.select_related("uploaded_by").filter(
            project_id=project_id,
            project__client__freelancer=self.request.user
        )


# ---------------------------------------------------------------------------
# Secure Download
# ---------------------------------------------------------------------------

class FileDownloadView(APIView):
    """
    GET /api/files/<id>/download/
    Returns a signed Cloudinary URL (or FileField URL) for downloading.
    Enforces workspace ownership.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, file_id):
        file_obj = get_object_or_404(ProjectFile, id=file_id)

        if not _check_file_ownership(file_obj, request.user):
            return Response(
                {"detail": "You do not have permission to access this file."},
                status=status.HTTP_403_FORBIDDEN,
            )

        url = _generate_signed_url(file_obj, as_attachment=True)
        if not url:
            return Response(
                {"detail": "File not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response({"url": url, "filename": file_obj.original_name})


# ---------------------------------------------------------------------------
# Secure Preview
# ---------------------------------------------------------------------------

class FilePreviewView(APIView):
    """
    GET /api/files/<id>/preview/
    Returns a signed Cloudinary URL for in-browser preview (no attachment flag).
    Enforces workspace ownership.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, file_id):
        file_obj = get_object_or_404(ProjectFile, id=file_id)

        if not _check_file_ownership(file_obj, request.user):
            return Response(
                {"detail": "You do not have permission to access this file."},
                status=status.HTTP_403_FORBIDDEN,
            )

        url = _generate_signed_url(file_obj, as_attachment=False)
        if not url:
            return Response(
                {"detail": "File not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response({
            "url": url,
            "filename": file_obj.original_name,
            "extension": file_obj.extension,
            "is_previewable": file_obj.is_previewable,
        })


# ---------------------------------------------------------------------------
# Secure Delete
# ---------------------------------------------------------------------------

class FileDeleteView(APIView):
    """
    DELETE /api/files/<id>/
    Deletes a file. Enforces workspace ownership.
    """
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, file_id):
        file_obj = get_object_or_404(ProjectFile, id=file_id)

        if not _check_file_ownership(file_obj, request.user):
            return Response(
                {"detail": "You do not have permission to delete this file."},
                status=status.HTTP_403_FORBIDDEN,
            )

        # Delete from Cloudinary if applicable
        if file_obj.public_id and _get_cloudinary_available():
            try:
                import cloudinary.uploader
                cloudinary.uploader.destroy(
                    file_obj.public_id,
                    resource_type=file_obj.resource_type or "image",
                    type="authenticated",
                )
            except Exception as exc:
                logger.warning("Cloudinary delete failed: %s", exc)

        file_obj.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
