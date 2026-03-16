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

        # Optimize by getting all counts in one query using aggregation on the clients relation
        stats = user.clients.aggregate(
            total_clients=Count('id', distinct=True),
            active_projects=Count('projects', filter=Q(projects__status=Project.STATUS_ACTIVE), distinct=True),
            pending_invoices=Count('invoices', filter=Q(invoices__status=Invoice.STATUS_PENDING), distinct=True),
            completed_tasks=Count('projects__tasks', filter=Q(projects__tasks__status=Task.STATUS_DONE), distinct=True)
        )

        projects = Project.objects.filter(client__freelancer=user)
        invoices = Invoice.objects.filter(client__freelancer=user)

        # Recent activity — last 5 projects and invoices
        recent_projects = list(
            projects.order_by("-created_at")[:5].values(
                "id", "title", "status", "created_at"
            )
        )
        recent_invoices = list(
            invoices.order_by("-created_at")[:5]
            .values(
                "id", "amount", "status", "created_at",
                "client__name",
            )
        )

        return Response(
            {
                "total_clients": stats["total_clients"],
                "active_projects": stats["active_projects"],
                "pending_invoices": stats["pending_invoices"],
                "completed_tasks": stats["completed_tasks"],
                "recent_projects": recent_projects,
                "recent_invoices": recent_invoices,
            }
        )
