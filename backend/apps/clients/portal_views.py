"""
Portal-facing API views.

All views use PortalTokenAuthentication. request.auth is the Client instance.
No JWT required — clients authenticate with their portal token only.
"""
from rest_framework import generics, status, permissions
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.clients.portal_auth import PortalTokenAuthentication
from apps.clients.models import Client
from apps.files.models import ProjectFile
from apps.files.api.serializers import ProjectFileSerializer
from apps.messaging.models import Message
from apps.messaging.api.serializers import MessageSerializer
from apps.invoices.models import Invoice
from apps.invoices.api.serializers import InvoiceSerializer
from apps.tasks.models import Task
from apps.tasks.api.serializers import TaskSerializer
from apps.projects.models import Project
from apps.projects.api.serializers import ProjectSerializer
from apps.analytics.utils import log_portal_event


class PortalPermission(permissions.BasePermission):
    """Shared permission: request must carry a valid portal token → request.auth is Client instance."""
    def has_permission(self, request, view):
        return isinstance(request.auth, Client)


class PortalBaseView(APIView):
    authentication_classes = [PortalTokenAuthentication]
    permission_classes = [PortalPermission]

    def get_client(self):
        return self.request.auth  # Authenticated Client instance


class PortalInfoView(PortalBaseView):
    """GET /portal/{token}/ — return consolidated client record."""

    def get(self, request, token):
        client = self.get_client()
        return Response({
            "client": {
                "id": client.id,
                "name": client.name,
                "email": client.email,
                "company": client.company,
            },
            "debug": "Portal accessed successfully",
            "projects": [],
            "invoices": [],
            "files": [],
        })


class PortalProjectFilesView(PortalBaseView):
    """GET /portal/{token}/files/?project=<id>"""

    def get(self, request, token):
        client = self.get_client()
        project_id = request.query_params.get("project")
        qs = ProjectFile.objects.filter(project__client=client).select_related("uploaded_by")
        if project_id:
            qs = qs.filter(project_id=project_id)
        
        # Log that client viewed their files (safely)
        try:
            log_portal_event(request, client, "view", "file_list", project_id or 0)
        except Exception:
            pass
        
        return Response(ProjectFileSerializer(qs, many=True, context={"request": request}).data)


class PortalMessagesView(PortalBaseView):
    """
    GET  /portal/{token}/messages/?project=<id>  — read messages
    POST /portal/{token}/messages/               — client sends a reply
    """

    def get(self, request, token):
        client = self.get_client()
        project_id = request.query_params.get("project")
        qs = Message.objects.filter(project__client=client)
        if project_id:
            qs = qs.filter(project_id=project_id)
        return Response(MessageSerializer(qs, many=True).data)

    def post(self, request, token):
        client = self.get_client()
        project_id = request.data.get("project")

        # Validate project belongs to this client
        if not Project.objects.filter(id=project_id, client=client).exists():
            return Response({"detail": "Project not found."}, status=status.HTTP_400_BAD_REQUEST)

        data = {
            "project": project_id,
            "sender_type": Message.SENDER_CLIENT,
            "content": request.data.get("content", ""),
        }
        serializer = MessageSerializer(data=data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class PortalInvoicesView(PortalBaseView):
    """GET /portal/{token}/invoices/ — client views their invoices."""

    def get(self, request, token):
        client = self.get_client()
        invoices = Invoice.objects.filter(client=client).select_related("project", "client")
        
        # Log that client viewed their invoices (safely)
        try:
            log_portal_event(request, client, "view", "invoice_list", 0)
        except Exception:
            pass
        
        return Response(InvoiceSerializer(invoices, many=True).data)


class PortalInvoiceDetailView(PortalBaseView):
    """GET /portal/{token}/invoices/{uuid}/ — client views specific invoice."""

    def get(self, request, token, uuid):
        client = self.get_client()
        invoice = get_object_or_404(Invoice, uuid=uuid, client=client)
        return Response(InvoiceSerializer(invoice).data)

class PortalTasksView(PortalBaseView):
    """GET /portal/{token}/tasks/?project=<id> — client views tasks."""

    def get(self, request, token):
        client = self.get_client()
        project_id = request.query_params.get("project")
        qs = Task.objects.filter(project__client=client)
        if project_id:
            qs = qs.filter(project_id=project_id)
        return Response(TaskSerializer(qs, many=True).data)
