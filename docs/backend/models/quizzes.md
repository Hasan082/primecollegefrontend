# Quizzes App — Models

**App:** `apps/quizzes/`  
**File:** `models.py`

---

## Question

Question bank entry linked to a unit.

```python
class Question(models.Model):
    QUESTION_TYPES = [
        ('single', 'Single Choice'),
        ('multiple', 'Multiple Choice'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    unit = models.ForeignKey('qualifications.Unit', on_delete=models.CASCADE)
    question_text = models.TextField()
    question_type = models.CharField(max_length=10, choices=QUESTION_TYPES)
    options = models.JSONField()           # List of option strings
    correct_answers = models.JSONField()   # List of correct option indices
    explanation = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)

    class Meta:
        db_table = 'questions'
        indexes = [models.Index(fields=['unit', 'is_active'])]
```

---

## QuizAttempt

A single quiz attempt by a learner — **scored server-side only**.

```python
class QuizAttempt(models.Model):
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
```

---

## QuizAnswer

Per-question answer with snapshot for audit trail.

```python
class QuizAnswer(models.Model):
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
```

---

## IntegrityViolation

Anti-cheat event log — **append-only**.

```python
class IntegrityViolation(models.Model):
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
