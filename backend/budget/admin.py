from django.contrib import admin
from django.utils.html import format_html
from audit.mixins import AuditMixin
from .models import BudgetAnnuel, AllocationDepartementale, Budget, LigneBudgetaire, ConsommationLigne


# ── Inlines ───────────────────────────────────────────────────────────────────

class AllocationInline(admin.TabularInline):
    model         = AllocationDepartementale
    extra         = 0
    fields        = ['departement', 'montant_alloue', 'montant_consomme', 'montant_disponible']
    readonly_fields = ['montant_consomme', 'montant_disponible']


class LigneBudgetaireInline(admin.TabularInline):
    model         = LigneBudgetaire
    extra         = 0
    fields        = ['libelle', 'section', 'quantite', 'prix_unitaire', 'montant_alloue', 'montant_disponible']
    readonly_fields = ['montant_alloue', 'montant_disponible']


# ── Filtres FlexList ──────────────────────────────────────────────────────────

class StatutBudgetFilter(admin.SimpleListFilter):
    title          = 'Statut'
    parameter_name = 'statut'

    STATUTS = [
        ('BROUILLON', 'Brouillon'),
        ('SOUMIS',    'Soumis'),
        ('APPROUVE',  'Approuvé'),
        ('REJETE',    'Rejeté'),
        ('CLOTURE',   'Clôturé'),
    ]
    COLORS = {
        'BROUILLON': ('#F3F4F6', '#6B7280'),
        'SOUMIS'   : ('#FFFBEB', '#D97706'),
        'APPROUVE' : ('#F0FDF4', '#059669'),
        'REJETE'   : ('#FEF2F2', '#DC2626'),
        'CLOTURE'  : ('#F5F3FF', '#7C3AED'),
    }

    def lookups(self, request, model_admin):
        return self.STATUTS

    def queryset(self, request, queryset):
        if self.value():
            return queryset.filter(statut=self.value())
        return queryset


class ConsommationStatutFilter(admin.SimpleListFilter):
    title          = 'Statut dépense'
    parameter_name = 'statut'

    def lookups(self, request, model_admin):
        return [
            ('SAISIE',   'Saisie'),
            ('VALIDEE',  'Validée'),
            ('REJETEE',  'Rejetée'),
        ]

    def queryset(self, request, queryset):
        if self.value():
            return queryset.filter(statut=self.value())
        return queryset


# ── BudgetAnnuel ──────────────────────────────────────────────────────────────

@admin.register(BudgetAnnuel)
class BudgetAnnuelAdmin(AuditMixin, admin.ModelAdmin):
    list_display         = [
        'annee_badge', 'montant_global_fmt', 'montant_alloue_depts_fmt',
        'montant_disponible_global_fmt', 'nb_allocations', 'date_creation',
    ]
    list_display_links   = ['annee_badge']
    list_filter          = ['annee']
    readonly_fields      = ['date_creation']
    inlines              = [AllocationInline]
    ordering             = ['-annee']
    list_per_page        = 15

    @admin.display(description='Année', ordering='annee')
    def annee_badge(self, obj):
        return format_html(
            '<span style="font-family:monospace;font-weight:800;font-size:15px;color:#1C1917">{}</span>',
            obj.annee,
        )

    @admin.display(description='Montant global (FCFA)', ordering='montant_global')
    def montant_global_fmt(self, obj):
        return _fmt_money(obj.montant_global)

    @admin.display(description='Alloué depts (FCFA)')
    def montant_alloue_depts_fmt(self, obj):
        return _fmt_money(obj.montant_alloue_depts)

    @admin.display(description='Disponible (FCFA)')
    def montant_disponible_global_fmt(self, obj):
        val = obj.montant_disponible_global
        color = '#DC2626' if float(val or 0) < 0 else '#059669'
        return format_html(
            '<span style="font-family:monospace;font-weight:700;color:{}">{} FCFA</span>',
            color,
            _int_fmt(val),
        )

    @admin.display(description='Allocations')
    def nb_allocations(self, obj):
        n = obj.allocations.count()
        return format_html(
            '<span style="font-family:monospace;font-weight:700;color:#6366F1">{}</span>', n
        )


# ── AllocationDepartementale ──────────────────────────────────────────────────

