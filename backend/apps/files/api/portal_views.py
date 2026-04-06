"""
Secure file access endpoints for portal clients.

Clients authenticate via portal token (no JWT).
These views generate signed Cloudinary URLs for download/preview.
"""
import logging

from rest_framework import status
from rest_framework.response import Response

from django.shortcuts import get_object_or_404

from apps.clients.portal_auth import PortalTokenAuthentication
from apps.clients.models import Client
from apps.clients.portal_views import PortalPermission, PortalBaseView
from apps.files.models import ProjectFile
from apps.files.api.views import _generate_signed_url

logger = logging.getLogger(__name__)


class PortalFileDownloadView(PortalBaseView):
    """
    GET /api/portal/<token>/files/<file_id>/download/
    Returns a signed URL for the client to download the file.
    """

    def get(self, request, token, file_id):
        client = self.get_client()
        file_obj = get_object_or_404(ProjectFile, id=file_id)

        # Ensure the file belongs to this client's project
        if file_obj.project.client != client:
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


class PortalFilePreviewView(PortalBaseView):
    """
    GET /api/portal/<token>/files/<file_id>/preview/
    Returns a signed URL for in-browser preview.
    """

    def get(self, request, token, file_id):
        client = self.get_client()
        file_obj = get_object_or_404(ProjectFile, id=file_id)

        if file_obj.project.client != client:
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
