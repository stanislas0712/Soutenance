#!/bin/sh
# Script de démarrage — migrations, superuser, gunicorn
set -e

echo "==> Migrations..."
python /app/backend/manage.py migrate --noinput

echo "==> Superuser (si nécessaire)..."
python /app/backend/create_superuser.py || true

echo "==> Démarrage gunicorn..."
exec gunicorn \
    --chdir /app/backend \
    config.wsgi:application \
    --bind "0.0.0.0:${PORT:-8000}" \
    --workers 2 \
    --timeout 120 \
    --access-logfile -
