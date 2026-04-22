# Learner Declaration & Course Evaluation Implementation

This document serves as a memory/reference for the Learner Declaration and Course Evaluation features implemented in the Learner Panel.

## 1. Enrollment Overview (Data Source)
All declaration and evaluation logic depends on the specific enrollment ID.
- **Endpoint**: `GET /api/enrolments/me/{id}/overview/`
- **ID Source**: The `id` field in the root of the data object is the `enrolment_id` required for subsequent calls.
- **Frontend Usage**: Retrieved via `useParams()` in `QualificationView.tsx`.

## 2. Learner Declaration
- **GET Endpoint**: `/api/enrolments/me/{enrolment_id}/learner-declaration/`
- **POST Endpoint**: `/api/enrolments/me/{enrolment_id}/learner-declaration/submission/`
- **Payload Structure**:
```json
{
  "accepted_items": ["item_key_1", "item_key_2"],
  "typed_full_name": "Full Legal Name"
}
```

## 3. Course Evaluation
- **GET Endpoint**: `/api/enrolments/me/{enrolment_id}/course-evaluation/`
- **POST Endpoint**: `/api/enrolments/me/{enrolment_id}/course-evaluation/submission/`
- **Payload Structure**:
```json
{
  "answers": {
    "overall_rating": 5,
    "content_quality": 4,
    "platform_experience": 5,
    "what_went_well": "Clear explanations and useful examples.",
    "areas_for_improvement": "Add more downloadable resources.",
    "would_recommend": true
  }
}
```

## 4. Frontend Integration
### Routes
Added to `App.tsx` under the learner layout:
- `qualification/:id/declaration`: `LearnerDeclaration` component.
- `qualification/:id/evaluation`: `CourseEvaluation` component.

### UI Components
- **QualificationView.tsx**:
    - Status card at the top for **Learner Declaration** (navigates to declaration page).
    - Status card at the bottom for **Course Evaluation** (navigates to evaluation page).
    - Checks `qualification.requires_learner_declaration` and `qualification.requires_course_evaluation` flags for conditional rendering.

### Components
- `src/components/learner/LearnerDeclaration.tsx`: Standalone page for the declaration form.
- `src/components/learner/CourseEvaluation.tsx`: Standalone page for the feedback form.
- `enrolmentDeclarationApi.ts`: Redux API layer handling all declaration and evaluation endpoints.

---
*Last updated: 2026-04-17*
