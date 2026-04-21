#!/usr/bin/env bash
# Script de build Vercel — frontend + collectstatic
set -o errexit

echo "==> Build React frontend..."
cd frontend
npm install
npm run build
cd ..

echo "==> Installation des dépendances Python..."
pip install -r api/requirements.txt

echo "==> Collecte des fichiers statiques Django..."
cd backend
python manage.py collectstatic --noinput
cd ..

echo "==> Build terminé."
