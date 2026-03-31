from django.contrib import admin
from django.utils.html import format_html
from .models import BudgetAnnuel, AllocationDepartementale, Budget, LigneBudgetaire, ConsommationLigne


class AllocationInline(admin.TabularInline):
    model  = AllocationDepartementale
    extra  = 0
    fields = ['departement', 'montant_alloue', 'montant_consomme', 'montant_disponible']
    readonly_fields = ['montant_consomme', 'montant_disponible']


class LigneBudgetaireInline(admin.TabularInline):
    model  = LigneBudgetaire
    extra  = 0
    fields = ['libelle', 'section', 'quantite', 'prix_unitaire', 'montant_alloue', 'montant_disponible']
    readonly_fields = ['montant_alloue', 'montant_disponible']


@admin.register(BudgetAnnuel)
class BudgetAnnuelAdmin(admin.ModelAdmin):
    list_display    = ['annee', 'montant_global', 'montant_alloue_depts', 'montant_disponible_global', 'date_creation']
    list_filter     = ['annee']
    readonly_fields = ['date_creation']
    inlines         = [AllocationInline]


@admin.register(AllocationDepartementale)
class AllocationDepartementaleAdmin(admin.ModelAdmin):
    list_display    = ['departement', 'budget_annuel', 'montant_alloue', 'montant_consomme', 'montant_disponible']
    list_filter     = ['budget_annuel', 'departement']
    readonly_fields = ['montant_consomme', 'montant_disponible', 'date_creation']


@admin.register(Budget)
class BudgetAdmin(admin.ModelAdmin):
    list_display    = ['code', 'nom', 'departement', 'statut', 'technique_estimation', 'montant_global', 'montant_disponible', 'date_creation']
    list_filter     = ['statut', 'departement', 'technique_estimation']
    search_fields   = ['code', 'nom']
    readonly_fields = ['code', 'montant_global', 'montant_consomme', 'montant_disponible', 'date_creation', 'date_soumission']
    inlines         = [LigneBudgetaireInline]


@admin.register(LigneBudgetaire)
class LigneBudgetaireAdmin(admin.ModelAdmin):
    list_display    = ['budget', 'libelle', 'section', 'montant_alloue', 'montant_consomme', 'montant_disponible']
    list_filter     = ['section', 'budget']
    readonly_fields = ['montant_alloue', 'montant_disponible', 'date_creation']


@admin.register(ConsommationLigne)
class ConsommationLigneAdmin(admin.ModelAdmin):
    list_display    = ['reference', 'ligne_budget', 'montant', 'statut_badge', 'enregistre_par', 'validateur', 'date']
    list_filter     = ['statut', 'date']
    search_fields   = ['reference', 'ligne__budget__code', 'ligne__budget__nom', 'enregistre_par__nom', 'enregistre_par__prenom']
    readonly_fields = ['reference', 'date']
    ordering        = ['-date']

    @admin.display(description='Budget / Ligne')
    def ligne_budget(self, obj):
        if obj.ligne and obj.ligne.budget:
            return format_html(
                '<span style="font-weight:600">{}</span> — {}',
                obj.ligne.budget.code, obj.ligne.libelle
            )
        return '—'

    @admin.display(description='Statut')
    def statut_badge(self, obj):
        colors = {
            'SAISIE':  ('#FEF3C7', '#D97706'),
            'VALIDEE': ('#F0FDF4', '#16A34A'),
            'REJETEE': ('#FEF2F2', '#DC2626'),
        }
        bg, color = colors.get(obj.statut, ('#F3F4F6', '#6B7280'))
        return format_html(
            '<span style="background:{};color:{};padding:2px 10px;border-radius:99px;font-size:11px;font-weight:700">{}</span>',
            bg, color, obj.statut
        )

    def has_add_permission(self, request):
        return False
