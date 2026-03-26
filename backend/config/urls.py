"""
BudgetFlow — URLs principales
Toutes les routes API sont accessibles sous /api/
"""
from django.contrib import admin
from django.urls import include, path, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView

urlpatterns = [
    path("admin/", admin.site.urls),

    # Comptes : auth, utilisateurs, départements
    path("api/accounts/", include("accounts.urls")),

    # Budget : budgets annuels, allocations, budgets, lignes
    path("api/budget/", include("budget.urls")),

    # Audit : logs
    path("api/audit/", include("audit.urls")),

    # Rapports & KPIs
    path("api/v1/rapports/", include("budget.urls_rapports")),

    # Dépenses (consommations avec workflow validation)
    path("api/v1/depenses/", include("budget.urls_depenses")),

    # Intelligence Artificielle
    path("api/v1/ia/", include("budget.urls_ia")),

    # Notifications in-app
    path("api/v1/notifications/", include("budget.urls_notifications")),

    # React SPA — catch-all (doit être en dernier)
    re_path(r'^(?!api|admin|static|media).*$', TemplateView.as_view(template_name='index.html')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
