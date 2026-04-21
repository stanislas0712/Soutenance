"""
Point d'entrée Vercel — expose le WSGI Django comme fonction serverless.
Vercel détecte automatiquement la variable `application` et adapte le runtime WSGI.
"""
import sys
import os

# Ajouter le dossier backend au PYTHONPATH
_backend = os.path.join(os.path.dirname(__file__), '..', 'backend')
sys.path.insert(0, os.path.abspath(_backend))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

from config.wsgi import application  # noqa: E402  (Vercel cherche cette variable)
