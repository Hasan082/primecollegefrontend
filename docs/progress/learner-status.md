# Learner Module — Progress Status

**Last Updated:** 2026-03-14

---

## Frontend Status Summary

### ✅ DONE — Working Features

| Feature | File(s) | Notes |
|---------|---------|-------|
| Learner Dashboard | `src/pages/learner/Dashboard.tsx` | Stats, recent activity, deadline alerts, Awaiting IQA stat |
| My Qualifications list | `src/pages/learner/MyQualifications.tsx` | Progress bars, expiry display |
| Qualification View (unit list) | `src/pages/learner/QualificationView.tsx` | Status badges incl. Awaiting IQA, feedback inline |
| Unit Detail page | `src/pages/learner/UnitDetail.tsx` | Resources, assignments, evidence, sidebar |
| Evidence Upload (file + description + criteria linking) | `src/components/learner/EvidenceUploadForm.tsx` | EV-numbering, mandatory fields |
| **Learner Declaration** | `src/components/learner/EvidenceUploadForm.tsx` | ✅ Regulatory checkbox — must confirm work is own before submitting |
| Submission History (versioned timeline) | `src/components/learner/SubmissionHistory.tsx` | v1/v2/v3, IQA verified badge |
| Resource Locking (payment gate) | `src/components/learner/ResourceLock.tsx` | 🔒 UI when unpaid |
| Evidence Upload Locking (payment gate) | `src/pages/learner/UnitDetail.tsx` | Locked form when `paymentConfirmed=false` |
| **Access Expiry Enforcement** | `src/pages/learner/UnitDetail.tsx` | ✅ Blocks evidence upload when qualification is expired |
| Strict Quiz (fullscreen, anti-cheat, timer) | `src/components/learner/StrictQuizModal.tsx` | Tab monitoring, auto-submit, attempt tracking |
| Written Assignments (word count, min 50) | `src/pages/learner/UnitDetail.tsx` | Inline component |
| File Upload Assignments | `src/pages/learner/UnitDetail.tsx` | Drag & drop |
| Extension Request + Payment modal | `src/components/learner/ExtensionRequestModal.tsx` | Plan selection, mock payment |
| Notification Bell (dropdown) | `src/components/learner/NotificationBell.tsx` | Mark read, navigate on click |
| **Profile page (email read-only)** | `src/pages/learner/Profile.tsx` | ✅ Email cannot be edited; "contact support" message shown |
| Change Password | `src/pages/learner/ChangePassword.tsx` | Validation, show/hide toggle |
| Layout + Sidebar | `src/components/learner/LearnerLayout.tsx` | Header, sidebar, user dropdown |
| Checkout (qualification purchase) | `src/pages/Checkout.tsx` | Cart, billing, order summary |
| Enrollment Confirmation | `src/pages/EnrollmentConfirmation.tsx` | Post-purchase redirect |
| Deadline warnings (unit-level) | `src/pages/learner/Dashboard.tsx` | Urgent / warning badges |
| Expired qualification alerts | `src/pages/learner/Dashboard.tsx` | Overdue days, "Extend & Pay" CTA |
| **Awaiting IQA status** | Multiple files | ✅ New status in unit lifecycle — visible in dashboard, qualification view, unit detail |
| **Submit for Assessment persists** | `src/pages/learner/UnitDetail.tsx` | ✅ Button disables after click; shows "Submitted — Awaiting Assessment" |
| **Accessibility: proper `<Button>` components** | Multiple files | ✅ All clickable elements use `<Button>` component |

### Mock Data Coverage
| Qualification | Units with full detail | Units skeleton only |
|---------------|----------------------|---------------------|
| Level 4 Diploma in Adult Care | u1–u5 (5 units) | u6–u10 (5 units — no detail data) |
| Level 3 Business Administration | u1–u3 (3 units) | None |

---

## ❌ Remaining Gaps

### Frontend (Low Priority)

| # | Gap | Priority |
|---|-----|----------|
| 1 | Units u6–u10 have no detail data (Adult Care) | 🟡 Medium |
| 2 | No dedicated Notifications page (only bell dropdown) | 🟢 Low |
| 3 | No file size validation on evidence upload | 🟢 Low |

### Backend Dependencies (Cannot fix without API)

| Requirement | Status |
|-------------|--------|
| Real user authentication (JWT/session) | ❌ Pending |
| Database persistence (submissions, feedback, progress) | ❌ Pending |
| Stripe payment integration | ❌ Pending |
| S3 file storage (evidence uploads) | ❌ Pending |
| Email notifications (assessment outcomes, deadlines) | ❌ Pending |
| Access expiry enforcement (server-side) | ❌ Pending |
| Audit trail (immutable submission/assessment logs) | ❌ Pending |

---

## Learner Journey Flow (Admin → Trainer → Learner → IQA)

```
ADMIN                          TRAINER                        LEARNER                         IQA
─────                          ───────                        ───────                         ───
1. Create qualification        
2. Add units + criteria        
3. Upload resources            
4. Set pricing                 
                               5. Assigned to learner          
                                                              6. Purchase qualification ──────► Account created
                                                              7. Payment confirmed ──────────► Resources unlocked
                                                              8. Download resources
                                                              9. Upload evidence (EV-ref)
                                                              10. Learner Declaration ✅
                                                              11. Link to criteria
                                                              12. Submit for assessment ──────►
                               13. Review evidence                                             
                               14. Mark criteria met/not met                                   
                               15. Provide feedback                                            
                               16. Set outcome ────────────────► 17. Receive notification       
                                                              18. View feedback                
                                                              19. Resubmit if needed (v2, v3)  
                               20. 100% criteria → sign off ──────────────────────────────────► 21. Auto-queued for sampling
                                                              22. See "Awaiting IQA" status    
                                                                                               23. VACS verification
                                                                                               24. Agree / Disagree
                                                              25. See "IQA Verified" badge     
                               26. If disagree → action req'd                                  
                               27. Re-assess and resubmit ────────────────────────────────────► 28. Re-review
```

---

## Notes
- All state currently uses `localStorage` / in-memory mock data
- Extension payment uses simulated flow (no real payment gateway)
- Quiz scoring is client-side (must move to server for production)
- Learner Declaration implemented as regulatory compliance requirement
- Profile email is read-only — changes require admin support
