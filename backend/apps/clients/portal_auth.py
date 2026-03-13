"""
Portal authentication backend.

Clients authenticate using a URL-safe token stored in ClientPortal.
They pass it as:
  - Query param:  GET /portal/files/?token=<token>
  - Header:       X-Portal-Token: <token>
"""
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed

from apps.clients.models import ClientPortal


class PortalTokenAuthentication(BaseAuthentication):
    keyword = "Portal"

    def authenticate(self, request):
        token = (
            request.query_params.get("token")
            or request.headers.get("X-Portal-Token")
        )
        if not token:
            return None  # Let other authenticators try

        try:
            portal = ClientPortal.objects.select_related("client").get(
                access_token=token
            )
        except ClientPortal.DoesNotExist:
            raise AuthenticationFailed("Invalid or expired portal token.")

        # Return (user=None, auth=portal) — views use request.auth
        return (None, portal)

    def authenticate_header(self, request):
        return self.keyword
