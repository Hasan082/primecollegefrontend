/* eslint-disable @typescript-eslint/no-explicit-any */
export interface EvidenceFile {
    id: string;
    file: string;
    file_name: string;
    file_size: string;
}

export interface EvidenceSubmission {
    id: string;
    enrolment: string;
    unit: string;
    evidence_ref: string;
    description: string;
    linked_criteria: string[];
    status:
    | "submitted"
    | "under_review"
    | "competent"
    | "resubmission_required"
    | "not_yet_competent";
    submitted_at: string;
    files: EvidenceFile[];
}

export interface EvidenceSubmissionResponse {
    success: boolean;
    message: string;
    data: EvidenceSubmission;
}

export interface LearnerSubmissionActor {
    id: string;
    name: string;
    email: string;
    role: string;
}

export interface LearnerWrittenAssignmentConfig {
    id: string;
    title: string;
    instructions: string;
    min_words: number;
    max_words: number;
    is_active: boolean;
    version: number;
    required_criteria?: string[];
}

export interface LearnerWrittenAssignmentSnapshot {
    version: number;
    title: string;
    instructions: string;
    min_words: number;
    max_words: number;
}

export interface LearnerWrittenAssignmentSubmission {
    id: string;
    submission_number: number;
    title: string;
    submission_type: string;
    assignment_snapshot?: LearnerWrittenAssignmentSnapshot;
    response_html: string;
    response_word_count: number;
    declaration_signed: boolean;
    declaration_signed_at: string | null;
    status: string;
    submitted_at: string;
    outcome_set_at: string | null;
    assessor: LearnerSubmissionActor | null;
    assessor_score: number | null;
    assessor_score_max: number | null;
    assessor_band: string | null;
    assessor_feedback: string;
    assessor_feedback_file: string | null;
    iqa_sampled: boolean;
    iqa_reviewer: LearnerSubmissionActor | null;
    iqa_review_notes: string;
    iqa_decision: string | null;
    iqa_reviewed_at: string | null;
}

export interface LearnerWrittenAssignmentResponse {
    success: boolean;
    message: string;
    data: {
        config: LearnerWrittenAssignmentConfig;
        submissions: LearnerWrittenAssignmentSubmission[];
    };
}

export interface LearnerWrittenAssignmentSubmissionResponse {
    success: boolean;
    message: string;
    data: LearnerWrittenAssignmentSubmission;
}

export interface LearnerEvidenceCriterion {
    id: string;
    code: string;
    description: string;
}

