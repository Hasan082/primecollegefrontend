import {
  EnrollmentAdminProgressResponse,
  EnrolmentContentResponse,
  EnrolmentOverviewResponse,
  LearnerUnitOverviewResponse,
  EnrolmentListResponse,
  EvidenceSubmissionResponse,
  LearnerEvidenceSubmissionListResponse,
  LearnerWrittenAssignmentResponse,
  LearnerWrittenAssignmentSubmissionResponse,
} from "@/types/enrollment.types";
import { api } from "../api";
import { cleanObject } from "@/utils/cleanObject";

export interface LearnerDashboardSummary {
  enrolled: number;
  awaiting_assessment: number;
  awaiting_iqa: number;
  competent: number;
  resubmission_required: number;
}

export interface LearnerDashboardExpiredQualification {
  enrolment_id: string;
  qualification_id: string;
  qualification_title: string;
  access_expires_at: string;
  days_overdue: number;
}

export interface LearnerDashboardUpcomingDeadline {
  enrolment_id: string;
  qualification_id: string;
  qualification_title: string;
  unit_id: string;
  unit_code: string;
  unit_title: string;
  due_at: string;
  days_remaining: number;
  severity: "warning" | "urgent";
}

export interface LearnerDashboardRecentActivity {
  type: string;
  label: string;
  detail: string;
  date: string;
  enrolment_id?: string | null;
  qualification_id?: string | null;
  unit_id?: string | null;
}

export interface LearnerDashboardResponse {
  success: boolean;
  message: string;
  data: {
    summary: LearnerDashboardSummary;
    expired_qualifications: LearnerDashboardExpiredQualification[];
    upcoming_unit_deadlines: LearnerDashboardUpcomingDeadline[];
    recent_activity: LearnerDashboardRecentActivity[];
  };
}

export interface LearnerExtensionPlan {
  id: string;
  label: string;
  duration_mode: "preset" | "custom";
  duration_months: number;
  amount: string;
  currency: string;
  sort_order: number;
  is_active: boolean;
}

export interface LearnerExtensionPlansResponse {
  success: boolean;
  message: string;
  data: LearnerExtensionPlan[];
}

export interface LearnerExtensionOrder {
  id: string;
  status: string;
  plan_id: string;
  plan_label: string;
  extension_months: number;
  amount: string;
  currency: string;
  qualification_title: string;
  previous_access_expires_at: string | null;
  extended_access_expires_at: string;
  current_access_expires_at: string | null;
  paid_at: string | null;
  payment_reference: string;
  order: {
    id: string;
    order_number: string;
    currency?: string;
    grand_total?: string;
    customer_email?: string;
  };
}

export interface LearnerExtensionOrderCreateResponse {
  success: boolean;
  message: string;
  data: {
    extension_order: LearnerExtensionOrder;
    available_plans: LearnerExtensionPlan[];
    payment_intent_client_secret: string;
    stripe_payment_intent_id: string;
    stripe_customer_id: string;
    stripe_publishable_key: string;
  };
}

export interface LearnerExtensionOrderStatusResponse {
  success: boolean;
  message: string;
  data: LearnerExtensionOrder;
}

export interface EvidenceFilePresignResponse {
  success: boolean;
  message: string;
  file_key: string;
  data: {
    file_key: string;
    key: string;
    upload_url: string;
    fields: Record<string, string>;
    max_file_size_mb: number;
  };
}

export interface EvidenceSubmissionJsonPayload {
  title?: string;
  description: string;
  declaration_signed: boolean;
  criteria_ids: string[];
  file_keys: string[];
}

export interface CpdUnitCompleteResponse {
  success: boolean;
  message: string;
  data: {
    status: string;
    competency_status?: string | null;
    started_at: string | null;
    completed_at: string | null;
    time_spent_seconds: number;
    min_time_met: boolean;
    is_locked: boolean;
  };
}

const enrolmentApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getLearnerDashboard: builder.query<LearnerDashboardResponse, void>({
      query: () => ({
        url: "/api/enrolments/me/dashboard/",
        method: "GET",
      }),
      providesTags: ["Enrolments"],
    }),
    getEnrolments: builder.query<EnrolmentListResponse, void>({
      query: () => ({
        url: "/api/enrolments/me/",
        method: "GET",
      }),
      providesTags: ["Enrolments"],
    }),
    getEnrolmentOverview: builder.query<EnrolmentOverviewResponse, string>({
      query: (enrolmentId) => ({
        url: `/api/enrolments/me/${enrolmentId}/overview/`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Enrolments", id }],
    }),
    getLearnerUnitOverview: builder.query<
      LearnerUnitOverviewResponse,
      { enrolmentId: string; unitId: string }
    >({
      query: ({ enrolmentId, unitId }) => ({
        url: `/api/enrolments/me/${enrolmentId}/units/${unitId}/overview/`,
        method: "GET",
      }),
      providesTags: (result, error, { enrolmentId, unitId }) => [
        { type: "Enrolments", id: enrolmentId },
        { type: "Enrolments", id: `UNIT_${unitId}` },
      ],
    }),
    markCpdUnitComplete: builder.mutation<
      CpdUnitCompleteResponse,
      { enrolmentId: string; unitId: string }
    >({
      query: ({ enrolmentId, unitId }) => ({
        url: `/api/enrolments/me/${enrolmentId}/units/${unitId}/cpd-complete/`,
        method: "POST",
        body: {},
      }),
      invalidatesTags: (_result, _error, { enrolmentId, unitId }) => [
        { type: "Enrolments", id: enrolmentId },
        { type: "Enrolments", id: `UNIT_${unitId}` },
        { type: "CertificateProgress", id: enrolmentId },
      ],
    }),
    getEnrolmentContent: builder.query<EnrolmentContentResponse, string>({
      query: (enrolmentId) => ({
        url: `/api/enrolments/me/${enrolmentId}/content/`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Enrolments", id }],
    }),
    getLearnerWrittenAssignment: builder.query<
      LearnerWrittenAssignmentResponse,
      { enrolmentId: string; unitId: string }
    >({
      query: ({ enrolmentId, unitId }) => ({
        url: `/api/enrolments/me/${enrolmentId}/units/${unitId}/written-assignment/`,
        method: "GET",
      }),
      providesTags: (result, error, { enrolmentId, unitId }) => [
        { type: "Enrolments", id: enrolmentId },
        { type: "Enrolments", id: `UNIT_${unitId}` },
        { type: "Enrolments", id: `WRITTEN_${unitId}` },
      ],
    }),
    submitWrittenAssignment: builder.mutation<
      LearnerWrittenAssignmentSubmissionResponse,
      { enrolmentId: string; unitId: string; body: { response_html: string; declaration_signed: boolean } }
    >({
      query: ({ enrolmentId, unitId, body }) => ({
        url: `/api/enrolments/me/${enrolmentId}/units/${unitId}/written-assignment/submissions/`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, { enrolmentId, unitId }) => [
        { type: "Enrolments", id: enrolmentId },
        { type: "Enrolments", id: `UNIT_${unitId}` },
        { type: "Enrolments", id: `WRITTEN_${unitId}` },
      ],
    }),
    getLearnerEvidenceSubmissions: builder.query<
      LearnerEvidenceSubmissionListResponse,
      { enrolmentId: string; unitId: string }
    >({
      query: ({ enrolmentId, unitId }) => ({
        url: `/api/enrolments/me/${enrolmentId}/units/${unitId}/evidence-submissions/`,
        method: "GET",
      }),
      providesTags: (result, error, { enrolmentId, unitId }) => [
        { type: "Enrolments", id: enrolmentId },
        { type: "Enrolments", id: `UNIT_${unitId}` },
        { type: "Enrolments", id: `EVIDENCE_${unitId}` },
      ],
    }),
    getLearnerExtensionPlans: builder.query<LearnerExtensionPlansResponse, string>({
      query: (enrolmentId) => ({
        url: `/api/enrolments/me/${enrolmentId}/extension-plans/`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Enrolments", id }, "ExtensionPlans"],
    }),
    createLearnerExtensionOrder: builder.mutation<
      LearnerExtensionOrderCreateResponse,
      { enrolmentId: string; plan_id: string }
    >({
      query: ({ enrolmentId, plan_id }) => ({
        url: `/api/enrolments/me/${enrolmentId}/extension-order/`,
        method: "POST",
        body: { plan_id },
      }),
      invalidatesTags: (result, error, { enrolmentId }) => [{ type: "Enrolments", id: enrolmentId }, "Enrolments"],
    }),
    getLearnerExtensionOrderStatus: builder.query<
      LearnerExtensionOrderStatusResponse,
      { enrolmentId: string; orderId: string }
    >({
      query: ({ enrolmentId, orderId }) => ({
        url: `/api/enrolments/me/${enrolmentId}/extension-orders/${orderId}/`,
        method: "GET",
      }),
      providesTags: (result, error, { enrolmentId, orderId }) => [
        { type: "Enrolments", id: enrolmentId },
        { type: "Enrolments", id: `EXT_ORDER_${orderId}` },
      ],
    }),
    presignEvidenceFile: builder.mutation<
      EvidenceFilePresignResponse,
      { enrolmentId: string; unitId: string; file_name: string; content_type: string }
    >({
      query: ({ enrolmentId, unitId, file_name, content_type }) => ({
        url: `/api/enrolments/me/${enrolmentId}/units/${unitId}/evidence-submissions/presign/`,
        method: "POST",
        body: { file_name, content_type },
      }),
    }),
    submitEvidence: builder.mutation<EvidenceSubmissionResponse, { enrolmentId: string; unitId: string; body: FormData | EvidenceSubmissionJsonPayload }>({
      query: ({ enrolmentId, unitId, body }) => ({
        url: `/api/enrolments/me/${enrolmentId}/units/${unitId}/evidence-submissions/`,
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, { enrolmentId, unitId }) => [
        { type: "Enrolments", id: enrolmentId },
        { type: "Enrolments", id: `UNIT_${unitId}` },
      ],
    }),
    getCertificateProgress: builder.query<
      {
        issues_certificate: boolean;
        can_download: boolean;
        certificate_issued?: boolean;
        all_units_completed?: boolean;
        units_completed_count?: number;
        total_units?: number;
        final_assessment_passed?: boolean;
        learner_declaration_signed?: boolean;
        course_evaluation_submitted?: boolean;
        blockers: { code: string; message: string }[];
      },
      string
    >({
      query: (enrolmentId) => ({
        url: `/api/enrolments/me/${enrolmentId}/certificate/progress/`,
        method: "GET",
      }),
      providesTags: (_r, _e, id) => [{ type: "CertificateProgress", id }],
    }),
    downloadCertificate: builder.mutation<
      {
        certificate_number: string;
        issued_at: string;
        download_url: string;
        qualification_title: string;
        cpd_hours: string | null;
      },
      string
    >({
      // Intentionally a mutation so the ephemeral pre-signed S3 URL is
      // always freshly generated on each click and never served from cache.
      query: (enrolmentId) => ({
        url: `/api/enrolments/me/${enrolmentId}/certificate/download/`,
        method: "GET",
      }),
    }),
    getEnrollmentAdminProgress: builder.query({
      query: (args) => {
        const filteredParams = cleanObject(args);
        return {
          url: "/api/enrolments/admin/progress-monitoring/",
          method: "GET",
          params: filteredParams,
        };
      },
      transformResponse: (response: any) => response.data,
      // providesTags: ["AdminEnrolmentProgress"],
    }),
  }),
});

export const {
  useGetLearnerDashboardQuery,
  useGetEnrolmentsQuery,
  useGetEnrolmentOverviewQuery,
  useGetLearnerUnitOverviewQuery,
  useMarkCpdUnitCompleteMutation,
  useGetEnrolmentContentQuery,
  useGetLearnerWrittenAssignmentQuery,
  useSubmitWrittenAssignmentMutation,
  useGetLearnerEvidenceSubmissionsQuery,
  usePresignEvidenceFileMutation,
  useGetLearnerExtensionPlansQuery,
  useCreateLearnerExtensionOrderMutation,
  useGetLearnerExtensionOrderStatusQuery,
  useSubmitEvidenceMutation,
  useGetEnrollmentAdminProgressQuery,
  useGetCertificateProgressQuery,
  useDownloadCertificateMutation,
} = enrolmentApi;
