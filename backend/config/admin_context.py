"""
Injecte des données statistiques dans le tableau de bord admin Jazzmin.
"""
from django.contrib.admin import AdminSite
from django.db.models import Sum

_original_index = AdminSite.index


def _patched_index(self, request, extra_context=None):
    extra_context = extra_context or {}

    try:
        from budget.models import Budget, BudgetAnnuel
        from accounts.models import Utilisateur, Departement
        from audit.models import LogAudit

        budgets_qs       = Budget.objects.all()
        montant_total    = budgets_qs.aggregate(t=Sum('montant_global'))['t'] or 0
        montant_consomme = budgets_qs.aggregate(c=Sum('montant_consomme'))['c'] or 0
        taux             = round((montant_consomme / montant_total) * 100) if montant_total else 0

        extra_context['stats'] = {
            'nb_budgets':            budgets_qs.count(),
            'budgets_en_validation': budgets_qs.filter(statut='SOUMIS').count(),
            'nb_budgets_annuels':    BudgetAnnuel.objects.count(),
            'nb_utilisateurs':       Utilisateur.objects.count(),
            'nb_departements':       Departement.objects.count(),
            'nb_logs':               LogAudit.objects.count(),
            'montant_total':         montant_total,
            'montant_consomme':      montant_consomme,
            'taux_consommation':     taux,
        }

        extra_context['budgets_recents'] = (
            Budget.objects
            .select_related('departement', 'gestionnaire')
            .order_by('-date_creation')[:5]
        )

    except Exception:
        extra_context.setdefault('stats', {
            'nb_budgets': 0, 'budgets_en_validation': 0,
            'nb_utilisateurs': 0, 'nb_departements': 0, 'nb_logs': 0,
            'montant_total': 0, 'montant_consomme': 0, 'taux_consommation': 0,
        })
        extra_context.setdefault('budgets_recents', [])

    return _original_index(self, request, extra_context)


AdminSite.index = _patched_index