export interface LearnerEvidenceItem {
    id: string;
    title: string;
    description: string;
    file: string;
    criteria: LearnerEvidenceCriterion[];
    display_order: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface LearnerEvidencePortfolioConfig {
    id: string;
    instructions: string;
    accepted_file_types: string[];
    max_files_per_submission: number;
    max_file_size_mb: number;
    require_criteria_linking: boolean;
    require_evidence_description: boolean;
    example_evidence: string;
    required_criteria: string[];
    is_active: boolean;
}

export interface LearnerEvidenceSubmission {
    id: string;
    submission_number: number;
    title: string;
    submission_type: string;
    declaration_signed: boolean;
    declaration_signed_at: string | null;
    status: string;
    submitted_at: string;
    outcome_set_at: string | null;
    assessor: LearnerSubmissionActor | null;
    assessor_score: number | null;
    assessor_score_max: number | null;
    assessor_band: string | null;
    assessor_feedback: string;
    assessor_feedback_file: string | null;
    iqa_sampled: boolean;
    iqa_reviewer: LearnerSubmissionActor | null;
    iqa_review_notes: string;
    iqa_decision: string | null;
    iqa_reviewed_at: string | null;
    evidence_items: LearnerEvidenceItem[];
}

export interface LearnerEvidenceSubmissionListResponse {
    success: boolean;
    message: string;
    data: {
        config: LearnerEvidencePortfolioConfig;
        submissions: LearnerEvidenceSubmission[];
    };
}

// ==================== Enrolment List ====================
export interface EnrolmentListItem {
    id: string;
    enrolment_number: string;
    status: string;
    payment_status: string;
    enrolled_at: string;
    access_expires_at: string | null;
    completed_at: string | null;
    qualification: {
        id: string;
        title: string;
        slug: string;
        qualification_code: string;
        category: string;
        is_session: boolean;
    };
    overall_progress: {
        completed_units: number;
        total_units: number;
        progress_percent: number;
    };
    access_expired: boolean;
    status_badge: string;
}

export interface EnrolmentListResponse {
    success: boolean;
    message: string;
    data: EnrolmentListItem[];
}

// ==================== Enrolment Overview ====================
export interface EnrolmentOverviewUnitProgress {
    status: string;
    competency_status?: string | null;
    started_at: string | null;
    completed_at: string | null;
    time_spent_seconds: number;
    min_time_met: boolean;
    is_locked: boolean;
}

export interface EnrolmentOverviewUnit {
    id: string;
    title: string;
    unit_code: string;
    description: string;
    order: number;
    display_status: string;
    progress: EnrolmentOverviewUnitProgress | null;
}

export interface EnrolmentOverviewResponse {
    success: boolean;
    message: string;
    data: {
        id: string;
        status: string;
        access_expires_at: string | null;
        access_expired: boolean;
        qualification: {
            id: string;
            title: string;
            slug: string;
            is_cpd: boolean;
            code?: string;
            requires_learner_declaration?: boolean;
            requires_course_evaluation?: boolean;
        };
        overall_progress: {
            completed_units: number;
            total_units: number;
            progress_percent: number;
        };
        status_counts: {
            not_started: number;
            in_progress: number;
            waiting_for_assessor_review: number;
            waiting_for_iqa_review: number;
            competent: number;
            resubmission_required: number;
            not_yet_competent: number;
            completed: number;
        };
        units: EnrolmentOverviewUnit[];
    };
}

export interface LearnerUnitOverviewResource {
    id: string;
    title: string;
    description: string;
    resource_type: string;
    file: string;
    external_url: string;
    estimated_minutes: number;
    is_downloadable: boolean;
    is_required: boolean;
    resource_version: string;
    order: number;
}

export interface LearnerUnitQuizSummary {
    enabled: boolean;
    attempts_used: number;
    passed: boolean;
    score_percent: string | null;
    score_summary_text: string;
    correct_count: number;
    total_questions: number;
    pass_mark: number | null;
    submitted_at: string | null;
    can_retake: boolean;
}

export interface LearnerUnitWrittenAssignmentSummary {
    enabled: boolean;
    title: string;
    min_words: number;
    max_words: number;
    submission_count: number;
    latest_submission_status: string | null;
    latest_submitted_at: string | null;
    latest_assessor_score: number | null;
    latest_assessor_score_max: number | null;
}

export interface LearnerUnitEvidencePortfolioSummary {
    enabled: boolean;
    submission_count: number;
    evidence_item_count: number;
    latest_submission_status: string | null;
    latest_submitted_at: string | null;
    latest_assessor_score: number | null;
    latest_assessor_score_max: number | null;
}

export interface LearnerUnitOverviewResponse {
    success: boolean;
    message: string;
    data: {
        id: string;
        title: string;
        unit_code: string;
        description: string;
        order: number;
        has_quiz: boolean;
        has_written_assignment: boolean;
        requires_evidence: boolean;
        display_status: string;
        progress: EnrolmentOverviewUnitProgress | null;
        resources: LearnerUnitOverviewResource[];
        quiz_summary: LearnerUnitQuizSummary;
        written_assignment_summary: LearnerUnitWrittenAssignmentSummary;
        evidence_portfolio_summary: LearnerUnitEvidencePortfolioSummary;
    };
}

// ==================== Enrolment Content ====================
export interface EnrolmentContent {
    id: string;
    enrolment_number: string;
    status: string;
    payment_status: string;
    enrolled_at: string;
    access_expires_at: string | null;
    completed_at: string | null;
    access_expired: boolean;
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
        code?: string;
        requires_learner_declaration?: boolean;
        requires_course_evaluation?: boolean;
    };
    units: {
        id: string;
        title: string;
        unit_code: string;
        description: string;
        order: number;
        has_quiz: boolean;
        has_written_assignment: boolean;
        requires_evidence: boolean;
        resources: any[];
        progress: {
            status: string;
            competency_status?: string | null;
            started_at: string | null;
            completed_at: string | null;
            quiz_passed: boolean;
            evidence_met: boolean;
            assignment_met: boolean;
        } | null;
    }[];
}

export interface EnrolmentContentResponse {
    success: boolean;
    message: string;
    data: EnrolmentContent;
}

// ==================== Admin Progress ====================
export type RiskStatus = "at_risk" | "on_track" | "completing";

export interface EnrollmentAdminProgressSummary {
    avg_progress: number;
    at_risk_count: number;
    on_track_count: number;
    completing_count: number;
}

export interface EnrollmentAdminProgressItem {
    enrolment_id: string;
    enrolment_number: string;
    learner: {
        id: string;
        name: string;
    };
    qualification: {
        id: string;
        title: string;
    };
    trainer: {
        id: string | null;
        name: string;
    };
    progress: {
        completed_units: number;
        total_units: number;
        progress_percent: number;
    };
    risk_status: RiskStatus | string;
    enrolled_at: string;
}

export interface EnrollmentAdminProgressResponse {
    success: boolean;
    message: string;
    data: {
        summary: EnrollmentAdminProgressSummary;
        results: EnrollmentAdminProgressItem[];
    };
}
