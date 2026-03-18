"""
Portal authentication backend.

Clients authenticate using a URL-safe token stored in ClientPortal.
They pass it as:
  - Query param:  GET /portal/files/?token=<token>
  - Header:       X-Portal-Token: <token>
"""
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed




class PortalTokenAuthentication(BaseAuthentication):
    keyword = "Portal"

    def authenticate(self, request):
        token = (
            request.query_params.get("token")
            or request.headers.get("X-Portal-Token")
            # Also allow obtaining from URL kwarg if needed, but usually handled by dispatch
        )
        if not token:
            return None

        from apps.clients.models import Client
        try:
            client = Client.objects.get(portal_token=token)
        except (Client.DoesNotExist, ValueError):
            raise AuthenticationFailed("Invalid or expired portal token.")

        # Return (user=None, auth=client) — auth stores the authenticated client
        return (None, client)

    def authenticate_header(self, request):
        return self.keyword
