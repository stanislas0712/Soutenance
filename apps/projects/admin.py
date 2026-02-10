from auditlog.registry import auditlog
from django.contrib import admin
from simple_history.admin import SimpleHistoryAdmin

from .models import Project, AppelAProjet


@admin.register(Project)
class ProjectAdmin(SimpleHistoryAdmin):
    list_display = ("title", "operator", "status", "ready_for_convention", "validated_by_admin", "updated_at")
    list_filter = ("status", "ready_for_convention", "validated_by_admin")
    search_fields = ("title", "operator__name", "gg_application__gg_id")
    raw_id_fields = ("gg_application", "operator")
    readonly_fields = ("created_at", "updated_at", "validated_at", "locked_at")


@admin.register(AppelAProjet)
class AppelAProjetAdmin(SimpleHistoryAdmin):
    list_display = ("nom", "date_debut", "date_fin", "actif_manuellement", "est_actif", "created_by")
    list_filter = ("date_debut", "date_fin", "actif_manuellement")
    list_editable = ("actif_manuellement",)
    search_fields = ("nom",)
    readonly_fields = ("created_at", "updated_at")
    actions = ["activer_appel", "desactiver_appel"]

    def est_actif(self, obj):
        return obj.est_actif
    est_actif.boolean = True
    est_actif.short_description = "Actif (effectif)"

    @admin.action(description="Activer manuellement les appels sélectionnés")
    def activer_appel(self, request, queryset):
        count = queryset.update(actif_manuellement=True)
        self.message_user(request, f"{count} appel(s) activé(s) manuellement.")

    @admin.action(description="Désactiver manuellement les appels sélectionnés")
    def desactiver_appel(self, request, queryset):
        count = queryset.update(actif_manuellement=False)
        self.message_user(request, f"{count} appel(s) désactivé(s).")


auditlog.register(Project)
auditlog.register(AppelAProjet)

