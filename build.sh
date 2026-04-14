#!/usr/bin/env bash
# Script de build pour Render — construit le frontend puis prépare Django
set -o errexit

echo "==> Build frontend React..."
cd frontend
npm install
npm run build
cd ..

echo "==> Installation des dépendances Python..."
pip install -r backend/requirements.txt

echo "==> Collecte des fichiers statiques..."
cd backend
python manage.py collectstatic --noinput

echo "==> Migrations base de données..."
python manage.py migrate

cd ..
echo "==> Build terminé."
