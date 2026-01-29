from auditlog.registry import auditlog
from django.contrib import admin
from simple_history.admin import SimpleHistoryAdmin

from .models import IntegrationEvent


@admin.register(IntegrationEvent)
class IntegrationEventAdmin(SimpleHistoryAdmin):
    list_display = ("system", "direction", "status", "external_id", "correlation_id", "created_at")
    list_filter = ("system", "direction", "status")
    search_fields = ("external_id", "correlation_id", "error_message")
    readonly_fields = ("created_at",)


auditlog.register(IntegrationEvent)

