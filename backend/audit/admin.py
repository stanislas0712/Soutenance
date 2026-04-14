from django.contrib import admin
from django.utils.html import format_html
from .models import LogAudit, ActionAudit


# ── Filtres FlexList ──────────────────────────────────────────────────────────

class ActionFilter(admin.SimpleListFilter):
    title        = 'Type d\'action'
    parameter_name = 'action'

    def lookups(self, request, model_admin):
        return ActionAudit.choices

    def queryset(self, request, queryset):
        if self.value():
            return queryset.filter(action=self.value())
        return queryset


class TableFilter(admin.SimpleListFilter):
    title          = 'Modèle concerné'
    parameter_name = 'table'

    def lookups(self, request, model_admin):
        tables = (
            LogAudit.objects
            .values_list('table', flat=True)
            .distinct()
            .order_by('table')
        )
        return [(t, t) for t in tables]

    def queryset(self, request, queryset):
        if self.value():
            return queryset.filter(table=self.value())
        return queryset


# ── Admin LogAudit ────────────────────────────────────────────────────────────

@admin.register(LogAudit)
class LogAuditAdmin(admin.ModelAdmin):
    """
    Consultation en lecture seule des logs d'audit.
    FlexList : colonnes colorées, filtres, recherche plein-texte, hiérarchie de dates.
    """

    # ── FlexList config ──────────────────────────────────────────────────────
    list_display         = [
        'horodatage', 'action_badge', 'table_tag',
        'enregistrement_id', 'utilisateur_link', 'agent_court',
    ]
    list_display_links   = ['horodatage']
    list_filter          = [ActionFilter, TableFilter, 'date_action']
    search_fields        = ['utilisateur__email', 'utilisateur__matricule', 'table', 'enregistrement_id']
    date_hierarchy       = 'date_action'
    list_per_page        = 30
    list_select_related  = ['utilisateur']
    show_full_result_count = True
    ordering             = ['-date_action']

    readonly_fields = [
        'utilisateur', 'action', 'table', 'enregistrement_id',
        'valeur_avant', 'valeur_apres', 'utilisateur_agent', 'date_action',
    ]

    # Regroupement dans le formulaire de détail
    fieldsets = (
        ('Identification', {
            'fields': ('date_action', 'action', 'utilisateur', 'utilisateur_agent'),
        }),
        ('Cible', {
            'fields': ('table', 'enregistrement_id'),
        }),
        ('Données', {
            'fields': ('valeur_avant', 'valeur_apres'),
            'classes': ('collapse',),
        }),
    )

    # ── Colonnes personnalisées ──────────────────────────────────────────────

    ACTION_COLORS = {
        'CREATE' : ('#F0FDF4', '#16A34A'),
        'UPDATE' : ('#EFF6FF', '#2563EB'),
        'DELETE' : ('#FEF2F2', '#DC2626'),
        'LOGIN'  : ('#F5F3FF', '#7C3AED'),
        'LOGOUT' : ('#F9FAFB', '#6B7280'),
        'APPROVE': ('#ECFDF5', '#059669'),
        'REJECT' : ('#FFF7ED', '#EA580C'),
        'SUBMIT' : ('#FFFBEB', '#D97706'),
        'VIEW'   : ('#F0F9FF', '#0284C7'),
        'EXPORT' : ('#FDF4FF', '#9333EA'),
    }

    @admin.display(description='Horodatage', ordering='date_action')
    def horodatage(self, obj):
        return format_html(
            '<span style="font-family:monospace;font-size:12px;color:#6B7280">{}</span>',
            obj.date_action.strftime('%d/%m/%Y %H:%M:%S'),
        )

    @admin.display(description='Action', ordering='action')
    def action_badge(self, obj):
        bg, color = self.ACTION_COLORS.get(obj.action, ('#F3F4F6', '#6B7280'))
        return format_html(
            '<span style="background:{};color:{};padding:2px 10px;border-radius:99px;'
            'font-size:11px;font-weight:700;white-space:nowrap">{}</span>',
            bg, color, obj.get_action_display(),
        )

    @admin.display(description='Modèle', ordering='table')
    def table_tag(self, obj):
        return format_html(
            '<code style="background:#F3F4F6;color:#374151;padding:1px 7px;'
            'border-radius:5px;font-size:12px">{}</code>',
            obj.table,
        )

    @admin.display(description='Utilisateur', ordering='utilisateur__email')
    def utilisateur_link(self, obj):
        if not obj.utilisateur:
            return format_html('<span style="color:#9CA3AF;font-style:italic">Système</span>')
        return format_html(
            '<span style="font-size:13px">{}</span>',
            obj.utilisateur.email,
        )

    @admin.display(description='User-Agent')
    def agent_court(self, obj):
        ua = (obj.utilisateur_agent or '').strip()
        if not ua:
            return '—'
        return format_html(
            '<span title="{}" style="color:#9CA3AF;font-size:11px">{}</span>',
            ua, ua[:40] + ('…' if len(ua) > 40 else ''),
        )

    # ── Permissions (lecture seule) ──────────────────────────────────────────

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False
