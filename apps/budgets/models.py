from __future__ import annotations

from decimal import Decimal

from django.core.exceptions import ValidationError
from django.db import models
from django.db.models import F, Sum
from django.db.models.functions import Coalesce
from simple_history.models import HistoricalRecords

from apps.conventions.models import Convention


class BudgetSection(models.Model):
    """
    Référentiel global des sections (A/B...).
    """

    code = models.CharField(max_length=5, unique=True)  # A, B, ...
    label = models.CharField(max_length=255)
    order = models.PositiveIntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    history = HistoricalRecords()

    class Meta:
        verbose_name = "Section budgétaire"
        verbose_name_plural = "Sections budgétaires"
        ordering = ("order", "code")

    def __str__(self) -> str:
        return f"{self.code} - {self.label}"


class BudgetLine(models.Model):
    convention = models.ForeignKey(Convention, on_delete=models.CASCADE, related_name="budget_lines")
    section = models.ForeignKey(BudgetSection, on_delete=models.PROTECT, related_name="lines")

    code = models.CharField(max_length=10)  # e.g. A1, A2...
    label = models.CharField(max_length=255)
    order = models.PositiveIntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    history = HistoricalRecords()

    class Meta:
        verbose_name = "Ligne budgétaire"
        verbose_name_plural = "Lignes budgétaires"
        ordering = ("section__order", "order", "code")
        constraints = [
            models.UniqueConstraint(fields=["convention", "code"], name="uniq_budget_line_code_per_convention"),
        ]
        indexes = [
            models.Index(fields=["convention", "section"]),
        ]

    def clean(self) -> None:
        if self.convention_id and not self.convention.is_editable:
            raise ValidationError("La convention est validée/verrouillée : le budget n'est plus modifiable.")

    @property
    def total(self) -> Decimal:
        agg = self.sublines.aggregate(
            total=Coalesce(Sum(F("quantity") * F("unit_cost")), Decimal("0.00"))
        )
        return agg["total"] or Decimal("0.00")

    def __str__(self) -> str:
        return f"{self.code} - {self.label}"


class BudgetSubLine(models.Model):
    line = models.ForeignKey(BudgetLine, on_delete=models.CASCADE, related_name="sublines")

    description = models.CharField(max_length=255)
    unit = models.CharField(max_length=50, blank=True)
    quantity = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    unit_cost = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    order = models.PositiveIntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    history = HistoricalRecords()

    class Meta:
        verbose_name = "Sous-ligne budgétaire"
        verbose_name_plural = "Sous-lignes budgétaires"
        ordering = ("line__order", "order", "id")
        indexes = [
            models.Index(fields=["line"]),
        ]

    def clean(self) -> None:
        if self.line_id and self.line.convention_id and not self.line.convention.is_editable:
            raise ValidationError("La convention est validée/verrouillée : le budget n'est plus modifiable.")

    @property
    def total(self) -> Decimal:
        return (self.quantity or Decimal("0")) * (self.unit_cost or Decimal("0"))

    def __str__(self) -> str:
        return self.description

