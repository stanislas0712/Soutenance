"""
AuditMixin — mixin pour ModelAdmin Django
Enregistre automatiquement CREATE / UPDATE / DELETE dans LogAudit.
"""
import json
from django.forms.models import model_to_dict
from .models import LogAudit, ActionAudit


class AuditMixin:
    """
    Ajoutez ce mixin à n'importe quel ModelAdmin pour activer la traçabilité
    automatique des opérations de création, modification et suppression.

    Usage::

        from audit.mixins import AuditMixin

        @admin.register(MonModel)
        class MonModelAdmin(AuditMixin, admin.ModelAdmin):
            ...
    """

    def _serialize(self, obj):
        """Sérialise un objet en JSON lisible pour le log."""
        try:
            raw = model_to_dict(obj)
            return json.dumps(
                {k: str(v) for k, v in raw.items()},
                ensure_ascii=False,
                indent=None,
            )
        except Exception:
            return str(obj)

    # ── CREATE / UPDATE ──────────────────────────────────────────────────────

    def save_model(self, request, obj, form, change):
        avant = None
        if change:
            try:
                avant = self._serialize(obj.__class__.objects.get(pk=obj.pk))
            except obj.__class__.DoesNotExist:
                pass

        super().save_model(request, obj, form, change)

        LogAudit.enregistrer(
            utilisateur=request.user,
            table=obj.__class__.__name__,
            enregistrement_id=obj.pk,
            action=ActionAudit.UPDATE if change else ActionAudit.CREATE,
            valeur_avant=avant,
            valeur_apres=self._serialize(obj),
            user_agent=request.META.get('HTTP_USER_AGENT', ''),
        )

    # ── DELETE (objet unique) ────────────────────────────────────────────────

    def delete_model(self, request, obj):
        avant = self._serialize(obj)
        pk    = obj.pk
        super().delete_model(request, obj)
        LogAudit.enregistrer(
            utilisateur=request.user,
            table=obj.__class__.__name__,
            enregistrement_id=pk,
            action=ActionAudit.DELETE,
            valeur_avant=avant,
            user_agent=request.META.get('HTTP_USER_AGENT', ''),
        )

    # ── DELETE (action groupée) ──────────────────────────────────────────────

    def delete_queryset(self, request, queryset):
        snapshots = [
            (obj.__class__.__name__, obj.pk, self._serialize(obj))
            for obj in queryset
        ]
        super().delete_queryset(request, queryset)
        for table, pk, avant in snapshots:
            LogAudit.enregistrer(
                utilisateur=request.user,
                table=table,
                enregistrement_id=pk,
                action=ActionAudit.DELETE,
                valeur_avant=avant,
                user_agent=request.META.get('HTTP_USER_AGENT', ''),
            )
