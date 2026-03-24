from django.contrib import admin
from .models import LogAudit


@admin.register(LogAudit)
class LogAuditAdmin(admin.ModelAdmin):
    list_display = ['date_action', 'utilisateur', 'action', 'table', 'enregistrement_id']
    list_filter = ['action', 'table']
    search_fields = ['utilisateur__email', 'utilisateur__matricule', 'table']
    readonly_fields = [
        'utilisateur', 'action', 'table', 'enregistrement_id',
        'valeur_avant', 'valeur_apres', 'utilisateur_agent', 'date_action',
    ]

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False