@admin.register(AllocationDepartementale)
class AllocationDepartementaleAdmin(AuditMixin, admin.ModelAdmin):
    list_display         = [
        'departement', 'budget_annuel', 'montant_alloue_fmt',
        'montant_consomme_fmt', 'taux_consommation', 'montant_disponible_fmt',
    ]
    list_display_links   = ['departement']
    list_filter          = ['budget_annuel', 'departement']
    readonly_fields      = ['montant_consomme', 'montant_disponible', 'date_creation']
    list_per_page        = 25
    list_select_related  = ['departement', 'budget_annuel']

    @admin.display(description='Alloué (FCFA)', ordering='montant_alloue')
    def montant_alloue_fmt(self, obj):
        return _fmt_money(obj.montant_alloue)

    @admin.display(description='Consommé (FCFA)', ordering='montant_consomme')
    def montant_consomme_fmt(self, obj):
        return _fmt_money(obj.montant_consomme)

    @admin.display(description='Disponible (FCFA)', ordering='montant_disponible')
    def montant_disponible_fmt(self, obj):
        return _fmt_money(obj.montant_disponible)

    @admin.display(description='Taux')
    def taux_consommation(self, obj):
        alloue = float(obj.montant_alloue or 0)
        if alloue == 0:
            return '—'
        taux  = float(obj.montant_consomme or 0) / alloue * 100
        color = '#DC2626' if taux > 75 else ('#D97706' if taux > 50 else '#059669')
        label = '{:.1f}'.format(taux)
        return format_html(
            '<span style="font-family:monospace;font-weight:700;color:{}"> {} %</span>',
            color, label,
        )


# ── Budget ────────────────────────────────────────────────────────────────────

@admin.register(Budget)
class BudgetAdmin(AuditMixin, admin.ModelAdmin):
    list_display         = [
        'code_tag', 'nom', 'departement', 'statut_badge',
        'montant_global_fmt', 'taux_bar', 'date_creation',
    ]
    list_display_links   = ['code_tag', 'nom']
    list_filter          = [StatutBudgetFilter, 'departement', 'technique_estimation']
    search_fields        = ['code', 'nom']
    readonly_fields      = ['code', 'montant_global', 'montant_consomme', 'montant_disponible', 'date_creation', 'date_soumission']
    inlines              = [LigneBudgetaireInline]
    date_hierarchy       = 'date_creation'
    list_per_page        = 20
    list_select_related  = ['departement']

    STATUT_COLORS = StatutBudgetFilter.COLORS

    @admin.display(description='Code', ordering='code')
    def code_tag(self, obj):
        return format_html(
            '<code style="background:#FEF9EC;color:#C9A84C;padding:2px 8px;'
            'border-radius:5px;font-weight:700;font-size:12px">{}</code>',
            obj.code,
        )

    @admin.display(description='Statut', ordering='statut')
    def statut_badge(self, obj):
        bg, color = self.STATUT_COLORS.get(obj.statut, ('#F3F4F6', '#6B7280'))
        return format_html(
            '<span style="background:{};color:{};padding:2px 10px;border-radius:99px;'
            'font-size:11px;font-weight:700">{}</span>',
            bg, color, obj.statut,
        )

    @admin.display(description='Montant global (FCFA)', ordering='montant_global')
    def montant_global_fmt(self, obj):
        return _fmt_money(obj.montant_global)

    @admin.display(description='Consommation')
    def taux_bar(self, obj):
        taux  = obj.calculer_taux_consommation()
        color = '#DC2626' if taux > 75 else ('#D97706' if taux > 50 else '#059669')
        width = '{:.0f}'.format(min(taux, 100))
        label = '{:.1f}'.format(taux)
        return format_html(
            '<div style="display:flex;align-items:center;gap:6px">'
            '<div style="flex:1;background:#F3F4F6;border-radius:4px;height:6px;min-width:60px">'
            '<div style="width:{}%;background:{};height:6px;border-radius:4px"></div>'
            '</div>'
            '<span style="font-family:monospace;font-size:11px;font-weight:700;color:{}">{}%</span>'
            '</div>',
            width, color, color, label,
        )


# ── LigneBudgetaire ───────────────────────────────────────────────────────────

