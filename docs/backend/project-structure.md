# Prime College — Django Backend Project Structure

**Version:** 1.0  
**Date:** 14 March 2026  
**Stack:** Django 5.x + DRF 3.15 + PostgreSQL 16 + Redis 7 + Celery 5.x + AWS S3

---

## Quick Start

```bash
# 1. Create project
mkdir prime-college-api && cd prime-college-api
python -m venv venv
source venv/bin/activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Create Django project
django-admin startproject config .

# 4. Create apps (in order)
python manage.py startapp users
python manage.py startapp qualifications
python manage.py startapp enrolments
python manage.py startapp assessments
python manage.py startapp quizzes
python manage.py startapp iqa
python manage.py startapp notifications
python manage.py startapp audit
python manage.py startapp payments
python manage.py startapp reports

# 5. Move apps into apps/ directory
mkdir apps
mv users qualifications enrolments assessments quizzes iqa notifications audit payments reports apps/

# 6. Run migrations
python manage.py makemigrations
python manage.py migrate

# 7. Create superuser
python manage.py createsuperuser

# 8. Run dev server
python manage.py runserver
```

---

## Complete Directory Structure

```
prime-college-api/
│
├── manage.py
├── requirements.txt
├── requirements-dev.txt
├── Dockerfile
├── docker-compose.yml
├── .env.example
├── .gitignore
├── pytest.ini
├── setup.cfg
│
├── config/                          # Django project settings
│   ├── __init__.py
│   ├── settings/
│   │   ├── __init__.py
│   │   ├── base.py                  # Shared settings
│   │   ├── development.py           # DEBUG=True, console email
│   │   ├── staging.py               # RDS staging, SES sandbox
│   │   └── production.py            # Full AWS, Sentry, strict security
│   ├── urls.py                      # Root URL configuration
│   ├── wsgi.py
│   ├── asgi.py
│   └── celery.py                    # Celery app configuration
│
├── core/                            # Shared utilities (not a Django app)
│   ├── __init__.py
│   ├── permissions.py               # HasRole, IsLearner, IsTrainer, IsIQA, IsAdmin,
│   │                                # IsAssignedTrainer, IsEnrolmentOwner
│   ├── pagination.py                # StandardPagination (25 per page)
│   ├── throttles.py                 # Custom throttle classes
│   ├── mixins.py                    # AuditMixin, OwnershipMixin
│   ├── exceptions.py                # Custom DRF exception handler
│   ├── middleware/
│   │   ├── __init__.py
│   │   ├── audit_middleware.py      # Auto-creates audit log on assessment endpoints
│   │   └── ip_middleware.py         # Captures IP for audit logs
│   └── utils/
│       ├── __init__.py
│       ├── evidence_ref.py          # generate_evidence_ref() → EV-2026-001
│       ├── learner_ref.py           # generate_learner_ref() → LRN-2024-001
│       ├── s3.py                    # Pre-signed URL generation (upload + download)
│       └── email.py                 # send_templated_email() wrapper
│
├── apps/
│   │
│   ├── users/                       # APP 1: User management
│   │   ├── __init__.py
│   │   ├── apps.py
│   │   ├── models.py                # UserProfile, UserRole
│   │   ├── admin.py
│   │   ├── serializers/
│   │   │   ├── __init__.py
│   │   │   ├── auth_serializers.py  # Login, Register, PasswordChange, PasswordReset
│   │   │   └── profile_serializers.py  # UserProfile CRUD
│   │   ├── views/
│   │   │   ├── __init__.py
│   │   │   ├── auth_views.py        # Login, Register, Refresh, PasswordReset, PasswordChange
│   │   │   └── profile_views.py     # GET /api/auth/me/, update profile
│   │   ├── urls/
│   │   │   ├── __init__.py
│   │   │   └── auth.py              # /api/auth/* routes
│   │   ├── signals.py               # Auto-create UserProfile on user creation
│   │   ├── tests/
│   │   │   ├── __init__.py
│   │   │   ├── test_auth.py
│   │   │   └── test_roles.py
│   │   └── migrations/
│   │
│   ├── qualifications/              # APP 2: Qualification catalogue
│   │   ├── __init__.py
│   │   ├── apps.py
│   │   ├── models.py                # Qualification, Unit, AssessmentCriteria, UnitResource
│   │   ├── admin.py
│   │   ├── serializers/
│   │   │   ├── __init__.py
│   │   │   ├── public_serializers.py   # QualificationList, QualificationDetail (public)
│   │   │   └── admin_serializers.py    # Full CRUD serializers for admin
│   │   ├── views/
│   │   │   ├── __init__.py
│   │   │   ├── public_views.py      # GET /api/qualifications/ (public catalogue)
│   │   │   └── admin_views.py       # CRUD /api/admin/qualifications/
│   │   ├── urls/
│   │   │   ├── __init__.py
│   │   │   ├── public.py            # /api/qualifications/* (no auth)
│   │   │   └── admin.py             # /api/admin/qualifications/* (admin only)
│   │   ├── tests/
│   │   │   ├── __init__.py
│   │   │   ├── test_public_api.py
│   │   │   └── test_admin_api.py
│   │   └── migrations/
│   │
│   ├── enrolments/                  # APP 3: Enrolment & access control
│   │   ├── __init__.py
│   │   ├── apps.py
│   │   ├── models.py                # Enrolment
│   │   ├── admin.py
│   │   ├── serializers/
│   │   │   ├── __init__.py
│   │   │   ├── learner_serializers.py  # Learner's own enrolments
│   │   │   └── admin_serializers.py    # Admin enrolment management
│   │   ├── views/
│   │   │   ├── __init__.py
│   │   │   ├── learner_views.py     # GET /api/learner/enrolments/
│   │   │   └── admin_views.py       # POST /api/admin/learners/ (manual enrol)
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   └── enrolment_service.py # create_enrolment(), check_access(), assign_trainer()
│   │   ├── signals.py               # Post-payment auto-enrolment signal
│   │   ├── urls/
│   │   │   ├── __init__.py
│   │   │   ├── learner.py
│   │   │   └── admin.py
│   │   ├── tests/
│   │   │   ├── __init__.py
│   │   │   ├── test_enrolment.py
│   │   │   └── test_access_control.py
│   │   └── migrations/
│   │
│   ├── assessments/                 # APP 4: Evidence + assessment decisions
│   │   ├── __init__.py
│   │   ├── apps.py
│   │   ├── models.py                # Submission, SubmissionFile, AssessmentDecision, CriteriaStatus
│   │   ├── admin.py
│   │   ├── serializers/
│   │   │   ├── __init__.py
│   │   │   ├── submission_serializers.py    # Submit evidence, list submissions
│   │   │   ├── assessment_serializers.py    # AssessmentDecision (trainer feedback)
│   │   │   └── criteria_serializers.py      # CriteriaStatus per unit
│   │   ├── views/
│   │   │   ├── __init__.py
│   │   │   ├── learner_views.py     # POST submit evidence, GET feedback, GET history
│   │   │   ├── trainer_views.py     # POST assess, PATCH mark criteria, GET queue
│   │   │   └── admin_views.py       # GET all submissions (read-only for admin)
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── submission_service.py    # create_submission(), create_resubmission()
│   │   │   ├── assessment_service.py    # submit_assessment(), auto-complete checks
│   │   │   └── criteria_service.py      # mark_criteria(), check_unit_completion()
│   │   ├── signals.py               # Post-assessment: notify learner, trigger IQA sampling
│   │   ├── urls/
│   │   │   ├── __init__.py
│   │   │   ├── learner.py           # /api/learner/enrolments/{id}/units/{code}/submit/
│   │   │   ├── trainer.py           # /api/trainer/submissions/{id}/assess/
│   │   │   └── admin.py
│   │   ├── tests/
│   │   │   ├── __init__.py
│   │   │   ├── test_submission.py
│   │   │   ├── test_versioning.py
│   │   │   ├── test_assessment.py
│   │   │   └── test_criteria.py
│   │   └── migrations/
│   │
│   ├── quizzes/                     # APP 5: Quiz engine
│   │   ├── __init__.py
│   │   ├── apps.py
│   │   ├── models.py                # Question, QuizAttempt, QuizAnswer, IntegrityViolation
│   │   ├── admin.py
│   │   ├── serializers/
│   │   │   ├── __init__.py
│   │   │   ├── question_serializers.py     # Question bank CRUD
│   │   │   └── quiz_serializers.py         # QuizAttempt, QuizAnswer (read-only)
│   │   ├── views/
│   │   │   ├── __init__.py
│   │   │   ├── learner_views.py     # POST /api/learner/.../quiz/ (submit answers)
│   │   │   ├── trainer_views.py     # GET quiz results, question bank CRUD
│   │   │   └── admin_views.py       # Bulk import, global question management
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   └── quiz_scoring_service.py  # generate_quiz(), score_attempt() — SERVER-SIDE ONLY
│   │   ├── urls/
│   │   │   ├── __init__.py
│   │   │   ├── learner.py
│   │   │   ├── trainer.py
│   │   │   └── admin.py
│   │   ├── tests/
│   │   │   ├── __init__.py
│   │   │   ├── test_scoring.py
│   │   │   └── test_integrity.py
│   │   └── migrations/
│   │
│   ├── iqa/                         # APP 6: Internal Quality Assurance
│   │   ├── __init__.py
│   │   ├── apps.py
│   │   ├── models.py                # IQASample, IQAReview, SamplingSetting,
│   │   │                            # ChecklistTemplate, ChecklistItem, CompletedChecklist
│   │   ├── admin.py
│   │   ├── serializers/
│   │   │   ├── __init__.py
│   │   │   ├── sample_serializers.py       # IQASample, IQAReview
│   │   │   └── checklist_serializers.py    # Templates + completed checklists
│   │   ├── views/
│   │   │   ├── __init__.py
│   │   │   ├── iqa_views.py         # Dashboard, sampling queue, review submission
│   │   │   ├── checklist_views.py   # Get templates, complete checklist
│   │   │   └── admin_views.py       # CRUD checklist templates, sampling settings
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── sampling_service.py      # create_samples_for_period() — Celery weekly task
│   │   │   └── checklist_service.py     # complete_checklist(), get_templates()
│   │   ├── tasks.py                 # Celery: weekly sampling task
│   │   ├── urls/
│   │   │   ├── __init__.py
│   │   │   ├── iqa.py               # /api/iqa/*
│   │   │   └── admin.py             # /api/admin/checklists/*
│   │   ├── tests/
│   │   │   ├── __init__.py
│   │   │   ├── test_sampling.py
│   │   │   └── test_checklists.py
│   │   └── migrations/
│   │
│   ├── notifications/               # APP 7: In-app + email notifications
│   │   ├── __init__.py
│   │   ├── apps.py
│   │   ├── models.py                # Notification
│   │   ├── admin.py
│   │   ├── serializers/
│   │   │   ├── __init__.py
│   │   │   └── notification_serializers.py
│   │   ├── views/
│   │   │   ├── __init__.py
│   │   │   └── notification_views.py  # GET list, PATCH mark read
│   │   ├── tasks/
│   │   │   ├── __init__.py
│   │   │   └── email_tasks.py       # Celery: send_assessment_email, send_access_expiry_warning
│   │   ├── urls/
│   │   │   ├── __init__.py
│   │   │   └── notifications.py     # /api/learner/notifications/
│   │   ├── tests/
│   │   │   └── test_notifications.py
│   │   └── migrations/
│   │
│   ├── audit/                       # APP 8: Immutable audit trail
│   │   ├── __init__.py
│   │   ├── apps.py
│   │   ├── models.py                # AuditLog (immutable — save/delete overridden)
│   │   ├── admin.py                 # Read-only admin view
│   │   ├── serializers/
│   │   │   ├── __init__.py
│   │   │   └── audit_serializers.py
│   │   ├── views/
│   │   │   ├── __init__.py
│   │   │   └── audit_views.py       # GET /api/admin/audit-log/ (paginated, filterable)
│   │   ├── urls/
│   │   │   ├── __init__.py
│   │   │   └── admin.py
│   │   ├── tests/
│   │   │   └── test_immutability.py  # Ensure save/delete raises on existing records
│   │   └── migrations/
│   │
│   ├── payments/                    # APP 9: Stripe integration
│   │   ├── __init__.py
│   │   ├── apps.py
│   │   ├── models.py                # (Enrolment.stripe_payment_id handles payment tracking)
│   │   ├── views/
│   │   │   ├── __init__.py
│   │   │   ├── checkout_views.py    # POST create Stripe session
│   │   │   └── webhook_views.py     # POST Stripe webhook (no auth)
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   └── payment_service.py   # handle_successful_payment() → create user + enrolment
│   │   ├── urls.py                  # /api/checkout/*
│   │   ├── tests/
│   │   │   └── test_webhook.py
│   │   └── migrations/
│   │
│   └── reports/                     # APP 10: Reporting & EQA export
│       ├── __init__.py
│       ├── apps.py
│       ├── views/
│       │   ├── __init__.py
│       │   └── report_views.py      # Progress, assessment, compliance reports
│       ├── services/
│       │   ├── __init__.py
│       │   └── eqa_export_service.py  # generate_portfolio() → PDF (WeasyPrint/ReportLab)
│       ├── urls/
│       │   ├── __init__.py
│       │   └── admin.py             # /api/admin/reports/*
│       ├── tests/
│       │   └── test_export.py
│       └── migrations/
│
├── templates/                       # Email templates (Django template engine)
│   └── emails/
│       ├── base.html                # Base email layout (Prime College branding)
│       ├── welcome.html             # Post-registration welcome
│       ├── assessment_outcome.html  # Competent / Resubmission / Not Competent
│       ├── access_expiry.html       # 30/7/1 day warnings
│       ├── password_reset.html      # Password reset link
│       └── extension_decision.html  # Extension approved/denied
│
├── fixtures/                        # Seed data for dev/staging
│   ├── users.json                   # Admin, trainer, IQA, learner accounts
│   ├── qualifications.json          # Qualifications + units + criteria
│   └── demo_enrolments.json         # Enrolments with submissions & assessments
│
└── scripts/                         # Management commands & utilities
    ├── seed_demo_data.py            # python manage.py runscript seed_demo_data
    ├── generate_samples.py          # Manual IQA sampling trigger
    └── export_evidence.py           # Bulk evidence export for EQA
```

