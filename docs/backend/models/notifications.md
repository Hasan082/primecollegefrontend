# Notifications App — Models

**App:** `apps/notifications/`  
**File:** `models.py`

---

## Notification

In-app notifications for all roles.

```python
class Notification(models.Model):
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
    link = models.CharField(max_length=500, blank=True)     # Deep link into platform

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
