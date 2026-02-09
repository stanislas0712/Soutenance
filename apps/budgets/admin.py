from django.contrib import admin
from .models import (
    InfosBudget, SectionBudgetaire, LigneBudgetaire,
    GroupeArticle, SousLigneArticle, Metier, Localite
)


@admin.register(Metier)
class MetierAdmin(admin.ModelAdmin):
    list_display = ('nom',)
    search_fields = ('nom',)


@admin.register(Localite)
class LocaliteAdmin(admin.ModelAdmin):
    list_display = ('nom',)
    search_fields = ('nom',)

# --- NIVEAU BAS : ARTICLES DANS LES GROUPES ---

class SousLigneArticleInline(admin.TabularInline):
    model = SousLigneArticle
    extra = 1
    fields = ('designation', 'unite', 'quantite', 'prix_unitaire', 'co_financement', 'cout_total_article', 'budget_demande_article')
    readonly_fields = ('cout_total_article', 'budget_demande_article')

@admin.register(GroupeArticle)
class GroupeArticleAdmin(admin.ModelAdmin):
    list_display = ('libelle', 'ligne', 'cout_total_groupe', 'budget_demande_groupe')
    inlines = [SousLigneArticleInline]
    list_filter = ('ligne__section__budget_parent',)

# --- NIVEAU MOYEN : GROUPES DANS LES LIGNES ---

class GroupeArticleInline(admin.TabularInline):
    model = GroupeArticle
    extra = 0
    fields = ('libelle', 'cout_total_groupe', 'co_financement_groupe', 'budget_demande_groupe')
    readonly_fields = fields # On ne modifie les montants que via les articles

@admin.register(LigneBudgetaire)
class LigneBudgetaireAdmin(admin.ModelAdmin):
    list_display = ('code', 'libelle', 'section', 'cout_total_ligne')
    inlines = [GroupeArticleInline]

# --- NIVEAU HAUT : SECTIONS DANS LE BUDGET ---

class SectionBudgetaireInline(admin.StackedInline):
    model = SectionBudgetaire
    extra = 0
    readonly_fields = ('cout_total_section', 'co_financement_section', 'budget_demande_section')

@admin.register(InfosBudget)
class InfosBudgetAdmin(admin.ModelAdmin):
    """
    Vue principale du Budget
    """
    list_display = ('titre_projet', 'operateur', 'cout_total_global', 'budget_demande_global', 'cout_par_apprenant')
    fieldsets = (
        ('Informations Générales', {
            'fields': ('operateur', 'titre_projet', 'filiere', 'metier', 'localite')
        }),
        ('Paramètres & Effectifs', {
            'fields': ('total_apprenants', 'nombre_sessions')
        }),
        ('Synthèse Financière (Calculée)', {
            'fields': (('cout_total_global', 'co_financement_global'), ('budget_demande_global', 'cout_par_apprenant')),
            'description': "Ces montants sont mis à jour automatiquement via la cascade de calculs."
        }),
    )
    readonly_fields = ('cout_total_global', 'co_financement_global', 'budget_demande_global', 'cout_par_apprenant')
    inlines = [SectionBudgetaireInline]

    # Action manuelle pour recalculer tout le budget en cas de besoin
    actions = ['forcer_recalcul']

    @admin.action(description="Forcer le recalcul total du budget")
    def forcer_recalcul(self, request, queryset):
        for budget in queryset:
            for section in budget.sections.all():
                for ligne in section.lignes.all():
                    for groupe in ligne.groupes.all():
                        groupe.calculer_groupe() # Déclenche la cascade montante
        self.message_user(request, "Les calculs ont été mis à jour avec succès.")