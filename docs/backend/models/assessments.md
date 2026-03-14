# Assessments App — Models

**App:** `apps/assessments/`  
**File:** `models.py`

---

## Submission

A piece of evidence submitted by a learner for a unit. Supports **versioning** — resubmissions create new Submission records linked via `previous_version`.

```python
class Submission(models.Model):
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

    # Evidence reference number (auto-generated, e.g. EV-2026-001)
    evidence_ref = models.CharField(max_length=20, unique=True)

    # Evidence description — learner explains what they uploaded
    evidence_description = models.TextField(
        blank=True,
        help_text="Learner's explanation of the evidence and how it meets assessment criteria"
    )

    # Linked assessment criteria
    linked_criteria = models.JSONField(
        default=list,
        help_text='List of criteria IDs this evidence covers, e.g. ["AC 1.1", "AC 2.3"]'
    )

    # Written evidence
    written_content = models.TextField(blank=True)
    word_count = models.IntegerField(null=True, blank=True)

    # Linked quiz attempt
    quiz_attempt = models.OneToOneField(
        'quizzes.QuizAttempt', null=True, blank=True, on_delete=models.SET_NULL
    )

    # Version tracking — resubmissions link to previous version
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
            models.Index(fields=['evidence_ref']),
        ]

    def create_resubmission(self):
        """Create a new version linked to this submission."""
        return Submission.objects.create(
            enrolment=self.enrolment,
            unit=self.unit,
            submission_type=self.submission_type,
            title=self.title,
            version=self.version + 1,
            previous_version=self,
            evidence_ref=generate_evidence_ref(),  # New unique ref
        )

    def get_version_chain(self):
        """Return all versions of this submission (oldest first)."""
        chain = [self]
        current = self
        while current.previous_version:
            current = current.previous_version
            chain.append(current)
        chain.reverse()
        return chain
```

### Evidence Numbering

Evidence references are auto-generated in format `EV-YYYY-NNN` using a database sequence:

```python
# utils/evidence_ref.py
from django.db import connection

def generate_evidence_ref():
    """Generate unique evidence reference like EV-2026-001."""
    with connection.cursor() as cursor:
        cursor.execute("SELECT nextval('evidence_ref_seq')")
        seq = cursor.fetchone()[0]
    year = timezone.now().year
    return f"EV-{year}-{str(seq).zfill(3)}"
```

### Versioning Flow

```
Learner uploads evidence → Submission v1 (status: submitted)
    ↓ Assessor marks resubmission_required
Learner uploads improved work → Submission v2 (previous_version → v1)
    ↓ Assessor marks competent
Submission v2 (status: assessed, outcome: competent)
```

---

## SubmissionFile

Files attached to a submission, with version control and integrity verification.

```python
class SubmissionFile(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    submission = models.ForeignKey(
        Submission, on_delete=models.CASCADE, related_name='files'
    )
    file_key = models.CharField(max_length=500)        # S3 key
    original_filename = models.CharField(max_length=255)
    content_type = models.CharField(max_length=100)
    file_size = models.BigIntegerField()
    checksum_sha256 = models.CharField(max_length=64)   # Integrity verification
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
```

---

## AssessmentDecision

Trainer's assessment of a submission — **immutable record**. If re-assessed, a new record is created with a `supersedes` link.

```python
class AssessmentDecision(models.Model):
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

    # Immutable chain
    supersedes = models.ForeignKey(
        'self', null=True, blank=True, on_delete=models.SET_NULL,
        related_name='superseded_by'
    )

    class Meta:
        db_table = 'assessment_decisions'
        ordering = ['-assessed_at']
```

---

## CriteriaStatus

Tracks per-criteria completion status for a learner's unit.

```python
class CriteriaStatus(models.Model):
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
