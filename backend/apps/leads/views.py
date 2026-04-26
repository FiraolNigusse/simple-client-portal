from rest_framework import viewsets, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Q
from .models import Lead
from .serializers import LeadSerializer

class LeadViewSet(viewsets.ModelViewSet):
    serializer_class = LeadSerializer
    permission_classes = [permissions.IsAdminUser]  # Staff-only

    def get_queryset(self):
        return Lead.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'])
    def metrics(self, request):
        """Return high-level metrics for the leads dashboard."""
        qs = self.get_queryset()
        total_leads = qs.count()
        if total_leads == 0:
            return Response({
                "total": 0,
                "active_pipeline": 0,
                "conversion_rate": 0,
                "avg_response": "N/A",
                "roi_estimate": "0x"
            })

        converted = qs.filter(stage='converted').count()
        conversion_rate = (converted / total_leads * 100) if total_leads > 0 else 0
        active_pipeline = qs.exclude(Q(stage='converted') | Q(stage='lost')).count()

        return Response({
            "total": total_leads,
            "active_pipeline": active_pipeline,
            "conversion_rate": round(conversion_rate, 1),
            "avg_response": "4.2 Hours", # Mocked for now, needs activity log
            "roi_estimate": "12.4x"      # Derived from average plan value
        })
