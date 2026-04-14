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

_extra_hosts = os.getenv('ALLOWED_HOSTS', '')
ALLOWED_HOSTS = ['localhost', '127.0.0.1'] + [h.strip() for h in _extra_hosts.split(',') if h.strip()]


# Application definition

INSTALLED_APPS = [
    'simpleui',                          # ← doit précéder django.contrib.admin
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

# ── SimpleUI — interface d'administration ──────────────────────────────────────
SIMPLEUI_HOME_TITLE     = 'BudgetFlow Admin'
SIMPLEUI_HOME_INFO      = False          # masquer le bloc "about SimpleUI"
SIMPLEUI_ANALYSIS       = False          # désactiver la télémétrie
SIMPLEUI_DEFAULT_THEME  = 'dark.css'     # thème sombre par défaut (dark / light / element.css …)
SIMPLEUI_LOGO           = '/gestion.jpg' # logo dans la barre latérale

# Raccourcis rapides sur la page d'accueil de l'admin
SIMPLEUI_HOME_QUICK = True

# Icônes FontAwesome pour chaque section de menu
SIMPLEUI_ICON = {
    'Comptes'                   : 'fas fa-users',
    'Utilisateurs'              : 'fas fa-user-tie',
    'Départements'              : 'fas fa-building',
    'Budget'                    : 'fas fa-wallet',
    'Budgets annuels'           : 'fas fa-calendar-alt',
    'Allocations départementales': 'fas fa-chart-pie',
    'Budgets'                   : 'fas fa-file-invoice-dollar',
    'Lignes budgétaires'        : 'fas fa-list-alt',
    'Consommations lignes'      : 'fas fa-receipt',
    'Audit'                     : 'fas fa-shield-alt',
    'Logs audit'                : 'fas fa-history',
}

SIMPLEUI_CONFIG = {
    'system_keep'  : False,   # cacher les menus Django par défaut non nécessaires
    'menu_display' : [        # ordre d'affichage des apps dans la sidebar
        'Comptes',
        'Budget',
        'Audit',
    ],
    'dynamic'      : True,    # menus dynamiques (basés sur les permissions réelles)
}

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
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


# Database — DATABASE_URL (Render) a priorité, sinon variables individuelles
import dj_database_url as _dj_db_url

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
_db_url = os.getenv('DATABASE_URL')
if _db_url:
    DATABASES['default'] = _dj_db_url.config(conn_max_age=600, ssl_require=True)


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
STATICFILES_DIRS = [d for d in [BASE_DIR / 'static', BASE_DIR / 'frontend_dist'] if d.exists()]

# Whitenoise — compression brotli/gzip, pas de re-hash (Vite hash déjà les assets)
STORAGES = {
    'default':     {'BACKEND': 'django.core.files.storage.FileSystemStorage'},
    'staticfiles': {'BACKEND': 'whitenoise.storage.CompressedStaticFilesStorage'},
}

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ── Hashage Argon2 (recommandé OWASP) ─────────────────────────────────────────
PASSWORD_HASHERS = [
    'django.contrib.auth.hashers.Argon2PasswordHasher',
    'django.contrib.auth.hashers.PBKDF2PasswordHasher',   # fallback pour anciens hash
]

# ── Sécurité — toujours actifs ────────────────────────────────────────────────
SECURE_CONTENT_TYPE_NOSNIFF = True   # empêche MIME-sniffing (XSS)
X_FRAME_OPTIONS             = 'DENY' # clickjacking
SECURE_BROWSER_XSS_FILTER   = True   # header X-XSS-Protection

# ── Sécurité — uniquement en production (HTTPS) ───────────────────────────────
if not DEBUG:
    SECURE_SSL_REDIRECT              = True
    SECURE_HSTS_SECONDS              = 31_536_000  # 1 an
    SECURE_HSTS_INCLUDE_SUBDOMAINS   = True
    SECURE_HSTS_PRELOAD              = True
    SESSION_COOKIE_SECURE            = True
    CSRF_COOKIE_SECURE               = True
    SECURE_PROXY_SSL_HEADER          = ('HTTP_X_FORWARDED_PROTO', 'https')

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
    'ACCESS_TOKEN_LIFETIME':  timedelta(hours=8),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ALGORITHM': 'HS256',
    'AUTH_HEADER_TYPES': ('Bearer',),
    'UPDATE_LAST_LOGIN': False,
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

# ── Email / SMTP ───────────────────────────────────────────────────────────────
_email_user     = os.getenv('EMAIL_HOST_USER', '').strip()
_email_password = os.getenv('EMAIL_HOST_PASSWORD', '').strip()

# Si l'email n'est pas configuré en dev → console (le lien s'affiche dans le terminal)
if DEBUG and not (_email_user and _email_password):
    EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
else:
    EMAIL_BACKEND       = 'django.core.mail.backends.smtp.EmailBackend'
    EMAIL_HOST          = os.getenv('EMAIL_HOST', 'smtp.gmail.com')
    EMAIL_PORT          = int(os.getenv('EMAIL_PORT', 587))
    EMAIL_USE_TLS       = os.getenv('EMAIL_USE_TLS', 'True') == 'True'
    EMAIL_HOST_USER     = _email_user
    EMAIL_HOST_PASSWORD = _email_password

DEFAULT_FROM_EMAIL = os.getenv(
    'DEFAULT_FROM_EMAIL',
    f'BudgetFlow <{_email_user}>' if _email_user else 'BudgetFlow <noreply@budgetflow.bf>',
)

# URL du frontend React (utilisé dans les liens des emails)
FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:5173')
