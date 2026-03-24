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
STATIC_URL = 'static/'
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

# IA
SKIP_CLAUDE_API = os.getenv('SKIP_CLAUDE_API', 'True').lower() in ('true', '1', 'yes')
ANTHROPIC_API_KEY = os.getenv('ANTHROPIC_API_KEY', '')

# ─── Jazzmin ──────────────────────────────────────────────────────────────────
JAZZMIN_SETTINGS = {
    'site_title': 'Gestion Budgétaire',
    'site_header': 'Gestion Budgétaire',
    'site_brand': 'Gestion Budgétaire',
    'site_logo': '',
    'site_icon': '',
    'welcome_sign': 'Bienvenue sur la plateforme de Gestion Budgétaire',
    'copyright': '© 2026 Gestion Budgétaire',
    'search_model': ['accounts.Utilisateur'],
    'topmenu_links': [
        {'name': 'Tableau de bord', 'url': 'admin:index', 'permissions': ['auth.view_user']},
        {
            'name': 'Comptes',
            'children': [
                {'name': 'Utilisateurs',  'url': 'admin:accounts_utilisateur_changelist'},
                {'name': 'Départements',  'url': 'admin:accounts_departement_changelist'},
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
        {
            'name': 'Audit',
            'children': [
                {'name': "Logs d'audit", 'url': 'admin:audit_logaudit_changelist'},
            ],
        },
        {'name': 'Frontend', 'url': 'http://localhost:5173', 'new_window': True},
    ],
    'usermenu_links': [],
    'show_sidebar': False,
    'navigation_expanded': False,
    'icons': {
        'accounts':                        'fas fa-users',
        'accounts.Utilisateur':            'fas fa-user-tie',
        'accounts.Departement':            'fas fa-building',
        'budget':                          'fas fa-coins',
        'budget.Budget':                   'fas fa-wallet',
        'budget.BudgetAnnuel':             'fas fa-calendar-alt',
        'budget.AllocationDepartementale': 'fas fa-envelope-open-text',
        'budget.LigneBudgetaire':          'fas fa-list-ol',
        'audit':                           'fas fa-clipboard-list',
        'audit.LogAudit':                  'fas fa-history',
        'auth':                            'fas fa-lock',
        'auth.Group':                      'fas fa-users-cog',
    },
    'default_icon_parents': 'fas fa-folder-open',
    'default_icon_children': 'fas fa-dot-circle',
    'custom_css': 'jazzmin/css/custom.css',
    'custom_js': 'jazzmin/js/custom.js',
    'related_modal_active': True,
    'use_google_fonts_cdn': False,
    'show_ui_builder': False,
    'language_chooser': False,
    'changeform_format': 'horizontal_tabs',
}

JAZZMIN_UI_TWEAKS = {
    'navbar': 'navbar-dark',
    'no_navbar_border': True,
    'navbar_fixed': True,
    'footer_fixed': False,
    'layout_boxed': False,
    'theme': 'default',
    'default_theme_mode': 'light',
    'button_classes': {
        'primary':   'btn-primary',
        'secondary': 'btn-secondary',
        'info':      'btn-info',
        'warning':   'btn-warning',
        'danger':    'btn-danger',
        'success':   'btn-success',
    },
    'actions_sticky_top': True,
}