---

## Root URL Configuration

**File:** `config/urls.py`

```python
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    # Django admin (superusers only)
    path('admin/', admin.site.urls),

    # Public APIs (no auth required)
    path('api/auth/', include('apps.users.urls.auth')),
    path('api/qualifications/', include('apps.qualifications.urls.public')),
    path('api/checkout/', include('apps.payments.urls')),

    # Learner APIs (IsLearner permission)
    path('api/learner/', include('apps.enrolments.urls.learner')),
    path('api/learner/', include('apps.assessments.urls.learner')),
    path('api/learner/', include('apps.quizzes.urls.learner')),
    path('api/learner/', include('apps.notifications.urls.notifications')),

    # Trainer APIs (IsTrainer permission)
    path('api/trainer/', include('apps.assessments.urls.trainer')),
    path('api/trainer/', include('apps.quizzes.urls.trainer')),

    # IQA APIs (IsIQA permission)
    path('api/iqa/', include('apps.iqa.urls.iqa')),

    # Admin APIs (IsAdmin permission)
    path('api/admin/', include('apps.qualifications.urls.admin')),
    path('api/admin/', include('apps.enrolments.urls.admin')),
    path('api/admin/', include('apps.iqa.urls.admin')),
    path('api/admin/', include('apps.audit.urls.admin')),
    path('api/admin/', include('apps.reports.urls.admin')),
    path('api/admin/', include('apps.quizzes.urls.admin')),
]
```

