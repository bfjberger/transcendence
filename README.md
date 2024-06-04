<a name="readme-top"></a>

# <p align="center">ft_transcendence</p>
<br/>
<p align="center">
  Résumé:
  Ce projet est le premier projet Web et dernier projet du tronc commun.
  Le site doit proposer de jouer au jeu Pong et des modules viennent personnaliser le projet suivant chaque team.
  <br/>
  <br/>
</p>


- [A propos du projet](#a-propos-du-projet)
    - [Modules choisis](#modules-choisis)
- [Utilisation](#utilisation)
- [Auteurs](#auteurs)
- [Sources](#sources)


## A propos du projet

Nous avons suivi les versions 14.1 et 14.2 du sujet.

Vous pouvez voir les versions des apps, langages utilisés en back via le `requirements.txt`.

Bootstrap était à sa version 5.3.


### Modules choisis:

| Module | Type |
|:---------:|:-------------|
| Utiliser un framework en backend (Django). | Module Majeur |
| Utiliser un framework ou toolkit en frontend (Bootstrap). | Module Mineur |
| Utiliser une base de données en backend (PostgreSQL). | Module Mineur |
| Gestion utilisateur standard, authentification, utilisateurs en tournois. | Module Majeur |
| Implémenter une authentification à distance (OAuth 2.0 authentication with 42). | Module Majeur |
| Joueurs à distance | Module Majeur |
| Multijoueurs (plus de 2 dans la même partie). | Module Majeur |
| Implémenter un adversaire contrôlé par IA. | Module Majeur |
| (BONUS) Étendre la compatibilité des navigateurs web (Firefox). | Module Mineur |

<p align="right">(<a href="#readme-top">back to top</a>)</p>


## Utilisation

Voici un template de `.env` que vous pouvez utilisez pour faire fonctionner le projet.

Des variables doivent être changer:
  - `DJANGO_ALLOWED_HOSTS` avec l'adresse IP de votre ordinateur ou localhost.
  - `KEY_API` & `SECRET_API`: ces deux variables sont utilisées pour l'authentification avec l'API 42 et sont uniques à l'app utilisée, créer via l'intra. Les apps que nous avons utilisées ne sont surement plus disponibles donc vous pouvez créer une app et remplacer ces variables avec les valeurs de votre app.

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
Vous pouvez également rediriger vers un pc à 42 (en tout cas à Lausanne) sous le format suivant `https://[position].42lausanne.ch` (ex: `https://c1r1s1.42lausanne.ch`).

Une fois le `.env` à la racine du projet, i.e. au même niveau que les `Dockerfile`, vous pouvez lancer le build via la commande `make` ou `docker-compose up --build` tel qu'indiqué dans le sujet.

<p align="right">(<a href="#readme-top">back to top</a>)</p>


## Auteurs

* [@bberger](https://github.com/bfjberger)
* [@fcoindre](https://github.com/FXC-ai)
* [@pvong](https://github.com/phlearning)
* [@kmorin](https://github.com/Killian-Morin)

<p align="right">(<a href="#readme-top">back to top</a>)</p>


## Sources

* API 42
  * https://api.intra.42.fr/apidoc

* Bootstrap
  * https://getbootstrap.com/docs/5.3/getting-started/introduction/
  * https://getbootstrap.com/docs/5.3/examples/
  * https://icons.getbootstrap.com/

* Single Page Application
  * https://dev.to/rohanbagchi/how-to-write-a-vanillajs-router-hk3 Base du router javascript
  * https://stackoverflow.com/questions/47229083/how-to-know-if-a-website-is-a-single-page-application

* Modules JavaScript
  * https://v8.dev/features/modules

* Django
  * https://docs.djangoproject.com/en/5.0/
  * https://openclassrooms.com/fr/courses/7172076-debutez-avec-le-framework-django
  * https://developer.mozilla.org/en-US/docs/Learn/Server-side/Django

* Django Rest Framework (DRF)
  * https://www.django-rest-framework.org/
  * https://www.youtube.com/watch?v=llrIu4Qsl7c pour l'authentification
  * https://openclassrooms.com/fr/courses/7192416-mettez-en-place-une-api-avec-django-rest-framework


<p align="right">(<a href="#readme-top">back to top</a>)</p>
