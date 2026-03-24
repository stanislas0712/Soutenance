from django.contrib import admin
from .models import BudgetAnnuel, AllocationDepartementale, Budget, LigneBudgetaire


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