---

## requirements.txt

```
# Core
Django==5.1
djangorestframework==3.15.2
djangorestframework-simplejwt==5.3.1
django-cors-headers==4.4.0
django-filter==24.3

# Database
psycopg2-binary==2.9.9

# Cache & Tasks
redis==5.0.8
celery==5.4.0
django-redis==5.4.0

# AWS
boto3==1.35.0
django-storages==1.14.4

# Payments
stripe==10.12.0

# PDF Generation
weasyprint==62.3

# Security
python-decouple==3.8

# Dev
django-extensions==3.2.3
django-debug-toolbar==4.4.6

# Testing
pytest==8.3.3
pytest-django==4.9.0
factory-boy==3.3.1
```

---

## Settings Base

**File:** `config/settings/base.py`

```python
import os
from pathlib import Path
from datetime import timedelta
from decouple import config

BASE_DIR = Path(__file__).resolve().parent.parent.parent

SECRET_KEY = config('SECRET_KEY')

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third-party
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',
    'corsheaders',
    'django_filters',
    'storages',

    # Project apps — ORDER MATTERS for migrations
    'apps.users',
    'apps.qualifications',
    'apps.enrolments',
    'apps.quizzes',
    'apps.assessments',
    'apps.iqa',
    'apps.notifications',
    'apps.audit',
    'apps.payments',
    'apps.reports',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'core.middleware.ip_middleware.IPCaptureMiddleware',
]

ROOT_URLCONF = 'config.urls'

# REST Framework
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_PAGINATION_CLASS': 'core.pagination.StandardPagination',
    'PAGE_SIZE': 25,
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '20/minute',
        'user': '100/minute',
    },
    'EXCEPTION_HANDLER': 'core.exceptions.custom_exception_handler',
}

# JWT
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=30),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'AUTH_HEADER_TYPES': ('Bearer',),
}

# CORS
CORS_ALLOWED_ORIGINS = config(
    'CORS_ALLOWED_ORIGINS',
    default='http://localhost:5173',
    cast=lambda v: [s.strip() for s in v.split(',')]
)
CORS_ALLOW_CREDENTIALS = True

# Database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': config('DB_NAME', default='prime_college'),
        'USER': config('DB_USER', default='postgres'),
        'PASSWORD': config('DB_PASSWORD', default='postgres'),
        'HOST': config('DB_HOST', default='localhost'),
        'PORT': config('DB_PORT', default='5432'),
    }
}

# Celery
CELERY_BROKER_URL = config('REDIS_URL', default='redis://localhost:6379/0')
CELERY_RESULT_BACKEND = config('REDIS_URL', default='redis://localhost:6379/0')

# Cache
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': config('REDIS_URL', default='redis://localhost:6379/1'),
    }
}

# S3 / File Storage
AWS_ACCESS_KEY_ID = config('AWS_ACCESS_KEY_ID', default='')
AWS_SECRET_ACCESS_KEY = config('AWS_SECRET_ACCESS_KEY', default='')
AWS_STORAGE_BUCKET_NAME = config('AWS_STORAGE_BUCKET_NAME', default='prime-college-evidence')
AWS_S3_REGION_NAME = config('AWS_S3_REGION_NAME', default='eu-west-2')
AWS_CLOUDFRONT_DOMAIN = config('AWS_CLOUDFRONT_DOMAIN', default='')

# Stripe
STRIPE_SECRET_KEY = config('STRIPE_SECRET_KEY', default='')
STRIPE_WEBHOOK_SECRET = config('STRIPE_WEBHOOK_SECRET', default='')
STRIPE_PUBLISHABLE_KEY = config('STRIPE_PUBLISHABLE_KEY', default='')

# Frontend URL (for email links, Stripe redirects)
FRONTEND_URL = config('FRONTEND_URL', default='http://localhost:5173')
```

