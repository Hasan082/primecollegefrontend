# Learner Module — Progress Status

**Last Updated:** 2026-03-14

---

## Frontend Status Summary

### ✅ DONE — Working Features

| Feature | File(s) | Notes |
|---------|---------|-------|
| Learner Dashboard | `src/pages/learner/Dashboard.tsx` | Stats, recent activity, deadline alerts |
| My Qualifications list | `src/pages/learner/MyQualifications.tsx` | Progress bars, expiry display |
| Qualification View (unit list) | `src/pages/learner/QualificationView.tsx` | Status badges, feedback inline |
| Unit Detail page | `src/pages/learner/UnitDetail.tsx` | Resources, assignments, evidence, sidebar |
| Evidence Upload (file + description + criteria linking) | `src/components/learner/EvidenceUploadForm.tsx` | EV-numbering, mandatory fields |
| Submission History (versioned timeline) | `src/components/learner/SubmissionHistory.tsx` | v1/v2/v3, IQA verified badge |
| Resource Locking (payment gate) | `src/components/learner/ResourceLock.tsx` | 🔒 UI when unpaid |
| Evidence Upload Locking (payment gate) | `src/pages/learner/UnitDetail.tsx` | Locked form when `paymentConfirmed=false` |
| Strict Quiz (fullscreen, anti-cheat, timer) | `src/components/learner/StrictQuizModal.tsx` | Tab monitoring, auto-submit, attempt tracking |
| Written Assignments (word count, min 50) | `src/pages/learner/UnitDetail.tsx` | Inline component |
| File Upload Assignments | `src/pages/learner/UnitDetail.tsx` | Drag & drop |
| Extension Request + Payment modal | `src/components/learner/ExtensionRequestModal.tsx` | Plan selection, mock payment |
| Notification Bell (dropdown) | `src/components/learner/NotificationBell.tsx` | Mark read, navigate on click |
| Profile page | `src/pages/learner/Profile.tsx` | Name, email, phone, address |
| Change Password | `src/pages/learner/ChangePassword.tsx` | Validation, show/hide toggle |
| Layout + Sidebar | `src/components/learner/LearnerLayout.tsx` | Header, sidebar, user dropdown |
| Checkout (qualification purchase) | `src/pages/Checkout.tsx` | Cart, billing, order summary |
| Enrollment Confirmation | `src/pages/EnrollmentConfirmation.tsx` | Post-purchase redirect |
| Deadline warnings (unit-level) | `src/pages/learner/Dashboard.tsx` | Urgent / warning badges |
| Expired qualification alerts | `src/pages/learner/Dashboard.tsx` | Overdue days, "Extend & Pay" CTA |

### Mock Data Coverage
| Qualification | Units with full detail | Units skeleton only |
|---------------|----------------------|---------------------|
| Level 4 Diploma in Adult Care | u1–u5 (5 units) | u6–u10 (5 units — no detail data) |
| Level 3 Business Administration | u1–u3 (3 units) | None |

---

## ❌ GAPS — Missing / Incomplete

### Critical Gaps (Compliance / Functionality)

| # | Gap | Impact | Priority |
|---|-----|--------|----------|
| 1 | **No Learner Declaration** before submission | Regulatory requirement — learners must confirm work is their own before submitting evidence | 🔴 High |
| 2 | **Checkout uses fake payment** — no Stripe integration | No real payment processing; `paymentConfirmed` is hardcoded in mock data | 🔴 High |
| 3 | **No "Awaiting IQA" status visible to learner** | Learner sees "Competent" but doesn't know unit is pending IQA verification | 🟡 Medium |
| 4 | **Profile email is editable** | Should be read-only (same rule as Admin/IQA portals) | 🟡 Medium |
| 5 | **Access expiry not enforced** | Dashboard shows expiry alerts but doesn't actually block resource/submission access | 🟡 Medium |
| 6 | **Units u6–u10 have no detail data** | Clicking "View Unit" shows empty page for 5 of 10 units in Adult Care qualification | 🟡 Medium |
| 7 | **No dedicated Notifications page** | Only bell dropdown — no full list view, no filtering, no pagination | 🟢 Low |
| 8 | **No learner-facing IQA feedback visibility** | Learner can't see IQA comments (by design — IQA comments are internal), but should see "IQA Verified" status | 🟢 Low |
| 9 | **Submit for Assessment button** doesn't change unit status | Toast-only — no state persistence after clicking | 🟡 Medium |
| 10 | **No file size validation** on evidence upload | Accepts any file size despite "max 10MB" label | 🟢 Low |

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
                                                              10. Link to criteria
                                                              11. Submit for assessment ──────►
                               12. Review evidence                                             
                               13. Mark criteria met/not met                                   
                               14. Provide feedback                                            
                               15. Set outcome ────────────────► 16. Receive notification       
                                                              17. View feedback                
                                                              18. Resubmit if needed (v2, v3)  
                               19. 100% criteria → sign off ──────────────────────────────────► 20. Auto-queued for sampling
                                                                                               21. VACS verification
                                                                                               22. Agree / Disagree
                                                              23. See "IQA Verified" badge     
                               24. If disagree → action req'd                                  
                               25. Re-assess and resubmit ────────────────────────────────────► 26. Re-review
```

---

## Notes
- All state currently uses `localStorage` / in-memory mock data
- Learner Declaration was documented in memory but not yet implemented in UI
- Extension payment uses simulated flow (no real payment gateway)
- Quiz scoring is client-side (must move to server for production)
