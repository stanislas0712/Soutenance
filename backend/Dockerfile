# ── Stage 1 : base ────────────────────────────────────────────────────────────
FROM python:3.11-slim AS base

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

# Dépendances système (psycopg2, WeasyPrint, python-magic)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev \
    gcc \
    libmagic1 \
    libcairo2 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libgdk-pixbuf2.0-0 \
    libffi-dev \
    shared-mime-info \
    && rm -rf /var/lib/apt/lists/*

# ── Stage 2 : développement ───────────────────────────────────────────────────
FROM base AS development

COPY requirements/base.txt requirements/development.txt ./requirements/
RUN pip install -r requirements/development.txt

COPY . .

EXPOSE 8000

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]

# ── Stage 3 : production ──────────────────────────────────────────────────────
FROM base AS production

# Créer un utilisateur non-root
RUN groupadd -r budgetflow && useradd -r -g budgetflow budgetflow

COPY requirements/base.txt requirements/production.txt ./requirements/
RUN pip install -r requirements/production.txt

COPY . .

# Collecter les fichiers statiques
RUN python manage.py collectstatic --noinput

# Changer la propriété des fichiers
RUN chown -R budgetflow:budgetflow /app

USER budgetflow

EXPOSE 8000

# Gunicorn en production
CMD ["gunicorn", "config.wsgi:application", \
     "--bind", "0.0.0.0:8000", \
     "--workers", "4", \
     "--worker-class", "gthread", \
     "--threads", "2", \
     "--timeout", "120", \
     "--access-logfile", "-", \
     "--error-logfile", "-"]
