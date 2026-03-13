# IQA App — Models

**App:** `apps/iqa/`  
**File:** `models.py`

---

## IQASample

A sample of trainer work selected for IQA review.

```python
class IQASample(models.Model):
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
    sampling_reason = models.CharField(max_length=50)   # 'random', 'new_trainer', 'escalated'
    sampling_period = models.CharField(max_length=20)    # e.g., 'Q1-2026'

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'iqa_samples'
        ordering = ['-created_at']
```

---

## IQAReview

IQA's review decision on a sampled assessment.

```python
class IQAReview(models.Model):
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
```

---

## SamplingSetting

IQA sampling configuration per qualification or trainer.

```python
class SamplingSetting(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    qualification = models.ForeignKey(
        'qualifications.Qualification', null=True, blank=True, on_delete=models.CASCADE
    )
    trainer = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.CASCADE
    )
    sample_rate_percent = models.IntegerField(default=25)   # % of assessments to sample
    is_new_trainer = models.BooleanField(default=False)     # 100% sampling for new trainers

    class Meta:
        db_table = 'sampling_settings'
```

---

## ChecklistTemplate

Admin-defined verification checklist template, scoped to a qualification or individual unit. Each item has a configurable response type.

```python
class ChecklistTemplate(models.Model):
    RESPONSE_TYPES = [
        ('yes_no', 'Yes / No'),
        ('yes_no_na', 'Yes / No / N/A'),
        ('met_notmet_na', 'Met / Not Met / N/A'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    qualification = models.ForeignKey(
        'qualifications.Qualification', on_delete=models.CASCADE,
        related_name='checklist_templates'
    )
    unit = models.ForeignKey(
        'qualifications.Unit', null=True, blank=True, on_delete=models.CASCADE,
        related_name='checklist_templates',
        help_text='NULL = qualification-level checklist'
    )
    title = models.CharField(max_length=255)
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)

    class Meta:
        db_table = 'checklist_templates'
        ordering = ['qualification', 'unit', 'title']
```

---

## ChecklistItem

Individual check within a template.

```python
class ChecklistItem(models.Model):
    RESPONSE_TYPES = [
        ('yes_no', 'Yes / No'),
        ('yes_no_na', 'Yes / No / N/A'),
        ('met_notmet_na', 'Met / Not Met / N/A'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    template = models.ForeignKey(
        ChecklistTemplate, on_delete=models.CASCADE, related_name='items'
    )
    label = models.CharField(max_length=500)
    response_type = models.CharField(max_length=15, choices=RESPONSE_TYPES)
    order = models.IntegerField(default=0)

    class Meta:
        db_table = 'checklist_items'
        ordering = ['order']
```

---

## CompletedChecklist

An IQA's completed verification checklist for a specific learner.

```python
class CompletedChecklist(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    template = models.ForeignKey(
        ChecklistTemplate, on_delete=models.PROTECT, related_name='completions'
    )
    enrolment = models.ForeignKey(
        'enrolments.Enrolment', on_delete=models.CASCADE, related_name='verification_checklists'
    )
    iqa_reviewer = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name='completed_checklists'
    )

    # Per-item responses stored as JSON: {"item_uuid": "yes", "item_uuid2": "not_met"}
    responses = models.JSONField(default=dict)
    summary_comment = models.TextField(blank=True)

    completed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'completed_checklists'
        ordering = ['-completed_at']
        indexes = [
            models.Index(fields=['enrolment']),
            models.Index(fields=['iqa_reviewer']),
        ]
```
