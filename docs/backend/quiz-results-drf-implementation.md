# Quiz Results & Assessment Review — DRF Backend Implementation Plan

## Overview
This document describes how the **Quiz Results Panel** and **Trainer Assessment Review** features (currently implemented with mock data in the React frontend) will be implemented in the Django REST Framework (DRF) backend.

---

## 1. Database Models

### 1.1 `QuizAttempt`
Stores each learner's quiz attempt with results and integrity data.

```python
class QuizAttempt(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    learner = models.ForeignKey('users.Learner', on_delete=models.CASCADE, related_name='quiz_attempts')
    unit = models.ForeignKey('qualifications.Unit', on_delete=models.CASCADE)
    qualification = models.ForeignKey('qualifications.Qualification', on_delete=models.CASCADE)
    
    # Results
    score_percent = models.IntegerField()
    correct_count = models.IntegerField()
    total_questions = models.IntegerField()
    pass_mark = models.IntegerField(default=80)
    passed = models.BooleanField()
    time_taken_seconds = models.IntegerField()
    
    # Integrity
    violation_count = models.IntegerField(default=0)
    
    # Timestamps
    started_at = models.DateTimeField()
    submitted_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-submitted_at']
        indexes = [
            models.Index(fields=['learner', 'unit']),
            models.Index(fields=['submitted_at']),
        ]
```

### 1.2 `QuizAnswer`
Stores each question's answer detail for per-question analysis.

```python
class QuizAnswer(models.Model):
    attempt = models.ForeignKey(QuizAttempt, on_delete=models.CASCADE, related_name='answers')
    question = models.ForeignKey('question_bank.Question', on_delete=models.CASCADE)
    question_order = models.IntegerField()  # Position in the shuffled quiz
    
    # Learner's response (stored as JSON array of option indices)
    learner_answers = models.JSONField(default=list)
    correct_answers = models.JSONField(default=list)
    is_correct = models.BooleanField()
    
    # Snapshot of question text + options at time of attempt (audit trail)
    question_text_snapshot = models.TextField()
    options_snapshot = models.JSONField()  # List of option strings in shuffled order
    
    class Meta:
        ordering = ['question_order']
```

### 1.3 `IntegrityViolation`
Stores anti-cheat violation events during a quiz attempt.

```python
class IntegrityViolation(models.Model):
    VIOLATION_TYPES = [
        ('tab_switch', 'Tab Switch'),
        ('right_click', 'Right Click'),
        ('copy_paste', 'Copy/Paste'),
        ('devtools', 'Developer Tools'),
        ('fullscreen_exit', 'Fullscreen Exit'),
    ]
    
    attempt = models.ForeignKey(QuizAttempt, on_delete=models.CASCADE, related_name='violations')
    violation_type = models.CharField(max_length=20, choices=VIOLATION_TYPES)
    detail = models.TextField()
    occurred_at = models.DateTimeField()
    
    class Meta:
        ordering = ['occurred_at']
```

### 1.4 `Submission`
Generic submission model for all evidence types (quiz, written, file upload).

```python
class Submission(models.Model):
    SUBMISSION_TYPES = [
        ('quiz', 'Quiz'),
        ('written', 'Written'),
        ('evidence', 'Evidence'),
    ]
    
    STATUS_CHOICES = [
        ('awaiting_review', 'Awaiting Review'),
        ('reviewed', 'Reviewed'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    learner = models.ForeignKey('users.Learner', on_delete=models.CASCADE)
    unit = models.ForeignKey('qualifications.Unit', on_delete=models.CASCADE)
    submission_type = models.CharField(max_length=10, choices=SUBMISSION_TYPES)
    title = models.CharField(max_length=255)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='awaiting_review')
    
    # Type-specific fields
    quiz_attempt = models.OneToOneField(QuizAttempt, null=True, blank=True, on_delete=models.SET_NULL)
    written_content = models.TextField(blank=True)
    word_count = models.IntegerField(null=True, blank=True)
    
    # Timestamps
    submitted_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-submitted_at']
```

### 1.5 `SubmissionFile`
Files attached to evidence submissions.

```python
class SubmissionFile(models.Model):
    submission = models.ForeignKey(Submission, on_delete=models.CASCADE, related_name='files')
    file = models.FileField(upload_to='submissions/%Y/%m/')
    original_filename = models.CharField(max_length=255)
    file_size = models.IntegerField()
    uploaded_at = models.DateTimeField(auto_now_add=True)
```

### 1.6 `AssessmentDecision`
Trainer's assessment outcome and feedback for a submission.

```python
class AssessmentDecision(models.Model):
    OUTCOME_CHOICES = [
        ('competent', 'Competent / Pass'),
        ('resubmission', 'Resubmission Required'),
        ('not_competent', 'Not Yet Competent'),
    ]
    
    submission = models.OneToOneField(Submission, on_delete=models.CASCADE, related_name='assessment')
    trainer = models.ForeignKey('users.Trainer', on_delete=models.CASCADE)
    outcome = models.CharField(max_length=20, choices=OUTCOME_CHOICES)
    feedback = models.TextField()
    feedback_file = models.FileField(upload_to='feedback/%Y/%m/', null=True, blank=True)
    assessed_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-assessed_at']
```

---

## 2. API Endpoints

### 2.1 Trainer — Unit Submissions List
```
GET /api/trainer/learners/{learner_id}/units/{unit_code}/submissions/
```
Returns all submissions for a specific learner + unit with status.

**Response:**
```json
[
  {
    "id": "uuid",
    "type": "quiz",
    "title": "Knowledge Assessment Quiz",
    "status": "awaiting_review",
    "submitted_at": "2025-02-05T10:30:00Z",
    "quiz_attempt_id": "uuid",
    "files": [],
    "word_count": null
  }
]
```

