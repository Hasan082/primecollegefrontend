# Prime College — Production Backend Architecture

**Version:** 1.0  
**Date:** 12 March 2026  
**Status:** Architecture Specification  
**Stack:** Django REST Framework (DRF) + PostgreSQL + AWS S3 + Redis + Celery  

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Technology Stack](#2-technology-stack)
3. [Database Schema](#3-database-schema)
4. [Authentication & Authorisation](#4-authentication--authorisation)
5. [API Architecture](#5-api-architecture)
6. [File Storage & Evidence Management](#6-file-storage--evidence-management)
7. [Assessment & Grading Engine](#7-assessment--grading-engine)
8. [Audit Trail & Compliance](#8-audit-trail--compliance)
9. [Notification System](#9-notification-system)
10. [Payment Integration](#10-payment-integration)
11. [IQA & Quality Assurance](#11-iqa--quality-assurance)
12. [Caching & Performance](#12-caching--performance)
13. [Security Architecture](#13-security-architecture)
14. [Deployment & Infrastructure](#14-deployment--infrastructure)
15. [Monitoring & Observability](#15-monitoring--observability)
16. [Data Migration & Seeding](#16-data-migration--seeding)
17. [API Endpoint Reference](#17-api-endpoint-reference)

---

## 1. System Overview

### 1.1 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React + Vite)                  │
│   Learner Portal │ Trainer Portal │ IQA Portal │ Admin Portal   │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTPS / JWT
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                     LOAD BALANCER (AWS ALB)                      │
└──────────────────────────┬──────────────────────────────────────┘
                           │
          ┌────────────────┼────────────────┐
          ▼                ▼                ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  DRF App     │  │  DRF App     │  │  DRF App     │
│  Instance 1  │  │  Instance 2  │  │  Instance N  │
│  (Gunicorn)  │  │  (Gunicorn)  │  │  (Gunicorn)  │
└──────┬───────┘  └──────┬───────┘  └──────┬───────┘
       │                 │                 │
       └────────┬────────┘────────┬────────┘
                │                 │
       ┌────────▼──────┐  ┌──────▼────────┐
       │  PostgreSQL   │  │    Redis       │
       │  (RDS)        │  │  (ElastiCache) │
       │  Primary +    │  │  Sessions +    │
       │  Read Replica │  │  Cache + Queue │
       └───────────────┘  └───────────────┘
                │
       ┌────────▼──────┐  ┌───────────────┐
       │  AWS S3       │  │  Celery        │
       │  Evidence     │  │  Workers       │
       │  Storage      │  │  (Background)  │
       └───────────────┘  └───────────────┘
```

### 1.2 Design Principles

1. **Append-Only Audit** — No hard deletes on assessment data; all changes logged
2. **Server-Side Scoring** — Quiz answers scored on backend; never trust client
3. **Role-Based Access** — Every endpoint enforced via permissions, never client-side checks
4. **Evidence Immutability** — Submitted evidence cannot be modified, only versioned
5. **Compliance-First** — All data structures designed for Ofsted/DfE audit export

---

## 2. Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| API Framework | Django 5.x + DRF 3.15 | REST API, ORM, admin |
| Database | PostgreSQL 16 (AWS RDS) | Primary data store |
| Cache / Queue | Redis 7 (AWS ElastiCache) | Caching, sessions, Celery broker |
| Task Queue | Celery 5.x | Async tasks (email, PDF, notifications) |
| File Storage | AWS S3 + CloudFront CDN | Evidence files, resources, exports |
| Authentication | Django SimpleJWT | JWT access + refresh tokens |
| Email | AWS SES | Transactional emails |
| Payments | Stripe API | Qualification purchases |
| Search | PostgreSQL Full-Text Search | Learner/qualification search |
| Monitoring | Sentry + CloudWatch | Error tracking, metrics |
| CI/CD | GitHub Actions | Automated testing + deployment |
| Container | Docker + AWS ECS Fargate | Serverless container deployment |

---

## 3. Database Schema

### 3.1 Entity Relationship Diagram

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│    User      │────▸│    UserRole       │     │  Qualification  │
│  (auth)      │     │  (learner/trainer │     │                 │
│              │     │   /admin/iqa)     │     │                 │
└──────┬───────┘     └──────────────────┘     └────────┬────────┘
       │                                               │
       ▼                                               ▼
┌──────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Profile     │     │   Enrolment      │────▸│     Unit        │
│   (extends    │     │   (learner +     │     │  (belongs to    │
│    user)      │     │    qualification) │     │   qualification)│
└──────────────┘     └────────┬─────────┘     └────────┬────────┘
                              │                        │
                              ▼                        ▼
                     ┌──────────────────┐     ┌─────────────────┐
                     │  TrainerAssign   │     │ AssessmentCrit  │
                     │  (trainer ↔      │     │  (criteria per  │
                     │   enrolment)     │     │   unit)         │
                     └──────────────────┘     └────────┬────────┘
                                                       │
                     ┌──────────────────┐              │
                     │   Submission     │◀─────────────┘
                     │  (evidence per   │
                     │   unit/criteria) │
                     └────────┬─────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
     ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
     │ SubmissionFile│ │ Assessment   │ │ QuizAttempt  │
     │ (versioned   │ │ Decision     │ │ (auto-scored │
     │  evidence)   │ │ (trainer     │ │  quiz result)│
     └──────────────┘ │  feedback)   │ └──────────────┘
                      └──────────────┘
```

### 3.2 Core Models

#### `users` App

```python
# users/models.py

class UserProfile(models.Model):
    """Extended user profile for all roles."""
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='profile'
    )
    phone = models.CharField(max_length=20, blank=True)
    organisation = models.CharField(max_length=255, blank=True)
    profile_image = models.ImageField(upload_to='profiles/', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'user_profiles'


class UserRole(models.Model):
    """Separate role table — NEVER store roles on the user model."""
    class Role(models.TextChoices):
        LEARNER = 'learner', 'Learner'
        TRAINER = 'trainer', 'Trainer'
        ADMIN = 'admin', 'Admin'
        IQA = 'iqa', 'Internal Quality Assurer'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='roles'
    )
    role = models.CharField(max_length=10, choices=Role.choices)

    class Meta:
        db_table = 'user_roles'
        unique_together = ['user', 'role']
        indexes = [models.Index(fields=['user', 'role'])]
```

#### `qualifications` App

```python
# qualifications/models.py

class Qualification(models.Model):
    """Top-level qualification (e.g., Level 3 Diploma in Business Admin)."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    title = models.CharField(max_length=500)
    code = models.CharField(max_length=50, unique=True)  # e.g., BUS-L3-DIP
    level = models.CharField(max_length=20)               # e.g., Level 3
    category = models.CharField(max_length=100)
    awarding_body = models.CharField(max_length=100)      # e.g., VTCT, CMI
    description = models.TextField(blank=True)
    
    # Commercial
    price = models.DecimalField(max_digits=10, decimal_places=2)
    access_duration_days = models.IntegerField(default=365)
    
    # Status
    status = models.CharField(
        max_length=10,
        choices=[('active', 'Active'), ('draft', 'Draft'), ('archived', 'Archived')],
        default='draft'
    )
    
    # SEO / Public page
    slug = models.SlugField(max_length=200, unique=True)
    meta_title = models.CharField(max_length=60, blank=True)
    meta_description = models.CharField(max_length=160, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'qualifications'
        ordering = ['title']


class Unit(models.Model):
    """A unit/module within a qualification."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    qualification = models.ForeignKey(
        Qualification, on_delete=models.CASCADE, related_name='units'
    )
    code = models.CharField(max_length=50)       # e.g., UNIT-301
    title = models.CharField(max_length=500)
    description = models.TextField(blank=True)
    order = models.IntegerField(default=0)
    
    # Assessment config
    has_quiz = models.BooleanField(default=False)
    quiz_pass_mark = models.IntegerField(default=80)
    requires_evidence = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'units'
        ordering = ['order']
        unique_together = ['qualification', 'code']


class AssessmentCriteria(models.Model):
    """Individual assessment criteria within a unit (UK standard)."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    unit = models.ForeignKey(Unit, on_delete=models.CASCADE, related_name='criteria')
    code = models.CharField(max_length=20)        # e.g., 1.1, 1.2, 2.1
    description = models.TextField()
    order = models.IntegerField(default=0)
    
    class Meta:
        db_table = 'assessment_criteria'
        ordering = ['order']
        unique_together = ['unit', 'code']


class UnitResource(models.Model):
    """Learning resources attached to a unit."""
    RESOURCE_TYPES = [
        ('pdf', 'PDF Document'),
        ('slides', 'Presentation'),
        ('template', 'Template'),
        ('guidance', 'Guidance Document'),
        ('example', 'Example Evidence'),
        ('video', 'Video Resource'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    unit = models.ForeignKey(Unit, on_delete=models.CASCADE, related_name='resources')
    title = models.CharField(max_length=255)
    resource_type = models.CharField(max_length=20, choices=RESOURCE_TYPES)
    file = models.FileField(upload_to='resources/%Y/%m/')
    file_size = models.BigIntegerField()
    order = models.IntegerField(default=0)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)

    class Meta:
        db_table = 'unit_resources'
        ordering = ['order']
```

#### `enrolments` App

```python
# enrolments/models.py

class Enrolment(models.Model):
    """Links a learner to a qualification with access control."""
    PAYMENT_METHODS = [
        ('online', 'Online Payment'),
        ('manual', 'Manual Enrolment'),
        ('employer', 'Employer Funded'),
    ]
    PAYMENT_STATUSES = [
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('overdue', 'Overdue'),
        ('refunded', 'Refunded'),
    ]
    ENROLMENT_STATUSES = [
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('suspended', 'Suspended'),
        ('expired', 'Expired'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    learner = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name='enrolments', limit_choices_to={'roles__role': 'learner'}
    )
    qualification = models.ForeignKey(
        'qualifications.Qualification', on_delete=models.PROTECT
    )
    learner_ref = models.CharField(max_length=20, unique=True)  # LRN-2024-001
    
    # Payment
    payment_method = models.CharField(max_length=10, choices=PAYMENT_METHODS)
    payment_status = models.CharField(max_length=10, choices=PAYMENT_STATUSES, default='pending')
    stripe_payment_id = models.CharField(max_length=255, blank=True)
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # Access control
    enrolled_at = models.DateTimeField(auto_now_add=True)
    access_expires_at = models.DateTimeField()
    status = models.CharField(max_length=10, choices=ENROLMENT_STATUSES, default='active')
    
    # Assignment
    assigned_trainer = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='trainer_enrolments',
        limit_choices_to={'roles__role': 'trainer'}
    )
    assigned_iqa = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='iqa_enrolments',
        limit_choices_to={'roles__role': 'iqa'}
    )
    
    # Progress (denormalised for performance)
    progress_percent = models.IntegerField(default=0)
    units_completed = models.IntegerField(default=0)
    total_units = models.IntegerField(default=0)
    
    class Meta:
        db_table = 'enrolments'
        unique_together = ['learner', 'qualification']
        indexes = [
            models.Index(fields=['assigned_trainer']),
            models.Index(fields=['status']),
            models.Index(fields=['payment_status']),
        ]

    def is_access_valid(self):
        """Check if learner still has access."""
        return (
            self.status == 'active'
            and self.payment_status == 'paid'
            and self.access_expires_at > timezone.now()
        )
```

#### `assessments` App

```python
# assessments/models.py

class Submission(models.Model):
    """A piece of evidence submitted by a learner for a unit."""
    SUBMISSION_TYPES = [
        ('evidence', 'Evidence Upload'),
        ('quiz', 'Quiz Attempt'),
        ('written', 'Written Response'),
    ]
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('submitted', 'Submitted'),
        ('under_review', 'Under Review'),
        ('assessed', 'Assessed'),
        ('resubmission_required', 'Resubmission Required'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    enrolment = models.ForeignKey('enrolments.Enrolment', on_delete=models.CASCADE)
    unit = models.ForeignKey('qualifications.Unit', on_delete=models.CASCADE)
    submission_type = models.CharField(max_length=10, choices=SUBMISSION_TYPES)
    title = models.CharField(max_length=255)
    status = models.CharField(max_length=25, choices=STATUS_CHOICES, default='draft')
    
    # Written evidence
    written_content = models.TextField(blank=True)
    word_count = models.IntegerField(null=True, blank=True)
    
    # Linked quiz attempt
    quiz_attempt = models.OneToOneField(
        'QuizAttempt', null=True, blank=True, on_delete=models.SET_NULL
    )
    
    # Version tracking
    version = models.IntegerField(default=1)
    previous_version = models.ForeignKey(
        'self', null=True, blank=True, on_delete=models.SET_NULL,
        related_name='next_versions'
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    submitted_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'submissions'
        ordering = ['-submitted_at']
        indexes = [
            models.Index(fields=['enrolment', 'unit']),
            models.Index(fields=['status']),
            models.Index(fields=['submitted_at']),
        ]


class SubmissionFile(models.Model):
    """Files attached to a submission, with version control."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    submission = models.ForeignKey(
        Submission, on_delete=models.CASCADE, related_name='files'
    )
    file_key = models.CharField(max_length=500)       # S3 key
    original_filename = models.CharField(max_length=255)
    content_type = models.CharField(max_length=100)
    file_size = models.BigIntegerField()
    checksum_sha256 = models.CharField(max_length=64)  # Integrity verification
    version = models.IntegerField(default=1)
    
    uploaded_at = models.DateTimeField(auto_now_add=True)
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    
    # Soft delete — evidence cannot be hard-deleted
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)
    deleted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True,
        on_delete=models.SET_NULL, related_name='deleted_files'
    )

    class Meta:
        db_table = 'submission_files'
        ordering = ['-uploaded_at']


class AssessmentDecision(models.Model):
    """Trainer's assessment of a submission — immutable record."""
    OUTCOMES = [
        ('competent', 'Competent / Pass'),
        ('resubmission', 'Resubmission Required'),
        ('not_competent', 'Not Yet Competent'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    submission = models.ForeignKey(
        Submission, on_delete=models.CASCADE, related_name='assessments'
    )
    trainer = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.PROTECT,
        related_name='assessment_decisions'
    )
    outcome = models.CharField(max_length=20, choices=OUTCOMES)
    feedback = models.TextField()
    feedback_file_key = models.CharField(max_length=500, blank=True)
    
    # Per-criteria marking
    criteria_decisions = models.JSONField(default=dict)
    # Format: {"1.1": "met", "1.2": "met", "2.1": "not_met", "2.2": "met"}
    
    assessed_at = models.DateTimeField(auto_now_add=True)
    
    # Immutable — if re-assessed, a new record is created
    supersedes = models.ForeignKey(
        'self', null=True, blank=True, on_delete=models.SET_NULL,
        related_name='superseded_by'
    )
    
    class Meta:
        db_table = 'assessment_decisions'
        ordering = ['-assessed_at']


class CriteriaStatus(models.Model):
    """Tracks per-criteria completion status for a learner's unit."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    enrolment = models.ForeignKey('enrolments.Enrolment', on_delete=models.CASCADE)
    criteria = models.ForeignKey(
        'qualifications.AssessmentCriteria', on_delete=models.CASCADE
    )
    status = models.CharField(
        max_length=10,
        choices=[('not_met', 'Not Met'), ('met', 'Met')],
        default='not_met'
    )
    met_at = models.DateTimeField(null=True, blank=True)
    assessed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, on_delete=models.SET_NULL
    )
    
    class Meta:
        db_table = 'criteria_statuses'
        unique_together = ['enrolment', 'criteria']
```

#### `quizzes` App

```python
# quizzes/models.py

class Question(models.Model):
    """Question bank entry linked to a unit."""
    QUESTION_TYPES = [
        ('single', 'Single Choice'),
        ('multiple', 'Multiple Choice'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    unit = models.ForeignKey('qualifications.Unit', on_delete=models.CASCADE)
    question_text = models.TextField()
    question_type = models.CharField(max_length=10, choices=QUESTION_TYPES)
    options = models.JSONField()          # List of option strings
    correct_answers = models.JSONField()  # List of correct option indices
    explanation = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    
    class Meta:
        db_table = 'questions'
        indexes = [models.Index(fields=['unit', 'is_active'])]


class QuizAttempt(models.Model):
    """A single quiz attempt by a learner — scored server-side."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    enrolment = models.ForeignKey('enrolments.Enrolment', on_delete=models.CASCADE)
    unit = models.ForeignKey('qualifications.Unit', on_delete=models.CASCADE)
    
    # Results (computed server-side)
    score_percent = models.IntegerField()
    correct_count = models.IntegerField()
    total_questions = models.IntegerField()
    pass_mark = models.IntegerField()
    passed = models.BooleanField()
    time_taken_seconds = models.IntegerField()
    
    # Anti-cheat
    violation_count = models.IntegerField(default=0)
    
    started_at = models.DateTimeField()
    submitted_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'quiz_attempts'
        ordering = ['-submitted_at']
        indexes = [
            models.Index(fields=['enrolment', 'unit']),
        ]


class QuizAnswer(models.Model):
    """Per-question answer with snapshot for audit trail."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    attempt = models.ForeignKey(QuizAttempt, on_delete=models.CASCADE, related_name='answers')
    question = models.ForeignKey(Question, on_delete=models.SET_NULL, null=True)
    question_order = models.IntegerField()
    
    # Learner response
    learner_answers = models.JSONField(default=list)
    correct_answers = models.JSONField(default=list)
    is_correct = models.BooleanField()
    
    # Snapshot at time of attempt (audit-safe)
    question_text_snapshot = models.TextField()
    options_snapshot = models.JSONField()
    
    class Meta:
        db_table = 'quiz_answers'
        ordering = ['question_order']


class IntegrityViolation(models.Model):
    """Anti-cheat event log — append-only."""
    TYPES = [
        ('tab_switch', 'Tab Switch'),
        ('right_click', 'Right Click'),
        ('copy_paste', 'Copy/Paste'),
        ('devtools', 'Developer Tools'),
        ('fullscreen_exit', 'Fullscreen Exit'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    attempt = models.ForeignKey(QuizAttempt, on_delete=models.CASCADE, related_name='violations')
    violation_type = models.CharField(max_length=20, choices=TYPES)
    detail = models.TextField()
    occurred_at = models.DateTimeField()
    
    class Meta:
        db_table = 'integrity_violations'
        ordering = ['occurred_at']
```

#### `audit` App

```python
# audit/models.py

class AuditLog(models.Model):
    """Immutable audit trail for all significant platform actions."""
    ACTION_TYPES = [
        # Evidence
        ('evidence_uploaded', 'Evidence Uploaded'),
        ('evidence_submitted', 'Evidence Submitted'),
        ('evidence_resubmitted', 'Evidence Resubmitted'),
        ('evidence_deleted', 'Evidence Soft-Deleted'),
        # Assessment
        ('assessment_started', 'Assessment Started'),
        ('assessment_completed', 'Assessment Completed'),
        ('criteria_marked', 'Criteria Marked'),
        ('unit_completed', 'Unit Completed'),
        ('qualification_completed', 'Qualification Completed'),
        # Quiz
        ('quiz_started', 'Quiz Started'),
        ('quiz_submitted', 'Quiz Submitted'),
        ('quiz_violation', 'Quiz Integrity Violation'),
        # IQA
        ('iqa_sample_created', 'IQA Sample Created'),
        ('iqa_review_completed', 'IQA Review Completed'),
        ('iqa_escalated', 'IQA Escalated'),
        # Admin
        ('learner_enrolled', 'Learner Enrolled'),
        ('learner_suspended', 'Learner Suspended'),
        ('trainer_assigned', 'Trainer Assigned'),
        ('iqa_assigned', 'IQA Assigned'),
        ('qualification_created', 'Qualification Created'),
        ('qualification_archived', 'Qualification Archived'),
        ('resource_uploaded', 'Resource Uploaded'),
        # Access
        ('access_granted', 'Access Granted'),
        ('access_expired', 'Access Expired'),
        ('login', 'User Login'),
        ('password_changed', 'Password Changed'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    action = models.CharField(max_length=30, choices=ACTION_TYPES)
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, related_name='audit_actions'
    )
    actor_role = models.CharField(max_length=10)
    
    # Polymorphic target
    target_type = models.CharField(max_length=50)       # e.g., 'submission', 'enrolment'
    target_id = models.UUIDField()
    
    # Context
    metadata = models.JSONField(default=dict)            # Action-specific data
    ip_address = models.GenericIPAddressField(null=True)
    user_agent = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'audit_logs'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['action']),
            models.Index(fields=['actor']),
            models.Index(fields=['target_type', 'target_id']),
            models.Index(fields=['created_at']),
        ]
    
    def save(self, *args, **kwargs):
        """Audit logs are immutable — prevent updates."""
        if self.pk and AuditLog.objects.filter(pk=self.pk).exists():
            raise ValueError("Audit logs cannot be modified")
        super().save(*args, **kwargs)
    
    def delete(self, *args, **kwargs):
        """Audit logs cannot be deleted."""
        raise ValueError("Audit logs cannot be deleted")
```

#### `iqa` App

```python
# iqa/models.py

class IQASample(models.Model):
    """A sample of trainer work selected for IQA review."""
    SAMPLE_STATUSES = [
        ('pending', 'Pending Review'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    iqa_reviewer = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name='iqa_samples'
    )
    assessment_decision = models.ForeignKey(
        'assessments.AssessmentDecision', on_delete=models.CASCADE
    )
    status = models.CharField(max_length=15, choices=SAMPLE_STATUSES, default='pending')
    
    # Sampling metadata
    sampling_reason = models.CharField(max_length=50)  # 'random', 'new_trainer', 'escalated'
    sampling_period = models.CharField(max_length=20)   # e.g., 'Q1-2026'
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'iqa_samples'
        ordering = ['-created_at']


class IQAReview(models.Model):
    """IQA's review decision on a sampled assessment."""
    OUTCOMES = [
        ('approved', 'Approved'),
        ('action_required', 'Assessor Action Required'),
        ('escalated', 'Escalated to Admin'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    sample = models.OneToOneField(
        IQASample, on_delete=models.CASCADE, related_name='review'
    )
    outcome = models.CharField(max_length=20, choices=OUTCOMES)
    feedback = models.TextField()
    action_points = models.JSONField(default=list)
    
    reviewed_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'iqa_reviews'


class SamplingSetting(models.Model):
    """IQA sampling configuration per qualification or trainer."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    qualification = models.ForeignKey(
        'qualifications.Qualification', null=True, blank=True, on_delete=models.CASCADE
    )
    trainer = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.CASCADE
    )
    sample_rate_percent = models.IntegerField(default=25)  # % of assessments to sample
    is_new_trainer = models.BooleanField(default=False)    # 100% sampling for new trainers
    
    class Meta:
        db_table = 'sampling_settings'
```

#### `notifications` App

```python
# notifications/models.py

class Notification(models.Model):
    """In-app notifications for all roles."""
    NOTIFICATION_TYPES = [
        ('submission_received', 'New Submission'),
        ('assessment_completed', 'Assessment Completed'),
        ('resubmission_required', 'Resubmission Required'),
        ('iqa_flagged', 'IQA Flagged'),
        ('access_expiring', 'Access Expiring'),
        ('new_resource', 'New Resource'),
        ('extension_approved', 'Extension Approved'),
        ('extension_denied', 'Extension Denied'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name='notifications'
    )
    notification_type = models.CharField(max_length=25, choices=NOTIFICATION_TYPES)
    title = models.CharField(max_length=255)
    message = models.TextField()
    link = models.CharField(max_length=500, blank=True)    # Deep link into platform
    
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'notifications'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['recipient', 'is_read']),
        ]
```

---

## 4. Authentication & Authorisation

### 4.1 JWT Authentication

```python
# settings.py

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=30),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'TOKEN_OBTAIN_SERIALIZER': 'users.serializers.CustomTokenObtainSerializer',
}

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 25,
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '20/minute',
        'user': '100/minute',
    },
}
```

### 4.2 Role-Based Permissions

```python
# core/permissions.py

class HasRole(BasePermission):
    """Check user has a specific role via the UserRole table."""
    
    def __init__(self, required_role):
        self.required_role = required_role
    
    def has_permission(self, request, view):
        return request.user.roles.filter(role=self.required_role).exists()


class IsLearner(BasePermission):
    def has_permission(self, request, view):
        return request.user.roles.filter(role='learner').exists()


class IsTrainer(BasePermission):
    def has_permission(self, request, view):
        return request.user.roles.filter(role='trainer').exists()


class IsIQA(BasePermission):
    def has_permission(self, request, view):
        return request.user.roles.filter(role='iqa').exists()


class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.roles.filter(role='admin').exists()


class IsAssignedTrainer(BasePermission):
    """Ensure trainer is assigned to the enrolment."""
    def has_object_permission(self, request, view, obj):
        enrolment = getattr(obj, 'enrolment', obj)
        return enrolment.assigned_trainer == request.user


class IsEnrolmentOwner(BasePermission):
    """Ensure learner owns the enrolment."""
    def has_object_permission(self, request, view, obj):
        enrolment = getattr(obj, 'enrolment', obj)
        return enrolment.learner == request.user
```

### 4.3 Access Control Matrix

| Resource | Learner | Trainer | IQA | Admin |
|----------|---------|---------|-----|-------|
| Own enrolment | R | — | — | RW |
| Assigned enrolments | — | R | R | RW |
| Resources (paid) | R | R | R | CRUD |
| Submit evidence | CRU | — | — | — |
| Review evidence | — | R | R | R |
| Assess submission | — | CRU | — | R |
| IQA sample | — | — | CRUD | R |
| Question bank | — | CRUD | — | CRUD |
| Qualifications | — | — | — | CRUD |
| Audit logs | — | — | R | R |
| User management | — | — | — | CRUD |

---

## 5. API Architecture

### 5.1 URL Structure

```python
# urls.py — Namespaced by role for clarity

urlpatterns = [
    # Public
    path('api/auth/', include('users.urls.auth')),
    path('api/qualifications/', include('qualifications.urls.public')),
    path('api/checkout/', include('payments.urls')),
    
    # Learner
    path('api/learner/', include('learner_api.urls')),
    
    # Trainer
    path('api/trainer/', include('trainer_api.urls')),
    
    # IQA
    path('api/iqa/', include('iqa_api.urls')),
    
    # Admin
    path('api/admin/', include('admin_api.urls')),
]
```

### 5.2 Key Endpoint Groups

#### Auth Endpoints
```
POST   /api/auth/register/              # Learner registration (post-payment)
POST   /api/auth/login/                  # JWT token obtain
POST   /api/auth/refresh/               # JWT refresh
POST   /api/auth/password/reset/        # Password reset request
POST   /api/auth/password/reset/confirm/ # Password reset confirm
POST   /api/auth/password/change/       # Authenticated password change
GET    /api/auth/me/                     # Current user profile
```

#### Learner Endpoints
```
GET    /api/learner/dashboard/                              # Dashboard stats
GET    /api/learner/enrolments/                             # My enrolments
GET    /api/learner/enrolments/{id}/                        # Enrolment detail
GET    /api/learner/enrolments/{id}/units/                  # Units list
GET    /api/learner/enrolments/{id}/units/{code}/           # Unit detail + resources
GET    /api/learner/enrolments/{id}/units/{code}/resources/ # Download resource
POST   /api/learner/enrolments/{id}/units/{code}/submit/    # Submit evidence
POST   /api/learner/enrolments/{id}/units/{code}/upload/    # Upload file (pre-signed URL)
GET    /api/learner/enrolments/{id}/units/{code}/feedback/  # Assessment feedback
POST   /api/learner/enrolments/{id}/units/{code}/quiz/      # Submit quiz
GET    /api/learner/enrolments/{id}/progress/               # Progress overview
GET    /api/learner/notifications/                          # Notifications
PATCH  /api/learner/notifications/{id}/read/                # Mark as read
POST   /api/learner/extensions/                             # Request extension
```

#### Trainer Endpoints
```
GET    /api/trainer/dashboard/                                  # Dashboard stats
GET    /api/trainer/learners/                                   # Assigned learners
GET    /api/trainer/learners/{id}/                              # Learner detail
GET    /api/trainer/learners/{id}/units/{code}/                 # Unit submissions
GET    /api/trainer/learners/{id}/units/{code}/submissions/     # Submission list
GET    /api/trainer/submissions/{id}/                           # Submission detail
POST   /api/trainer/submissions/{id}/assess/                    # Submit assessment
GET    /api/trainer/quiz-attempts/{id}/                         # Quiz result detail
GET    /api/trainer/queue/                                      # Pending assessments queue
GET    /api/trainer/history/                                    # Assessment history
PATCH  /api/trainer/learners/{id}/units/{code}/criteria/{cid}/  # Mark criteria met/not met
GET    /api/trainer/question-bank/{unit_id}/                    # Questions for unit
POST   /api/trainer/question-bank/{unit_id}/                    # Add question
PUT    /api/trainer/question-bank/{unit_id}/{qid}/              # Edit question
DELETE /api/trainer/question-bank/{unit_id}/{qid}/              # Deactivate question
```

#### IQA Endpoints
```
GET    /api/iqa/dashboard/                       # IQA dashboard
GET    /api/iqa/sampling-queue/                  # Pending samples
GET    /api/iqa/samples/{id}/                    # Sample detail (evidence + assessment)
POST   /api/iqa/samples/{id}/review/             # Submit IQA review
GET    /api/iqa/trainer-performance/             # Trainer stats
GET    /api/iqa/reports/                         # Compliance reports
GET    /api/iqa/settings/                        # Sampling settings
PUT    /api/iqa/settings/                        # Update sampling config
```

#### Admin Endpoints
```
# Qualifications
GET    /api/admin/qualifications/                # List all
POST   /api/admin/qualifications/                # Create
PUT    /api/admin/qualifications/{id}/           # Update
PATCH  /api/admin/qualifications/{id}/archive/   # Archive/unarchive
POST   /api/admin/qualifications/{id}/units/     # Add unit
PUT    /api/admin/qualifications/{id}/units/{code}/ # Update unit
POST   /api/admin/qualifications/{id}/units/{code}/criteria/ # Add criteria
POST   /api/admin/qualifications/{id}/units/{code}/resources/ # Upload resource

# Learners
GET    /api/admin/learners/                      # List all
POST   /api/admin/learners/                      # Manual enrol
PUT    /api/admin/learners/{id}/                 # Update
PATCH  /api/admin/learners/{id}/suspend/         # Suspend
PATCH  /api/admin/learners/{id}/assign-trainer/  # Assign trainer
PATCH  /api/admin/learners/{id}/assign-iqa/      # Assign IQA

# Trainers
GET    /api/admin/trainers/                      # List all
POST   /api/admin/trainers/                      # Create trainer account
PUT    /api/admin/trainers/{id}/                 # Update

# Reports & Audit
GET    /api/admin/reports/progress/              # Progress report
GET    /api/admin/reports/assessments/           # Assessment stats
GET    /api/admin/reports/compliance/            # Compliance report
GET    /api/admin/audit-log/                     # Full audit log (paginated)
GET    /api/admin/eqa-export/{learner_id}/       # EQA portfolio export (PDF)

# Question Bank (global)
GET    /api/admin/question-bank/                 # All questions
POST   /api/admin/question-bank/bulk-import/     # CSV/JSON import
```

---

## 6. File Storage & Evidence Management

### 6.1 Architecture

```
┌──────────────┐     ┌─────────────────┐     ┌──────────────┐
│   Frontend   │────▸│  DRF Backend    │────▸│   AWS S3     │
│  (Upload UI) │     │  (Pre-signed    │     │  (Storage)   │
│              │◀────│   URL Generator)│     │              │
│  Direct S3   │─────────────────────────────▸│  Bucket      │
│  Upload      │     │                 │     │              │
└──────────────┘     └─────────────────┘     └──────┬───────┘
                                                     │
                                              ┌──────▼───────┐
                                              │  CloudFront  │
                                              │  (CDN +      │
                                              │   Signed URLs│
                                              │   for access)│
                                              └──────────────┘
```

### 6.2 Upload Flow

1. Frontend requests pre-signed upload URL from DRF
2. DRF validates user permissions and generates S3 pre-signed PUT URL (5 min expiry)
3. Frontend uploads directly to S3 (avoids passing through server)
4. Frontend confirms upload to DRF with file metadata
5. DRF creates `SubmissionFile` record with S3 key and SHA-256 checksum
6. Audit log entry created

### 6.3 Download Flow

1. Frontend requests file access from DRF
2. DRF validates user has permission (learner owns it, or assigned trainer/IQA/admin)
3. DRF generates CloudFront signed URL (15 min expiry)
4. Frontend redirects to signed URL

### 6.4 S3 Bucket Structure

```
prime-college-evidence/
├── submissions/{year}/{month}/{submission_id}/{filename}
├── resources/{qualification_id}/{unit_code}/{filename}
├── feedback/{year}/{month}/{assessment_id}/{filename}
├── profiles/{user_id}/{filename}
└── exports/{year}/{month}/{export_id}.pdf
```

### 6.5 File Policies

| Policy | Value |
|--------|-------|
| Max file size | 50MB per file |
| Max files per submission | 10 |
| Allowed types | PDF, DOCX, DOC, XLSX, XLS, PPTX, JPG, PNG, MP4, ZIP |
| Retention | Minimum 7 years (regulatory) |
| Encryption | AES-256 at rest, TLS in transit |
| Versioning | S3 versioning enabled for evidence buckets |
| Deletion | Soft-delete only; S3 objects retained with lifecycle policy |

---

## 7. Assessment & Grading Engine

### 7.1 Quiz Scoring (Server-Side Only)

```python
# apps/quizzes/services/quiz_scoring_service.py

class QuizScoringService:
    """
    Server-side quiz scoring — NEVER trust client scores.
    Questions are shuffled and snapshotted at attempt time.
    """
    
    @staticmethod
    def generate_quiz(unit: Unit, num_questions: int = 25) -> list[Question]:
        """Select and shuffle questions for a quiz attempt."""
        questions = list(
            Question.objects.filter(unit=unit, is_active=True)
            .order_by('?')[:num_questions]
        )
        if len(questions) < num_questions:
            raise ValidationError(
                f"Insufficient questions: {len(questions)}/{num_questions}"
            )
        return questions
    
    @staticmethod
    def score_attempt(
        enrolment: Enrolment,
        unit: Unit,
        answers: dict,
        violations: list,
        started_at: datetime,
        questions: list[Question]
    ) -> QuizAttempt:
        """Score a submitted quiz and create all records atomically."""
        
        with transaction.atomic():
            correct_count = 0
            quiz_answers = []
            
            for order, question in enumerate(questions):
                learner_answer = answers.get(str(question.id), [])
                is_correct = sorted(learner_answer) == sorted(question.correct_answers)
                if is_correct:
                    correct_count += 1
                
                quiz_answers.append(QuizAnswer(
                    question=question,
                    question_order=order + 1,
                    learner_answers=learner_answer,
                    correct_answers=question.correct_answers,
                    is_correct=is_correct,
                    question_text_snapshot=question.question_text,
                    options_snapshot=question.options,
                ))
            
            score_percent = round((correct_count / len(questions)) * 100)
            pass_mark = unit.quiz_pass_mark
            time_taken = int((timezone.now() - started_at).total_seconds())
            
            attempt = QuizAttempt.objects.create(
                enrolment=enrolment,
                unit=unit,
                score_percent=score_percent,
                correct_count=correct_count,
                total_questions=len(questions),
                pass_mark=pass_mark,
                passed=score_percent >= pass_mark,
                time_taken_seconds=time_taken,
                violation_count=len(violations),
                started_at=started_at,
            )
            
            for qa in quiz_answers:
                qa.attempt = attempt
            QuizAnswer.objects.bulk_create(quiz_answers)
            
            for v in violations:
                IntegrityViolation.objects.create(
                    attempt=attempt,
                    violation_type=v['type'],
                    detail=v['detail'],
                    occurred_at=v['occurred_at'],
                )
            
            # Create audit log
            AuditLog.objects.create(
                action='quiz_submitted',
                actor=enrolment.learner,
                actor_role='learner',
                target_type='quiz_attempt',
                target_id=attempt.id,
                metadata={
                    'score': score_percent,
                    'passed': attempt.passed,
                    'violations': len(violations),
                },
            )
            
            return attempt
```

### 7.2 Assessment Workflow

```
┌──────────┐     ┌───────────┐     ┌──────────────┐     ┌─────────┐
│ Learner  │     │  Trainer  │     │     IQA      │     │  Admin  │
│ uploads  │────▸│  reviews  │────▸│   samples    │     │ audits  │
│ evidence │     │  & marks  │     │  & verifies  │     │         │
└──────────┘     └─────┬─────┘     └──────┬───────┘     └────┬────┘
                       │                  │                   │
              ┌────────▼────────┐         │                   │
              │ Assessment      │         │                   │
              │ Decision        │◀────────┘                   │
              │ (immutable)     │                              │
              └────────┬────────┘                              │
                       │                                       │
              ┌────────▼────────┐                              │
              │ Audit Log       │◀─────────────────────────────┘
              │ (append-only)   │
              └─────────────────┘
```

### 7.3 Per-Criteria Marking

Trainers mark **individual assessment criteria** (UK standard), not just units:

```python
# apps/assessments/views/assessment_views.py

class MarkCriteriaView(APIView):
    permission_classes = [IsAuthenticated, IsTrainer, IsAssignedTrainer]
    
    def patch(self, request, enrolment_id, criteria_id):
        criteria_status, created = CriteriaStatus.objects.get_or_create(
            enrolment_id=enrolment_id,
            criteria_id=criteria_id,
            defaults={'assessed_by': request.user}
        )
        
        new_status = request.data.get('status')  # 'met' or 'not_met'
        criteria_status.status = new_status
        criteria_status.assessed_by = request.user
        criteria_status.met_at = timezone.now() if new_status == 'met' else None
        criteria_status.save()
        
        # Audit log
        AuditLog.objects.create(
            action='criteria_marked',
            actor=request.user,
            actor_role='trainer',
            target_type='criteria_status',
            target_id=criteria_status.id,
            metadata={'criteria_code': criteria_status.criteria.code, 'status': new_status},
        )
        
        # Check if all criteria met → auto-complete unit
        self._check_unit_completion(enrolment_id, criteria_status.criteria.unit)
        
        return Response({'status': new_status})
```

---

## 8. Audit Trail & Compliance

### 8.1 What Gets Logged

| Event | Actor | Data Captured |
|-------|-------|--------------|
| Evidence upload | Learner | File hash, size, timestamp, unit |
| Evidence submission | Learner | Submission ID, unit, version |
| Evidence resubmission | Learner | Previous version link, new files |
| Assessment started | Trainer | Submission ID, timestamp |
| Assessment completed | Trainer | Outcome, feedback excerpt, criteria marked |
| Quiz submitted | Learner | Score, pass/fail, violations |
| IQA sample created | System | Assessment ID, sampling reason |
| IQA review completed | IQA | Outcome, action points |
| IQA escalation | IQA | Escalation reason, admin notified |
| Learner enrolled | Admin/System | Payment method, qualification |
| Trainer assigned | Admin | Trainer ID, enrolment ID |
| Access expired | System | Enrolment ID, expiry date |
| Login | Any | IP address, user agent |
| Password changed | Any | Timestamp (not password) |

### 8.2 Compliance Requirements

```python
# core/middleware.py — ComplianceMiddleware

class ComplianceMiddleware:
    """Ensures all API actions that modify assessment data create audit entries."""
    
    AUDITED_ENDPOINTS = [
        '/api/trainer/submissions/',
        '/api/learner/*/submit/',
        '/api/iqa/samples/',
    ]
    
    def process_response(self, request, response):
        if response.status_code in (200, 201) and request.method in ('POST', 'PUT', 'PATCH'):
            if any(request.path.startswith(ep.replace('*', '')) for ep in self.AUDITED_ENDPOINTS):
                self._ensure_audit_log_exists(request, response)
        return response
```

### 8.3 EQA Portfolio Export

```python
# apps/reports/services/eqa_export_service.py

class EQAExportService:
    """Generate complete learner portfolio for External Quality Assurance."""
    
    def generate_portfolio(self, enrolment_id: UUID) -> bytes:
        """Create PDF portfolio containing:
        1. Learner details + enrolment summary
        2. Per-unit evidence list with timestamps
        3. All assessment decisions with feedback
        4. IQA review records
        5. Complete audit trail
        6. File integrity checksums
        """
        enrolment = Enrolment.objects.select_related(
            'learner', 'qualification', 'assigned_trainer'
        ).get(id=enrolment_id)
        
        submissions = Submission.objects.filter(
            enrolment=enrolment
        ).prefetch_related('files', 'assessments', 'assessments__submission__iqa_samples')
        
        audit_logs = AuditLog.objects.filter(
            target_id__in=[s.id for s in submissions]
        )
        
        # Generate PDF with reportlab or weasyprint
        return self._render_pdf(enrolment, submissions, audit_logs)
```

---

## 9. Notification System

### 9.1 Notification Triggers

```python
# notifications/signals.py

@receiver(post_save, sender=AssessmentDecision)
def notify_learner_of_assessment(sender, instance, created, **kwargs):
    """When trainer completes assessment, notify learner."""
    if created:
        submission = instance.submission
        enrolment = submission.enrolment
        
        Notification.objects.create(
            recipient=enrolment.learner,
            notification_type='assessment_completed',
            title=f'Assessment Complete: {submission.unit.title}',
            message=f'Your trainer has assessed your submission. Outcome: {instance.get_outcome_display()}',
            link=f'/learner/qualifications/{enrolment.id}/units/{submission.unit.code}',
        )
        
        # Send email via Celery
        send_assessment_email.delay(
            learner_id=str(enrolment.learner.id),
            unit_title=submission.unit.title,
            outcome=instance.outcome,
        )


@receiver(post_save, sender=Submission)
def notify_trainer_of_submission(sender, instance, created, **kwargs):
    """When learner submits evidence, notify assigned trainer."""
    if created and instance.status == 'submitted':
        enrolment = instance.enrolment
        if enrolment.assigned_trainer:
            Notification.objects.create(
                recipient=enrolment.assigned_trainer,
                notification_type='submission_received',
                title=f'New Submission: {instance.title}',
                message=f'{enrolment.learner.get_full_name()} submitted evidence for {instance.unit.title}',
                link=f'/trainer/learner/{enrolment.id}/unit/{instance.unit.code}',
            )
```

### 9.2 Email Templates (Celery Tasks)

```python
# notifications/tasks.py

@shared_task
def send_assessment_email(learner_id, unit_title, outcome):
    """Send assessment notification email via AWS SES."""
    learner = User.objects.get(id=learner_id)
    
    subject_map = {
        'competent': f'✅ Congratulations — {unit_title} marked as Competent',
        'resubmission': f'📝 Resubmission Required — {unit_title}',
        'not_competent': f'⚠️ {unit_title} — Not Yet Competent',
    }
    
    send_templated_email(
        to=learner.email,
        subject=subject_map[outcome],
        template='assessment_outcome',
        context={'learner': learner, 'unit': unit_title, 'outcome': outcome},
    )


@shared_task
def send_access_expiry_warning():
    """Daily task: Warn learners 30/7/1 days before access expires."""
    warning_days = [30, 7, 1]
    for days in warning_days:
        expiring = Enrolment.objects.filter(
            status='active',
            access_expires_at__date=timezone.now().date() + timedelta(days=days),
        ).select_related('learner', 'qualification')
        
        for enrolment in expiring:
            Notification.objects.create(
                recipient=enrolment.learner,
                notification_type='access_expiring',
                title=f'Access expires in {days} day(s)',
                message=f'Your access to {enrolment.qualification.title} expires in {days} day(s).',
                link=f'/learner/qualifications/{enrolment.id}',
            )
```

---

## 10. Payment Integration

### 10.1 Stripe Integration

```python
# payments/views.py

class CreateCheckoutSessionView(APIView):
    """Create Stripe Checkout session for qualification purchase."""
    permission_classes = [AllowAny]  # Pre-registration purchase
    
    def post(self, request):
        qualification_id = request.data['qualification_id']
        qualification = Qualification.objects.get(id=qualification_id, status='active')
        
        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price_data': {
                    'currency': 'gbp',
                    'product_data': {
                        'name': qualification.title,
                        'description': f'{qualification.level} — {qualification.awarding_body}',
                    },
                    'unit_amount': int(qualification.price * 100),
                },
                'quantity': 1,
            }],
            mode='payment',
            success_url=f'{settings.FRONTEND_URL}/enrolment/success?session_id={{CHECKOUT_SESSION_ID}}',
            cancel_url=f'{settings.FRONTEND_URL}/qualifications/{qualification.slug}',
            metadata={
                'qualification_id': str(qualification.id),
                'buyer_email': request.data.get('email', ''),
            },
        )
        
        return Response({'checkout_url': session.url})


class StripeWebhookView(APIView):
    """Handle Stripe webhook events."""
    permission_classes = [AllowAny]
    authentication_classes = []
    
    def post(self, request):
        payload = request.body
        sig = request.META.get('HTTP_STRIPE_SIGNATURE')
        
        event = stripe.Webhook.construct_event(
            payload, sig, settings.STRIPE_WEBHOOK_SECRET
        )
        
        if event['type'] == 'checkout.session.completed':
            session = event['data']['object']
            self._handle_successful_payment(session)
        
        return Response({'status': 'ok'})
    
    def _handle_successful_payment(self, session):
        """Create user account + enrolment after payment."""
        qual_id = session['metadata']['qualification_id']
        email = session['customer_details']['email']
        qualification = Qualification.objects.get(id=qual_id)
        
        with transaction.atomic():
            # Create or get user
            user, created = User.objects.get_or_create(
                email=email,
                defaults={'username': email, 'first_name': session['customer_details'].get('name', '')}
            )
            
            if created:
                # Set temporary password, send welcome email
                temp_password = User.objects.make_random_password()
                user.set_password(temp_password)
                user.save()
                UserRole.objects.create(user=user, role='learner')
                send_welcome_email.delay(str(user.id), temp_password)
            
            # Create enrolment
            enrolment = Enrolment.objects.create(
                learner=user,
                qualification=qualification,
                learner_ref=generate_learner_ref(),
                payment_method='online',
                payment_status='paid',
                stripe_payment_id=session['payment_intent'],
                amount_paid=qualification.price,
                access_expires_at=timezone.now() + timedelta(days=qualification.access_duration_days),
                total_units=qualification.units.count(),
            )
            
            AuditLog.objects.create(
                action='learner_enrolled',
                actor=user,
                actor_role='learner',
                target_type='enrolment',
                target_id=enrolment.id,
                metadata={'payment_method': 'online', 'amount': str(qualification.price)},
            )
```

---

## 11. IQA & Quality Assurance

### 11.1 Automated Sampling

```python
# iqa/services.py

class SamplingService:
    """Auto-generate IQA samples based on configured sampling rates."""
    
    @staticmethod
    def create_samples_for_period(period: str):
        """Run periodically (e.g., weekly) to queue assessments for IQA review."""
        
        recent_assessments = AssessmentDecision.objects.filter(
            assessed_at__gte=timezone.now() - timedelta(days=7),
        ).exclude(
            id__in=IQASample.objects.values_list('assessment_decision_id', flat=True)
        ).select_related('submission__enrolment')
        
        for decision in recent_assessments:
            enrolment = decision.submission.enrolment
            trainer = decision.trainer
            qualification = enrolment.qualification
            
            # Get sampling rate
            setting = SamplingSetting.objects.filter(
                Q(trainer=trainer) | Q(qualification=qualification)
            ).first()
            
            sample_rate = 100 if (setting and setting.is_new_trainer) else (
                setting.sample_rate_percent if setting else 25
            )
            
            # Random selection based on rate
            if random.randint(1, 100) <= sample_rate:
                iqa_user = enrolment.assigned_iqa
                if iqa_user:
                    IQASample.objects.create(
                        iqa_reviewer=iqa_user,
                        assessment_decision=decision,
                        sampling_reason='new_trainer' if (setting and setting.is_new_trainer) else 'random',
                        sampling_period=period,
                    )
```

---

## 12. Caching & Performance

### 12.1 Redis Caching Strategy

```python
# Cached queries (Redis TTL)

CACHE_CONFIG = {
    'qualification_list': 300,        # 5 min  — public catalogue
    'qualification_detail': 300,      # 5 min  — public detail page
    'learner_dashboard': 60,          # 1 min  — personalised dashboard
    'trainer_queue_count': 30,        # 30 sec — pending assessment count
    'progress_stats': 120,            # 2 min  — progress percentages
}
```

### 12.2 Database Optimisation

```python
# Key query optimisations

# Trainer dashboard — single query with prefetch
Enrolment.objects.filter(
    assigned_trainer=request.user
).select_related(
    'learner', 'qualification'
).prefetch_related(
    Prefetch('submission_set', queryset=Submission.objects.filter(status='submitted'))
).annotate(
    pending_count=Count('submission', filter=Q(submission__status='submitted'))
)

# Progress calculation — annotated query
Enrolment.objects.filter(id=enrolment_id).annotate(
    met_criteria=Count(
        'criteriastatus',
        filter=Q(criteriastatus__status='met')
    ),
    total_criteria=Count(
        'qualification__units__criteria'
    )
)
```

---

## 13. Security Architecture

### 13.1 Security Controls

| Control | Implementation |
|---------|---------------|
| Authentication | JWT with 30-min access tokens, 7-day refresh rotation |
| Authorisation | Role-based via `UserRole` table — never client-side |
| Password | Django PBKDF2 with SHA256, min 8 chars, complexity rules |
| File access | Pre-signed S3 URLs with 15-min expiry |
| API rate limiting | 20/min anonymous, 100/min authenticated |
| CORS | Whitelist frontend domain only |
| CSRF | Token-based for session endpoints |
| XSS | Django auto-escaping + Content-Security-Policy header |
| SQL Injection | Django ORM parameterised queries |
| Data encryption | TLS 1.3 in transit, AES-256 at rest (S3 + RDS) |
| Audit immutability | `save()` and `delete()` overrides on AuditLog |
| Secret management | AWS Secrets Manager for API keys |

### 13.2 CORS Configuration

```python
CORS_ALLOWED_ORIGINS = [
    'https://primecollegefrontend.lovable.app',
    'https://www.primecollege.co.uk',
]
CORS_ALLOW_CREDENTIALS = True
```

---

## 14. Deployment & Infrastructure

### 14.1 AWS Architecture

```
┌──────────────────────────────────────────────────────────┐
│                     AWS Cloud                            │
│                                                          │
│  ┌─────────────┐   ┌──────────────┐   ┌──────────────┐  │
│  │ Route 53    │──▸│ CloudFront   │──▸│ S3 (Static)  │  │
│  │ (DNS)       │   │ (CDN)        │   │ React Build  │  │
│  └─────────────┘   └──────┬───────┘   └──────────────┘  │
│                           │                              │
│                    ┌──────▼───────┐                      │
│                    │ ALB          │                      │
│                    │ (HTTPS)      │                      │
│                    └──────┬───────┘                      │
│                           │                              │
│                    ┌──────▼───────┐   ┌──────────────┐   │
│                    │ ECS Fargate  │──▸│ RDS Postgres │   │
│                    │ (DRF App)    │   │ (Primary +   │   │
│                    │ Auto-scaling │   │  Replica)    │   │
│                    └──────┬───────┘   └──────────────┘   │
│                           │                              │
│              ┌────────────┼────────────┐                 │
│              ▼            ▼            ▼                 │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐     │
│  │ ElastiCache  │ │ S3 Evidence  │ │ SES (Email)  │     │
│  │ (Redis)      │ │ Bucket       │ │              │     │
│  └──────────────┘ └──────────────┘ └──────────────┘     │
│                                                          │
│  ┌──────────────┐ ┌──────────────┐                      │
│  │ CloudWatch   │ │ Secrets      │                      │
│  │ (Monitoring) │ │ Manager      │                      │
│  └──────────────┘ └──────────────┘                      │
└──────────────────────────────────────────────────────────┘
```

### 14.2 Environment Configuration

```python
# Environments

ENVIRONMENTS = {
    'development': {
        'DEBUG': True,
        'DATABASE': 'Local PostgreSQL',
        'STORAGE': 'Local MinIO (S3-compatible)',
        'EMAIL': 'Console backend',
    },
    'staging': {
        'DEBUG': False,
        'DATABASE': 'RDS (t3.small)',
        'STORAGE': 'S3 staging bucket',
        'EMAIL': 'SES sandbox',
        'DOMAIN': 'staging.primecollege.co.uk',
    },
    'production': {
        'DEBUG': False,
        'DATABASE': 'RDS (r6g.large) + read replica',
        'STORAGE': 'S3 production bucket',
        'EMAIL': 'SES production',
        'DOMAIN': 'app.primecollege.co.uk',
    },
}
```

### 14.3 CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml

name: Deploy
on:
  push:
    branches: [main, staging]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run tests
        run: |
          pip install -r requirements.txt
          python manage.py test --parallel
          
  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Build Docker image
        run: docker build -t prime-college-api .
      - name: Push to ECR
        run: |
          aws ecr get-login-password | docker login --username AWS --password-stdin $ECR_URI
          docker tag prime-college-api:latest $ECR_URI:${{ github.sha }}
          docker push $ECR_URI:${{ github.sha }}
      - name: Deploy to ECS
        run: |
          aws ecs update-service --cluster prime-college --service api --force-new-deployment
```

---

## 15. Monitoring & Observability

### 15.1 Monitoring Stack

| Tool | Purpose |
|------|---------|
| Sentry | Error tracking + performance monitoring |
| CloudWatch | Infrastructure metrics, alarms |
| CloudWatch Logs | Application logs (structured JSON) |
| Custom dashboard | Business metrics (enrolments, assessments/day) |

### 15.2 Key Metrics & Alerts

```python
ALERTS = {
    'api_error_rate_5xx': {'threshold': '> 1%', 'window': '5min'},
    'api_latency_p99': {'threshold': '> 2s', 'window': '5min'},
    'db_connections': {'threshold': '> 80%', 'window': '1min'},
    'disk_space': {'threshold': '> 85%', 'window': '15min'},
    'failed_logins': {'threshold': '> 10/min', 'window': '5min'},
    'celery_queue_depth': {'threshold': '> 100', 'window': '5min'},
}
```

---

## 16. Data Migration & Seeding

### 16.1 Initial Migration Order

```
1. users (UserProfile, UserRole)
2. qualifications (Qualification, Unit, AssessmentCriteria, UnitResource)
3. enrolments (Enrolment)
4. quizzes (Question)
5. assessments (Submission, SubmissionFile, AssessmentDecision, CriteriaStatus)
6. quizzes (QuizAttempt, QuizAnswer, IntegrityViolation)
7. iqa (IQASample, IQAReview, SamplingSetting)
8. notifications (Notification)
9. audit (AuditLog)
```

### 16.2 Seed Data

```python
# management/commands/seed_demo.py

class Command(BaseCommand):
    """Seed demo data matching current mock data for testing."""
    
    def handle(self, *args, **options):
        # Create demo users
        admin = self._create_user('admin@primecollege.edu', 'Admin User', 'admin')
        trainer = self._create_user('trainer@primecollege.edu', 'Sarah Jones', 'trainer')
        iqa = self._create_user('iqa@primecollege.edu', 'Claire Morgan', 'iqa')
        learner = self._create_user('john.smith@example.com', 'John Smith', 'learner')
        
        # Create qualifications matching adminMockData.ts
        bus_l3 = Qualification.objects.create(
            title='Level 3 Diploma in Business Administration',
            code='BUS-L3-DIP', level='Level 3', category='Business',
            awarding_body='VTCT', price=1200, access_duration_days=365,
            status='active', slug='level-3-diploma-business-administration',
        )
        
        # Create units, criteria, resources...
        self._create_units(bus_l3)
        
        # Create enrolment
        enrolment = Enrolment.objects.create(
            learner=learner, qualification=bus_l3,
            learner_ref='LRN-2024-001', payment_method='online',
            payment_status='paid', assigned_trainer=trainer,
            assigned_iqa=iqa, access_expires_at=timezone.now() + timedelta(days=365),
            total_units=bus_l3.units.count(),
        )
```

---

## 17. API Endpoint Reference

### Complete Endpoint Summary

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | `/api/auth/register/` | No | — | Register new user |
| POST | `/api/auth/login/` | No | — | Obtain JWT tokens |
| POST | `/api/auth/refresh/` | No | — | Refresh JWT token |
| POST | `/api/auth/password/reset/` | No | — | Request password reset |
| POST | `/api/auth/password/change/` | Yes | Any | Change password |
| GET | `/api/auth/me/` | Yes | Any | Current user profile |
| GET | `/api/qualifications/` | No | — | Public catalogue |
| GET | `/api/qualifications/{slug}/` | No | — | Public detail |
| POST | `/api/checkout/` | No | — | Create Stripe session |
| POST | `/api/checkout/webhook/` | No | — | Stripe webhook |
| GET | `/api/learner/dashboard/` | Yes | Learner | Dashboard stats |
| GET | `/api/learner/enrolments/` | Yes | Learner | My enrolments |
| GET | `/api/learner/enrolments/{id}/units/` | Yes | Learner | Units list |
| POST | `/api/learner/enrolments/{id}/units/{code}/submit/` | Yes | Learner | Submit evidence |
| POST | `/api/learner/enrolments/{id}/units/{code}/upload/` | Yes | Learner | Get upload URL |
| POST | `/api/learner/enrolments/{id}/units/{code}/quiz/` | Yes | Learner | Submit quiz |
| GET | `/api/learner/notifications/` | Yes | Learner | Notifications |
| GET | `/api/trainer/dashboard/` | Yes | Trainer | Dashboard |
| GET | `/api/trainer/learners/` | Yes | Trainer | Assigned learners |
| GET | `/api/trainer/queue/` | Yes | Trainer | Pending assessments |
| POST | `/api/trainer/submissions/{id}/assess/` | Yes | Trainer | Submit assessment |
| PATCH | `/api/trainer/.../criteria/{id}/` | Yes | Trainer | Mark criteria |
| GET | `/api/trainer/quiz-attempts/{id}/` | Yes | Trainer | Quiz result |
| GET | `/api/iqa/dashboard/` | Yes | IQA | Dashboard |
| GET | `/api/iqa/sampling-queue/` | Yes | IQA | Pending samples |
| POST | `/api/iqa/samples/{id}/review/` | Yes | IQA | Submit review |
| GET | `/api/admin/qualifications/` | Yes | Admin | All qualifications |
| POST | `/api/admin/qualifications/` | Yes | Admin | Create qualification |
| GET | `/api/admin/learners/` | Yes | Admin | All learners |
| POST | `/api/admin/learners/` | Yes | Admin | Manual enrol |
| GET | `/api/admin/audit-log/` | Yes | Admin | Audit trail |
| GET | `/api/admin/eqa-export/{id}/` | Yes | Admin | EQA portfolio PDF |

---

## Appendix A: Django App Structure

Each app follows a consistent internal layout using `views/`, `services/`, `signals/`, `mixins/`, and `utils/` folders to keep code organised and maintainable as the codebase grows.

```
prime_college_backend/
├── manage.py
├── config/
│   ├── settings/
│   │   ├── base.py
│   │   ├── development.py
│   │   ├── staging.py
│   │   └── production.py
│   ├── urls.py
│   └── wsgi.py
│
├── core/                              # Shared cross-app utilities
│   ├── mixins/
│   │   ├── __init__.py
│   │   ├── response_mixin.py          # Standardised API response format
│   │   ├── audit_mixin.py             # Auto audit-log on create/update
│   │   └── pagination_mixin.py        # Reusable pagination helpers
│   ├── utils/
│   │   ├── __init__.py
│   │   ├── response_utils.py          # success_response(), error_response()
│   │   ├── email_utils.py             # send_templated_email() via SES
│   │   ├── s3_utils.py                # Pre-signed URL generation
│   │   └── ref_utils.py               # generate_learner_ref(), etc.
│   ├── permissions.py                 # HasRole, IsLearner, IsTrainer, IsIQA, IsAdmin
│   └── middleware.py                  # ComplianceMiddleware, RequestLoggingMiddleware
│
├── apps/
│   ├── users/
│   │   ├── models.py                  # UserProfile, UserRole
│   │   ├── views/
│   │   │   ├── __init__.py
│   │   │   ├── auth_views.py          # Login, Register, PasswordReset, RefreshToken
│   │   │   └── profile_views.py       # Me, UpdateProfile
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   └── user_service.py        # create_user_with_role(), assign_role()
│   │   ├── serializers/
│   │   │   ├── __init__.py
│   │   │   ├── auth_serializers.py     # CustomTokenObtainSerializer, RegisterSerializer
│   │   │   └── profile_serializers.py  # UserProfileSerializer
│   │   └── urls/
│   │       ├── __init__.py
│   │       └── auth.py
│   │
│   ├── qualifications/
│   │   ├── models.py                  # Qualification, Unit, AssessmentCriteria, UnitResource
│   │   ├── views/
│   │   │   ├── __init__.py
│   │   │   ├── public_views.py        # Catalogue listing, detail (no auth)
│   │   │   └── admin_views.py         # CRUD qualifications, units, criteria, resources
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   └── qualification_service.py  # create_qualification(), archive(), duplicate()
│   │   ├── serializers/
│   │   │   ├── __init__.py
│   │   │   ├── public_serializers.py
│   │   │   └── admin_serializers.py
│   │   └── urls/
│   │       ├── __init__.py
│   │       ├── public.py
│   │       └── admin.py
│   │
│   ├── enrolments/
│   │   ├── models.py                  # Enrolment
│   │   ├── views/
│   │   │   ├── __init__.py
│   │   │   ├── learner_views.py       # My enrolments, progress
│   │   │   └── admin_views.py         # Manual enrol, assign trainer/IQA, suspend
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── enrolment_service.py   # create_enrolment(), extend_access()
│   │   │   └── progress_service.py    # calculate_progress(), check_completion()
│   │   ├── signals/
│   │   │   ├── __init__.py
│   │   │   └── enrolment_signals.py   # Post-enrolment: create unit trackers, welcome email
│   │   ├── serializers/
│   │   │   ├── __init__.py
│   │   │   ├── learner_serializers.py
│   │   │   └── admin_serializers.py
│   │   └── urls/
│   │       ├── __init__.py
│   │       ├── learner.py
│   │       └── admin.py
│   │
│   ├── assessments/
│   │   ├── models.py                  # Submission, SubmissionFile, AssessmentDecision, CriteriaStatus
│   │   ├── views/
│   │   │   ├── __init__.py
│   │   │   ├── submission_views.py    # Learner: upload, submit evidence
│   │   │   ├── assessment_views.py    # Trainer: review, assess, mark criteria
│   │   │   └── admin_views.py         # Admin: view all submissions, reports
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── submission_service.py  # create_submission(), handle_resubmission()
│   │   │   ├── assessment_service.py  # submit_assessment(), criteria marking logic
│   │   │   └── file_service.py        # generate_upload_url(), verify_checksum()
│   │   ├── signals/
│   │   │   ├── __init__.py
│   │   │   └── assessment_signals.py  # Post-assessment: update progress, notify learner
│   │   ├── serializers/
│   │   │   ├── __init__.py
│   │   │   ├── submission_serializers.py
│   │   │   └── assessment_serializers.py
│   │   └── urls/
│   │       ├── __init__.py
│   │       ├── learner.py
│   │       └── trainer.py
│   │
│   ├── quizzes/
│   │   ├── models.py                  # Question, QuizAttempt, QuizAnswer, IntegrityViolation
│   │   ├── views/
│   │   │   ├── __init__.py
│   │   │   ├── quiz_views.py          # Learner: submit quiz answers
│   │   │   ├── result_views.py        # Trainer: view quiz results detail
│   │   │   └── question_bank_views.py # Trainer/Admin: CRUD questions, bulk import
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── quiz_scoring_service.py   # generate_quiz(), score_attempt() — server-side only
│   │   │   └── question_bank_service.py  # bulk_import(), validate_questions()
│   │   ├── signals/
│   │   │   ├── __init__.py
│   │   │   └── quiz_signals.py        # Post-quiz: create submission record, notify trainer
│   │   ├── serializers/
│   │   │   ├── __init__.py
│   │   │   ├── quiz_serializers.py
│   │   │   └── question_serializers.py
│   │   └── urls/
│   │       ├── __init__.py
│   │       ├── learner.py
│   │       └── trainer.py
│   │
│   ├── iqa/
│   │   ├── models.py                  # IQASample, IQAReview, SamplingSetting, VerificationChecklist
│   │   ├── views/
│   │   │   ├── __init__.py
│   │   │   ├── sampling_views.py      # Sampling queue, sample detail
│   │   │   ├── review_views.py        # Submit IQA review
│   │   │   ├── checklist_views.py     # Complete verification checklists
│   │   │   ├── report_views.py        # Trainer performance, compliance reports
│   │   │   └── settings_views.py      # Sampling config
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── sampling_service.py    # Auto-generate samples, calculate rates
│   │   │   ├── checklist_service.py   # Manage dynamic checklists per qualification/unit
│   │   │   └── report_service.py      # Generate IQA reports + stats
│   │   ├── signals/
│   │   │   ├── __init__.py
│   │   │   └── iqa_signals.py         # Post-assessment: auto-create sample if rate met
│   │   ├── serializers/
│   │   │   ├── __init__.py
│   │   │   ├── sample_serializers.py
│   │   │   ├── review_serializers.py
│   │   │   └── checklist_serializers.py
│   │   └── urls/
│   │       └── __init__.py
│   │
│   ├── payments/
│   │   ├── views/
│   │   │   ├── __init__.py
│   │   │   ├── checkout_views.py      # CreateCheckoutSession
│   │   │   └── webhook_views.py       # StripeWebhookView
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   └── payment_service.py     # handle_successful_payment(), refund()
│   │   ├── signals/
│   │   │   ├── __init__.py
│   │   │   └── payment_signals.py     # Post-payment: trigger enrolment creation
│   │   └── urls.py
│   │
│   ├── notifications/
│   │   ├── models.py                  # Notification
│   │   ├── views/
│   │   │   ├── __init__.py
│   │   │   └── notification_views.py  # List, mark read, mark all read
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   └── notification_service.py # create_notification(), bulk_notify()
│   │   ├── signals/
│   │   │   ├── __init__.py
│   │   │   └── notification_signals.py # Listen to assessment, submission, IQA events
│   │   ├── tasks/
│   │   │   ├── __init__.py
│   │   │   ├── email_tasks.py         # send_assessment_email, send_welcome_email (Celery)
│   │   │   └── reminder_tasks.py      # send_access_expiry_warning (Celery beat)
│   │   ├── serializers/
│   │   │   └── __init__.py
│   │   └── urls/
│   │       └── __init__.py
│   │
│   ├── audit/
│   │   ├── models.py                  # AuditLog (immutable)
│   │   ├── views/
│   │   │   ├── __init__.py
│   │   │   └── audit_views.py         # Admin: paginated audit log, filtered search
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   └── audit_service.py       # log_action(), bulk_log()
│   │   ├── mixins/
│   │   │   ├── __init__.py
│   │   │   └── auditable_mixin.py     # Auto-log on model save/delete
│   │   ├── serializers/
│   │   │   └── __init__.py
│   │   └── urls/
│   │       └── __init__.py
│   │
│   └── reports/
│       ├── views/
│       │   ├── __init__.py
│       │   ├── progress_report_views.py  # Admin: learner progress reports
│       │   ├── assessment_report_views.py # Admin: assessment stats
│       │   └── compliance_report_views.py # Admin: compliance / Ofsted export
│       ├── services/
│       │   ├── __init__.py
│       │   ├── eqa_export_service.py     # Generate EQA portfolio PDF
│       │   └── report_generator_service.py # Build CSV/Excel exports
│       └── urls/
│           └── __init__.py
│
├── requirements/
│   ├── base.txt
│   ├── development.txt
│   └── production.txt
├── Dockerfile
├── docker-compose.yml
└── .github/workflows/deploy.yml
```

### App Structure Convention

Every app follows this consistent pattern:

| Folder | Purpose | Example |
|--------|---------|---------|
| `views/` | API endpoint handlers, one file per domain concern | `checkout_views.py`, `webhook_views.py` |
| `services/` | Business logic, separated from views for testability | `payment_service.py`, `quiz_scoring_service.py` |
| `signals/` | Django signals for cross-app event handling | `assessment_signals.py`, `payment_signals.py` |
| `serializers/` | DRF serializers, split by role or domain | `admin_serializers.py`, `public_serializers.py` |
| `mixins/` | Reusable view/model mixins | `response_mixin.py`, `auditable_mixin.py` |
| `utils/` | Pure utility functions (no Django dependencies ideally) | `email_utils.py`, `s3_utils.py` |
| `tasks/` | Celery async tasks | `email_tasks.py`, `reminder_tasks.py` |
| `urls/` | URL routing, split by role namespace | `learner.py`, `admin.py` |

**Rules:**
- Views call services; views should NOT contain business logic
- Services are the single source of truth for business rules
- Signals handle cross-app side effects (notifications, audit logging, progress recalculation)
- Shared utilities live in `core/` — app-specific utilities stay in the app's `utils/`

---

## Appendix B: Estimated Build Timeline

| Phase | Duration | Deliverables |
|-------|----------|-------------|
| Phase 1: Core | 3-4 weeks | Auth, Qualifications, Units, Enrolments, basic CRUD APIs |
| Phase 2: Assessment | 2-3 weeks | Evidence upload, S3 integration, assessment decisions, criteria marking |
| Phase 3: Quizzes | 2 weeks | Question bank, server-side scoring, anti-cheat logging |
| Phase 4: IQA + Audit | 2 weeks | IQA sampling, reviews, audit trail, compliance middleware |
| Phase 5: Payments | 1-2 weeks | Stripe checkout, webhooks, auto-enrolment |
| Phase 6: Notifications | 1 week | In-app + email notifications, Celery tasks |
| Phase 7: Reports + EQA | 1-2 weeks | Admin reports, EQA portfolio PDF export |
| Phase 8: Testing + Deploy | 2-3 weeks | Full test suite, staging deploy, security audit, production go-live |
| **Total** | **14-20 weeks** | **Full production platform** |

---

*This architecture document serves as the blueprint for the Prime College backend. All models, endpoints, and services described here align with the current frontend implementation and the gap analysis findings.*
