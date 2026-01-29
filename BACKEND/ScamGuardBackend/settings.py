from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = 'django-insecure-scamshield-backend'

DEBUG = True

ALLOWED_HOSTS = ['localhost', '127.0.0.1', '0.0.0.0']

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    'rest_framework',
    'rest_framework.authtoken',
    'corsheaders',

    'analyzer',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

CORS_ALLOW_ALL_ORIGINS = True

CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
]

CORS_ALLOW_CREDENTIALS = True

ROOT_URLCONF = 'ScamGuardBackend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
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

WSGI_APPLICATION = 'ScamGuardBackend.wsgi.application'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

AUTH_PASSWORD_VALIDATORS = []

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'Asia/Kolkata'

USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Email Configuration - Gmail SMTP
import os
from pathlib import Path

_env_file = BASE_DIR / '.env'
if _env_file.exists():
    with open(_env_file, encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                key, _, value = line.partition('=')
                key, value = key.strip(), value.strip().strip('"').strip("'")
                os.environ.setdefault(key, value)

EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_USE_SSL = False

EMAIL_HOST_USER = os.getenv('EMAIL_USER', 'ananta.evince@gmail.com').strip()
EMAIL_HOST_PASSWORD = (os.getenv('EMAIL_PASS', '') or '').strip()

if not EMAIL_HOST_PASSWORD:
    EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
    print("WARNING: EMAIL_PASS not set. Emails will NOT be sent; they are printed to console.")
    print("To receive report emails at ananta.evince@gmail.com:")
    print("  1. Create BACKEND/.env with EMAIL_USER=ananta.evince@gmail.com and EMAIL_PASS=<Gmail-App-Password>")
    print("  2. Gmail App Password: Google Account -> Security -> 2-Step Verification -> App passwords -> generate for 'Mail'")

DEFAULT_FROM_EMAIL = os.getenv('EMAIL_FROM', EMAIL_HOST_USER or 'noreply@scamshield.com')
SCAMSHIELD_REPORT_EMAILS = [
    'ananta.evince@gmail.com',
]

# Email timeout (seconds)
EMAIL_TIMEOUT = 10

# File upload settings
MEDIA_URL = 'media/'
MEDIA_ROOT = BASE_DIR / 'media'

# File upload size limit (5MB)
DATA_UPLOAD_MAX_MEMORY_SIZE = 5242880