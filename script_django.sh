#!/bin/sh

if [ "$DATABASE" = "postgres" ]
then
    echo "Waiting for postgres..."

    while ! nc -z $SQL_HOST $SQL_PORT; do
      sleep 0.1
			echo "Waiting for postgres..."
    done

    echo "PostgreSQL started"
fi

cd /usr/backend/

python manage.py runserver 0.0.0.0:8000

exec gunicorn bck_django.wsgi:application --bind 0.0.0.0:8000