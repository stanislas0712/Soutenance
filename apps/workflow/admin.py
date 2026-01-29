from auditlog.registry import auditlog
from django.contrib import admin
from simple_history.admin import SimpleHistoryAdmin

from .models import WorkflowEvent


@admin.register(WorkflowEvent)
class WorkflowEventAdmin(SimpleHistoryAdmin):
    list_display = ("action", "content_type", "object_id", "created_by", "created_at")
    list_filter = ("action", "content_type")
    search_fields = ("object_id", "notes")
    readonly_fields = ("created_at",)


auditlog.register(WorkflowEvent)

