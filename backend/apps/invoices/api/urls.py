from django.urls import path
from .views import InvoiceListCreateView, InvoiceDetailView, InvoiceMetricsView
from .public_views import PublicInvoiceDetailView, PublicPaymentConfirmView

from .portal_views import ClientPortalInvoiceListView, ClientPortalInvoiceDetailView

urlpatterns = [
    # Authenticated routes (Freelancer)
    path("", InvoiceListCreateView.as_view(), name="invoice-list-create"),
    path("metrics/", InvoiceMetricsView.as_view(), name="invoice-metrics"),
    path("<int:pk>/", InvoiceDetailView.as_view(), name="invoice-detail"),
    
    # Public routes (Payment Link - UUID based)
    path("p/<uuid:uuid>/", PublicInvoiceDetailView.as_view(), name="public-invoice-detail"),
    path("p/<uuid:uuid>/confirm/", PublicPaymentConfirmView.as_view(), name="public-payment-confirm"),
    
    # Client Portal routes (Token based)
    path("portal/<uuid:token>/", ClientPortalInvoiceListView.as_view(), name="portal-invoice-list"),
    path("portal/<uuid:token>/<uuid:uuid>/", ClientPortalInvoiceDetailView.as_view(), name="portal-invoice-detail"),
]


