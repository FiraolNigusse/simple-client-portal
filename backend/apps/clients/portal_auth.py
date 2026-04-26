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
        # Prefer query param or header, but support URL path kwarg for PortalInfoView
        token = (
            request.query_params.get("token")
            or request.headers.get("X-Portal-Token")
            or (request.resolver_match.kwargs.get("token") if request.resolver_match else None)
        )
        if not token:
            return None

        from apps.clients.models import Client
        try:
            client = Client.objects.get(portal_token=token)
        except (Client.DoesNotExist, ValueError):
            raise AuthenticationFailed("Invalid portal token.")

        if not client.is_portal_token_valid():
            raise AuthenticationFailed("Portal token has expired.")

        # Return (user=None, auth=client) — auth stores the authenticated client
        return (None, client)

    def authenticate_header(self, request):
        return self.keyword
