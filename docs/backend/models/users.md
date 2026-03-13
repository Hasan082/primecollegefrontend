# Users App — Models

**App:** `apps/users/`  
**File:** `models.py`

---

## UserProfile

Extended user profile for all roles.

```python
class UserProfile(models.Model):
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
```

---

## UserRole

Separate role table — **NEVER store roles on the user model** (prevents privilege escalation).

```python
class UserRole(models.Model):
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
