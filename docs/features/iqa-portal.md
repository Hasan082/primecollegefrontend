# IQA Portal — Complete Functional Documentation

**Last Updated:** 13 March 2026  
**Portal Role:** Internal Quality Assurer (IQA)  
**Login:** `/staff-login` → IQA role  
**Sidebar Navigation:** `src/components/iqa/IQASidebar.tsx`

---

## Table of Contents

1. [Overview & Purpose](#1-overview--purpose)
2. [End-to-End Workflow](#2-end-to-end-workflow)
3. [IQA Dashboard](#3-iqa-dashboard)
4. [Qualification Tree View](#4-qualification-tree-view)
5. [Assessment Sampling Queue](#5-assessment-sampling-queue)
6. [Assessment Review (Core Verification)](#6-assessment-review-core-verification)
7. [VACS Verification](#7-vacs-verification)
8. [IQA Decision-Making](#8-iqa-decision-making)
9. [IQA → Assessor Notifications](#9-iqa--assessor-notifications)
10. [Verification Checklists](#10-verification-checklists)
11. [Trainer Performance Monitoring](#11-trainer-performance-monitoring)
12. [Reports & Compliance](#12-reports--compliance)
13. [Sampling Configuration](#13-sampling-configuration)
14. [Evidence Numbering System](#14-evidence-numbering-system)
15. [Data Flow & Lifecycle](#15-data-flow--lifecycle)
16. [File Map](#16-file-map)

---

## 1. Overview & Purpose

The IQA portal provides a **regulatory compliance layer** for Prime College's assessment workflow. Its purpose is to ensure that trainer/assessor decisions are:

- **Valid** — the assessment method matches the criteria
- **Authentic** — the work is the learner's own
- **Current** — evidence reflects current standards
- **Sufficient** — enough evidence to demonstrate competence

This is known as the **VACS standard**, which is the core of every IQA verification.

The IQA does **not** assess learners directly. They verify the **quality and consistency of the assessor's decisions**.

---

## 2. End-to-End Workflow

### The Complete Lifecycle (Step-by-Step)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         ASSESSMENT LIFECYCLE                           │
│                                                                        │
│  1. LEARNER uploads evidence for a unit                                │
│         ↓                                                              │
│  2. ASSESSOR reviews evidence against Assessment Criteria (ACs)        │
│         ↓                                                              │
│  3. ASSESSOR ticks each AC as Met / Not Met                            │
│         ↓                                                              │
│  4. ASSESSOR provides written feedback + outcome:                      │
│         • Competent                                                    │
│         • Resubmission Required                                        │
│         • Not Yet Competent                                            │
│         ↓                                                              │
│  5. When ALL ACs are ticked Met → ASSESSOR clicks "Sign Off Unit"      │
│         ↓                                                              │
│  6. Unit auto-flips to "Awaiting IQA" status                           │
│         ↓                                                              │
│  7. SAMPLING ENGINE decides: sampled for IQA review? (Yes/No)          │
│     ┌────────┴────────┐                                                │
│     │                 │                                                │
│   SAMPLED         NOT SAMPLED                                          │
│     │             → Status: "Not Sampled"                              │
│     │             → Unit is considered complete                        │
│     ↓                                                                  │
│  8. IQA opens Assessment Review page                                   │
│         ↓                                                              │
│  9. IQA sees:                                                          │
│         • Assessor's criteria tick-state (which ACs met/not met)       │
│         • Full feedback history (all submissions, not just latest)      │
│         • Learner evidence files with evidence numbers (EV-2026-XXX)   │
│         • Inline document preview                                      │
│         ↓                                                              │
│  10. IQA completes VACS Verification (Valid, Authentic, Current,       │
│      Sufficient — each Yes/No)                                         │
│         ↓                                                              │
│  11. IQA makes a decision:                                             │
│      ┌──────────┬──────────────────┬──────────────┐                    │
│      │          │                  │              │                    │
│    AGREE     DISAGREE         NOT SAMPLED         │                    │
│      │          │              (quick skip)        │                    │
│      │          │                  │              │                    │
│      ↓          ↓                  ↓              │                    │
│   "IQA       "Assessor         "Not Sampled"      │                    │
│   Approved"   Action            → Unit complete    │                    │
│   → Done      Required"                           │                    │
│               → Notification                       │                    │
│                 sent to                             │                    │
│                 Assessor                            │                    │
│                    ↓                                │                    │
│              12. ASSESSOR sees notification on      │                    │
│                  their dashboard with:              │                    │
│                  • Which action is required          │                    │
│                  • IQA's reason                     │                    │
│                  • Affected criteria                 │                    │
│                  • IQA comments                     │                    │
│                    ↓                                │                    │
│              13. ASSESSOR takes corrective action   │                    │
│                  and marks notification resolved     │                    │
│                                                     │                    │
└─────────────────────────────────────────────────────────────────────────┘
```

### What Triggers IQA Involvement

The IQA queue is populated **automatically** when:

1. An assessor signs off a unit (all ACs ticked as Met → "Sign Off Unit" button clicked)
2. The sampling engine runs against the configured sampling rate
3. The unit is either added to the queue as "Pending IQA Review" or marked "Not Sampled"

**There is no manual step for the IQA to "request" work** — it arrives automatically.

---

## 3. IQA Dashboard

**Route:** `/iqa/dashboard`  
**File:** `src/pages/iqa/Dashboard.tsx`

### What It Shows

| Card | Description |
|------|-------------|
| **Pending Review** | Count of units with status "Pending IQA Review" |
| **IQA Approved** | Count of units the IQA has verified and approved |
| **Action Required** | Count of units where IQA disagreed with the assessor |
| **Escalated** | Count of units escalated to Admin (systemic issues) |

### Sections

1. **Pending IQA Reviews** — Latest 5 units awaiting review, each linking directly to the Assessment Review page (`/iqa/review/:id`). Shows learner name, unit, outcome, trainer, and sampling reason.

2. **Trainer Quality Overview** — Summary cards for each trainer showing:
   - Approval rate (% of assessments IQA approved)
   - Total assessments, flagged count, average turnaround days

### Navigation From Dashboard

- "View All" on Pending Reviews → Sampling Queue (`/iqa/sampling`)
- "View All" on Trainer Overview → Trainer Performance (`/iqa/trainers`)
- Click any pending review → Assessment Review (`/iqa/review/:id`)

---

## 4. Qualification Tree View

**Route:** `/iqa/qualifications`  
**File:** `src/pages/iqa/QualificationTreeView.tsx`  
**Data:** `src/data/qualificationTreeData.ts`

### Purpose

Gives the IQA a bird's-eye view of **all qualifications → all learners → all units → status**. This is the primary tool for identifying gaps in sampling coverage.

### Drill-Down Structure

```
Qualification (e.g. "CMI Level 5 Management & Leadership")
  └── Learner (e.g. "John Smith" — 75% overall progress)
       └── Unit 501: Principles of Management — [IQA Approved] ✓
       └── Unit 502: Professional Skills — [Awaiting IQA] → "Review" button
       └── Unit 503: Resource Management — [In Progress]
```

### Unit Status Badges

| Status | Meaning | Colour |
|--------|---------|--------|
| Not Started | Learner hasn't begun the unit | Grey |
| In Progress | Learner is working on it | Blue |
| Assessed | Assessor has reviewed but not all ACs met yet | Amber |
| Awaiting IQA | Signed off by assessor, in IQA queue | Purple |
| IQA Approved | IQA verified and approved | Green |
| Not Sampled | Signed off, not selected for IQA review | Grey |
| Action Required | IQA disagreed, assessor must take action | Red |

### Summary Stats (Top Cards)

- Total Learners across all qualifications
- Units Awaiting IQA
- IQA Approved count
- Action Required count

### Each Unit Row Shows

- Unit code + name
- Assessor name
- Evidence count
- Last activity date
- Completion percentage (progress bar)
- Status badge
- "Review" button (if Awaiting IQA)

---

## 5. Assessment Sampling Queue

**Route:** `/iqa/sampling`  
**File:** `src/pages/iqa/SamplingQueue.tsx`

### Purpose

The IQA's **main working list** — all assessments that have been signed off by assessors, showing which need review, which have been reviewed, and which were not sampled.

### Data Sources

The queue merges **two data sources**:

1. **Static mock data** (`src/data/iqaMockData.ts`) — pre-populated demo samples
2. **Auto-flipped entries** (`src/lib/iqaQueue.ts`) — units that were signed off by assessors during the session, stored in localStorage

### Filters

| Filter | Options |
|--------|---------|
| Trainer | All trainers / specific trainer name |
| Qualification | All qualifications / specific qualification |
| Outcome | All / Competent / Resubmission Required / Not Yet Competent |
| IQA Status | All / Pending IQA Review / IQA Approved / Assessor Action Required / Not Sampled |

### Table Columns

Learner | Unit | Qualification | Trainer | Outcome | Date | IQA Status | Sample Reason | Action

### Actions Per Row

- **Pending IQA Review** → "Review" button (primary, navigates to `/iqa/review/:id`)
- **IQA Approved / Action Required** → "View" button (outline, navigates to review page in read mode)
- **Not Sampled** → "Signed Off" badge (no action needed)

### Course Sampling Plans (Inline Config)

Toggle the "Course Sampling Plans" button to configure **per-qualification** sampling:

- **100% IQA toggle** — every unit in this qualification goes to IQA
- **Sampling Rate slider** — 5% to 100% (default: 25%)

These settings are persisted in localStorage via `src/lib/iqaQueue.ts` → `CourseSamplingPlan`.

---

## 6. Assessment Review (Core Verification)

**Route:** `/iqa/review/:id`  
**File:** `src/pages/iqa/AssessmentReview.tsx`

This is the **most critical page** — where the IQA does their actual verification work.

### Layout

**Left Column (2/3 width):**

1. **Submission Details Card**
   - Learner name, qualification, unit, submission date, sampling reason

2. **Assessor Criteria Tick-State** ⭐
   - Shows each AC (Assessment Criterion) with:
     - ✓ Met (green background, CheckCircle icon)
     - ✗ Not Met (red background, AlertTriangle icon)
   - Summary bar: "X Met / Y Not Met — Z% complete"
   - This lets the IQA verify the assessor hasn't just ticked everything without checking

3. **Learner Evidence** (if files exist)
   - Each file shown with:
     - Auto-generated evidence reference number (e.g. `EV-2026-042`)
     - File type icon (PDF/Word/PPT)
     - File size estimate
     - "Preview" button → inline document preview panel
   - Component: `src/components/iqa/EvidencePreview.tsx`

4. **Assessment Feedback History** ⭐
   - Timeline showing **all** feedback entries for this unit, not just the latest
   - Each entry shows: date, assessor name, outcome, submission number, feedback text
   - Colour-coded: green for Competent, amber for Resubmission, red for Not Yet Competent
   - Component: `src/components/iqa/FeedbackHistory.tsx`

5. **VACS Verification** (only shown if not yet reviewed)
   - See [Section 7](#7-vacs-verification)

6. **Disagree Form** (only shown when "Disagree" is selected)
   - See [Section 8](#8-iqa-decision-making)

**Right Column (1/3 width):**

- **IQA Decision Panel** — the three decision buttons and comments box
- See [Section 8](#8-iqa-decision-making)

---

## 7. VACS Verification

**Component:** `src/components/iqa/VACSVerification.tsx`

### What It Is

A 4-item checklist that the IQA must complete before submitting an "Agree" decision. Each item has a **Yes / No** toggle.

### The Four Checks

| Check | Question | What IQA Verifies |
|-------|----------|-------------------|
| **Valid** | Is the assessment method appropriate for the criteria? | Correct assessment methods used |
| **Authentic** | Is the work the learner's own? | No plagiarism, learner's own work |
| **Current** | Does evidence reflect current standards? | Evidence is recent and relevant |
| **Sufficient** | Is there enough evidence across all criteria? | Adequate volume and depth |

### Behaviour

- Each check starts as `null` (unchecked)
- IQA clicks "Yes" (green) or "No" (red) for each
- Status badge shows: "X/4 Checked" → "All Standards Met" or "Issues Found"
- **All 4 must be answered** before the "Agree" decision can be submitted
- If any VACS check is "No", the IQA should select "Disagree" instead

---

## 8. IQA Decision-Making

**Component:** `src/components/iqa/IQADisagreeForm.tsx` (for disagree workflow)  
**Location:** Right panel of Assessment Review page

### Three Possible Decisions

#### Decision 1: Agree — IQA Approved ✅

**Requirements:**
- All 4 VACS checks must be completed
- IQA must enter comments (text area)

**What Happens:**
1. IQA queue entry status updated to "IQA Approved"
2. IQA review date recorded
3. **Notification sent to assessor** (approval notification via `createApprovalNotification`)
4. Toast: "✅ IQA Approved — Assessment verified. Assessor notified."

#### Decision 2: Disagree — Assessor Action Required ⚠️

**Requirements:**
- IQA must select one of 4 required actions (see below)
- IQA must provide a reason (minimum 10 characters)
- Optionally select which specific criteria are affected
- Optionally add general IQA comments

**The 4 Action Types:**

| Action | Label | Description |
|--------|-------|-------------|
| `reassess` | Assessor to Re-assess | Assessor must re-mark the unit and provide a new decision |
| `revise_feedback` | Revise Feedback | Decision may be correct but feedback needs more detail/clarity |
| `additional_evidence` | Request Additional Evidence | More evidence needed before a decision can be confirmed |
| `assessor_training` | Assessor CPD / Training | Systemic issue — assessor needs additional support or training |

**What Happens:**
1. IQA queue entry status updated to "Assessor Action Required"
2. Full comments recorded including action type, reason, and affected criteria
3. **Disagree notification sent to assessor** (via `createDisagreeNotification`)
4. Toast: "⚠️ Assessor Action Required — Notification sent to assessor"

#### Decision 3: Not Sampled — Quick Sign-Off ⏭️

**Requirements:** None — one-click action

**What Happens:**
1. IQA queue entry status updated to "Not Sampled"
2. Comment auto-filled: "Not sampled — quick sign-off by IQA."
3. Redirects back to Sampling Queue after 1 second
4. Toast: "Unit marked as Not Sampled"

**Use Case:** When the IQA decides this particular unit doesn't need a full review (e.g., experienced assessor, low-risk qualification).

---

## 9. IQA → Assessor Notifications

**Library:** `src/lib/iqaNotifications.ts`  
**Assessor View:** `src/components/trainer/IQANotificationsPanel.tsx`

### How Notifications Work

When the IQA submits a decision (Agree or Disagree), a notification is created and stored in localStorage. The assessor sees these on their Trainer Dashboard.

### Notification Types

| Type | When Created | What Assessor Sees |
|------|-------------|-------------------|
| `iqa_action_required` | IQA selects "Disagree" | Red left-border, action label, IQA feedback, affected criteria, "Mark as Resolved" button |
| `iqa_approved` | IQA selects "Agree" | Green left-border, approval confirmation, IQA comments |
| `iqa_not_sampled` | (Type exists but not currently triggered) | Grey border, informational |

### Notification Data Structure

```typescript
interface IQANotification {
  id: string;
  type: "iqa_action_required" | "iqa_approved" | "iqa_not_sampled";
  learnerId: string;
  learnerName: string;
  qualification: string;
  unitCode: string;
  unitName: string;
  iqaName: string;              // Always "Catherine (IQA)" in demo
  iqaDecision: string;
  iqaComments: string;
  actionRequired?: string;      // "reassess" | "revise_feedback" | "additional_evidence" | "assessor_training"
  actionLabel?: string;         // Human-readable label
  affectedCriteria?: string[];  // e.g. ["AC 1.1", "AC 1.3"]
  reason?: string;              // IQA's reason for disagreement
  createdDate: string;
  read: boolean;
  resolved: boolean;
}
```

### Assessor Dashboard Integration

The Trainer Dashboard (`src/pages/trainer/Dashboard.tsx`) includes:

1. **IQA Notifications Panel** — appears at top of dashboard when notifications exist
2. **Stats card** — "IQA Actions" count sourced from `getActionRequiredCount()`

### Assessor Notification Actions

- **Expand** — click to see full details (IQA feedback, reason, affected criteria)
- **Acknowledge** — marks as read (removes unread indicator)
- **Mark as Resolved** — marks the action as completed (removes from active count)

---

## 10. Verification Checklists

**Route:** `/iqa/checklists`  
**File:** `src/pages/iqa/VerificationChecklists.tsx`  
**Logic:** `src/lib/checklists.ts`

### What They Are

Admin-defined verification templates that IQAs complete **per learner**. These are separate from the VACS verification — they're compliance checklists specific to a qualification or unit.

### Template Structure

```
ChecklistTemplate
  ├── id, title
  ├── qualificationId (which qualification)
  ├── unitCode (null = qualification-level, string = unit-specific)
  └── items[]
       ├── label (the question/check)
       └── responseType: "yes-no" | "yes-no-na" | "met-notmet-na"
```

### Three Response Types

| Type | Options |
|------|---------|
| Yes / No | Binary compliance check |
| Yes / No / N/A | Binary with not-applicable option |
| Met / Not Met / N/A | Competency-based check |

### Workflow

1. IQA navigates to `/iqa/checklists`
2. Filters by qualification (optional)
3. Clicks "Start Check" on a template
4. Enters learner name
5. Answers each checklist item (radio buttons)
6. Adds summary comment (optional)
7. Clicks "Submit Verification"
8. Completed checklist appears in "Completed Verifications" history

### Completed Checklist Record

```typescript
interface CompletedChecklist {
  id: string;
  templateId: string;
  qualificationId: string;
  unitCode: string | null;
  iqaName: string;          // "Catherine (IQA)"
  learnerName: string;
  responses: Record<string, CheckResponse>;  // itemId → "yes"/"no"/"met"/"not-met"/"na"
  summaryComment: string;
  completedDate: string;
}
```

### Who Creates Templates?

Templates are created by **Administrators** in the Admin portal's **Checklist Builder** (`/admin/checklists`). IQAs can only fill them in, not create or edit them.

---

## 11. Trainer Performance Monitoring

**Route:** `/iqa/trainers`  
**File:** `src/pages/iqa/TrainerPerformance.tsx`

### Purpose

Lets the IQA monitor assessment quality **per trainer** to identify:

- Assessors with high flag rates (potential training needs)
- Assessors with slow turnaround times
- High resubmission rates suggesting poor initial feedback

### Metrics Displayed

| Metric | Description |
|--------|-------------|
| Total Assessments | Number of assessments completed |
| IQA Approvals | How many the IQA approved |
| IQA Flags | How many the IQA flagged/disagreed with |
| Approval Rate | % approved (visual progress bar) |
| Resubmission Rate | % of units requiring resubmission |
| Avg Turnaround | Average days from submission to assessment |
| Status | Active / Inactive |

### Views

1. **Card view** — one card per trainer with progress bar and stats grid
2. **Table view** — detailed comparison table with all metrics side-by-side

---

## 12. Reports & Compliance

**Route:** `/iqa/reports`  
**File:** `src/pages/iqa/Reports.tsx`

### Available Reports

| Report | Category | Purpose |
|--------|----------|---------|
| Trainer Assessment Quality | Quality | Approval vs flagged per trainer with trends |
| IQA Activity Summary | Quality | Total reviews, approvals, flags, escalations over time |
| Resubmission Rate Analysis | Analytics | Units with high resub rates and root causes |
| Compliance Audit Trail | Audit | Full log of all IQA actions for Ofsted/DfE |
| **Sampling Plan Report** | **EQA** | **EQA-ready report with coverage, strategy, and compliance** |

### Sampling Plan Report (EQA-Critical) ⭐

This is the most important report — required for External Quality Assurance audits. It includes:

**1. Summary Statistics**
- Total assessments
- Total sampled (IQA reviewed)
- Overall coverage percentage
- Number of active assessors

**2. Sampling Coverage by Qualification**

Table showing per qualification:
- Total units | Sampled | Approved | Flagged | Pending | Coverage % | Assessors

**3. Assessor Sampling Summary**

Table showing per trainer:
- Total assessed | IQA Approvals | IQA Flags | Approval Rate | Avg Turnaround | Risk Level

Risk levels:
- **Low** — ≥80% approval rate
- **Medium** — 60–79% approval rate
- **High** — <60% approval rate

**4. Sampling Strategy Statement**

Formal text block for EQA/Ofsted:
> "The IQA sampling strategy for Prime College follows a risk-based approach aligned with awarding organisation requirements and Ofsted Education Inspection Framework (EIF) standards."

Covers: New assessors (100% sampling), established assessors (25% random), triggered sampling (resubmissions, previous flags), and cross-section compliance.

### Export Formats

All reports support CSV and PDF export (demo-only in current build).

---

## 13. Sampling Configuration

**Route:** `/iqa/settings`  
**File:** `src/pages/iqa/SamplingSettings.tsx`

### Global Settings

| Setting | Default | Range | Description |
|---------|---------|-------|-------------|
| Random Sampling % | 15% | 5–50% | Base percentage of assessments randomly selected |
| Auto-sample resubmissions | On | Toggle | Resubmission assessments always go to IQA |
| New trainer sampling | On | Toggle | 100% sampling during probation period |
| Probation period | 3 months | 1–12 months | How long new trainers get 100% sampling |

### Per-Course Settings

Configured in the Sampling Queue page (not the settings page):

| Setting | Description |
|---------|-------------|
| 100% IQA toggle | Every sign-off in this qualification goes to IQA |
| Sampling rate slider | 5–100% override for this specific qualification |

### Sampling Engine Logic

**File:** `src/lib/iqaQueue.ts` → `shouldAutoSelectForIQA()`

```
1. Check if a CourseSamplingPlan exists for this qualification
2. If plan.sampleAll === true → always sample (100%)
3. Otherwise, use plan.samplingRate (or fallback to global samplingConfig.randomPercentage)
4. Roll Math.random() * 100 < rate → sample or not
```

---

## 14. Evidence Numbering System

**File:** `src/lib/evidenceNumbering.ts`

### Format

```
EV-{YEAR}-{SEQUENCE}
Example: EV-2026-001, EV-2026-042
```

### How It Works

- **Counter-based** — each new evidence file gets the next sequential number
- **Persisted** in localStorage (key: `evidence_counter`)
- **Year-prefixed** for annual audit compliance
- **Zero-padded** to 3 digits

### Functions

| Function | Purpose |
|----------|---------|
| `generateEvidenceNumber()` | Returns next sequential evidence ref |
| `assignEvidenceNumbers(files)` | Batch-assigns refs to an array of filenames |
| `getDemoEvidenceNumber(sampleId, fileIndex)` | Generates deterministic refs for demo data (hash-based) |

### Where Evidence Numbers Appear

- **Assessment Review page** — next to each evidence file in the "Learner Evidence" section
- **Evidence Preview component** — shown as a badge on each file card

---

## 15. Data Flow & Lifecycle

### Unit Status Lifecycle

```
Not Started → In Progress → Assessed → Awaiting IQA
                                            │
                              ┌──────────────┼──────────────┐
                              ↓              ↓              ↓
                         IQA Approved    Not Sampled    Action Required
                              │              │              │
                              ↓              ↓              ↓
                           Complete       Complete     Assessor fixes
                                                           │
                                                           ↓
                                                     Re-enters queue
```

### Data Storage (Current Implementation)

All IQA data is stored in **localStorage**:

| Key | Contents | Managed By |
|-----|----------|------------|
| `iqa_queue_entries` | Auto-flipped IQA queue entries | `src/lib/iqaQueue.ts` |
| `iqa_course_sampling_plans` | Per-course sampling config | `src/lib/iqaQueue.ts` |
| `iqa_assessor_notifications` | IQA → Assessor notifications | `src/lib/iqaNotifications.ts` |
| `iqa_checklist_templates` | Admin-created checklist templates | `src/lib/checklists.ts` |
| `iqa_completed_checklists` | IQA-completed verifications | `src/lib/checklists.ts` |
| `evidence_counter` | Sequential evidence number counter | `src/lib/evidenceNumbering.ts` |

### Backend Models (Future — Supabase/Cloud)

See `docs/backend/models/iqa.md` for the planned database schema:

| Model | Purpose |
|-------|---------|
| `IQASample` | A sampled assessment linked to an assessment decision |
| `IQAReview` | The IQA's review outcome (approved/action required/escalated) |
| `SamplingSetting` | Sampling config per qualification or trainer |
| `ChecklistTemplate` | Admin-defined verification templates |
| `ChecklistItem` | Individual items within a template |
| `CompletedChecklist` | IQA's filled-in verification records |

---

## 16. File Map

### Pages (Routes)

| Route | File | Purpose |
|-------|------|---------|
| `/iqa/dashboard` | `src/pages/iqa/Dashboard.tsx` | Main dashboard with stats and pending list |
| `/iqa/qualifications` | `src/pages/iqa/QualificationTreeView.tsx` | Qual → Learner → Unit drill-down |
| `/iqa/sampling` | `src/pages/iqa/SamplingQueue.tsx` | Full sampling queue with filters + course config |
| `/iqa/review/:id` | `src/pages/iqa/AssessmentReview.tsx` | Core verification page |
| `/iqa/checklists` | `src/pages/iqa/VerificationChecklists.tsx` | Fill & view verification checklists |
| `/iqa/trainers` | `src/pages/iqa/TrainerPerformance.tsx` | Trainer quality monitoring |
| `/iqa/reports` | `src/pages/iqa/Reports.tsx` | Reports & sampling plan |
| `/iqa/settings` | `src/pages/iqa/SamplingSettings.tsx` | Global sampling configuration |

### Components

| File | Purpose |
|------|---------|
| `src/components/iqa/IQASidebar.tsx` | Navigation sidebar |
| `src/components/iqa/IQALayout.tsx` | Layout wrapper |
| `src/components/iqa/VACSVerification.tsx` | VACS 4-check component |
| `src/components/iqa/IQADisagreeForm.tsx` | Disagree decision form with action types |
| `src/components/iqa/EvidencePreview.tsx` | Inline document preview with evidence numbers |
| `src/components/iqa/FeedbackHistory.tsx` | Timeline of all assessor feedback |

### Libraries

| File | Purpose |
|------|---------|
| `src/lib/iqaQueue.ts` | IQA queue CRUD, sampling logic, course plans |
| `src/lib/iqaNotifications.ts` | IQA → Assessor notification system |
| `src/lib/checklists.ts` | Checklist template and completion management |
| `src/lib/evidenceNumbering.ts` | Evidence reference number generation |

### Data

| File | Purpose |
|------|---------|
| `src/data/iqaMockData.ts` | Static demo IQA samples + trainer performance data |
| `src/data/qualificationTreeData.ts` | Demo tree view data |

### Assessor-Side Integration

| File | Purpose |
|------|---------|
| `src/components/trainer/IQANotificationsPanel.tsx` | Assessor dashboard notification display |
| `src/components/trainer/UnitSignOff.tsx` | Sign-off button that triggers IQA queue |
| `src/components/trainer/UnitCriteriaTracker.tsx` | Shows AC progress (100% = ready for sign-off) |

---

## Appendix: Quick Reference for Testers

### How to Test the Full Flow

1. **Login as Trainer** → `/staff-login`
2. Go to a learner → open a unit → tick all ACs → click "Sign Off Unit"
3. Unit flips to "Awaiting IQA"
4. **Login as IQA** → `/staff-login`
5. Go to `/iqa/sampling` → find the signed-off unit
6. Click "Review" → verify criteria, evidence, feedback history
7. Complete VACS → select a decision (Agree/Disagree)
8. **Login as Trainer** again → check dashboard for IQA notification

### Key Statuses at a Glance

| Status | Who Sets It | What Happens Next |
|--------|------------|-------------------|
| Pending IQA Review | System (auto) | IQA reviews it |
| IQA Approved | IQA | Unit is complete |
| Assessor Action Required | IQA | Assessor must fix it |
| Escalated to Admin | IQA | Admin investigates |
| Not Sampled | IQA/System | Unit is complete (no review) |
