from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from apps.clients.models import Client
from apps.projects.models import Project
from apps.invoices.models import Invoice
from apps.tasks.models import Task


class DashboardSummaryView(APIView):
    """
    GET /dashboard/summary
    Returns key metrics for the authenticated freelancer.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        # Freelancer's own clients
        clients = Client.objects.filter(freelancer=user)
        client_ids = clients.values_list("id", flat=True)

        # Projects belonging to those clients
        projects = Project.objects.filter(client__in=client_ids)
        project_ids = projects.values_list("id", flat=True)

        total_clients = clients.count()
        active_projects = projects.filter(status=Project.STATUS_ACTIVE).count()
        pending_invoices = Invoice.objects.filter(
            client__in=client_ids, status=Invoice.STATUS_PENDING
        ).count()
        completed_tasks = Task.objects.filter(
            project__in=project_ids, status=Task.STATUS_DONE
        ).count()

        # Recent activity — last 5 projects and invoices combined
        recent_projects = list(
            projects.order_by("-created_at")[:5].values(
                "id", "title", "status", "created_at"
            )
        )
        recent_invoices = list(
            Invoice.objects.filter(client__in=client_ids)
            .order_by("-created_at")[:5]
            .values(
                "id", "amount", "status", "created_at",
                "client__name",
            )
        )

        return Response(
            {
                "total_clients": total_clients,
                "active_projects": active_projects,
                "pending_invoices": pending_invoices,
                "completed_tasks": completed_tasks,
                "recent_projects": recent_projects,
                "recent_invoices": recent_invoices,
            }
        )