---

## .env.example

```env
# Django
SECRET_KEY=your-secret-key-here
DEBUG=True
DJANGO_SETTINGS_MODULE=config.settings.development

# Database
DB_NAME=prime_college
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432

# Redis
REDIS_URL=redis://localhost:6379/0

# AWS S3
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_STORAGE_BUCKET_NAME=prime-college-evidence
AWS_S3_REGION_NAME=eu-west-2
AWS_CLOUDFRONT_DOMAIN=

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:5173

# Frontend
FRONTEND_URL=http://localhost:5173

# Sentry (production only)
SENTRY_DSN=
```

---

## Dockerfile

```dockerfile
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# System dependencies (for WeasyPrint PDF generation)
RUN apt-get update && apt-get install -y \
    build-essential libpq-dev libcairo2 libpango-1.0-0 \
    libpangocairo-1.0-0 libgdk-pixbuf2.0-0 libffi-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN python manage.py collectstatic --noinput

EXPOSE 8000

CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "4"]
```

---

## docker-compose.yml (Development)

```yaml
version: '3.8'

services:
  api:
    build: .
    command: python manage.py runserver 0.0.0.0:8000
    volumes:
      - .:/app
    ports:
      - "8000:8000"
    env_file:
      - .env
    depends_on:
      - db
      - redis

  db:
    image: postgres:16
    environment:
      POSTGRES_DB: prime_college
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  celery:
    build: .
    command: celery -A config worker -l info
    env_file:
      - .env
    depends_on:
      - db
      - redis

  celery-beat:
    build: .
    command: celery -A config beat -l info --scheduler django_celery_beat.schedulers:DatabaseScheduler
    env_file:
      - .env
    depends_on:
      - db
      - redis

volumes:
  postgres_data:
```

