"""
Django settings pour BudgetFlow.
Ce fichier est le point d'entrée de config.settings (package).
"""

import os
from pathlib import Path
from datetime import timedelta
from dotenv import load_dotenv

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent.parent

# Charger les variables d'environnement depuis .env
load_dotenv(BASE_DIR / '.env')


# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.getenv('SECRET_KEY', 'django-insecure-y2(m0&q27a$6os9%+fxf@(fqq1gu86tc-+*307kd1p#4-ndnv^')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.getenv('DEBUG', 'True') == 'True'

ALLOWED_HOSTS = ['localhost', '127.0.0.1']


# Application definition

INSTALLED_APPS = [
    # Jazzmin DOIT être avant django.contrib.admin
    'jazzmin',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # Third-party
    'rest_framework',
    'corsheaders',
    # Local
    'accounts',
    'budget',
    'audit',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates', BASE_DIR / 'frontend_dist'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'


# Database - PostgreSQL
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv('DB_NAME', 'config'),
        'USER': os.getenv('DB_USER', 'postgres'),
        'PASSWORD': os.getenv('DB_PASSWORD', ''),
        'HOST': os.getenv('DB_HOST', 'localhost'),
        'PORT': os.getenv('DB_PORT', '5432'),
    }
}


# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator', 'OPTIONS': {'min_length': 4}},
]


# Internationalization
LANGUAGE_CODE = 'fr-fr'
TIME_ZONE = 'Africa/Abidjan'
USE_I18N = True
USE_TZ = True


# Static files
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_DIRS = [
    BASE_DIR / 'static',
    BASE_DIR / 'frontend_dist',
]

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Modèle utilisateur personnalisé
AUTH_USER_MODEL = 'accounts.Utilisateur'

# Fichiers media (photos utilisateurs, pièces jointes)
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'


# Django REST Framework
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
}


# Simple JWT
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
}


# CORS - autorise le frontend React (Vite port 5173)
CORS_ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
]
CORS_ALLOW_CREDENTIALS = True

# ── Logging ───────────────────────────────────────────────────────────────────
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,

    'formatters': {
        'colored': {
            '()': 'django.utils.log.ServerFormatter',
            'format': '[{asctime}] {levelname} {message}',
            'style': '{',
        },
        'api': {
            'format': '%(asctime)s  %(levelname)-8s  %(name)s  %(message)s',
            'datefmt': '%H:%M:%S',
        },
    },

    'filters': {
        'require_debug_true': {
            '()': 'django.utils.log.RequireDebugTrue',
        },
    },

    'handlers': {
        'console': {
            'class':     'logging.StreamHandler',
            'formatter': 'api',
        },
    },

    'loggers': {
        # Requêtes HTTP Django (runserver)
        'django.request': {
            'handlers':  ['console'],
            'level':     'DEBUG',
            'propagate': False,
        },
        # Requêtes DB (SQL) — passer à DEBUG pour voir les requêtes SQL
        'django.db.backends': {
            'handlers':  ['console'],
            'level':     'WARNING',
            'propagate': False,
        },
        # Nos apps métier
        'budget': {
            'handlers':  ['console'],
            'level':     'DEBUG',
            'propagate': False,
        },
        'accounts': {
            'handlers':  ['console'],
            'level':     'DEBUG',
            'propagate': False,
        },
        'audit': {
            'handlers':  ['console'],
            'level':     'DEBUG',
            'propagate': False,
        },
    },
}

# IA
SKIP_CLAUDE_API = os.getenv('SKIP_CLAUDE_API', 'True').lower() in ('true', '1', 'yes')
ANTHROPIC_API_KEY = os.getenv('ANTHROPIC_API_KEY', '')

