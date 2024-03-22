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

pip install Pillow

pip install djangorestframework

pip install requests

cd /usr/backend/

python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser --noinput
python manage.py runserver 0.0.0.0:8000

exec gunicorn bck_django.wsgi:application --bind 0.0.0.0:8000