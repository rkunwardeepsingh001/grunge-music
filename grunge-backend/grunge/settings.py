"""Django settings for the **grunge** project.

This configuration is intentionally minimal yet flexible enough for both
development and production.  Environment variables are read using
`django-environ` so that secrets and deployment-specific values can be
injected without modifying source control.

See https://docs.djangoproject.com/en/stable/ref/settings/ for a full
list of configuration options.
"""

import os
from pathlib import Path
from datetime import timedelta

# ``django-environ`` provides the ``environ`` module.  if the package
# isn't installed we raise an explicit error so that the cause is clear
# rather than letting the import fail later on during configuration.
try:
    import environ
except ImportError as exc:
    raise ImportError(
        "django-environ is required; install dependencies with ``pip install -r requirements.txt``"
    ) from exc

# read environment variables from a `.env` file if present
ENV = environ.Env()
ENV.read_env()



# basic paths

BASE_DIR = Path(__file__).resolve().parent.parent



# security and debug

SECRET_KEY = ENV.str("SECRET_KEY", "unsafe-secret-for-dev")
# security-sensitive settings should be provided via environment variables.
# DEBUG is False in production by default; developers can override it locally.
DEBUG = ENV.bool("DEBUG", True)
ALLOWED_HOSTS = ENV.list("ALLOWED_HOSTS", default=["*"])


# security enhancements for production

# ensure cookies are only sent over HTTPS when REQUIRE_HTTPS is truthy
SESSION_COOKIE_SECURE = ENV.bool("SESSION_COOKIE_SECURE", not DEBUG)
CSRF_COOKIE_SECURE = ENV.bool("CSRF_COOKIE_SECURE", not DEBUG)
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_HSTS_SECONDS = ENV.int("SECURE_HSTS_SECONDS", 0)
SECURE_HSTS_INCLUDE_SUBDOMAINS = ENV.bool("SECURE_HSTS_INCLUDE_SUBDOMAINS", False)
SECURE_HSTS_PRELOAD = ENV.bool("SECURE_HSTS_PRELOAD", False)
SECURE_SSL_REDIRECT = ENV.bool("SECURE_SSL_REDIRECT", False)
SECURE_REFERRER_POLICY = "same-origin"
X_FRAME_OPTIONS = "DENY"


# application definition

INSTALLED_APPS = [
    # django core
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "django.contrib.humanize",
    # third party
    "django_filters",
    "rest_framework",
    "rest_framework.authtoken",
    # local
    "grunge_app",
    "django.contrib.admin",
    "corsheaders",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware", 
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"
CORS_ALLOWED_ORIGINS = [
    "http://172.21.0.3:5173",
]
CORS_ALLOW_CREDENTIALS = True

CSRF_TRUSTED_ORIGINS = [
    "http://172.21.0.3:5173",
]


ROOT_URLCONF = "grunge.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "grunge.wsgi.application"



# database

DATABASES = {"default": ENV.db_url(default=f"sqlite:///{BASE_DIR / 'db.sqlite3'}")}



# password validation

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"
    },
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]



# internationalization

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_L10N = True
USE_TZ = True



# static & media


STATIC_URL = '/static/'

# STATIC_ROOT = BASE_DIR / "staticfiles"
STATIC_ROOT = os.path.join(BASE_DIR, "staticfiles")

# STATICFILES_DIRS = [
#     BASE_DIR / "static",
# ]
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, "static"),
]
# REST framework defaults

REST_FRAMEWORK = {
    "DEFAULT_VERSIONING_CLASS": "rest_framework.versioning.URLPathVersioning",
    "DEFAULT_VERSION": ENV.str("DEFAULT_API_VERSION", "v1"),
    "ALLOWED_VERSIONS": ENV.list("ALLOWED_API_VERSIONS", default=["v1"]),
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework.authentication.TokenAuthentication",
        "rest_framework_simplejwt.authentication.JWTAuthentication",

    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticated",
    ),
    "DEFAULT_FILTER_BACKENDS": (
        "django_filters.rest_framework.DjangoFilterBackend",
        "rest_framework.filters.OrderingFilter",
    ),
    "DEFAULT_RENDERER_CLASSES": [
        "rest_framework.renderers.JSONRenderer",
    ],
    "DEFAULT_PARSER_CLASSES": (
        "rest_framework.parsers.FormParser",
        "rest_framework.parsers.MultiPartParser",
        "rest_framework.parsers.JSONParser",
        "rest_framework.parsers.FileUploadParser",
    ),
    # use the standard DRF paginator; clients may change size via
    # `?page_size=` when the built-in ``PageNumberPagination`` is active.
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": ENV.int("API_PAGE_SIZE", 10),
    
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=60),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=1),
    "AUTH_HEADER_TYPES": ("Bearer",),
}
# the default query parameter exposed by ``PageNumberPagination`` is
# ``page_size``; no separate setting is required anymore.


if DEBUG:
    REST_FRAMEWORK["DEFAULT_RENDERER_CLASSES"].append(
        "rest_framework.renderers.BrowsableAPIRenderer"
    )


# allow extra configuration from a local_settings file if needed
try:
    from .local_settings import *  # noqa: F401,F403
except ImportError:
    pass




LOG_DIR = os.path.join(BASE_DIR, "logs")

if not os.path.exists(LOG_DIR):
    os.makedirs(LOG_DIR)


LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "simple": {
            "format": "[{levelname}] {asctime} {name} {message}",
            "style": "{",
        },
    },
    "handlers": {
        "file": {
            "level": "INFO",
            "class": "logging.FileHandler",
            "filename": os.path.join(LOG_DIR, "app.log"),
            "formatter": "simple",
        },
        "console": {
            "class": "logging.StreamHandler",
        },
    },
    "root": {
        "handlers": ["console", "file"],
        "level": "INFO",
    },
}

