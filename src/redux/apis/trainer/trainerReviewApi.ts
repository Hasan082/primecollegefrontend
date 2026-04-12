import {
  EnrolmentContentResponse,
  LearnerEvidenceSubmissionListResponse,
  LearnerWrittenAssignmentResponse,
} from "@/types/enrollment.types";
import { api } from "../../api";

export interface TrainerDashboardSummary {
  assigned_learners: number;
  pending_assessments: number;
  assessed_this_week: number;
  iqa_actions: number;
}

export interface TrainerDashboardPendingSubmission {
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
    category: string;
  };
  unit: {
    id: string;
    title: string;
    unit_code: string;
  };
  submission_type: string;
  status: string;
  submitted_at: string;
  days_waiting: number;
}

export interface TrainerDashboardAssignedLearner {
  id: string;
  learner: {
    id: string;
    name: string;
    learner_id: string;
    qualification_learner_id: string;
  };
  qualification: {
    id: string;
    title: string;
    category: string;
  };
  progress: {
    completed_units: number;
    total_units: number;
    progress_percent: number;
  };
  pending_count: number;
}

export interface TrainerDashboardRecentAssessment {
  id: string;
  enrolment_id: string;
  learner: {
    id: string;
    name: string;
  };
  unit: {
    id: string;
    title: string;
    unit_code: string;
  };
  submission_type: string;
  status: string;
  assessed_at: string | null;
  assessor_score: number | null;
  assessor_score_max: number | null;
  assessor_band: string | null;
}

export interface TrainerDashboardResponse {
  success: boolean;
  message: string;
  data: {
    summary: TrainerDashboardSummary;
    pending_submissions: TrainerDashboardPendingSubmission[];
    assigned_learners: TrainerDashboardAssignedLearner[];
    recent_assessments: TrainerDashboardRecentAssessment[];
  };
}

export interface TrainerNotification {
  id: string;
  submission_id: string;
  enrolment_id: string;
  learner: {
    id: string;
    name: string;
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
  submission_type: string;
  iqa_decision: string;
  iqa_review_notes: string;
  iqa_reviewed_at: string | null;
}

export interface TrainerNotificationListResponse {
  success: boolean;
  message: string;
  data: TrainerNotification[];
}

export interface TrainerSubmissionRecordResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    submission_number: number;
    title: string;
    submission_type: string;
    status: string;
    submitted_at: string;
    outcome_set_at: string | null;
    response_html: string;
    response_word_count: number;
    assessor_score: number | null;
    assessor_score_max: number | null;
    assessor_band: string | null;
    assessor_feedback: string;
    iqa_decision: string | null;
    iqa_review_notes: string;
    iqa_reviewed_at: string | null;
    learner: {
      id: string;
      name: string;
      qualification_learner_id: string;
    };
    qualification: {
      id: string;
      title: string;
    };
    unit_data: {
      id: string;
      title: string;
      unit_code: string;
    };
    assessor: {
      id: string;
      name: string;
      email: string;
      role: string;
    } | null;
    iqa_reviewer: {
      id: string;
      name: string;
      email: string;
      role: string;
    } | null;
  };
}

const trainerReviewApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getTrainerDashboard: builder.query<TrainerDashboardResponse, void>({
      query: () => ({
        url: "/api/enrolments/trainer/dashboard/",
        method: "GET",
      }),
      providesTags: ["Enrolments"],
    }),
    getTrainerEnrolmentContent: builder.query<EnrolmentContentResponse, string>({
      query: (enrolmentId) => ({
        url: `/api/enrolments/trainer/${enrolmentId}/content/`,
        method: "GET",
      }),
      providesTags: (_result, _error, enrolmentId) => [
        { type: "Enrolments", id: enrolmentId },
      ],
    }),
    getTrainerWrittenAssignment: builder.query<
      LearnerWrittenAssignmentResponse,
      { enrolmentId: string; unitId: string }
    >({
      query: ({ enrolmentId, unitId }) => ({
        url: `/api/enrolments/trainer/${enrolmentId}/units/${unitId}/written-assignment/`,
        method: "GET",
      }),
      providesTags: (_result, _error, { enrolmentId, unitId }) => [
        { type: "Enrolments", id: enrolmentId },
        { type: "Enrolments", id: `TRAINER_WRITTEN_${unitId}` },
      ],
    }),
    reviewTrainerWrittenAssignment: builder.mutation<
      LearnerWrittenAssignmentResponse["data"]["submissions"][number],
      {
        submissionId: string;
        body: {
          status: string;
          assessor_feedback: string;
          assessor_score?: number;
          assessor_score_max?: number;
          assessor_band?: string;
        };
        enrolmentId: string;
        unitId: string;
      }
    >({
      query: ({ submissionId, body }) => ({
        url: `/api/enrolments/trainer/submissions/${submissionId}/review/`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, { enrolmentId, unitId, submissionId }) => [
        { type: "Enrolments", id: enrolmentId },
        { type: "Enrolments", id: `TRAINER_WRITTEN_${unitId}` },
        { type: "Enrolments", id: `SUBMISSION_${submissionId}` },
      ],
    }),
    getTrainerEvidenceSubmissions: builder.query<
      LearnerEvidenceSubmissionListResponse,
      { enrolmentId: string; unitId: string }
    >({
      query: ({ enrolmentId, unitId }) => ({
        url: `/api/enrolments/trainer/${enrolmentId}/units/${unitId}/evidence-submissions/`,
        method: "GET",
      }),
      providesTags: (_result, _error, { enrolmentId, unitId }) => [
        { type: "Enrolments", id: enrolmentId },
        { type: "Enrolments", id: `TRAINER_EVIDENCE_${unitId}` },
      ],
    }),
    reviewTrainerEvidenceSubmission: builder.mutation<
      LearnerEvidenceSubmissionListResponse["data"]["submissions"][number],
      {
        submissionId: string;
        body: {
          status: string;
          assessor_feedback: string;
          assessor_score?: number;
          assessor_score_max?: number;
          assessor_band?: string;
        };
        enrolmentId: string;
        unitId: string;
      }
    >({
      query: ({ submissionId, body }) => ({
        url: `/api/enrolments/trainer/evidence-submissions/${submissionId}/review/`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, { enrolmentId, unitId, submissionId }) => [
        { type: "Enrolments", id: enrolmentId },
        { type: "Enrolments", id: `TRAINER_EVIDENCE_${unitId}` },
        { type: "Enrolments", id: `SUBMISSION_${submissionId}` },
      ],
    }),
    getTrainerNotifications: builder.query<TrainerNotificationListResponse, void>({
      query: () => ({
        url: "/api/enrolments/trainer/notifications/",
        method: "GET",
      }),
      providesTags: ["Enrolments"],
    }),
    getTrainerSubmissionRecord: builder.query<TrainerSubmissionRecordResponse, string>({
      query: (submissionId) => ({
        url: `/api/enrolments/trainer/submissions/${submissionId}/record/`,
        method: "GET",
      }),
      providesTags: (_result, _error, submissionId) => [
        { type: "Enrolments", id: `TRAINER_RECORD_${submissionId}` },
      ],
    }),
  }),
});

export const {
  useGetTrainerDashboardQuery,
  useGetTrainerEnrolmentContentQuery,
  useGetTrainerWrittenAssignmentQuery,
  useReviewTrainerWrittenAssignmentMutation,
  useGetTrainerEvidenceSubmissionsQuery,
  useReviewTrainerEvidenceSubmissionMutation,
  useGetTrainerNotificationsQuery,
  useGetTrainerSubmissionRecordQuery,
} = trainerReviewApi;
