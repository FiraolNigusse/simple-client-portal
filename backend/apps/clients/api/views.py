from django.db import IntegrityError
from rest_framework import generics, permissions, status, serializers
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models import Client
from .serializers import (
    ClientDetailSerializer,
    ClientPortalRegenerateSerializer,
    ClientSerializer,
)
from apps.users.permissions import PlanLimitMixin
from apps.core.permissions import IsOwner


class ClientListCreateView(PlanLimitMixin, generics.ListCreateAPIView):
    serializer_class = ClientSerializer
    permission_classes = [permissions.IsAuthenticated]
    plan_resource = "clients"

    def get_plan_count(self) -> int:
        return Client.objects.filter(freelancer=self.request.user).count()

    def get_queryset(self):
        return Client.objects.filter(freelancer=self.request.user)

    def perform_create(self, serializer):
        try:
            serializer.save(freelancer=self.request.user)
        except IntegrityError:
            raise serializers.ValidationError({"email": "A client with this email already exists for your account."})


class ClientDetailView(generics.RetrieveDestroyAPIView):
    serializer_class = ClientDetailSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]

    def get_queryset(self):
        return Client.objects.filter(freelancer=self.request.user)


class ClientPortalRegenerateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = ClientPortalRegenerateSerializer(
            data=request.data,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)
        client = serializer.save()

        # Provide updated client info with new portal_link.
        client_serializer = ClientDetailSerializer(
            client,
            context={"request": request},
        )
        return Response(client_serializer.data, status=status.HTTP_200_OK)

