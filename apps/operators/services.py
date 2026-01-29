"""
Operator services.

Use services to encapsulate validation / dedup / enrichment rules.
"""

from __future__ import annotations

from django.db import transaction

from .models import Operator


@transaction.atomic
def upsert_operator(*, name: str, registration_number: str = "", defaults: dict | None = None) -> Operator:
    defaults = defaults or {}
    obj, _created = Operator.objects.update_or_create(
        name=name.strip(),
        defaults={"registration_number": registration_number.strip(), **defaults},
    )
    return obj

