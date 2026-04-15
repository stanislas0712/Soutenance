#!/bin/sh
# Script de démarrage — migrations puis gunicorn
set -e

echo "==> Migrations..."
python manage.py migrate --noinput

echo "==> Démarrage gunicorn..."
exec gunicorn config.wsgi:application \
    --bind "0.0.0.0:${PORT:-8000}" \
    --workers 2 \
    --timeout 120 \
    --access-logfile -