---

## Celery Configuration

**File:** `config/celery.py`

```python
import os
from celery import Celery
from celery.schedules import crontab

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')

app = Celery('prime_college')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()

app.conf.beat_schedule = {
    # Weekly IQA sampling — every Monday 6 AM
    'weekly-iqa-sampling': {
        'task': 'apps.iqa.tasks.run_weekly_sampling',
        'schedule': crontab(hour=6, minute=0, day_of_week=1),
    },
    # Daily access expiry warnings
    'daily-access-expiry-check': {
        'task': 'apps.notifications.tasks.email_tasks.send_access_expiry_warning',
        'schedule': crontab(hour=8, minute=0),
    },
}
```

---

## Build Order (Recommended)

Build the apps in this order — each depends on the ones above it:

| Phase | App | What to Build | Dependencies |
|-------|-----|---------------|-------------|
| **1** | `core/` | permissions.py, utils/, middleware/ | None |
| **2** | `users` | UserProfile, UserRole, auth endpoints | core |
| **3** | `qualifications` | Qualification, Unit, Criteria, Resource, public API | core, users |
| **4** | `payments` | Stripe checkout, webhook, auto-enrolment | users, qualifications |
| **5** | `enrolments` | Enrolment model, learner/admin endpoints | users, qualifications, payments |
| **6** | `assessments` | Submission, AssessmentDecision, CriteriaStatus | enrolments, qualifications |
| **7** | `quizzes` | Question bank, scoring engine, anti-cheat | enrolments, qualifications, assessments |
| **8** | `iqa` | Sampling, reviews, checklists | assessments, enrolments |
| **9** | `notifications` | In-app + Celery email tasks | users, assessments, enrolments |
| **10** | `audit` | AuditLog (immutable), admin read-only view | All apps |
| **11** | `reports` | Progress/compliance reports, EQA PDF export | All apps |