# ─── Jazzmin ──────────────────────────────────────────────────────────────────
JAZZMIN_SETTINGS = {
    # Branding
    'site_title':  'BudgetFlow Admin',
    'site_header': 'BudgetFlow',
    'site_brand':  'Gestion Budgétaire',
    'site_logo':   None,
    'site_icon':   None,
    'welcome_sign': 'Bienvenue sur BudgetFlow — Plateforme de Gestion Budgétaire',
    'copyright':    'BudgetFlow © 2025 — Burkina Faso',

    # Recherche globale
    'search_model': ['accounts.Utilisateur', 'budget.Budget'],

    # Menu supérieur
    'topmenu_links': [
        {'name': 'Dashboard', 'url': 'admin:index', 'permissions': ['auth.view_user']},
        {'name': 'Application', 'url': '/', 'new_window': True},
        {
            'name': 'Comptes',
            'children': [
                {'name': 'Utilisateurs', 'url': 'admin:accounts_utilisateur_changelist'},
                {'name': 'Départements', 'url': 'admin:accounts_departement_changelist'},
            ],
        },
        {
            'name': 'Budget',
            'children': [
                {'name': 'Budgets annuels',  'url': 'admin:budget_budgetannuel_changelist'},
                {'name': 'Allocations',      'url': 'admin:budget_allocationdepartementale_changelist'},
                {'name': 'Budgets',          'url': 'admin:budget_budget_changelist'},
                {'name': 'Lignes',           'url': 'admin:budget_lignebudgetaire_changelist'},
            ],
        },
        {'name': "Audit", 'url': 'admin:audit_logaudit_changelist'},
    ],

    # Menu utilisateur (en haut à droite)
    'usermenu_links': [
        {'name': 'Voir l\'application', 'url': '/', 'new_window': True, 'icon': 'fas fa-external-link-alt'},
    ],

    # Sidebar
    'show_sidebar': True,
    'navigation_expanded': True,

    # Ordre des apps dans la sidebar
    'order_with_respect_to': [
        'accounts',
        'accounts.Utilisateur',
        'accounts.Departement',
        'budget',
        'budget.BudgetAnnuel',
        'budget.AllocationDepartementale',
        'budget.Budget',
        'budget.LigneBudgetaire',
        'audit',
        'audit.LogAudit',
    ],

    # Masquer auth (groupes Django non utilisés)
    'hide_apps': ['auth'],
    'hide_models': [],

    # Icônes FontAwesome
    'icons': {
        'accounts':                         'fas fa-users-cog',
        'accounts.Utilisateur':             'fas fa-user-tie',
        'accounts.Departement':             'fas fa-building',
        'budget':                           'fas fa-chart-line',
        'budget.BudgetAnnuel':              'fas fa-calendar-alt',
        'budget.AllocationDepartementale':  'fas fa-wallet',
        'budget.Budget':                    'fas fa-file-invoice-dollar',
        'budget.LigneBudgetaire':           'fas fa-list-ul',
        'audit':                            'fas fa-shield-alt',
        'audit.LogAudit':                   'fas fa-history',
    },
    'default_icon_parents':  'fas fa-folder-open',
    'default_icon_children': 'fas fa-circle',

    # Liens rapides dans la sidebar
    'custom_links': {
        'budget': [
            {'name': 'Voir l\'application', 'url': '/', 'icon': 'fas fa-rocket', 'new_window': True},
        ],
    },

    # UI
    'related_modal_active': True,
    'use_google_fonts_cdn':  False,
    'show_ui_builder':       False,
    'language_chooser':      False,
    'changeform_format':     'horizontal_tabs',
}

JAZZMIN_UI_TWEAKS = {
    # Navbar
    'navbar':             'navbar-dark',
    'no_navbar_border':   True,
    'navbar_fixed':       True,
    'navbar_small_text':  False,

    # Sidebar
    'sidebar':                    'sidebar-dark-primary',
    'sidebar_fixed':              True,
    'sidebar_nav_small_text':     False,
    'sidebar_disable_expand':     False,
    'sidebar_nav_child_indent':   True,
    'sidebar_nav_compact_style':  False,
    'sidebar_nav_legacy_style':   False,
    'sidebar_nav_flat_style':     False,

    # Thème — flatly = moderne, propre, professionnel
    'theme':           'flatly',
    'dark_mode_theme': None,

    # Layout
    'footer_fixed':  False,
    'layout_boxed':  False,
    'actions_sticky_top': True,

    # Boutons
    'button_classes': {
        'primary':   'btn-primary',
        'secondary': 'btn-secondary',
        'info':      'btn-info',
        'warning':   'btn-warning',
        'danger':    'btn-danger',
        'success':   'btn-success',
    },
}
