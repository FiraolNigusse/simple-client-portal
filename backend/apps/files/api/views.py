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
from apps.users.models import Workspace

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
    """
    if file_obj.workspace:
        return file_obj.workspace.owner == user
    # Fallback legacy ownership chain
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

        # Get or create workspace for the user
        workspace, _ = Workspace.objects.get_or_create(
            owner=self.request.user,
            defaults={'name': f"{self.request.user.email.split('@')[0]}'s Workspace"}
        )

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
                    workspace=workspace,
                    project=project,
                    name=original_name,
                    public_id=result.get("public_id", ""),
                    resource_type=result.get("resource_type", "auto"),
                    file_size=result.get("bytes", file_size),
                    file=None,  # Don't store in FileField when using Cloudinary
                )
                return
            except Exception as exc:
                logger.warning(
                    "Cloudinary upload failed, falling back to FileField: %s", exc
                )

        # ------------------------------------------------------------------
        # Fallback: standard Django FileField upload (development / no Cloudinary)
        # ------------------------------------------------------------------
        serializer.save(
            uploaded_by=self.request.user,
            workspace=workspace,
            project=project,
            name=original_name,
            file_size=file_size,
        )


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


import urllib.request
from django.http import StreamingHttpResponse

def _proxy_file_response(file_obj, as_attachment=False):
    """
    Proxies the file from Cloudinary (or local storage) to the client so the client
    never sees the direct storage URL.
    """
    url = _generate_signed_url(file_obj, as_attachment=as_attachment)
    if not url:
        return Response({"detail": "File not found."}, status=status.HTTP_404_NOT_FOUND)

    req = urllib.request.Request(url)
    try:
        response = urllib.request.urlopen(req)
    except Exception as exc:
        logger.error(f"Error proxying file: {exc}")
        return Response({"detail": "Failed to fetch file from storage."}, status=status.HTTP_502_BAD_GATEWAY)

    content_type = response.headers.get("Content-Type", "application/octet-stream")

    django_response = StreamingHttpResponse(
        (chunk for chunk in iter(lambda: response.read(8192), b"")),
        content_type=content_type
    )

    disposition = "attachment" if as_attachment else "inline"
    filename = file_obj.original_name or "download"
    django_response["Content-Disposition"] = f'{disposition}; filename="{filename}"'
    django_response["Access-Control-Expose-Headers"] = "Content-Disposition"
    return django_response


# ---------------------------------------------------------------------------
# Secure Download
# ---------------------------------------------------------------------------

class FileDownloadView(APIView):
    """
    GET /api/files/<id>/download/
    Returns a secure signed Cloudinary URL.
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
        return Response({"url": url})


# ---------------------------------------------------------------------------
# Secure Preview
# ---------------------------------------------------------------------------

class FilePreviewView(APIView):
    """
    GET /api/files/<id>/preview/
    Returns a secure signed Cloudinary URL for preview.
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
        return Response({"url": url})


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
