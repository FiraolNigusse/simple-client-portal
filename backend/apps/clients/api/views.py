from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models import Client
from .serializers import (
    ClientDetailSerializer,
    ClientPortalGenerateSerializer,
    ClientSerializer,
)


class ClientListCreateView(generics.ListCreateAPIView):
    serializer_class = ClientSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Client.objects.filter(freelancer=self.request.user)

    def perform_create(self, serializer):
        serializer.save(freelancer=self.request.user)


class ClientDetailView(generics.RetrieveDestroyAPIView):
    serializer_class = ClientDetailSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Client.objects.filter(freelancer=self.request.user)


class ClientPortalGenerateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = ClientPortalGenerateSerializer(
            data=request.data,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)
        portal = serializer.save()

        # Reuse detail serializer to provide portal_link.
        client_serializer = ClientDetailSerializer(
            portal.client,
            context={"request": request},
        )
        return Response(client_serializer.data, status=status.HTTP_200_OK)

