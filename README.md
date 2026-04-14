# Gestion Budgétaire — Plateforme de Gestion Budgétaire d'Entreprise

[![CI](https://github.com/stanislas0712/Gestion-de-budget/actions/workflows/ci.yml/badge.svg)](https://github.com/stanislas0712/Gestion-de-budget/actions)
[![Python](https://img.shields.io/badge/Python-3.10+-blue.svg)](https://www.python.org/)
[![Django](https://img.shields.io/badge/Django-5.2-green.svg)](https://djangoproject.com/)
[![React](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev/)
![License](https://img.shields.io/badge/licence-académique-lightgrey.svg)

> Application web de gestion budgétaire avec circuit de validation multi-rôles, traçabilité complète et assistance par intelligence artificielle (Claude — Anthropic).

---

## Table des matières

1. [Présentation](#1-présentation)
2. [Fonctionnalités](#2-fonctionnalités)
3. [Stack technologique](#3-stack-technologique)
4. [Modèle de données](#4-modèle-de-données)
5. [Rôles et permissions](#5-rôles-et-permissions)
6. [API REST](#6-api-rest)
7. [Structure du projet](#7-structure-du-projet)
8. [Installation et démarrage](#8-installation-et-démarrage)
9. [Variables d'environnement](#9-variables-denvironnement)
10. [Administration Django](#10-administration-django)
11. [Auteur](#11-auteur)

---

## 1. Présentation

**Gestion Budgétaire** est une plateforme de gestion budgétaire conçue pour les entreprises et organisations qui souhaitent structurer, soumettre, valider et suivre leurs budgets départementaux de manière rigoureuse et traçable.

Le système repose sur un **circuit de validation à trois niveaux** :

```
Administrateur  →  vote le budget annuel global et l'alloue aux départements
Gestionnaire    →  crée les budgets départementaux et saisit les dépenses
Comptable       →  examine, approuve ou rejette les budgets et les dépenses
```

Chaque action (création, modification, validation, rejet) est automatiquement **journalisée** dans un journal d'audit immuable. Une **assistance IA** (modèle Claude d'Anthropic) permet d'analyser les budgets, détecter les anomalies et suggérer des optimisations.

---

## 2. Fonctionnalités

### Gestion budgétaire

- Vote du **budget annuel global** avec découpage par exercice (1 ou plusieurs années)
- **Allocations départementales** : répartition du budget global entre les départements avec contrôle de dépassement
- Création de budgets par les gestionnaires avec lignes budgétaires (REVENU / DÉPENSE)
- Techniques d'estimation : **Analogie**, **3 Points (PERT)**, **Ascendante**
- Circuit de statuts : `BROUILLON → SOUMIS → APPROUVÉ / REJETÉ → CLÔTURÉ`
- Jauge de consommation temps réel par département et par ligne

### Suivi des dépenses

- Saisie de dépenses multi-lignes sur un budget approuvé
- Pièces justificatives (fichiers uploadés)
- Validation / rejet par le comptable avec motif obligatoire
- Mise à jour automatique des montants consommés

### Rapports & KPIs

- Tableaux de bord rôle-spécifiques avec indicateurs clés
- Graphiques d'exécution budgétaire (Recharts)
- Export **CSV** et **PDF** sur toutes les listes
- Page KPI Analytics (admin + comptable)

### Intelligence artificielle (Claude — Anthropic)

- Analyse automatique d'un budget : cohérence, risques, optimisations
- Détection d'anomalies sur les dépenses
- Suggestions de réallocation
- Chatbot budgétaire intégré (mode conversationnel)
- Mode de contournement (`SKIP_CLAUDE_API=True`) pour les environnements sans clé API

### Sécurité & gestion des utilisateurs

- Authentification **JWT** (access 15 min / refresh 7 jours) avec hachage **Argon2**
- Blocage automatique après 3 tentatives de connexion échouées
- Réinitialisation de mot de passe par email avec token signé
- Gestion des profils utilisateurs avec photo

### Traçabilité complète

- Journal d'audit `LogAudit` : CREATE / UPDATE / DELETE / LOGIN / APPROVE / REJECT / SUBMIT / EXPORT / VIEW
- Déclenchement automatique via signaux Django
- Capture de l'état avant/après sur chaque modification
- Interface de consultation avec filtres par action, table et date

### Administration

- Interface d'administration Django avec **SimpleUI**
- Gestion complète des utilisateurs, départements, budgets et allocations
- Filtres avancés, jauges de consommation, badges colorés par statut

---

## 3. Stack technologique

### Backend

| Composant | Technologie | Version |
|---|---|---|
| Framework web | Django | 5.2 |
| API REST | Django REST Framework | ≥ 3.15 |
| Authentification | djangorestframework-simplejwt | 5.3.1 |
| Hachage mots de passe | argon2-cffi | ≥ 23.1 |
| Base de données | PostgreSQL | 15 |
| Driver PostgreSQL | psycopg2-binary | 2.9.11 |
| Intelligence artificielle | Claude API (Anthropic) | claude-3-5-sonnet |
| Interface admin | django-simpleui | latest |
| CORS | django-cors-headers | ≥ 4.4 |
| Images | Pillow | ≥ 10 |
| Export Excel | openpyxl | ≥ 3.1 |
| Export PDF | reportlab | ≥ 4 |
| Configuration | python-dotenv | 1.0.1 |

### Frontend

| Composant | Technologie | Version |
|---|---|---|
| Framework UI | React | 19 |
| Build tool | Vite | 7 |
| CSS | TailwindCSS | 4 |
| Requêtes HTTP | Axios | ≥ 1.13 |
| State serveur | TanStack Query | 5 |
| Routage | React Router DOM | 7 |
| Graphiques | Recharts | 3 |
| Icônes | Lucide React | ≥ 0.577 |

---

## 4. Modèle de données

### Application `accounts`

```
Departement
├── id          UUID (PK, auto)
├── code        CharField unique (généré automatiquement depuis le nom)
├── nom         CharField
├── description TextField (optionnel)
└── actif       BooleanField

Utilisateur  (AbstractBaseUser)
├── id                  UUID (PK, auto)
├── matricule           CharField unique
├── email               EmailField unique
├── nom / prenom        CharField
├── photo               ImageField
├── role                ADMINISTRATEUR | GESTIONNAIRE | COMPTABLE
├── departement         FK → Departement
├── actif               BooleanField
├── bloque              BooleanField
├── tentatives_connexion PositiveSmallIntegerField (max 3 avant blocage)
└── derniere_connexion  DateTimeField
```

### Application `budget`

```
BudgetAnnuel
├── id             UUID (PK)
├── annee          IntegerField
├── annee_fin      IntegerField (optionnel — exercice pluriannuel)
├── montant_global DecimalField
└── description    TextField

AllocationDepartementale
├── budget_annuel   FK → BudgetAnnuel
├── departement     FK → Departement
├── montant_alloue  DecimalField
├── montant_consomme  (calculé)
└── montant_disponible (calculé)

Budget
├── id               UUID (PK)
├── code             CharField unique (auto-généré)
├── nom              CharField
├── statut           BROUILLON | SOUMIS | APPROUVE | REJETE | CLOTURE
├── technique        ANALOGIE | TROIS_POINTS | ASCENDANTE
├── gestionnaire     FK → Utilisateur
├── departement      FK → Departement
├── comptable        FK → Utilisateur (validateur)
├── date_soumission  DateTimeField
├── motif_rejet      TextField
└── montant_global   (calculé depuis les lignes)

LigneBudgetaire
├── budget           FK → Budget
├── sous_categorie   FK → SousCategorie
├── libelle          CharField
├── section          REVENU | DEPENSE
├── montant_alloue   DecimalField
├── montant_consomme DecimalField
└── montant_disponible DecimalField

ConsommationLigne  (dépenses)
├── ligne            FK → LigneBudgetaire
├── reference        CharField unique (auto-généré)
├── montant          DecimalField
├── statut           SAISIE | VALIDEE | REJETEE
├── enregistre_par   FK → Utilisateur
├── validateur       FK → Utilisateur
├── piece_justificative FileField
└── motif_rejet      TextField
```

### Application `audit`

```
LogAudit
├── id                UUID (PK)
├── utilisateur       FK → Utilisateur
├── table             CharField
├── enregistrement_id CharField
├── action            CREATE | UPDATE | DELETE | LOGIN | APPROVE | REJECT | SUBMIT | EXPORT
├── valeur_avant      TextField JSON
├── valeur_apres      TextField JSON
└── date_action       DateTimeField (auto)
```

---

## 5. Rôles et permissions

| Fonctionnalité | Administrateur | Gestionnaire | Comptable |
|---|:---:|:---:|:---:|
| Gérer les départements | ✅ | — | — |
| Gérer les utilisateurs | ✅ | — | — |
| Budget annuel & allocations | ✅ | — | — |
| Voir tous les budgets | ✅ | — | ✅ |
| Créer / modifier un budget | — | ✅ | — |
| Soumettre un budget | — | ✅ | — |
| Approuver / rejeter un budget | — | — | ✅ |
| Clôturer un budget | — | — | ✅ |
| Saisir des dépenses | — | ✅ | — |
| Valider / rejeter des dépenses | — | — | ✅ |
| Rapports & KPIs | ✅ | — | ✅ |
| Journal d'audit | ✅ | — | — |
| Assistant IA | ✅ | ✅ | ✅ |
| Administration Django | ✅ | — | — |

---

## 6. API REST

Base URL : `http://localhost:8000/api/v1/`

### Authentification

| Méthode | Endpoint | Description |
|---|---|---|
| POST | `/auth/login/` | Connexion — retourne access + refresh |
| POST | `/auth/token/refresh/` | Renouvellement du token access |
| POST | `/auth/reset-password/request/` | Demande de réinitialisation par email |
| POST | `/auth/reset-password/confirm/` | Confirmation avec token |

### Comptes

| Méthode | Endpoint | Description |
|---|---|---|
| GET / POST | `/departements/` | Lister / créer |
| GET / PATCH / DELETE | `/departements/{id}/` | Détail / modifier / supprimer |
| GET / POST | `/utilisateurs/` | Lister / créer |
| GET / PATCH / DELETE | `/utilisateurs/{id}/` | Détail / modifier / supprimer |
| GET / PATCH | `/auth/me/` | Profil de l'utilisateur connecté |

### Budgets

| Méthode | Endpoint | Description |
|---|---|---|
| GET / POST | `/budgets-annuels/` | Budgets annuels |
| GET / POST | `/budgets-annuels/{id}/allocations/` | Allocations d'un exercice |
| GET / POST | `/budgets/` | Budgets départementaux |
| GET / PATCH | `/budgets/{id}/` | Détail |
| POST | `/budgets/{id}/soumettre/` | Soumettre pour validation |
| POST | `/budgets/{id}/approuver/` | Approuver |
| POST | `/budgets/{id}/rejeter/` | Rejeter |
| POST | `/budgets/{id}/cloturer/` | Clôturer |
| GET / POST | `/budgets/{id}/lignes/` | Lignes budgétaires |
| POST | `/budgets/{id}/depense-multi/` | Saisie dépense multi-lignes |

### Dépenses

| Méthode | Endpoint | Description |
|---|---|---|
| GET | `/depenses/` | Lister (filtrable par statut, budget) |
| GET | `/depenses/{id}/` | Détail |
| POST | `/depenses/{id}/valider/` | Valider |
| POST | `/depenses/{id}/rejeter/` | Rejeter avec motif |

### Intelligence artificielle

| Méthode | Endpoint | Description |
|---|---|---|
| POST | `/ia/analyser/{budget_id}/` | Analyse complète d'un budget |
| POST | `/ia/anomalies/{budget_id}/` | Détection d'anomalies |
| POST | `/ia/suggestions/{budget_id}/` | Suggestions de réallocation |
| GET / POST | `/ia/conversations/` | Conversations chatbot |
| POST | `/ia/conversations/{id}/messages/` | Envoyer un message |

### Rapports & Journal d'audit

| Méthode | Endpoint | Description |
|---|---|---|
| GET | `/rapports/kpis/` | Indicateurs clés globaux |
| GET | `/rapports/evolution/` | Évolution mensuelle |
| GET | `/rapports/departements/` | Consommation par département |
| GET | `/audit/logs/` | Journal d'audit (filtrable) |

---

## 7. Structure du projet

```
Gestion-de-budget/
│
├── backend/                          # Django API
│   ├── accounts/                     # Utilisateurs, départements, rôles
│   ├── budget/                       # Cœur métier (budgets, lignes, dépenses, IA)
│   ├── audit/                        # Traçabilité (LogAudit)
│   ├── config/                       # Settings, URLs, WSGI
│   ├── templates/                    # Templates admin + emails
│   ├── requirements.txt
│   └── manage.py
│
├── frontend/                         # React SPA
│   ├── src/
│   │   ├── api/                      # Clients Axios (budget, dépenses, IA, audit)
│   │   ├── components/               # Layout, StatusBadge, ChatbotDrawer…
│   │   ├── context/AuthContext.jsx   # JWT + refresh auto
│   │   ├── pages/                    # landing / admin / gestionnaire / comptable / ia
│   │   └── utils/                    # export.js, constants.js, notifRefresh.js
│   └── package.json
│
├── .github/workflows/
│   └── ci.yml                        # Tests + lint à chaque push/PR
│
├── .env.example
└── README.md
```

---

## 8. Installation et démarrage

### Prérequis

- Python 3.10+
- Node.js 20+
- PostgreSQL 15

### Backend

```bash
cd backend

# Créer et activer l'environnement virtuel
python -m venv ../venv
../venv/Scripts/activate           # Windows
# source ../venv/bin/activate      # Linux/Mac

# Installer les dépendances
pip install -r requirements.txt

# Configurer l'environnement
cp ../.env.example ../.env
# Adapter DB_HOST, DB_USER, DB_PASSWORD, SECRET_KEY…

# Migrations
python manage.py migrate

# Créer un superutilisateur
python manage.py createsuperuser

# Démarrer le serveur
python manage.py runserver
```

### Frontend

```bash
cd frontend

# Installer les dépendances
npm install

# Build de production (servi par Django)
npm run build

# Ou démarrer en mode développement (hot reload)
npm run dev
```

---

## 9. Variables d'environnement

Copiez `.env.example` en `.env` et adaptez les valeurs. **Ne commitez jamais `.env`.**

| Variable | Description | Défaut |
|---|---|---|
| `SECRET_KEY` | Clé secrète Django (≥ 50 caractères) | *obligatoire* |
| `DEBUG` | Mode debug Django | `True` |
| `ALLOWED_HOSTS` | Hôtes autorisés (virgule) | `localhost,127.0.0.1` |
| `DB_NAME` | Nom de la base PostgreSQL | `budgetflow` |
| `DB_USER` | Utilisateur PostgreSQL | `budgetflow` |
| `DB_PASSWORD` | Mot de passe PostgreSQL | *obligatoire* |
| `DB_HOST` | Hôte PostgreSQL | `localhost` |
| `DB_PORT` | Port PostgreSQL | `5432` |
| `ANTHROPIC_API_KEY` | Clé API Claude (Anthropic) | *optionnel* |
| `SKIP_CLAUDE_API` | Désactiver les appels IA | `False` |
| `JWT_ACCESS_TOKEN_LIFETIME_MINUTES` | Durée du token access | `15` |
| `JWT_REFRESH_TOKEN_LIFETIME_DAYS` | Durée du token refresh | `7` |
| `EMAIL_HOST` | Serveur SMTP | `smtp.gmail.com` |
| `EMAIL_PORT` | Port SMTP | `587` |
| `EMAIL_HOST_USER` | Email d'envoi | *configurable* |
| `EMAIL_HOST_PASSWORD` | Mot de passe SMTP | *configurable* |
| `FRONTEND_URL` | URL du frontend (liens email) | `http://localhost:8000` |

---

## 10. Administration Django

L'interface d'administration est accessible sur `/manager/` avec un compte `is_staff=True`.

- Thème sombre (SimpleUI)
- Gestion des utilisateurs avec badges rôle, statut actif/bloqué
- Budgets avec jauge de consommation inline
- Journal d'audit en lecture seule avec badges colorés par action

---

## 11. Auteur

**Stanislas Konaté**
Projet de soutenance — Développement d'une application web de gestion budgétaire

- GitHub : [@stanislas0712](https://github.com/stanislas0712)

---

*Gestion Budgétaire — Projet académique de soutenance. Tous droits réservés.*
