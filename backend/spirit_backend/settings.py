"""
Django settings for Spirit Adventures backend.
"""
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

# Local secrets live in backend/.env (never committed); on Render use env vars
try:
    from dotenv import load_dotenv
    load_dotenv(BASE_DIR / '.env')
except ImportError:
    pass

SECRET_KEY = os.getenv('SECRET_KEY', 'spirit-adventures-dev-secret-key-nature-2025-cinematic')

DEBUG = os.getenv('DEBUG', 'True').lower() in ('true', '1', 'yes')

# Public domain of the site, e.g. spiritadventures.in (used for hosts, CSRF and CORS)
SITE_DOMAIN = os.getenv('SITE_DOMAIN', '').strip().lower()

ALLOWED_HOSTS = [h.strip() for h in os.getenv('ALLOWED_HOSTS', '*').split(',') if h.strip()]
if SITE_DOMAIN and '*' not in ALLOWED_HOSTS:
    ALLOWED_HOSTS += [SITE_DOMAIN, f'www.{SITE_DOMAIN}']
# Containers talk to each other by service name (frontend -> backend:8000)
if '*' not in ALLOWED_HOSTS:
    ALLOWED_HOSTS += ['backend', 'localhost', '127.0.0.1']

if not DEBUG and SECRET_KEY == 'spirit-adventures-dev-secret-key-nature-2025-cinematic':
    raise RuntimeError('Set a real SECRET_KEY before running with DEBUG=False.')

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'whitenoise.runserver_nostatic',
    'django.contrib.staticfiles',
    'corsheaders',
    'adventures.apps.AdventuresConfig',
    # Built-in sales CRM (team accounts, leads, targets)
    'crm.accounts.apps.AccountsConfig',
    'crm.enquiries.apps.EnquiriesConfig',
    'crm.targets.apps.TargetsConfig',
]

# One login for the owner portal, the CRM and Django admin: team members sign in with email
AUTH_USER_MODEL = 'accounts.CustomUser'

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'spirit_backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
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

WSGI_APPLICATION = 'spirit_backend.wsgi.application'
ASGI_APPLICATION = 'spirit_backend.asgi.application'

# Database Configuration
import dj_database_url

DATABASE_URL = os.getenv('DATABASE_URL')
DB_NAME = os.getenv('POSTGRES_DB', '')
DB_USER = os.getenv('POSTGRES_USER', '')
DB_PASSWORD = os.getenv('POSTGRES_PASSWORD', '')
DB_HOST = os.getenv('POSTGRES_HOST', '')
DB_PORT = os.getenv('POSTGRES_PORT', '5432')

if DATABASE_URL:
    DATABASES = {
        'default': dj_database_url.config(
            default=DATABASE_URL,
            conn_max_age=600,
            conn_health_checks=True,
        )
    }
elif DB_NAME and DB_USER and DB_HOST:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': DB_NAME,
            'USER': DB_USER,
            'PASSWORD': DB_PASSWORD,
            'HOST': DB_HOST,
            'PORT': DB_PORT,
        }
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
            'OPTIONS': {
                'timeout': 30,
            },
        }
    }

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Asia/Kolkata'
USE_I18N = True
USE_TZ = True

STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STORAGES = {
    'default': {'BACKEND': 'django.core.files.storage.FileSystemStorage'},
    'staticfiles': {'BACKEND': 'whitenoise.storage.CompressedManifestStaticFilesStorage'},
}

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Slash handling
APPEND_SLASH = True

# CORS
# The browser only ever calls the API through the same domain (Next.js / Caddy proxy),
# so cross-origin access stays limited to known hosts. Never allow-all with credentials.
CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOWED_ORIGIN_REGEXES = [
    r"^https:\/\/.*\.onrender\.com$",
    r"^https:\/\/.*\.render\.com$",
    r"^http:\/\/localhost:[0-9]+$",
    r"^http:\/\/127\.0\.0\.1:[0-9]+$",
]
CSRF_TRUSTED_ORIGINS = [
    "https://*.onrender.com",
    "https://*.render.com",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
]

# Business settings
WHATSAPP_NUMBER = os.getenv('WHATSAPP_NUMBER', '+919876543210')
SUPPORT_EMAIL = os.getenv('SUPPORT_EMAIL', 'hello@spiritadventures.in')
SUPPORT_PHONE = os.getenv('SUPPORT_PHONE', '+91 98765 43210')

# Website enquiries become CRM leads automatically (adventures/crm.py -> crm/enquiries/services.py).

# Owner portal session cookies (HTTP-only session; CSRF token readable by the portal JS)
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = 'Lax'
# HTTPS-only cookies in production. COOKIE_SECURE=False only for testing over plain http.
COOKIE_SECURE = os.getenv('COOKIE_SECURE', str(not DEBUG)).lower() in ('true', '1', 'yes')
SESSION_COOKIE_SECURE = COOKIE_SECURE
CSRF_COOKIE_SAMESITE = 'Lax'
CSRF_COOKIE_SECURE = COOKIE_SECURE
SESSION_COOKIE_AGE = 60 * 60 * 12  # 12h
_env_csrf = os.getenv('CSRF_TRUSTED_ORIGINS', '') or os.getenv('CSRF_TRUSTED_ORIGINS_EXTRA', '')
_extra_origins = [o.strip() for o in _env_csrf.split(',') if o.strip()]
CSRF_TRUSTED_ORIGINS += _extra_origins
if SITE_DOMAIN:
    CSRF_TRUSTED_ORIGINS += [f'https://{SITE_DOMAIN}', f'https://www.{SITE_DOMAIN}']
    import re as _re
    CORS_ALLOWED_ORIGIN_REGEXES.append(r"^https://(www\.)?" + _re.escape(SITE_DOMAIN) + "$")

# Behind Caddy / Render the TLS ends at the proxy; trust its X-Forwarded-Proto header
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
USE_X_FORWARDED_HOST = True
if not DEBUG:
    SECURE_CONTENT_TYPE_NOSNIFF = True
    SECURE_REFERRER_POLICY = 'strict-origin-when-cross-origin'
    X_FRAME_OPTIONS = 'DENY'


# ----------------- Cloudinary (photo + video uploads from the owner portal) -----------------
# Either CLOUDINARY_URL=cloudinary://<api_key>:<api_secret>@<cloud_name>
# or the three separate variables below. Files go straight from the browser to
# Cloudinary with a short-lived signature, so big videos never pass through Django.
from urllib.parse import urlparse as _urlparse  # noqa: E402

_cld = _urlparse(os.getenv('CLOUDINARY_URL', '')) if os.getenv('CLOUDINARY_URL') else None
CLOUDINARY_CLOUD_NAME = os.getenv('CLOUDINARY_CLOUD_NAME') or (_cld.hostname if _cld else '')
CLOUDINARY_API_KEY = os.getenv('CLOUDINARY_API_KEY') or (_cld.username if _cld else '')
CLOUDINARY_API_SECRET = os.getenv('CLOUDINARY_API_SECRET') or (_cld.password if _cld else '')
CLOUDINARY_FOLDER = os.getenv('CLOUDINARY_FOLDER', 'spirit_adventures')
