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
    qualification: {
        id: string;
        title: string;
        slug: string;
        is_cpd: boolean;
        code: string;
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
        feedback: string | null;
        progress: {
            status: string;
            started_at: string | null;
            completed_at: string | null;
            quiz_passed: boolean;
            evidence_met: boolean;
            assignment_met: boolean;
            submitted_at: string | null;
            feedback: string | null;
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