### 2.2 Trainer — Quiz Results Detail
```
GET /api/trainer/quiz-attempts/{attempt_id}/
```
Returns full quiz results with per-question breakdown and violations.

**Response:**
```json
{
  "id": "uuid",
  "score_percent": 76,
  "correct_count": 19,
  "total_questions": 25,
  "pass_mark": 80,
  "passed": false,
  "time_taken": "32:15",
  "violation_count": 1,
  "violations": [
    {
      "type": "tab_switch",
      "detail": "Learner switched away from the quiz window for 3 seconds",
      "occurred_at": "2025-02-05T12:34:00Z"
    }
  ],
  "answers": [
    {
      "question_order": 1,
      "question_text": "What is meant by 'duty of care' in adult care?",
      "options": ["A legal obligation...", "A voluntary commitment...", "A contractual...", "A guideline..."],
      "learner_answers": [0],
      "correct_answers": [0],
      "is_correct": true
    }
  ]
}
```

### 2.3 Trainer — Submit Assessment Decision
```
POST /api/trainer/submissions/{submission_id}/assess/
```
**Request:**
```json
{
  "outcome": "resubmission",
  "feedback": "The learner scored below the pass mark. Please review...",
  "feedback_file": null
}
```

### 2.4 Learner — Submit Quiz
```
POST /api/learner/units/{unit_code}/quiz/submit/
```
**Request:**
```json
{
  "quiz_id": "quiz-xxx",
  "answers": {
    "qi-0": [0],
    "qi-1": [2]
  },
  "violations": [
    {
      "type": "tab_switch",
      "detail": "Switched away for 3 seconds",
      "occurred_at": "2025-02-05T12:34:00Z"
    }
  ],
  "started_at": "2025-02-05T12:00:00Z"
}
```

The backend scores the quiz server-side using the question bank, preventing client-side score manipulation.

---

## 3. Serializers

```python
class QuizAttemptDetailSerializer(serializers.ModelSerializer):
    violations = IntegrityViolationSerializer(many=True, read_only=True)
    answers = QuizAnswerSerializer(many=True, read_only=True)
    time_taken = serializers.SerializerMethodField()
    
    class Meta:
        model = QuizAttempt
        fields = [
            'id', 'score_percent', 'correct_count', 'total_questions',
            'pass_mark', 'passed', 'time_taken', 'violation_count',
            'violations', 'answers', 'submitted_at'
        ]
    
    def get_time_taken(self, obj):
        mins, secs = divmod(obj.time_taken_seconds, 60)
        return f"{mins}:{secs:02d}"


class SubmissionListSerializer(serializers.ModelSerializer):
    files = SubmissionFileSerializer(many=True, read_only=True)
    
    class Meta:
        model = Submission
        fields = ['id', 'submission_type', 'title', 'status', 'submitted_at',
                  'quiz_attempt', 'word_count', 'files']


class AssessmentDecisionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssessmentDecision
        fields = ['outcome', 'feedback', 'feedback_file']
    
    def validate_outcome(self, value):
        if value not in ['competent', 'resubmission', 'not_competent']:
            raise serializers.ValidationError("Invalid outcome")
        return value
```

---

## 4. Permissions

```python
class IsAssignedTrainer(BasePermission):
    """Only allow trainers who are assigned to this learner."""
    
    def has_object_permission(self, request, view, obj):
        return obj.learner in request.user.trainer_profile.assigned_learners.all()


class IsSubmissionOwner(BasePermission):
    """Learners can only see their own submissions."""
    
    def has_object_permission(self, request, view, obj):
        return obj.learner.user == request.user
```

---

## 5. Key Security Considerations

1. **Server-side scoring**: Quiz answers are NEVER scored on the client. The frontend sends raw answers; the backend computes the score against the question bank.
2. **Question snapshots**: When a quiz is generated, question text and options are snapshotted in `QuizAnswer` so trainers always see exactly what the learner saw, even if the question bank is later modified.
3. **Violation integrity**: Violation logs are append-only — learners cannot modify or delete them.
4. **Audit trail**: `AssessmentDecision` records are immutable once created. Revisions create new records with a `supersedes` foreign key.
5. **File access control**: Submission files are served via signed URLs with expiry, never direct storage paths.

---

## 6. Frontend Integration Points

When migrating from mock data to DRF:

| Frontend Component | Current Data Source | DRF Endpoint |
|---|---|---|
| `UnitManagement.tsx` submissions list | `getMockSubmissions()` | `GET /api/trainer/learners/{id}/units/{code}/submissions/` |
| `QuizResultsPanel.tsx` | `getMockQuizResult()` | `GET /api/trainer/quiz-attempts/{id}/` |
| Assessment form submit | `handleSubmitReview()` (local state) | `POST /api/trainer/submissions/{id}/assess/` |
| `StrictQuizModal.tsx` quiz submit | `scoreQuiz()` (client-side) | `POST /api/learner/units/{code}/quiz/submit/` |

---

## 7. Migration Steps

1. Create Django models and run migrations
2. Create serializers and viewsets
3. Add URL routing under `/api/trainer/` and `/api/learner/`
4. Replace `getMockSubmissions()` with API call using React Query
5. Replace `getMockQuizResult()` with API call using React Query
6. Move quiz scoring from `quizEngine.ts` to backend
7. Update `handleSubmitReview()` to POST to the assessment endpoint
8. Add JWT authentication middleware
9. Add file upload handling for evidence submissions
10. Add notification triggers (Django signals) for assessment outcomes
