"""
Django settings for backend project.

Generated by 'django-admin startproject' using Django 3.2.25.

For more information on this file, see
https://docs.djangoproject.com/en/3.2/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/3.2/ref/settings/
"""

from pathlib import Path

import os

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.environ.get("SECRET_KEY")

DEBUG = False

# Host/Domain name served by Django
ALLOWED_HOSTS = os.environ.get("DJANGO_ALLOWED_HOSTS").split(" ")

# Application definition
INSTALLED_APPS = [
    'daphne',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'channels',
    'corsheaders',
    'rest_framework',
    'allauth',
    'allauth.account',
    'api_42',
    'friends',
    'games',
    'pong_IA',
    'pong_online',
    'tournament',
    'users',
]

# A list of middleware to use
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'allauth.account.middleware.AccountMiddleware',
    'backend.middleware.LastActivityMiddleware',
]

# Path to the root URLconf in the main app
ROOT_URLCONF = 'backend.urls'

# List containing the settings for all template engines to be used with Django
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, 'templates')],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

# Path to the WSGI application object of the main app
WSGI_APPLICATION = 'backend.wsgi.application'

# For daphne, allow to use the command 'runserver' of daphne to serve the site with ASGI, path to the ASGI application object of the main app
ASGI_APPLICATION = 'backend.asgi.application'

# Database settings
DATABASES = {
    'default': {
        "ENGINE": os.environ.get("SQL_ENGINE", "django.db.backends.sqlite3"),
        "NAME": os.environ.get("SQL_DATABASE", BASE_DIR / "db.sqlite3"),
        "USER": os.environ.get("SQL_USER", "user"),
        "PASSWORD": os.environ.get("SQL_PASSWORD", "password"),
        "HOST": os.environ.get("SQL_HOST", "localhost"),
        "PORT": os.environ.get("SQL_PORT", "5432"),
    }
}

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'Europe/Zurich'

# Manage the translation system of Django
USE_I18N = True

# Specifies if datetimes are timezone-aware
USE_TZ = True

# URL to use when referring to static files located in 'STATIC_ROOT'
STATIC_URL = 'static/'
# Absolute path to the directory where the staticfiles will be collected for deployment
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# Default primary key field type to use for models that don’t have a field with 'primary_key=True'
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Variables used in 'CSRF_TRUSTED_ORIGINS'
ALLOWED_HOSTS_HTTPS = [f"https://" + os.environ.get("DJANGO_ALLOWED_HOSTS")]
ALLOWED_HOSTS_HTTP = [f"http://" + os.environ.get("DJANGO_ALLOWED_HOSTS")]

# List of trusted origins for unsafe requests (e.g. POST)
CSRF_TRUSTED_ORIGINS = ALLOWED_HOSTS_HTTPS + ALLOWED_HOSTS_HTTP
CSRF_ALLOWED_ORIGINS = ALLOWED_HOSTS_HTTPS + ALLOWED_HOSTS_HTTP

# A secure cookie must be used for the session cookie. The cookie is set as 'secure', browsers will sent it only for HTTPS connexion
SESSION_COOKIE_SECURE = True
# A secure cookie must be used for the CSRF cookie. The cookie is set as 'secure', browsers will sent it only for HTTPS connexion
CSRF_COOKIE_SECURE = True
# The domain to use at the definition of the cookie
CSRF_COOKIE_DOMAIN = None

# For Django cors-headers
CORS_ALLOW_ALL_ORIGINS = True

# The ID, of the current site in the django_site database table
SITE_ID = 1

# URL that handles the media served from 'MEDIA_ROOT', used for managing stored files
MEDIA_URL = ""
# Absolute filesystem path to the directory that will hold user-uploaded files
MEDIA_ROOT = os.path.join(BASE_DIR, "")

# List of authentication backend classes used when attempting to authenticate a user
AUTHENTICATION_BACKENDS = [
    'allauth.account.auth_backends.AuthenticationBackend',
]

# For django channels
CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels.layers.InMemoryChannelLayer'
    }
}

# For Django allauth
SOCIALACCOUNT_PROVIDERS = {
    '42': {
        'SCOPE': ['profile'],
        'AUTH_PARAMS': {'access_type': 'online'},
        'METHOD': 'oauth2',
        'VERIFIED_EMAIL': False,
        'KEY': os.environ.get("KEY_API"),
        'SECRET': os.environ.get("SECRET_API"),
    }
}

SESSION_EXPIRE_AT_BROWSER_CLOSE = True

# URL where requests are redirected after login when LoginView doesn't get a 'next' GET parameter
LOGIN_REDIRECT_URL = 'https://localhost'
# URL where requests are redirected after logout if LogoutView doesn't have a 'next_page' attribute
LOGOUT_REDIRECT_URL = 'https://localhost'

AUTH_USER_MODEL = 'users.MyUser'