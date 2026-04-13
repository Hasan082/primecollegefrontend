import { cleanObject } from "@/utils/cleanObject";
import { api } from "../../api";
import type {
  ChecklistCompletion,
  ChecklistCompletionCreatePayload,
  ChecklistCompletionListResponse,
  ChecklistQualificationOption,
  ChecklistTemplateListResponse,
  IQAAssignedEnrolmentListResponse,
  IQADashboardResponse,
  IQAEnrolmentContentResponse,
  IQAEvidenceSubmissionDetailResponse,
  IQAEvidenceSubmissionReviewPayload,
  IQAEvidenceSubmissionReviewResponse,
  IQAReviewQueueResponse,
  IQAWrittenAssignmentDetailResponse,
  IQAWrittenAssignmentReviewPayload,
  IQAWrittenAssignmentReviewResponse,
  SamplingPlan,
  SamplingPlanListResponse,
  SamplingPlanWritePayload,
  SubmissionAdminConcernCreatePayload,
  SubmissionAdminConcernResponse,
} from "@/types/iqa.types";

const iqaApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getIqaDashboard: builder.query<IQADashboardResponse, void>({
      query: () => ({
        url: "/api/enrolments/iqa/dashboard/",
        method: "GET",
      }),
      providesTags: ["Enrolments"],
    }),
    getIqaReviewQueue: builder.query<
      IQAReviewQueueResponse,
      { status?: string; qualification_id?: string; trainer_id?: string } | void
    >({
      query: (args) => ({
        url: "/api/enrolments/iqa/review-queue/",
        method: "GET",
        params: cleanObject(args || {}),
      }),
      providesTags: ["Enrolments"],
    }),
    getIqaAssignedEnrolments: builder.query<
      IQAAssignedEnrolmentListResponse,
      Record<string, unknown> | void
    >({
      query: (args) => {
        const filteredParams = cleanObject(args || {});
        return {
          url: "/api/enrolments/iqa/my-enrolments/",
          method: "GET",
          params: filteredParams,
        };
      },
      providesTags: ["Enrolments"],
    }),
    getIqaEnrolmentContent: builder.query<IQAEnrolmentContentResponse, string>({
      query: (enrolmentId) => ({
        url: `/api/enrolments/iqa/${enrolmentId}/content/`,
        method: "GET",
      }),
      providesTags: (_result, _error, enrolmentId) => [
        { type: "Enrolments", id: enrolmentId },
      ],
    }),
    getIqaWrittenSubmissionDetail: builder.query<
      IQAWrittenAssignmentDetailResponse,
      string
    >({
      query: (submissionId) => ({
        url: `/api/enrolments/submissions/${submissionId}/`,
        method: "GET",
      }),
      providesTags: (_result, _error, submissionId) => [
        { type: "Enrolments", id: `SUBMISSION_${submissionId}` },
      ],
    }),
    submitIqaWrittenReview: builder.mutation<
      IQAWrittenAssignmentReviewResponse,
      { submissionId: string; body: IQAWrittenAssignmentReviewPayload }
    >({
      query: ({ submissionId, body }) => ({
        url: `/api/enrolments/iqa/submissions/${submissionId}/review/`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, { submissionId }) => [
        { type: "Enrolments", id: `SUBMISSION_${submissionId}` },
        "Enrolments",
      ],
    }),
    raiseIqaWrittenConcern: builder.mutation<
      SubmissionAdminConcernResponse,
      { submissionId: string; body: SubmissionAdminConcernCreatePayload }
    >({
      query: ({ submissionId, body }) => ({
        url: `/api/enrolments/iqa/submissions/${submissionId}/concerns/`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Enrolments"],
    }),
    getIqaEvidenceSubmissionDetail: builder.query<
      IQAEvidenceSubmissionDetailResponse,
      string
    >({
      query: (submissionId) => ({
        url: `/api/enrolments/evidence-submissions/${submissionId}/`,
        method: "GET",
      }),
      providesTags: (_result, _error, submissionId) => [
        { type: "Enrolments", id: `EVIDENCE_SUBMISSION_${submissionId}` },
      ],
    }),
    submitIqaEvidenceReview: builder.mutation<
      IQAEvidenceSubmissionReviewResponse,
      { submissionId: string; body: IQAEvidenceSubmissionReviewPayload }
    >({
      query: ({ submissionId, body }) => ({
        url: `/api/enrolments/iqa/evidence-submissions/${submissionId}/review/`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, { submissionId }) => [
        { type: "Enrolments", id: `EVIDENCE_SUBMISSION_${submissionId}` },
        "Enrolments",
      ],
    }),
    raiseIqaEvidenceConcern: builder.mutation<
      SubmissionAdminConcernResponse,
      { submissionId: string; body: SubmissionAdminConcernCreatePayload }
    >({
      query: ({ submissionId, body }) => ({
        url: `/api/enrolments/iqa/evidence-submissions/${submissionId}/concerns/`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Enrolments"],
    }),
    getChecklistTemplatesForIqa: builder.query<
      ChecklistTemplateListResponse,
      Record<string, unknown> | void
    >({
      query: (args) => {
        const filteredParams = cleanObject(args || {});
        return {
          url: "/api/v1/checklists/templates/",
          method: "GET",
          params: filteredParams,
        };
      },
      providesTags: ["ChecklistTemplates"],
    }),
    getChecklistQualificationOptions: builder.query<
      ChecklistQualificationOption[],
      void
    >({
      query: () => ({
        url: "/api/v1/checklists/qualifications/",
        method: "GET",
      }),
      providesTags: ["ChecklistTemplates"],
    }),
    getChecklistCompletions: builder.query<
      ChecklistCompletionListResponse,
      Record<string, unknown> | void
    >({
      query: (args) => {
        const filteredParams = cleanObject(args || {});
        return {
          url: "/api/v1/checklists/completions/",
          method: "GET",
          params: filteredParams,
        };
      },
      providesTags: ["ChecklistCompletions"],
    }),
    getChecklistCompletionDetail: builder.query<ChecklistCompletion, string>({
      query: (completionId) => ({
        url: `/api/v1/checklists/completions/${completionId}/`,
        method: "GET",
      }),
      providesTags: (_result, _error, completionId) => [
        { type: "ChecklistCompletions", id: completionId },
      ],
    }),
    createChecklistCompletion: builder.mutation<
      ChecklistCompletion,
      ChecklistCompletionCreatePayload
    >({
      query: (body) => ({
        url: "/api/v1/checklists/completions/",
        method: "POST",
        body,
      }),
      invalidatesTags: ["ChecklistCompletions"],
    }),
    getSamplingPlans: builder.query<
      SamplingPlanListResponse,
      Record<string, unknown> | void
    >({
      query: (args) => ({
        url: "/api/v1/checklists/sampling-plans/",
        method: "GET",
        params: cleanObject(args || {}),
      }),
      providesTags: ["ChecklistTemplates"],
    }),
    createSamplingPlan: builder.mutation<SamplingPlan, SamplingPlanWritePayload>({
      query: (body) => ({
        url: "/api/v1/checklists/sampling-plans/",
        method: "POST",
        body,
      }),
      invalidatesTags: ["ChecklistTemplates"],
    }),
    updateSamplingPlan: builder.mutation<
      SamplingPlan,
      { planId: string; body: Partial<SamplingPlanWritePayload> }
    >({
      query: ({ planId, body }) => ({
        url: `/api/v1/checklists/sampling-plans/${planId}/`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["ChecklistTemplates"],
    }),
  }),
});

export const {
  useGetIqaDashboardQuery,
  useGetIqaReviewQueueQuery,
  useGetIqaAssignedEnrolmentsQuery,
  useGetIqaEnrolmentContentQuery,
  useGetIqaWrittenSubmissionDetailQuery,
  useSubmitIqaWrittenReviewMutation,
  useRaiseIqaWrittenConcernMutation,
  useGetIqaEvidenceSubmissionDetailQuery,
  useSubmitIqaEvidenceReviewMutation,
  useRaiseIqaEvidenceConcernMutation,
  useGetChecklistTemplatesForIqaQuery,
  useGetChecklistQualificationOptionsQuery,
  useGetChecklistCompletionsQuery,
  useGetChecklistCompletionDetailQuery,
  useCreateChecklistCompletionMutation,
  useGetSamplingPlansQuery,
  useCreateSamplingPlanMutation,
  useUpdateSamplingPlanMutation,
} = iqaApi;

export default iqaApi;
