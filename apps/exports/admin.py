from auditlog.registry import auditlog
from django.contrib import admin
from simple_history.admin import SimpleHistoryAdmin

from .models import ExportJob


@admin.register(ExportJob)
class ExportJobAdmin(SimpleHistoryAdmin):
    list_display = ("kind", "status", "created_by", "created_at", "updated_at")
    list_filter = ("kind", "status")
    search_fields = ("error_message",)
    readonly_fields = ("created_at", "updated_at")


auditlog.register(ExportJob)

