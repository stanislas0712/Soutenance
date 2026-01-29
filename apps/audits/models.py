from django.conf import settings
from django.db import models
from simple_history.models import HistoricalRecords


class IntegrationEvent(models.Model):
    """
    Traçabilité des échanges inter-systèmes (GoodGrants/Odoo).
    Objectif: audit, support, conformité.
    """

    class System(models.TextChoices):
        GOODGRANTS = "goodgrants", "GoodGrants"
        ODOO = "odoo", "Odoo"

    class Direction(models.TextChoices):
        INBOUND = "in", "Entrant"
        OUTBOUND = "out", "Sortant"

    class Status(models.TextChoices):
        RECEIVED = "received", "Reçu"
        PROCESSED = "processed", "Traité"
        FAILED = "failed", "Échec"

    system = models.CharField(max_length=50, choices=System.choices)
    direction = models.CharField(max_length=10, choices=Direction.choices)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.RECEIVED)

    correlation_id = models.CharField(max_length=100, blank=True)  # to correlate request/response/retries
    external_id = models.CharField(max_length=100, blank=True)  # gg_id / odoo_id / webhook event id

    request_payload = models.JSONField(null=True, blank=True)
    response_payload = models.JSONField(null=True, blank=True)
    error_message = models.TextField(blank=True)

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)

    history = HistoricalRecords()

    class Meta:
        verbose_name = "Événement intégration"
        verbose_name_plural = "Événements intégrations"
        indexes = [
            models.Index(fields=["system", "direction", "status"]),
            models.Index(fields=["correlation_id"]),
            models.Index(fields=["external_id"]),
            models.Index(fields=["created_at"]),
        ]

    def __str__(self) -> str:
        return f"{self.system}/{self.direction}/{self.status}"

