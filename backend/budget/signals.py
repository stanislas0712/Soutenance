"""
Signaux Django pour l'audit automatique des modèles budget.
Ces signaux capturent les créations/modifications/suppressions
même quand elles passent par Django admin (pas uniquement via l'API REST).
"""
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import BudgetAnnuel, AllocationDepartementale, Budget, LigneBudgetaire


def _log(table, obj_id, action, avant=None, apres=None):
    """Enregistre un log d'audit de façon silencieuse (ne bloque jamais)."""
    try:
        from audit.models import LogAudit, ActionAudit
        LogAudit.enregistrer(
            utilisateur=None,  # pas de requête HTTP disponible ici
            table=table,
            enregistrement_id=str(obj_id),
            action=action,
            valeur_avant=avant,
            valeur_apres=apres,
        )
    except Exception:
        pass  # ne jamais bloquer l'opération principale à cause de l'audit


# ── Budget annuel ─────────────────────────────────────────────────────────────

@receiver(post_save, sender=BudgetAnnuel)
def audit_budget_annuel_save(sender, instance, created, **kwargs):
    if created:
        _log('budget_annuel', instance.id, 'CREATE',
             apres=f"Budget annuel {instance.annee} – global: {instance.montant_global} F")
    else:
        _log('budget_annuel', instance.id, 'UPDATE',
             apres=f"Budget annuel {instance.annee} – global: {instance.montant_global} F")


@receiver(post_delete, sender=BudgetAnnuel)
def audit_budget_annuel_delete(sender, instance, **kwargs):
    _log('budget_annuel', instance.id, 'DELETE',
         avant=f"Budget annuel {instance.annee} – global: {instance.montant_global} F")


# ── Allocation départementale ─────────────────────────────────────────────────

@receiver(post_save, sender=AllocationDepartementale)
def audit_allocation_save(sender, instance, created, **kwargs):
    desc = f"{instance.departement} – {instance.budget_annuel.annee} – alloué: {instance.montant_alloue} F"
    if created:
        _log('allocation_departementale', instance.id, 'CREATE', apres=desc)
    else:
        _log('allocation_departementale', instance.id, 'UPDATE', apres=desc)


@receiver(post_delete, sender=AllocationDepartementale)
def audit_allocation_delete(sender, instance, **kwargs):
    _log('allocation_departementale', instance.id, 'DELETE',
         avant=f"{instance.departement} – {instance.budget_annuel.annee} – alloué: {instance.montant_alloue} F")


# ── Budget ────────────────────────────────────────────────────────────────────

@receiver(post_save, sender=Budget)
def audit_budget_save(sender, instance, created, **kwargs):
    desc = f"{instance.code} – {instance.nom} – statut: {instance.statut}"
    if created:
        _log('budget', instance.id, 'CREATE', apres=desc)
    else:
        _log('budget', instance.id, 'UPDATE', apres=desc)


@receiver(post_delete, sender=Budget)
def audit_budget_delete(sender, instance, **kwargs):
    _log('budget', instance.id, 'DELETE',
         avant=f"{instance.code} – {instance.nom}")