@admin.register(LigneBudgetaire)
class LigneBudgetaireAdmin(AuditMixin, admin.ModelAdmin):
    list_display         = [
        'budget_code', 'libelle', 'section_badge', 'quantite',
        'montant_alloue_fmt', 'montant_consomme_fmt', 'montant_disponible_fmt',
    ]
    list_display_links   = ['libelle']
    list_filter          = ['section', 'budget']
    search_fields        = ['libelle', 'budget__code', 'budget__nom']
    readonly_fields      = ['montant_alloue', 'montant_disponible', 'date_creation']
    list_per_page        = 30
    list_select_related  = ['budget']

    SECTION_COLORS = {
        'REVENU' : ('#F0FDF4', '#059669'),
        'DEPENSE': ('#EFF6FF', '#2563EB'),
    }

    @admin.display(description='Budget', ordering='budget__code')
    def budget_code(self, obj):
        return format_html(
            '<code style="background:#FEF9EC;color:#C9A84C;padding:1px 6px;'
            'border-radius:4px;font-size:11px;font-weight:700">{}</code>',
            obj.budget.code if obj.budget else '—',
        )

    @admin.display(description='Section', ordering='section')
    def section_badge(self, obj):
        bg, color = self.SECTION_COLORS.get(obj.section, ('#F3F4F6', '#6B7280'))
        return format_html(
            '<span style="background:{};color:{};padding:1px 8px;border-radius:99px;'
            'font-size:11px;font-weight:700">{}</span>',
            bg, color, obj.section,
        )

    @admin.display(description='Alloué (FCFA)', ordering='montant_alloue')
    def montant_alloue_fmt(self, obj):
        return _fmt_money(obj.montant_alloue)

    @admin.display(description='Consommé (FCFA)')
    def montant_consomme_fmt(self, obj):
        return _fmt_money(obj.montant_consomme)

    @admin.display(description='Disponible (FCFA)', ordering='montant_disponible')
    def montant_disponible_fmt(self, obj):
        return _fmt_money(obj.montant_disponible)


# ── ConsommationLigne ─────────────────────────────────────────────────────────

@admin.register(ConsommationLigne)
class ConsommationLigneAdmin(AuditMixin, admin.ModelAdmin):
    list_display         = [
        'reference_tag', 'ligne_budget', 'montant_fmt',
        'statut_badge', 'enregistre_par', 'validateur', 'date_fmt',
    ]
    list_display_links   = ['reference_tag']
    list_filter          = [ConsommationStatutFilter, 'date']
    search_fields        = ['reference', 'ligne__budget__code', 'ligne__budget__nom']
    readonly_fields      = ['reference', 'date']
    ordering             = ['-date']
    date_hierarchy       = 'date'
    list_per_page        = 30
    list_select_related  = ['ligne__budget', 'enregistre_par', 'validateur']

    STATUT_COLORS = {
        'SAISIE' : ('#FEF3C7', '#D97706'),
        'VALIDEE': ('#F0FDF4', '#16A34A'),
        'REJETEE': ('#FEF2F2', '#DC2626'),
    }

    @admin.display(description='Référence', ordering='reference')
    def reference_tag(self, obj):
        return format_html(
            '<code style="background:#F3F4F6;color:#374151;padding:2px 7px;'
            'border-radius:5px;font-size:12px">{}</code>',
            obj.reference,
        )

    @admin.display(description='Budget / Ligne')
    def ligne_budget(self, obj):
        if obj.ligne and obj.ligne.budget:
            return format_html(
                '<span style="font-weight:600;color:#C9A84C">{}</span>'
                '<span style="color:#9CA3AF"> — </span>'
                '<span style="font-size:12px">{}</span>',
                obj.ligne.budget.code, obj.ligne.libelle,
            )
        return '—'

    @admin.display(description='Montant (FCFA)', ordering='montant')
    def montant_fmt(self, obj):
        return _fmt_money(obj.montant)

    @admin.display(description='Statut', ordering='statut')
    def statut_badge(self, obj):
        bg, color = self.STATUT_COLORS.get(obj.statut, ('#F3F4F6', '#6B7280'))
        return format_html(
            '<span style="background:{};color:{};padding:2px 10px;border-radius:99px;'
            'font-size:11px;font-weight:700">{}</span>',
            bg, color, obj.statut,
        )

    @admin.display(description='Date', ordering='date')
    def date_fmt(self, obj):
        return format_html(
            '<span style="font-family:monospace;font-size:12px;color:#6B7280">{}</span>',
            obj.date.strftime('%d/%m/%Y %H:%M') if obj.date else '—',
        )

    def has_add_permission(self, request):
        return False


# ── Utilitaires ───────────────────────────────────────────────────────────────

def _int_fmt(value):
    try:
        return f'{int(float(value or 0)):,}'.replace(',', '\u202f')
    except (ValueError, TypeError):
        return '0'


def _fmt_money(value):
    return format_html(
        '<span style="font-family:monospace;font-weight:600">{} FCFA</span>',
        _int_fmt(value),
    )
