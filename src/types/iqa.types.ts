import type {
  EnrolmentContentResponse,
  LearnerEvidenceSubmission,
  LearnerEvidenceSubmissionListResponse,
  LearnerSubmissionActor,
  LearnerWrittenAssignmentResponse,
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

export type IQAWrittenAssignmentResponse = LearnerWrittenAssignmentResponse;

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
  submission_id?: string;
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
  sample_id?: string;
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
  has_open_admin_concern?: boolean;
  admin_concern_status?: string | null;
  admin_concern_raised_at?: string | null;
  admin_concern_updated_at?: string | null;
}

export interface IQASubmissionHistoryItem {
  id: string;
  submission_number: number;
  submission_type: string;
  title: string;
  status: string;
  submitted_at: string;
  outcome_set_at: string | null;
  response_html?: string;
  response_word_count?: number | null;
  assessor_feedback: string;
  iqa_decision: string | null;
  iqa_review_notes: string;
  iqa_reviewed_at: string | null;
  assessor: LearnerSubmissionActor | null;
  iqa_reviewer: LearnerSubmissionActor | null;
}

export interface IQASubmissionHistoryResponse {
  success: boolean;
  message: string;
  data: {
    enrolment_id: string;
    unit: {
      id: string;
      title: string;
      unit_code: string;
    };
    results: IQASubmissionHistoryItem[];
  };
}

export interface IQABulkReviewPayload {
  submission_ids: string[];
  iqa_decision: "approved" | "changes_required" | "referred_back";
  iqa_review_notes?: string;
  iqa_sampled?: boolean;
}

