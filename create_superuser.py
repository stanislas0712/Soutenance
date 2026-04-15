"""
Script de création automatique du superuser au démarrage.
Lit les variables d'environnement DJANGO_SUPERUSER_*.
Appelé par start.sh — ne fait rien si l'utilisateur existe déjà.
"""
import os
import sys

# Ajouter le backend au path
sys.path.insert(0, '/app/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

import django
django.setup()

from accounts.models import Utilisateur

email     = os.environ.get('DJANGO_SUPERUSER_EMAIL',    'admin@budgetflow.com')
password  = os.environ.get('DJANGO_SUPERUSER_PASSWORD', 'Admin@2024!')
nom       = os.environ.get('DJANGO_SUPERUSER_NOM',      'Admin')
prenom    = os.environ.get('DJANGO_SUPERUSER_PRENOM',   'Super')
matricule = os.environ.get('DJANGO_SUPERUSER_MATRICULE', 'ADM001')

if Utilisateur.objects.filter(email=email).exists():
    print(f'[superuser] déjà existant : {email}')
else:
    Utilisateur.objects.create_superuser(
        email=email,
        password=password,
        nom=nom,
        prenom=prenom,
        matricule=matricule,
    )
    print(f'[superuser] créé : {email}')
