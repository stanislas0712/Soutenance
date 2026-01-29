from auditlog.registry import auditlog
from django.contrib import admin
from simple_history.admin import SimpleHistoryAdmin

from .models import IntegrationHealth
from .goodgrants.models import GoodGrantsApplication


@admin.register(IntegrationHealth)
class IntegrationHealthAdmin(admin.ModelAdmin):
    list_display = ("system", "last_success_at", "last_error_at", "updated_at")
    search_fields = ("system",)
    readonly_fields = ("created_at", "updated_at")


@admin.register(GoodGrantsApplication)
class GoodGrantsApplicationAdmin(SimpleHistoryAdmin):
    list_display = ("gg_id", "status", "validated_at", "synced", "synced_at", "received_at")
    list_filter = ("status", "synced")
    search_fields = ("gg_id",)
    readonly_fields = ("received_at", "updated_at", "raw_payload")


auditlog.register(IntegrationHealth)
auditlog.register(GoodGrantsApplication)

