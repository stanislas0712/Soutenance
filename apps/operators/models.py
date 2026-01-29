from django.db import models
from simple_history.models import HistoricalRecords


class Operator(models.Model):
    """
    Organisme/opérateur (ex: centre de formation).
    """

    name = models.CharField(max_length=255)
    registration_number = models.CharField(max_length=100, blank=True)

    contact_person = models.CharField(max_length=255, blank=True)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=50, blank=True)
    address = models.TextField(blank=True)

    odoo_id = models.IntegerField(null=True, blank=True)

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    history = HistoricalRecords()

    class Meta:
        verbose_name = "Opérateur"
        verbose_name_plural = "Opérateurs"
        indexes = [
            models.Index(fields=["name"]),
            models.Index(fields=["odoo_id"]),
            models.Index(fields=["is_active"]),
        ]

    def __str__(self) -> str:
        return self.name

