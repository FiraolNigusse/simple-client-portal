import logging
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings

logger = logging.getLogger(__name__)

def custom_exception_handler(exc, context):
    """
    Custom exception handler for Django Rest Framework.
    - Ensures tracebacks are not leaked in production.
    - Provides a consistent error format.
    - Logs 500 errors for internal debugging.
    """
    # Call standard DRF exception handler first to get the default response.
    response = exception_handler(exc, context)

    if response is not None:
        # Wrap all detail/error messages in a consistent "error" key
        if isinstance(response.data, dict):
            if 'detail' in response.data:
                response.data['error'] = response.data.pop('detail')
        return response

    # If response is None, it means DRF didn't handle the exception (e.g. 500 server error)
    # Log the full exception for developers
    logger.error(f"Unhandled Exception: {str(exc)}", exc_info=True)

    if not settings.DEBUG:
        # In production, return a generic error message
        return Response(
            {"error": "Something went wrong. Please try again later."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
    # In development, returning None lets Django's default debug page handle it
    return None
