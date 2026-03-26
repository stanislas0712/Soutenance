from django.contrib import admin
from django.contrib.auth.forms import AdminPasswordChangeForm
from django.utils.html import format_html
from django.http import HttpResponseRedirect
from django.urls import path, reverse
from django.contrib import messages
from .models import Utilisateur, Departement


@admin.register(Departement)
class DepartementAdmin(admin.ModelAdmin):
    list_display  = ['code', 'nom', 'actif']
    list_filter   = ['actif']
    search_fields = ['code', 'nom']
    ordering      = ['code']


@admin.register(Utilisateur)
class UtilisateurAdmin(admin.ModelAdmin):
    list_display   = ['photo_vignette', 'matricule', 'email', 'nom_complet', 'role', 'departement', 'statut_badge']
    list_filter    = ['role', 'actif', 'departement']
    search_fields  = ['matricule', 'email', 'nom', 'prenom']
    ordering       = ['nom', 'prenom']
    readonly_fields = ['date_creation', 'derniere_connexion', 'apercu_photo', 'id']

    fieldsets = (
        ('Identité', {
            'fields': ('id', 'matricule', 'email', 'nom', 'prenom', 'photo', 'apercu_photo'),
        }),
        ('Rôle & Département', {
            'fields': ('role', 'departement'),
        }),
        ('Accès & Statut', {
            'fields': ('actif', 'is_staff', 'is_superuser'),
        }),
        ('Dates', {
            'fields': ('date_creation', 'derniere_connexion'),
            'classes': ('collapse',),
        }),
    )

    add_fieldsets = (
        ('Nouvel utilisateur', {
            'fields': ('matricule', 'email', 'nom', 'prenom', 'role', 'departement', 'password1', 'password2'),
        }),
    )

    # ── Colonnes personnalisées ──────────────────────────────────────────────

    @admin.display(description='Photo')
    def photo_vignette(self, obj):
        if obj.photo:
            return format_html(
                '<img src="{}" style="width:38px;height:38px;border-radius:50%;object-fit:cover;border:2px solid #E5E7EB">',
                obj.photo.url
            )
        initials = (obj.prenom[:1] + obj.nom[:1]).upper() if obj.prenom and obj.nom else '?'
        return format_html(
            '<div style="width:38px;height:38px;border-radius:50%;background:linear-gradient(135deg,#6366F1,#4F46E5);'
            'display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:13px">{}</div>',
            initials
        )

    @admin.display(description='Nom complet')
    def nom_complet(self, obj):
        return f'{obj.prenom} {obj.nom}'

    @admin.display(description='Statut')
    def statut_badge(self, obj):
        if obj.actif:
            return format_html(
                '<span style="background:#F0FDF4;color:#16A34A;padding:2px 10px;border-radius:99px;font-size:11px;font-weight:700">✓ Actif</span>'
            )
        return format_html(
            '<span style="background:#FEF2F2;color:#DC2626;padding:2px 10px;border-radius:99px;font-size:11px;font-weight:700">✗ Inactif</span>'
        )

    @admin.display(description='Aperçu photo')
    def apercu_photo(self, obj):
        if obj.photo:
            return format_html(
                '<img src="{}" style="width:100px;height:100px;border-radius:12px;object-fit:cover">',
                obj.photo.url
            )
        return '—'

    # ── Formulaire d'ajout avec mot de passe ────────────────────────────────

    def get_form(self, request, obj=None, **kwargs):
        if obj is None:
            # Création : afficher champs password
            from django import forms

            class CreateForm(forms.ModelForm):
                password1 = forms.CharField(label='Mot de passe', widget=forms.PasswordInput)
                password2 = forms.CharField(label='Confirmer mot de passe', widget=forms.PasswordInput)

                class Meta:
                    model  = Utilisateur
                    fields = ('matricule', 'email', 'nom', 'prenom', 'role', 'departement')

                def clean(self):
                    cd = super().clean()
                    if cd.get('password1') != cd.get('password2'):
                        raise forms.ValidationError('Les mots de passe ne correspondent pas.')
                    return cd

                def save(self, commit=True):
                    user = super().save(commit=False)
                    user.set_password(self.cleaned_data['password1'])
                    if commit:
                        user.save()
                    return user

            return CreateForm
        return super().get_form(request, obj, **kwargs)

    def get_fieldsets(self, request, obj=None):
        if obj is None:
            return self.add_fieldsets
        return self.fieldsets

    # ── Action : réinitialiser mot de passe ─────────────────────────────────

    actions = ['activer_utilisateurs', 'desactiver_utilisateurs']

    @admin.action(description='✓ Activer les utilisateurs sélectionnés')
    def activer_utilisateurs(self, request, queryset):
        nb = queryset.update(actif=True)
        self.message_user(request, f'{nb} utilisateur(s) activé(s).', messages.SUCCESS)

    @admin.action(description='✗ Désactiver les utilisateurs sélectionnés')
    def desactiver_utilisateurs(self, request, queryset):
        nb = queryset.update(actif=False)
        self.message_user(request, f'{nb} utilisateur(s) désactivé(s).', messages.WARNING)
