import re
import uuid
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils import timezone


class Role(models.TextChoices):
    ADMINISTRATEUR = 'ADMINISTRATEUR', 'Administrateur'
    GESTIONNAIRE   = 'GESTIONNAIRE',   'Gestionnaire'
    COMPTABLE      = 'COMPTABLE',      'Comptable'


class Departement(models.Model):
    id          = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    code        = models.CharField(max_length=20, unique=True, verbose_name="Code")
    nom         = models.CharField(max_length=100, verbose_name="Nom")
    description = models.TextField(blank=True, null=True, verbose_name="Description")
    actif       = models.BooleanField(default=True, verbose_name="Actif")

    def save(self, *args, **kwargs):
        if not self.code:
            base = re.sub(r'[^A-Z0-9]', '', self.nom.upper())[:8] or 'DEPT'
            code = base
            counter = 1
            qs = Departement.objects.exclude(pk=self.pk) if self.pk else Departement.objects.all()
            while qs.filter(code=code).exists():
                code = f"{base}{counter}"
                counter += 1
            self.code = code
        super().save(*args, **kwargs)

    class Meta:
        db_table        = 'departement'
        verbose_name    = 'Département'
        verbose_name_plural = 'Départements'
        ordering        = ['nom']

    def __str__(self):
        return f"{self.code} – {self.nom}"


class UtilisateurManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("L'email est obligatoire")
        email = self.normalize_email(email)
        user  = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff',     True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('actif',        True)
        extra_fields.setdefault('role',         Role.ADMINISTRATEUR)
        return self.create_user(email, password, **extra_fields)


class Utilisateur(AbstractBaseUser, PermissionsMixin):
    id                 = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    matricule          = models.CharField(max_length=50, unique=True, verbose_name="Matricule")
    email              = models.EmailField(unique=True, verbose_name="Email")
    nom                = models.CharField(max_length=100, verbose_name="Nom")
    prenom             = models.CharField(max_length=100, verbose_name="Prénom")
    photo              = models.ImageField(upload_to='photos/', blank=True, null=True)
    role               = models.CharField(
                            max_length=20,
                            choices=Role.choices,
                            default=Role.GESTIONNAIRE,
                            verbose_name="Rôle"
                         )
    departement        = models.ForeignKey(
                            Departement,
                            on_delete=models.SET_NULL,
                            null=True, blank=True,
                            related_name='utilisateurs',
                            verbose_name="Département"
                         )
    actif                 = models.BooleanField(default=True, verbose_name="Actif")
    bloque                = models.BooleanField(default=False, verbose_name="Compte bloqué")
    tentatives_connexion  = models.PositiveSmallIntegerField(default=0, verbose_name="Tentatives échouées")
    date_creation         = models.DateTimeField(auto_now_add=True)
    derniere_connexion    = models.DateTimeField(null=True, blank=True)
    is_staff              = models.BooleanField(default=False)

    objects = UtilisateurManager()

    USERNAME_FIELD  = 'email'
    REQUIRED_FIELDS = ['matricule', 'nom', 'prenom']

    class Meta:
        db_table            = 'utilisateur'
        verbose_name        = 'Utilisateur'
        verbose_name_plural = 'Utilisateurs'
        ordering            = ['-date_creation']
        indexes             = [
            models.Index(fields=['email']),
            models.Index(fields=['matricule']),
            models.Index(fields=['role']),
        ]

    def __str__(self):
        return f"{self.matricule} – {self.nom} {self.prenom}"

    @property
    def is_active(self):
        return self.actif

    MAX_TENTATIVES = 3

    def se_connecter(self):
        """Connexion réussie : réinitialise le compteur de tentatives."""
        self.derniere_connexion   = timezone.now()
        self.tentatives_connexion = 0
        self.save(update_fields=['derniere_connexion', 'tentatives_connexion'])

    def incrementer_tentatives(self):
        """Mauvais mot de passe : incrémente et bloque après MAX_TENTATIVES."""
        self.tentatives_connexion += 1
        if self.tentatives_connexion >= self.MAX_TENTATIVES:
            self.bloque = True
        self.save(update_fields=['tentatives_connexion', 'bloque'])

    def debloquer(self):
        """Déblocage administrateur : remet les compteurs à zéro."""
        self.bloque               = False
        self.tentatives_connexion = 0
        self.save(update_fields=['bloque', 'tentatives_connexion'])

    # ── Propriétés de rôle ──────────────────────────────────────────────────
    @property
    def is_administrateur(self):
        return self.role == Role.ADMINISTRATEUR

    @property
    def is_gestionnaire(self):
        return self.role == Role.GESTIONNAIRE

    @property
    def is_comptable(self):
        return self.role == Role.COMPTABLE
