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

# python manage.py makemigrations
# python manage.py migrate
# python manage.py createsuperuser --noinput
# python3 manage.py collectstatic --noinput


mkdir -p staticfiles/avatars
cp avatar.png staticfiles/avatars

pip freeze > requirements.txt

# script to create admin player
# python manage.py shell <<EOF
# from django.contrib.auth.models import User
# from players_manager.models import Player
# admin_user = User.objects.get(username='$DJANGO_SUPERUSER_USERNAME')
# if not Player.objects.filter(owner=admin_user).exists():
#     Player.objects.create(owner=admin_user, nickname=admin_user.username)
# EOF

python manage.py runserver 0.0.0.0:8000
# exec daphne -u /usr/backend/daphne.sock bck_django.asgi:application
# daphne -b 0.0.0.0 -p 8001 django_project.asgi:application
# exec daphne -b 0.0.0.0 -p 8000 bck_django.asgi:application
# exec gunicorn bck_django.wsgi:application --bind 0.0.0.0:8000