web: python /app/backend/manage.py migrate --noinput && gunicorn --chdir /app/backend config.wsgi:application --bind 0.0.0.0:$PORT --workers 2 --timeout 120 --access-logfile -