export interface IQABulkReviewResponse {
  success: boolean;
  message: string;
  data: {
    processed: Array<{
      submission_id: string;
      iqa_decision: string;
    }>;
    failed: Array<{
      submission_id: string;
      reason: string;
    }>;
  };
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

export interface TrainerPerformanceSummary {
  trainer_count: number;
  total_reviews: number;
  total_approvals: number;
  total_flags: number;
  overall_approval_rate_percent: number;
  overall_flag_rate_percent: number;
  avg_turnaround_days: number;
}

export interface TrainerPerformanceItem {
  trainer: {
    id: string;
    name: string;
    email: string;
    is_active: boolean;
  } | null;
  metrics: {
    assessments: number;
    iqa_approvals: number;
    flags: number;
    changes_required: number;
    referred_back: number;
    resub_rate_percent: number;
    approval_rate_percent: number;
    flag_rate_percent: number;
    avg_turnaround_days: number;
    avg_trainer_outcome_days: number;
  };
}

export interface TrainerPerformanceResponse {
  success: boolean;
  message: string;
  data: {
    summary: TrainerPerformanceSummary;
    count: number;
    next: string | null;
    previous: string | null;
    results: TrainerPerformanceItem[];
  };
}

export interface TrainerPerformanceDetailSummary {
  assessments: number;
  iqa_approvals: number;
  flags: number;
  changes_required: number;
  referred_back: number;
  resub_rate_percent: number;
  approval_rate_percent: number;
  flag_rate_percent: number;
  avg_turnaround_days: number;
  avg_trainer_outcome_days: number;
}

export interface TrainerPerformanceDetailQualificationBreakdown {
  qualification: {
    id: string;
    title: string;
  };
  metrics: {
    assessments: number;
    iqa_approvals: number;
    flags: number;
    resub_rate_percent: number;
    approval_rate_percent: number;
    avg_turnaround_days: number;
  };
}

export interface TrainerPerformanceDetailSubmissionTypeBreakdown {
  written?: {
    assessments: number;
    iqa_approvals: number;
    flags: number;
  };
  evidence?: {
    assessments: number;
    iqa_approvals: number;
    flags: number;
  };
}

export interface TrainerPerformanceDetailRecentReview {
  submission_id: string;
  submission_type: string;
  learner: {
    id: string;
    name: string;
    qualification_learner_id: string | null;
  };
  qualification: {
    id: string;
    title: string;
  };
  unit: {
    id: string;
    title: string;
    unit_code: string;
  };
  trainer_outcome: string | null;
  iqa_decision: string | null;
  submitted_at: string | null;
  outcome_set_at: string | null;
  iqa_reviewed_at: string | null;
  turnaround_days: number | null;
}

export interface TrainerPerformanceDetailResponse {
  success: boolean;
  message: string;
  data: {
    trainer: {
      id: string;
      name: string;
      email: string;
      is_active: boolean;
    };
    summary: TrainerPerformanceDetailSummary;
    qualification_breakdown: TrainerPerformanceDetailQualificationBreakdown[];
    submission_type_breakdown: TrainerPerformanceDetailSubmissionTypeBreakdown;
    recent_reviews: {
      count: number;
      next: string | null;
      previous: string | null;
      results: TrainerPerformanceDetailRecentReview[];
    };
  };
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


export interface IQASamplingConfig {
  random_percentage: number;
  new_trainer_percentage: number;
  resubmission_always_sampled: boolean;
  escalation_always_sampled: boolean;
  audit_window_months: number;
  created_at: string;
  updated_at: string;
}

export interface CourseSamplingPlanQualification {
  id: string;
  title: string;
  qualification_code: string;
}

export interface CourseSamplingPlanActor {
  id: string;
  name: string;
  email: string;
}

export interface CourseSamplingPlanItem {
  qualification: CourseSamplingPlanQualification;
  sampling_rate_percent: number;
  sample_all: boolean;
  created_by: CourseSamplingPlanActor;
  created_at: string;
  updated_at: string;
}

export interface CourseSamplingPlanWritePayload {
  qualification_id?: string;
  sampling_rate_percent?: number;
  sample_all?: boolean;
}

export interface UnitIQASampleTriggerSubmission {
  id: string;
  submission_type: string;
  status: string;
  submitted_at: string | null;
  outcome_set_at: string | null;
}

export interface UnitIQASampleItem {
  id: string;
  enrolment_id: string;
  learner: {
    id: string;
    name: string;
    qualification_learner_id: string;
  };
  qualification: {
    id: string;
    title: string;
  };
  unit: {
    id: string;
    code: string;
    title: string;
  };
  trainer: {
    id: string;
    name: string;
  };
  sampling_decision: 'sampled' | 'not_sampled';
  sampling_reason:
    | 'random'
    | 'new_trainer'
    | 'resubmission'
    | 'escalation'
    | 'course_sample_all'
    | 'not_selected';
  resolved_rate_percent: number;
  review_status:
    | 'pending'
    | 'in_progress'
    | 'approved'
    | 'action_required'
    | 'trainer_review'
    | 'escalated'
    | 'auto_cleared';
  sampled_at: string;
  reviewed_at: string | null;
  iqa_reviewer: {
    id: string;
    name: string;
  } | null;
  trigger_submission: UnitIQASampleTriggerSubmission;
  review_comments: string;
  vacs_responses: Record<string, unknown>;
  action_type: string;
  affected_criteria: string[];
  manually_sampled: boolean;
}

export interface UnitIQASampleListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: UnitIQASampleItem[];
}

export interface UnitIQASampleListParams {
  status?: string;
  trainer?: string;
  qualification?: string;
  sampling_decision?: string;
  date_from?: string;
  date_to?: string;
  mine?: boolean | string;
}

export interface UnitIQASampleDecisionPayload {
  decision: 'approved' | 'action_required' | 'escalated';
  comments?: string;
  vacs?: Record<string, unknown>;
  action_type?: string;
  affected_criteria?: string[];
}

export interface UnitIQAManualSamplePayload {
  reason: string;
}

// ─── New QA Sampling Portal Types ────────────────────────────────────────────

export interface QaDashboardQueue {
  pending: number;
  in_progress: number;
  escalated: number;
}

export interface QaDashboardThisMonth {
  approved: number;
  action_required: number;
  escalated: number;
}

export interface QaDashboardTotals {
  sampled: number;
  not_sampled: number;
}

export interface QaDashboardData {
  queue: QaDashboardQueue;
  this_month: QaDashboardThisMonth;
  totals: QaDashboardTotals;
}

export interface QaTrainerPerformanceItem {
  trainer: { id: string; name: string };
  total_sampled: number;
  approved: number;
  action_required: number;
  escalated: number;
  pending: number;
  in_progress: number;
  approval_rate_percent: number | null;
}

export interface QaTrainerPerformanceResponse {
  results: QaTrainerPerformanceItem[];
}

export interface UnitIQAFeedbackItem {
  id: string;
  comments: string;
  action_type: string;
  affected_criteria: string[];
  created_by: { id: string; name: string };
  created_at: string;
}

export interface SampleFeedbackListResponse {
  results: UnitIQAFeedbackItem[];
}

export interface UnitSignOffSampleInfo {
  id: string;
  sampling_decision: string;
  review_status: string;
}

export interface UnitSignOffItem {
  id: string;
  unit: { id: string; code: string; title: string };
  outcome: string;
  had_resubmission_cycle: boolean;
  signed_off_at: string;
  signed_off_by: { id: string; name: string };
  iqa_sample: UnitSignOffSampleInfo | null;
}

export interface UnitSignOffListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: UnitSignOffItem[];
}

export interface AuditLogItem {
  id: string;
  event_type: string;
  actor: { id: string; name: string } | null;
  entity_type: string;
  entity_id: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface AuditLogListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: AuditLogItem[];
}
