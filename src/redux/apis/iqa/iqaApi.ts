import { cleanObject } from "@/utils/cleanObject";
import { api } from "../../api";
import type {
  ChecklistCompletion,
  ChecklistCompletionCreatePayload,
  ChecklistCompletionListResponse,
  ChecklistQualificationOption,
  ChecklistTemplateListResponse,
  IQAAssignedEnrolmentListResponse,
  IQABulkReviewPayload,
  IQABulkReviewResponse,
  IQADashboardResponse,
  IQAEnrolmentContentResponse,
  IQAEvidenceSubmissionDetailResponse,
  IQAEvidenceSubmissionReviewPayload,
  IQAEvidenceSubmissionReviewResponse,
  IQAReviewQueueResponse,
  IQASubmissionHistoryResponse,
  IQASamplingConfig,
  IQAWrittenAssignmentResponse,
  IQAWrittenAssignmentDetailResponse,
  IQAWrittenAssignmentReviewPayload,
  IQAWrittenAssignmentReviewResponse,
  SamplingPlan,
  SamplingPlanListResponse,
  SamplingPlanWritePayload,
  SubmissionAdminConcernCreatePayload,
  SubmissionAdminConcernResponse,
  TrainerPerformanceResponse,
  CourseSamplingPlanItem,
  CourseSamplingPlanWritePayload,
  UnitIQAManualSamplePayload,
  UnitIQASampleDecisionPayload,
  UnitIQASampleItem,
  UnitIQASampleListParams,
  UnitIQASampleListResponse,
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
    getIqaSubmissionHistory: builder.query<
      IQASubmissionHistoryResponse,
      { enrolmentId: string; unitId: string }
    >({
      query: ({ enrolmentId, unitId }) => ({
        url: `/api/enrolments/iqa/${enrolmentId}/units/${unitId}/submission-history/`,
        method: "GET",
      }),
      providesTags: (_result, _error, { enrolmentId, unitId }) => [
        { type: "Enrolments", id: `IQA_HISTORY_${enrolmentId}_${unitId}` },
      ],
    }),
    getIqaWrittenAssignment: builder.query<
      IQAWrittenAssignmentResponse,
      { enrolmentId: string; unitId: string }
    >({
      query: ({ enrolmentId, unitId }) => ({
        url: `/api/enrolments/iqa/${enrolmentId}/units/${unitId}/written-assignment/`,
        method: "GET",
      }),
      providesTags: (_result, _error, { enrolmentId, unitId }) => [
        { type: "Enrolments", id: `IQA_WRITTEN_${enrolmentId}_${unitId}` },
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
    submitIqaBulkReview: builder.mutation<IQABulkReviewResponse, IQABulkReviewPayload>({
      query: (body) => ({
        url: "/api/enrolments/iqa/bulk-review/",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Enrolments"],
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
    getIqaSamplingConfig: builder.query<IQASamplingConfig, void>({
      query: () => ({
        url: "/api/iqa/sampling-config/",
        method: "GET",
      }),
      transformResponse: (response: { data: IQASamplingConfig }) =>
        response.data ?? (response as unknown as IQASamplingConfig),
      providesTags: ["Enrolments"],
    }),
    updateIqaSamplingConfig: builder.mutation<
      IQASamplingConfig,
      Partial<IQASamplingConfig>
    >({
      query: (body) => ({
        url: "/api/iqa/sampling-config/",
        method: "PATCH",
        body,
      }),
      transformResponse: (response: { data: IQASamplingConfig }) =>
        response.data ?? (response as unknown as IQASamplingConfig),
      invalidatesTags: ["Enrolments"],
    }),
    getCourseSamplingPlans: builder.query<
      CourseSamplingPlanItem[],
      { qualification_id?: string } | void
    >({
      query: (args) => ({
        url: "/api/iqa/course-sampling-plans/",
        method: "GET",
        params: cleanObject(args || {}),
      }),
      transformResponse: (response: { data: CourseSamplingPlanItem[] } | CourseSamplingPlanItem[]) =>
        Array.isArray(response) ? response : (response.data ?? []),
      providesTags: ["Enrolments"],
    }),
    createCourseSamplingPlan: builder.mutation<
      CourseSamplingPlanItem,
      CourseSamplingPlanWritePayload
    >({
      query: (body) => ({
        url: "/api/iqa/course-sampling-plans/",
        method: "POST",
        body,
      }),
      transformResponse: (response: { data: CourseSamplingPlanItem } | CourseSamplingPlanItem) =>
        (response as { data: CourseSamplingPlanItem }).data ?? (response as CourseSamplingPlanItem),
      invalidatesTags: ["Enrolments"],
    }),
    updateCourseSamplingPlan: builder.mutation<
      CourseSamplingPlanItem,
      { qualificationId: string; body: Partial<CourseSamplingPlanWritePayload> }
    >({
      query: ({ qualificationId, body }) => ({
        url: `/api/iqa/course-sampling-plans/${qualificationId}/`,
        method: "PATCH",
        body,
      }),
      transformResponse: (response: { data: CourseSamplingPlanItem } | CourseSamplingPlanItem) =>
        (response as { data: CourseSamplingPlanItem }).data ?? (response as CourseSamplingPlanItem),
      invalidatesTags: ["Enrolments"],
    }),
    getIqaSamples: builder.query<
      UnitIQASampleListResponse,
      UnitIQASampleListParams | void
    >({
      query: (args) => ({
        url: "/api/iqa/samples/",
        method: "GET",
        params: cleanObject(args || {}),
      }),
      providesTags: ["Enrolments"],
    }),
    getIqaSampleDetail: builder.query<UnitIQASampleItem, string>({
      query: (sampleId) => ({
        url: `/api/iqa/samples/${sampleId}/`,
        method: "GET",
      }),
      providesTags: (_result, _error, sampleId) => [
        { type: "Enrolments", id: `IQA_SAMPLE_${sampleId}` },
      ],
    }),
    startIqaSampleReview: builder.mutation<UnitIQASampleItem, string>({
      query: (sampleId) => ({
        url: `/api/iqa/samples/${sampleId}/start-review/`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, sampleId) => [
        { type: "Enrolments", id: `IQA_SAMPLE_${sampleId}` },
        "Enrolments",
      ],
    }),
    submitIqaSampleDecision: builder.mutation<
      UnitIQASampleItem,
      { sampleId: string; body: UnitIQASampleDecisionPayload }
    >({
      query: ({ sampleId, body }) => ({
        url: `/api/iqa/samples/${sampleId}/decision/`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, { sampleId }) => [
        { type: "Enrolments", id: `IQA_SAMPLE_${sampleId}` },
        "Enrolments",
      ],
    }),
    manualSampleIqaUnit: builder.mutation<
      UnitIQASampleItem,
      { sampleId: string; body: UnitIQAManualSamplePayload }
    >({
      query: ({ sampleId, body }) => ({
        url: `/api/iqa/samples/${sampleId}/manual-sample/`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, { sampleId }) => [
        { type: "Enrolments", id: `IQA_SAMPLE_${sampleId}` },
        "Enrolments",
      ],
    }),
    getTrainerPerformance: builder.query<
      TrainerPerformanceResponse,
      Record<string, unknown> | void
    >({
      query: (args) => ({
        url: "/api/enrolments/iqa/trainer-performance/",
        method: "GET",
        params: cleanObject(args || {}),
      }),
      providesTags: ["Enrolments"],
    }),
  }),
});

export const {
  useGetIqaDashboardQuery,
  useGetIqaReviewQueueQuery,
  useGetIqaAssignedEnrolmentsQuery,
  useGetIqaEnrolmentContentQuery,
  useGetIqaSubmissionHistoryQuery,
  useGetIqaWrittenAssignmentQuery,
  useGetIqaWrittenSubmissionDetailQuery,
  useSubmitIqaWrittenReviewMutation,
  useRaiseIqaWrittenConcernMutation,
  useGetIqaEvidenceSubmissionDetailQuery,
  useSubmitIqaEvidenceReviewMutation,
  useSubmitIqaBulkReviewMutation,
  useRaiseIqaEvidenceConcernMutation,
  useGetChecklistTemplatesForIqaQuery,
  useGetChecklistQualificationOptionsQuery,
  useGetChecklistCompletionsQuery,
  useGetChecklistCompletionDetailQuery,
  useCreateChecklistCompletionMutation,
  useGetSamplingPlansQuery,
  useCreateSamplingPlanMutation,
  useUpdateSamplingPlanMutation,
  useGetIqaSamplingConfigQuery,
  useUpdateIqaSamplingConfigMutation,
  useGetCourseSamplingPlansQuery,
  useCreateCourseSamplingPlanMutation,
  useUpdateCourseSamplingPlanMutation,
  useGetIqaSamplesQuery,
  useGetIqaSampleDetailQuery,
  useStartIqaSampleReviewMutation,
  useSubmitIqaSampleDecisionMutation,
  useManualSampleIqaUnitMutation,
  useGetTrainerPerformanceQuery,
} = iqaApi;

export default iqaApi;
