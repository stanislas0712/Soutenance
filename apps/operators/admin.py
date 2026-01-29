from auditlog.registry import auditlog
from django.contrib import admin
from simple_history.admin import SimpleHistoryAdmin

from .models import Operator


@admin.register(Operator)
class OperatorAdmin(SimpleHistoryAdmin):
    list_display = ("name", "registration_number", "email", "phone", "odoo_id", "is_active", "updated_at")
    search_fields = ("name", "registration_number", "email")
    list_filter = ("is_active",)
    readonly_fields = ("created_at", "updated_at")


auditlog.register(Operator)