---

## Migration Sequence

```bash
# Phase 1: Core models
python manage.py makemigrations users
python manage.py makemigrations qualifications
python manage.py migrate

# Phase 2: Enrolments (depends on users + qualifications)
python manage.py makemigrations enrolments
python manage.py migrate

# Phase 3: Assessment models (depends on enrolments + qualifications)
python manage.py makemigrations quizzes        # Question model first (no FK to QuizAttempt yet)
python manage.py makemigrations assessments    # Submission has FK to QuizAttempt
python manage.py migrate

# Phase 4: IQA (depends on assessments)
python manage.py makemigrations iqa
python manage.py migrate

# Phase 5: Support models
python manage.py makemigrations notifications
python manage.py makemigrations audit
python manage.py migrate

# Phase 6: DB sequence for evidence numbering
python manage.py dbshell
# CREATE SEQUENCE evidence_ref_seq START 1;
# CREATE SEQUENCE learner_ref_seq START 1;
```

---

## Database Sequences (Run After Migrations)

```sql
-- Evidence reference: EV-2026-001, EV-2026-002, ...
CREATE SEQUENCE IF NOT EXISTS evidence_ref_seq START 1;

-- Learner reference: LRN-2024-001, LRN-2024-002, ...
CREATE SEQUENCE IF NOT EXISTS learner_ref_seq START 1;
```

