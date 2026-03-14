# IQA Module — Progress Status

**Last Updated:** 2026-03-14

---

## Frontend Status: ✅ COMPLETE

### IQA Portal Pages
| Feature | File | Status |
|---------|------|--------|
| IQA Dashboard | `src/pages/iqa/Dashboard.tsx` | ✅ Done |
| Sampling Queue | `src/pages/iqa/SamplingQueue.tsx` | ✅ Done |
| Assessment Review (VACS + Agree/Disagree) | `src/pages/iqa/AssessmentReview.tsx` | ✅ Done |
| Verification Checklists | `src/pages/iqa/VerificationChecklists.tsx` | ✅ Done |
| Trainer Performance | `src/pages/iqa/TrainerPerformance.tsx` | ✅ Done |
| Sampling Settings (per-qual rates) | `src/pages/iqa/SamplingSettings.tsx` | ✅ Done |
| Qualification Tree View | `src/pages/iqa/QualificationTreeView.tsx` | ✅ Done |
| Reports (Sampling Plan Report) | `src/pages/iqa/Reports.tsx` | ✅ Done |

### IQA Components
| Feature | File | Status |
|---------|------|--------|
| VACS Verification Checklist | `src/components/iqa/VACSVerification.tsx` | ✅ Done |
| Disagree Form (action types, criteria selection) | `src/components/iqa/IQADisagreeForm.tsx` | ✅ Done |
| Feedback History Timeline | `src/components/iqa/FeedbackHistory.tsx` | ✅ Done |
| Evidence Preview | `src/components/iqa/EvidencePreview.tsx` | ✅ Done |
| IQA Layout + Sidebar | `src/components/iqa/IQALayout.tsx` | ✅ Done |

### Admin — IQA Management
| Feature | File | Status |
|---------|------|--------|
| IQA Account CRUD | `src/pages/admin/IQAManagement.tsx` | ✅ Done |
| IQA Detail Modal (edit name, assign quals) | `src/components/admin/IQADetailModal.tsx` | ✅ Done |
| Checklist Builder (templates + items) | `src/pages/admin/ChecklistBuilder.tsx` | ✅ Done |

### Trainer — IQA Integration
| Feature | File | Status |
|---------|------|--------|
| IQA Notifications Panel | `src/components/trainer/IQANotificationsPanel.tsx` | ✅ Done |
| Auto-queue on 100% criteria sign-off | `src/lib/iqaQueue.ts` | ✅ Done |
| Course Sampling Plans | `src/lib/iqaQueue.ts` | ✅ Done |

### Business Logic Libraries
| Feature | File | Status |
|---------|------|--------|
| IQA Queue engine | `src/lib/iqaQueue.ts` | ✅ Done |
| IQA Notifications | `src/lib/iqaNotifications.ts` | ✅ Done |
| Checklist template management | `src/lib/checklists.ts` | ✅ Done |
| Quiz engine (strict mode) | `src/lib/quizEngine.ts` | ✅ Done |

---

## Backend Status: ❌ NOT STARTED

| Requirement | Status |
|-------------|--------|
| Django models (IQASample, IQAReview, SamplingSetting, Checklist*) | ❌ Pending |
| API endpoints (sampling queue, review submission, checklists) | ❌ Pending |
| Celery weekly sampling task | ❌ Pending |
| Immutable audit trail for IQA decisions | ❌ Pending |
| Email notifications on IQA outcomes | ❌ Pending |
| Server-enforced role permissions (IsIQA) | ❌ Pending |

---

## Notes
- All frontend data uses `localStorage` mock persistence
- Admin assigns IQAs to qualifications (not self-selected)
- Sampling strategy: 100% for new trainers, configurable % for experienced
- IQA decisions: Agree, Disagree (with action type), Not Sampled
