import type {
  EnrolmentContentResponse,
  LearnerEvidenceSubmission,
  LearnerEvidenceSubmissionListResponse,
  LearnerSubmissionActor,
  LearnerWrittenAssignmentSubmission,
  LearnerWrittenAssignmentSubmissionResponse,
} from "@/types/enrollment.types";

export interface IQAAssignedEnrolmentItem {
  id: string;
  enrolment_number: string;
  status: string;
  payment_status: string;
  enrolled_at: string;
  access_expires_at: string | null;
  completed_at: string | null;
  learner: {
    id: string;
    name: string;
    qualification_learner_id: string;
    email: string;
  };
  qualification: {
    id: string;
    title: string;
    slug: string;
    is_cpd: boolean;
  };
  trainer: LearnerSubmissionActor | null;
}

export interface IQAAssignedEnrolmentListResponse {
  success: boolean;
  message: string;
  data: {
    summary: {
      total_learners: number;
      awaiting_iqa: number;
      iqa_approved: number;
      action_required: number;
    };
    count: number;
    next: string | null;
    previous: string | null;
    results: IQAAssignedEnrolmentItem[];
  };
}

export type IQAEnrolmentContentResponse = EnrolmentContentResponse;

export interface IQAWrittenAssignmentReviewPayload {
  iqa_sampled?: boolean;
  iqa_decision: "approved" | "changes_required" | "referred_back";
  iqa_review_notes?: string;
}

export interface IQAEvidenceSubmissionReviewPayload {
  iqa_sampled?: boolean;
  iqa_decision: "approved" | "changes_required" | "referred_back";
  iqa_review_notes?: string;
}

export type IQAWrittenAssignmentDetailResponse =
  LearnerWrittenAssignmentSubmissionResponse;

export interface IQAEvidenceSubmissionDetailResponse {
  success: boolean;
  message: string;
  data: LearnerEvidenceSubmission;
}

export interface ChecklistTemplateItem {
  id: string;
  label: string;
  response_type: "yes_no" | "yes_no_na" | "met_notmet_na";
  order: number;
  is_active: boolean;
}

export interface ChecklistTemplate {
  id: string;
  qualification_id: string;
  qualification_title: string;
  unit_id: string | null;
  unit_title: string | null;
  title: string;
  is_active: boolean;
  items: ChecklistTemplateItem[];
  created_at: string;
  updated_at: string;
}

export interface ChecklistTemplateListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ChecklistTemplate[];
}

export interface ChecklistCompletion {
  id: string;
  template: {
    id: string;
    title: string;
  };
  enrolment_id: string;
  iqa_reviewer: {
    id: string;
    name: string;
  };
  responses: Record<string, string>;
  summary_comment: string;
  completed_at: string;
}

export interface ChecklistCompletionListResponse {
  results: ChecklistCompletion[];
}

export interface ChecklistCompletionCreatePayload {
  template_id: string;
  enrolment_id: string;
  responses: Record<string, string>;
  summary_comment?: string;
}

export interface ChecklistQualificationOption {
  id: string;
  title: string;
}

export interface SamplingPlan {
  id: string;
  title: string;
  qualification: string;
  qualification_title: string;
  strategy: "full" | "percentage" | "risk_based" | "new_assessor" | "custom";
  sample_percentage: string;
  status: "draft" | "active" | "closed";
  start_date: string;
  end_date: string | null;
  academic_year: string;
  rationale: string;
  iqa_reviewer: {
    id: string;
    name: string;
    email: string;
    staff_role: string;
  } | null;
  approved_by: {
    id: string;
    name: string;
    email: string;
    role: string;
  } | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SamplingPlanListResponse {
  results: SamplingPlan[];
}

export interface SamplingPlanWritePayload {
  title?: string;
  qualification: string;
  strategy: "full" | "percentage" | "risk_based" | "new_assessor" | "custom";
  sample_percentage: number;
  status: "draft" | "active" | "closed";
  start_date: string;
  end_date?: string | null;
  academic_year?: string;
  rationale?: string;
}

export interface SubmissionConcernUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface SubmissionConcernSubmission {
  id: string;
  submission_number: number;
  title: string;
  submission_type: string;
  status: string;
  unit_id: string;
  enrolment_id: string;
  learner: {
    id: string;
    name: string;
    email: string;
  };
  trainer: {
    id: string;
    name: string;
    email: string;
  } | null;
}

export interface SubmissionAdminConcern {
  id: string;
  submission: SubmissionConcernSubmission;
  status: "open" | "in_progress" | "resolved" | "dismissed";
  concern_note: string;
  admin_response_note: string;
  raised_by: SubmissionConcernUser | null;
  resolved_by: SubmissionConcernUser | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SubmissionAdminConcernResponse {
  success: boolean;
  message: string;
  data: SubmissionAdminConcern;
}

export interface SubmissionAdminConcernListResponse {
  success: boolean;
  message: string;
  data: SubmissionAdminConcern[];
}

export interface SubmissionAdminConcernCreatePayload {
  concern_note: string;
}

export interface IQAWrittenAssignmentReviewResponse {
  success: boolean;
  message: string;
  data: LearnerWrittenAssignmentSubmission;
}

export interface IQAEvidenceSubmissionReviewResponse {
  success: boolean;
  message: string;
  data: LearnerEvidenceSubmission;
}

export interface IQAReviewQueueItem {
  submission_id: string;
  enrolment_id: string;
  submission_type: "written" | "evidence" | string;
  learner: {
    id: string;
    name: string;
    qualification_learner_id: string;
  };
  trainer: {
    id: string;
    name: string;
  } | null;
  qualification: {
    id: string;
    title: string;
  };
  unit: {
    id: string;
    title: string;
    unit_code: string;
  };
  status: string;
  iqa_decision: string | null;
  iqa_reviewed_at: string | null;
  submitted_at: string | null;
  outcome_set_at: string | null;
  iqa_status: string;
  sampling_reason: string;
}

export interface IQATrainerOverviewItem {
  trainer: {
    id: string;
    name: string;
  } | null;
  total_assessments: number;
  iqa_approvals: number;
  iqa_flags: number;
  avg_turnaround_days: number;
}

export interface IQADashboardResponse {
  success: boolean;
  message: string;
  data: {
    summary: {
      pending_review: number;
      approved: number;
      action_required: number;
      escalated: number;
    };
    pending_reviews: IQAReviewQueueItem[];
    trainer_overview: IQATrainerOverviewItem[];
  };
}

export interface IQAReviewQueueResponse {
  success: boolean;
  message: string;
  data: {
    count: number;
    next: string | null;
    previous: string | null;
    results: IQAReviewQueueItem[];
  };
}
