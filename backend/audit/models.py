"""
Models pour l'application Audit
Gestion des logs et traçabilité des actions
"""

import uuid
from django.db import models
from django.conf import settings


class ActionAudit(models.TextChoices):
    """Énumération des types d'actions auditées"""
    CREATE = 'CREATE', 'Création'
    UPDATE = 'UPDATE', 'Modification'
    DELETE = 'DELETE', 'Suppression'
    LOGIN = 'LOGIN', 'Connexion'
    LOGOUT = 'LOGOUT', 'Déconnexion'
    APPROVE = 'APPROVE', 'Approbation'
    REJECT = 'REJECT', 'Rejet'
    SUBMIT = 'SUBMIT', 'Soumission'
    VIEW = 'VIEW', 'Consultation'
    EXPORT = 'EXPORT', 'Export'


class LogAudit(models.Model):
    """
    Modèle représentant un log d'audit pour la traçabilité
    """
    id          = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    utilisateur = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='logs',
        verbose_name="Utilisateur"
    )
    table = models.CharField(max_length=100, verbose_name="Table concernée")
    enregistrement_id = models.CharField(max_length=40, verbose_name="ID de l'enregistrement")
    valeur_avant = models.TextField(blank=True, null=True, verbose_name="Valeur avant")
    valeur_apres = models.TextField(blank=True, null=True, verbose_name="Valeur après")
    utilisateur_agent = models.CharField(max_length=255, blank=True, null=True, verbose_name="User Agent")
    date_action = models.DateTimeField(auto_now_add=True, verbose_name="Date de l'action")
    action = models.CharField(
        max_length=20,
        choices=ActionAudit.choices,
        verbose_name="Action"
    )

    class Meta:
        db_table = 'log_audit'
        verbose_name = 'Log Audit'
        verbose_name_plural = 'Logs Audit'
        ordering = ['-date_action']
        indexes = [
            models.Index(fields=['table', 'enregistrement_id']),
            models.Index(fields=['utilisateur', 'date_action']),
            models.Index(fields=['action']),
            models.Index(fields=['-date_action']),
        ]

    def __str__(self):
        return f"{self.action} - {self.table}#{self.enregistrement_id} - {self.date_action}"

    @classmethod
    def enregistrer(cls, utilisateur, table, enregistrement_id, action,
                    valeur_avant=None, valeur_apres=None, user_agent=None):
        """Enregistrer un nouveau log d'audit."""
        return cls.objects.create(
            utilisateur=utilisateur,
            table=table,
            enregistrement_id=str(enregistrement_id),
            action=action,
            valeur_avant=valeur_avant,
            valeur_apres=valeur_apres,
            utilisateur_agent=user_agent,
        )

    @classmethod
    def consulter(cls, filtres=None):
        """Consulter les logs avec des filtres optionnels."""
        queryset = cls.objects.all()

        if filtres:
            if 'table' in filtres:
                queryset = queryset.filter(table=filtres['table'])
            if 'utilisateur' in filtres:
                queryset = queryset.filter(utilisateur=filtres['utilisateur'])
            if 'action' in filtres:
                queryset = queryset.filter(action=filtres['action'])
            if 'date_debut' in filtres:
                queryset = queryset.filter(date_action__gte=filtres['date_debut'])
            if 'date_fin' in filtres:
                queryset = queryset.filter(date_action__lte=filtres['date_fin'])
            if 'enregistrement_id' in filtres:
                queryset = queryset.filter(enregistrement_id=filtres['enregistrement_id'])

        return queryset.select_related('utilisateur')

    def get_details(self):
        """Obtenir les détails du log."""
        return {
            'id': self.id,
            'utilisateur': str(self.utilisateur) if self.utilisateur else 'Système',
            'table': self.table,
            'enregistrement_id': self.enregistrement_id,
            'action': self.get_action_display(),
            'date_action': self.date_action,
            'valeur_avant': self.valeur_avant,
            'valeur_apres': self.valeur_apres,
        }
