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

pip install django-allauth

cd /usr/backend/

python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser --noinput
python3 manage.py collectstatic --noinput
python manage.py runserver 0.0.0.0:8000
echo "\n\n\n\n\n\n hello"
# exec daphne -u /usr/backend/daphne.sock bck_django.asgi:application
# daphne -b 0.0.0.0 -p 8001 django_project.asgi:application
exec daphne -b 0.0.0.0 -p 8000 bck_django.asgi:application
# exec gunicorn bck_django.wsgi:application --bind 0.0.0.0:8000