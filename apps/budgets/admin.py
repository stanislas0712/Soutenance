from auditlog.registry import auditlog
from django.contrib import admin
from simple_history.admin import SimpleHistoryAdmin

from .models import BudgetLine, BudgetSection, BudgetSubLine


@admin.register(BudgetSection)
class BudgetSectionAdmin(SimpleHistoryAdmin):
    list_display = ("code", "label", "order", "updated_at")
    search_fields = ("code", "label")
    ordering = ("order", "code")


class BudgetSubLineInline(admin.TabularInline):
    model = BudgetSubLine
    extra = 0


@admin.register(BudgetLine)
class BudgetLineAdmin(SimpleHistoryAdmin):
    list_display = ("code", "label", "convention", "section", "total", "updated_at")
    list_filter = ("section",)
    search_fields = ("code", "label", "convention__reference")
    raw_id_fields = ("convention",)
    inlines = [BudgetSubLineInline]


@admin.register(BudgetSubLine)
class BudgetSubLineAdmin(SimpleHistoryAdmin):
    list_display = ("description", "line", "quantity", "unit_cost", "total", "updated_at")
    raw_id_fields = ("line",)
    search_fields = ("description", "line__code", "line__convention__reference")


auditlog.register(BudgetSection)
auditlog.register(BudgetLine)
auditlog.register(BudgetSubLine)