---

## Key Architecture Rules

| Rule | Details |
|------|---------|
| **Roles in separate table** | UserRole table — NEVER on User model |
| **Server-side scoring** | Quiz answers scored in `QuizScoringService` — never trust client |
| **Immutable audit logs** | `AuditLog.save()` and `.delete()` raise on existing records |
| **Evidence immutability** | Submitted evidence cannot be edited — only new versions (resubmissions) |
| **Soft-delete only** | SubmissionFile.is_deleted — no hard deletes on evidence |
| **Pre-signed URLs** | All S3 access via pre-signed URLs — never expose bucket paths |
| **Business logic in services/** | Views call services — views are thin, services are testable |
| **Signals for cross-app effects** | Post-assessment → notification + IQA sampling trigger |
| **All assessment endpoints audit-logged** | Middleware or explicit AuditLog.objects.create() |

---

## Frontend ↔ Backend API Mapping

| Frontend Page | Backend Endpoint |
|---------------|-----------------|
| Public qualifications | `GET /api/qualifications/` |
| Qualification detail | `GET /api/qualifications/{slug}/` |
| Checkout | `POST /api/checkout/create-session/` |
| Learner dashboard | `GET /api/learner/dashboard/` |
| Learner unit detail | `GET /api/learner/enrolments/{id}/units/{code}/` |
| Submit evidence | `POST /api/learner/enrolments/{id}/units/{code}/submit/` |
| Upload file | `POST /api/learner/enrolments/{id}/units/{code}/upload/` |
| View feedback | `GET /api/learner/enrolments/{id}/units/{code}/feedback/` |
| Trainer queue | `GET /api/trainer/queue/` |
| Assess submission | `POST /api/trainer/submissions/{id}/assess/` |
| Mark criteria | `PATCH /api/trainer/learners/{id}/units/{code}/criteria/{cid}/` |
| IQA sampling queue | `GET /api/iqa/sampling-queue/` |
| IQA review | `POST /api/iqa/samples/{id}/review/` |
| Admin learners | `GET /api/admin/learners/` |
| Admin reports | `GET /api/admin/reports/progress/` |
| EQA export | `GET /api/admin/eqa-export/{learner_id}/` |
