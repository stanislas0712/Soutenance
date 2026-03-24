# BudgetFlow — Plateforme de Gestion Budgétaire Entreprise

[![CI/CD](https://github.com/votre-org/budgetflow/actions/workflows/ci.yml/badge.svg)](https://github.com/votre-org/budgetflow/actions)
[![Coverage](https://img.shields.io/badge/coverage-≥85%25-brightgreen)](https://github.com/votre-org/budgetflow)
[![Python](https://img.shields.io/badge/python-3.11%2B-blue)](https://python.org)
[![Django](https://img.shields.io/badge/django-4.2%20LTS-green)](https://djangoproject.com)
[![React](https://img.shields.io/badge/react-18-61DAFB)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/typescript-5-blue)](https://typescriptlang.org)
[![License](https://img.shields.io/badge/license-MIT-lightgrey)](LICENSE)

> **Projet académique de fin d'études** — Plateforme web complète de gestion budgétaire d'entreprise, conçue selon les standards de l'industrie : Clean Architecture, sécurité OWASP Top 10, tests automatisés, CI/CD.

---

## Table des matières

1. [Présentation](#présentation)
2. [Architecture globale](#architecture-globale)
3. [Justification des choix techniques](#justification-des-choix-techniques)
4. [Prérequis système](#prérequis-système)
5. [Installation rapide](#installation-rapide)
6. [Variables d'environnement](#variables-denvironnement)
7. [Commandes utiles](#commandes-utiles)
8. [Identifiants de démonstration](#identifiants-de-démonstration)
9. [Documentation API](#documentation-api)
10. [Tests](#tests)
11. [Sécurité](#sécurité)
12. [Liens utiles](#liens-utiles)

---

## Présentation

**BudgetFlow** est une plateforme web de gestion budgétaire d'entreprise permettant de gérer le cycle de vie complet des budgets départementaux :

- **Gestionnaire** : crée, soumet et corrige ses budgets
- **Comptable** : valide, approuve ou rejette les budgets soumis
- **Administrateur** : gère les utilisateurs, départements, exercices et enveloppes budgétaires

### Fonctionnalités clés

| Fonctionnalité | Description |
|---|---|
| Workflow budgétaire | Machine à états : Brouillon → Soumis → Approuvé/Rejeté → Clôturé |
| Contrôle des enveloppes | Plafonnement automatique, alertes dépassement |
| Audit trail | Historique immuable de toutes les actions |
| Notifications | In-app + email (Celery async) |
| Exports | PDF (WeasyPrint) + Excel (openpyxl) |
| Rapports | KPIs, évolution mensuelle, par département |
| API REST | OpenAPI 3.0, documentation Swagger interactive |

---

## Architecture globale

```
┌─────────────────────────────────────────────────────────────────┐
│                         NGINX (80/443)                          │
│                    Reverse Proxy + SSL/TLS                      │
└──────────────────┬──────────────────────┬───────────────────────┘
                   │                      │
          ┌────────▼────────┐    ┌────────▼────────┐
          │   React + TS    │    │  Django + DRF   │
          │   (Vite/SPA)    │    │   API REST v1   │
          │   :3000/static  │    │      :8000      │
          └─────────────────┘    └────────┬────────┘
                                          │
              ┌───────────────────────────┼───────────────────────┐
              │                           │                       │
     ┌────────▼───────┐         ┌─────────▼──────┐    ┌──────────▼─────┐
     │  PostgreSQL 15  │         │    Redis 7     │    │   MinIO (S3)   │
     │  Base de données│         │ Cache + Broker │    │ Stockage objets│
     └─────────────────┘         └────────┬───────┘    └────────────────┘
                                          │
                               ┌──────────▼──────────┐
                               │   Celery Workers    │
                               │  + Celery Beat      │
                               │ (tâches async/cron) │
                               └─────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    Pattern Architectural                        │
│                                                                 │
│  PRÉSENTATION  →  Views DRF + Serializers                       │
│        ↓                                                        │
│  APPLICATION   →  Services (use cases métier)                   │
│        ↓                                                        │
│  DOMAINE       →  Models + règles métier + StateMachine         │
│        ↓                                                        │
│  INFRASTRUCTURE → Repository (Selectors) + ORM Django           │
└─────────────────────────────────────────────────────────────────┘
```

### Structure des répertoires

```
budgetflow/
├── backend/                    ← Projet Django
│   ├── config/
│   │   ├── settings/
│   │   │   ├── base.py         ← settings communs
│   │   │   ├── development.py  ← DEBUG=True
│   │   │   ├── production.py   ← sécurité maximale
│   │   │   └── test.py         ← BD en mémoire
│   │   ├── urls.py
│   │   ├── wsgi.py
│   │   └── asgi.py
│   ├── apps/
│   │   ├── users/              ← Gestion utilisateurs
│   │   ├── authentication/     ← JWT auth
│   │   ├── departements/       ← Départements
│   │   ├── exercices/          ← Exercices budgétaires
│   │   ├── enveloppes/         ← Enveloppes budgétaires
│   │   ├── budgets/            ← Domaine principal
│   │   ├── notifications/      ← Système de notifications
│   │   └── rapports/           ← KPIs et exports
│   ├── common/                 ← Code partagé
│   │   ├── models.py           ← BaseModel UUID
│   │   ├── permissions.py      ← Permissions par rôle
│   │   ├── renderers.py        ← Format réponse uniforme
│   │   ├── exceptions.py       ← Exceptions métier
│   │   ├── pagination.py
│   │   └── validators.py
│   ├── requirements/
│   │   ├── base.txt
│   │   ├── development.txt
│   │   └── production.txt
│   └── manage.py
├── frontend/                   ← Application React/TypeScript
│   ├── src/
│   │   ├── api/                ← Clients HTTP + types
│   │   ├── components/         ← Composants réutilisables
│   │   ├── pages/              ← Pages par rôle
│   │   ├── hooks/              ← Custom hooks
│   │   ├── store/              ← État global (Zustand)
│   │   ├── utils/              ← Utilitaires
│   │   └── router/             ← Configuration routing
│   └── package.json
├── docker-compose.yml          ← Dev environment
├── docker-compose.prod.yml     ← Production
├── nginx/
│   └── nginx.conf
└── .github/
    └── workflows/
        └── ci.yml
```

---

## Justification des choix techniques

### Django 4.2 LTS
- **Framework mature** (+ de 15 ans) avec "batteries included"
- **ORM puissant** avec migrations versionnées et auditables
- **Sécurité éprouvée** : protection CSRF, XSS, injection SQL intégrée
- **DRF** : standard industrie pour les APIs REST
- **LTS** : support garanti jusqu'en avril 2026, stabilité en production

### React 18 + TypeScript 5
- **TypeScript** : typage statique → détection d'erreurs à la compilation
- **Composants réutilisables** → maintenabilité et cohérence UI
- **React 18 Concurrent** : performances améliorées (Suspense, transitions)
- **Séparation frontend/backend** → scalabilité indépendante

### PostgreSQL 15
- **ACID compliance** → intégrité des données financières garantie
- **Transactions atomiques** pour les opérations budgétaires critiques
- **Support JSON natif** pour les métadonnées flexibles
- **Performance analytique** sur les requêtes de rapports

### Redis 7
- **Cache des tableaux de bord** → latence < 50ms vs > 500ms sans cache
- **Broker Celery** → file de tâches asynchrones persistante
- **Rate limiting** → protection contre les attaques par force brute
- **Atomic operations** → verrous distribués thread-safe

### JWT (djangorestframework-simplejwt)
- **Stateless** → scalabilité horizontale sans session partagée
- **Refresh token rotation** → révocation sécurisée
- **Standard RFC 7519** → interopérabilité maximale
- **Blacklist** → invalidation explicite à la déconnexion

---

## Prérequis système

| Outil | Version minimale |
|---|---|
| Docker | 24.0+ |
| Docker Compose | 2.20+ |
| Git | 2.40+ |
| Make (optionnel) | 4.0+ |

> **Note** : Docker Compose gère automatiquement Python, Node.js, PostgreSQL, Redis, etc.

---

## Installation rapide

```bash
# 1. Cloner le dépôt
git clone https://github.com/votre-org/budgetflow.git
cd budgetflow

# 2. Copier et configurer les variables d'environnement
cp .env.example .env
# Éditer .env si nécessaire (les valeurs par défaut fonctionnent en dev)

# 3. Construire et démarrer les conteneurs
docker compose up -d --build

# 4. Appliquer les migrations et charger les données de démo
docker compose exec backend python manage.py migrate
docker compose exec backend python manage.py loaddata fixtures/demo.json

# 5. Créer un superutilisateur admin (optionnel, déjà dans fixtures)
docker compose exec backend python manage.py createsuperuser
```

L'application est disponible sur **http://localhost** après ces 5 commandes.

---

## Variables d'environnement

Copier `.env.example` → `.env` et adapter :

```env
# ─── Django ───────────────────────────────────────────────────────
DJANGO_SETTINGS_MODULE=config.settings.development
SECRET_KEY=your-secret-key-min-50-chars
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# ─── Base de données ──────────────────────────────────────────────
DB_ENGINE=django.db.backends.postgresql
DB_NAME=budgetflow
DB_USER=budgetflow
DB_PASSWORD=budgetflow_secret
DB_HOST=postgres
DB_PORT=5432

# ─── Redis ────────────────────────────────────────────────────────
REDIS_URL=redis://redis:6379/0
CELERY_BROKER_URL=redis://redis:6379/1
CELERY_RESULT_BACKEND=redis://redis:6379/2

# ─── MinIO / S3 ───────────────────────────────────────────────────
AWS_ACCESS_KEY_ID=minioadmin
AWS_SECRET_ACCESS_KEY=minioadmin
AWS_STORAGE_BUCKET_NAME=budgetflow
AWS_S3_ENDPOINT_URL=http://minio:9000

# ─── Email ────────────────────────────────────────────────────────
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=mailpit
EMAIL_PORT=1025
EMAIL_USE_TLS=False
DEFAULT_FROM_EMAIL=noreply@budgetflow.local

# ─── JWT ──────────────────────────────────────────────────────────
JWT_ACCESS_TOKEN_LIFETIME_MINUTES=15
JWT_REFRESH_TOKEN_LIFETIME_DAYS=7

# ─── Sentry (production) ──────────────────────────────────────────
SENTRY_DSN=
```

---

## Commandes utiles

```bash
# ─── Développement ────────────────────────────────────────────────
docker compose up -d                    # Démarrer tous les services
docker compose logs -f backend          # Logs backend en temps réel
docker compose exec backend bash        # Shell dans le conteneur

# ─── Django ───────────────────────────────────────────────────────
docker compose exec backend python manage.py migrate
docker compose exec backend python manage.py makemigrations
docker compose exec backend python manage.py shell_plus        # shell amélioré
docker compose exec backend python manage.py collectstatic

# ─── Tests ────────────────────────────────────────────────────────
docker compose exec backend pytest                             # tous les tests
docker compose exec backend pytest --cov=apps --cov-report=html
docker compose exec backend pytest apps/budgets/tests/ -v     # app spécifique
cd frontend && npm run test                                    # tests frontend
cd frontend && npm run test:coverage

# ─── Qualité code ─────────────────────────────────────────────────
docker compose exec backend black .
docker compose exec backend isort .
docker compose exec backend flake8
cd frontend && npm run lint
cd frontend && npm run type-check

# ─── Celery ───────────────────────────────────────────────────────
docker compose exec celery-worker celery -A config inspect active
docker compose exec celery-beat celery -A config beat --loglevel=info

# ─── Base de données ──────────────────────────────────────────────
docker compose exec postgres psql -U budgetflow budgetflow
docker compose exec backend python manage.py dumpdata --indent=2 > fixtures/dump.json

# ─── Production ───────────────────────────────────────────────────
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml exec backend python manage.py migrate
```

---

## Identifiants de démonstration

| Rôle | Email | Mot de passe |
|---|---|---|
| Administrateur | admin@budgetflow.local | Admin1234! |
| Comptable | comptable1@budgetflow.local | Compta1234! |
| Comptable | comptable2@budgetflow.local | Compta1234! |
| Gestionnaire Finance | gestionnaire.finance@budgetflow.local | Gest1234! |
| Gestionnaire RH | gestionnaire.rh@budgetflow.local | Gest1234! |
| Gestionnaire IT | gestionnaire.it@budgetflow.local | Gest1234! |

---

## Documentation API

| URL | Description |
|---|---|
| http://localhost:8000/api/docs/ | Swagger UI interactif |
| http://localhost:8000/api/redoc/ | ReDoc (documentation lisible) |
| http://localhost:8000/api/schema/ | Schéma OpenAPI 3.0 (JSON/YAML) |

> **Authentification Swagger** : cliquer "Authorize" → saisir `Bearer <access_token>`

---

## Tests

```bash
# Rapport de couverture complet
docker compose exec backend pytest --cov=apps --cov-report=html --cov-report=term-missing

# Résultats dans htmlcov/index.html
# Couverture cible : ≥ 85%
```

### Cas critiques testés

- Isolation des données par rôle (gestionnaire voit uniquement ses budgets)
- Machine à états : transitions valides/invalides
- Anti-conflit d'intérêts : comptable ne peut approuver son propre département
- Rate limiting : 6ème tentative de login → 429 Too Many Requests
- Dépassement d'enveloppe → 400 Bad Request
- Upload fichier avec mauvais MIME → 400 Bad Request
- Race condition lors de l'approbation concurrente

---

## Sécurité

BudgetFlow implémente l'ensemble des recommandations **OWASP Top 10** :

| OWASP | Mesure |
|---|---|
| A01 Broken Access Control | Permissions DRF granulaires par rôle + ownership, UUIDs |
| A02 Cryptographic Failures | Bcrypt passwords, HTTPS/HSTS, secrets .env, JWT HS256 |
| A03 Injection | ORM Django, validation Zod/serializers, pas de SQL brut |
| A04 Insecure Design | Moindre privilège, anti-conflit d'intérêts, audit trail |
| A05 Security Misconfiguration | DEBUG=False prod, CSP headers, CORS restreint |
| A06 Vulnerable Components | Versions épinglées, safety check CI, images Docker officielles |
| A07 Authentication Failures | Lock 5 tentatives, rate limit 10/min, JWT blacklist |
| A08 Software & Data Integrity | python-magic MIME check, machine à états explicite |
| A09 Logging & Monitoring | Logs JSON structurés, Sentry, audit trail complet |
| A10 SSRF | Pas de fetch externe, MinIO URLs présignées |

---

## Liens utiles

| Service | URL | Accès |
|---|---|---|
| Application | http://localhost | - |
| API Swagger | http://localhost:8000/api/docs/ | - |
| Django Admin | http://localhost:8000/admin/ | admin@budgetflow.local |
| pgAdmin | http://localhost:5050 | admin@admin.com / admin |
| Flower (Celery) | http://localhost:5555 | - |
| MinIO Console | http://localhost:9001 | minioadmin / minioadmin |
| Mailpit (emails dev) | http://localhost:8025 | - |

---

## Méthodologie

- **Agile Scrum** : 4 sprints de 2 semaines, backlog priorisé
- **Git Flow** : branches `feature/`, `fix/`, `release/`
- **Conventional Commits** : `feat:`, `fix:`, `docs:`, `test:`, `refactor:`
- **Code Review** : Pull Requests obligatoires, CI verte avant merge

---

*Développé dans le cadre d'un projet de fin d'études — 2024/2025*
