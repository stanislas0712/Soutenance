from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.forms import UserCreationForm, UserChangeForm
from django.utils.html import format_html
from .models import Utilisateur, Departement


class UtilisateurCreationForm(UserCreationForm):
    class Meta(UserCreationForm.Meta):
        model  = Utilisateur
        fields = ('matricule', 'email', 'nom', 'prenom', 'role', 'departement')


class UtilisateurChangeForm(UserChangeForm):
    class Meta:
        model  = Utilisateur
        fields = '__all__'


@admin.register(Departement)
class DepartementAdmin(admin.ModelAdmin):
    list_display  = ['code', 'nom', 'actif']
    list_filter   = ['actif']
    search_fields = ['code', 'nom']


@admin.register(Utilisateur)
class UtilisateurAdmin(UserAdmin):
    form     = UtilisateurChangeForm
    add_form = UtilisateurCreationForm

    list_display   = ['photo_vignette', 'matricule', 'email', 'nom', 'prenom', 'role', 'departement', 'actif']
    list_filter    = ['role', 'actif', 'departement']
    search_fields  = ['matricule', 'email', 'nom', 'prenom']
    ordering       = ['-date_creation']
    readonly_fields = ['date_creation', 'derniere_connexion', 'apercu_photo']

    fieldsets = (
        ('Identité',         {'fields': ('matricule', 'email', 'nom', 'prenom', 'password', 'photo', 'apercu_photo')}),
        ('Rôle',             {'fields': ('role', 'departement')}),
        ('Statut',           {'fields': ('actif', 'is_staff', 'is_superuser')}),
        ('Dates',            {'fields': ('date_creation', 'derniere_connexion')}),
    )
    add_fieldsets = (
        ('Création', {
            'classes': ('wide',),
            'fields':  ('matricule', 'email', 'nom', 'prenom', 'password1', 'password2', 'role', 'departement'),
        }),
    )

    @admin.display(description='Photo')
    def photo_vignette(self, obj):
        if obj.photo:
            return format_html(
                '<img src="{}" style="width:36px;height:36px;border-radius:50%;object-fit:cover;">',
                obj.photo.url
            )
        return '—'

    @admin.display(description='Aperçu photo')
    def apercu_photo(self, obj):
        if obj.photo:
            return format_html(
                '<img src="{}" style="width:96px;height:96px;border-radius:10px;object-fit:cover;">',
                obj.photo.url
            )
        return 'Aucune photo'
