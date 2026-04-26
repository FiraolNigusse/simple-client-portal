from django.db.models import Count, Q
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
        print(f"DEBUG: Dashboard request for user {user.email}")
        
        # Fetch basic counts explicitly to avoid potential aggregation issues with nested relations
        clients_qs = Client.objects.filter(freelancer=user)
        total_clients = clients_qs.count()
        print(f"DEBUG: Found {total_clients} clients for user {user.email}")
        active_projects = Project.objects.filter(client__freelancer=user, status=Project.STATUS_ACTIVE).count()
        pending_invoices = Invoice.objects.filter(
            client__freelancer=user, 
            status__in=[Invoice.STATUS_SENT, Invoice.STATUS_PARTIAL, Invoice.STATUS_OVERDUE]
        ).count()
        completed_tasks = Task.objects.filter(
            project__client__freelancer=user, 
            status=Task.STATUS_DONE
        ).count()

        # Recent activity
        projects_qs = Project.objects.filter(client__freelancer=user).order_by("-created_at")
        invoices_qs = Invoice.objects.filter(client__freelancer=user).order_by("-created_at")

        recent_projects = list(
            projects_qs[:5].values(
                "id", "title", "status", "created_at"
            )
        )
        recent_invoices = list(
            invoices_qs[:5].values(
                "id", "amount", "status", "created_at", "client__name"
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
