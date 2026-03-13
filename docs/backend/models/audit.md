# Audit App — Models

**App:** `apps/audit/`  
**File:** `models.py`

---

## AuditLog

Immutable audit trail for all significant platform actions. Records cannot be updated or deleted.

```python
class AuditLog(models.Model):
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
        ('iqa_checklist_completed', 'IQA Checklist Completed'),
        # Admin
        ('learner_enrolled', 'Learner Enrolled'),
        ('learner_suspended', 'Learner Suspended'),
        ('trainer_assigned', 'Trainer Assigned'),
        ('iqa_assigned', 'IQA Assigned'),
        ('qualification_created', 'Qualification Created'),
        ('qualification_archived', 'Qualification Archived'),
        ('resource_uploaded', 'Resource Uploaded'),
        ('checklist_template_created', 'Checklist Template Created'),
        ('checklist_template_updated', 'Checklist Template Updated'),
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
    target_type = models.CharField(max_length=50)        # e.g., 'submission', 'enrolment'
    target_id = models.UUIDField()

    # Context
    metadata = models.JSONField(default=dict)             # Action-specific data
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
