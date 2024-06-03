# TMP README

Please find below a tmp .env:
```
SECRET_KEY=s'django-insecure-sm@b^=144g8k*vt7gc&&h7q3z7(yf4q=08mdikb=^lrr-18vz2'
DJANGO_ALLOWED_HOSTS=10.12.8.2
SQL_ENGINE=django.db.backends.postgresql
SQL_DATABASE=db_bck_django
SQL_USER=bck_django
SQL_PASSWORD=bck_django
SQL_HOST=postgres
SQL_PORT=5432
DATABASE=postgres
DJANGO_SUPERUSER_USERNAME=admin
DJANGO_SUPERUSER_PASSWORD=admin
DJANGO_SUPERUSER_EMAIL=admin@admin.com

KEY_API='u-s4t2ud-adf33f6403b9acf5fd58b157e28d550b4a708e5b4bb0c7e2d33ff39069fba381'
SECRET_API='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'

S_ADDR_IP_WEBSITE="https://${DJANGO_ALLOWED_HOSTS}/"
ADDR_IP_WEBSITE="http://${DJANGO_ALLOWED_HOSTS}/"


POSTGRES_USER=bck_django
POSTGRES_PASSWORD=bck_django
POSTGRES_DB=db_bck_django
```


For those who used the precedent .env please check if the KEY_API and SECRET_API are correctly set to your api.
Do not forget to channge the django_allowed_hosts to your ip or localhost if you wanna try locally.
Also you can also redirect to your pc at 42 such as https://[position].42lausanne.ch (ex: https://c1r1s1.42lausanne.ch)
