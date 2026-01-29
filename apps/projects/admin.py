from auditlog.registry import auditlog
from django.contrib import admin
from simple_history.admin import SimpleHistoryAdmin

from .models import Project


@admin.register(Project)
class ProjectAdmin(SimpleHistoryAdmin):
    list_display = ("title", "operator", "status", "ready_for_convention", "validated_by_admin", "updated_at")
    list_filter = ("status", "ready_for_convention", "validated_by_admin")
    search_fields = ("title", "operator__name", "gg_application__gg_id")
    raw_id_fields = ("gg_application", "operator")
    readonly_fields = ("created_at", "updated_at", "validated_at", "locked_at")


auditlog.register(Project)

