# Enrolments App — Models

**App:** `apps/enrolments/`  
**File:** `models.py`

---

## Enrolment

Links a learner to a qualification with access control.

```python
class Enrolment(models.Model):
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
    payment_confirmed = models.BooleanField(
        default=False,
        help_text="Set to True when payment is verified. Controls resource access locking."
    )

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
