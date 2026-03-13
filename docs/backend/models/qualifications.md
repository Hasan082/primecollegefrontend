# Qualifications App — Models

**App:** `apps/qualifications/`  
**File:** `models.py`

---

## Qualification

Top-level qualification (e.g., Level 3 Diploma in Business Administration).

```python
class Qualification(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    title = models.CharField(max_length=500)
    code = models.CharField(max_length=50, unique=True)       # e.g., BUS-L3-DIP
    level = models.CharField(max_length=20)                    # e.g., Level 3
    category = models.CharField(max_length=100)
    awarding_body = models.CharField(max_length=100)           # e.g., VTCT, CMI
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
```

---

## Unit

A unit/module within a qualification.

```python
class Unit(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    qualification = models.ForeignKey(
        Qualification, on_delete=models.CASCADE, related_name='units'
    )
    code = models.CharField(max_length=50)        # e.g., UNIT-301
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
```

---

## AssessmentCriteria

Individual assessment criteria within a unit (UK standard).

```python
class AssessmentCriteria(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    unit = models.ForeignKey(Unit, on_delete=models.CASCADE, related_name='criteria')
    code = models.CharField(max_length=20)         # e.g., 1.1, 1.2, 2.1
    description = models.TextField()
    order = models.IntegerField(default=0)

    class Meta:
        db_table = 'assessment_criteria'
        ordering = ['order']
        unique_together = ['unit', 'code']
```

---

## UnitResource

Learning resources attached to a unit.

```python
class UnitResource(models.Model):
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
