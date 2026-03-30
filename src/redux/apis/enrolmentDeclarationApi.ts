import { api } from "../api";

export interface CheckboxItem {
  key: string;
  label: string;
}

export interface EvaluationQuestion {
  key: string;
  label: string;
  type: "rating" | "textarea" | "single_choice" | "text";
  required: boolean;
  options?: string[];
  placeholder?: string;
}

export interface DeclarationTemplate {
  id: string;
  qualification: string;
  title: string;
  body_text: string;
  checkbox_items: CheckboxItem[];
  version: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DeclarationSubmission {
  id: string;
  submitted_at: string;
  template_version_snapshot: number;
  title_snapshot: string;
  body_text_snapshot: string;
  checkbox_items_snapshot: CheckboxItem[];
  accepted_items: string[];
  typed_full_name: string;
}

export interface EvaluationTemplate {
  id: string;
  qualification: string;
  title: string;
  description: string;
  questions: EvaluationQuestion[];
  version: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EvaluationSubmission {
  id: string;
  submitted_at: string;
  template_version_snapshot: number;
  title_snapshot: string;
  description_snapshot: string;
  questions_snapshot: EvaluationQuestion[];
  answers: Record<string, any>;
}

export interface LearnerDeclarationResponse {
  success: boolean;
  message: string;
  data: {
    template: DeclarationTemplate;
    submission: DeclarationSubmission | null;
  };
}

export interface LearnerEvaluationResponse {
  success: boolean;
  message: string;
  data: {
    template: EvaluationTemplate;
    submission: EvaluationSubmission | null;
  };
}

export interface DeclarationSubmissionResponse {
  success: boolean;
  message: string;
  data: DeclarationSubmission;
}

export interface EvaluationSubmissionResponse {
  success: boolean;
  message: string;
  data: EvaluationSubmission;
}

export interface AdminDeclarationTemplateResponse {
  success: boolean;
  message: string;
  data: DeclarationTemplate;
}

export interface AdminEvaluationTemplateResponse {
  success: boolean;
  message: string;
  data: EvaluationTemplate;
}

export const enrolmentDeclarationApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Declaration Endpoints
    getAdminDeclarationTemplate: builder.query<AdminDeclarationTemplateResponse, string>({
      query: (qualificationId) => ({
        url: `/api/enrolments/admin/qualifications/${qualificationId}/learner-declaration-template/`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "DeclarationTemplate", id }],
    }),
    createAdminDeclarationTemplate: builder.mutation<AdminDeclarationTemplateResponse, { qualificationId: string; payload: Partial<DeclarationTemplate> }>({
      query: ({ qualificationId, payload }) => ({
        url: `/api/enrolments/admin/qualifications/${qualificationId}/learner-declaration-template/`,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: (result, error, { qualificationId }) => [{ type: "DeclarationTemplate", id: qualificationId }],
    }),
    updateAdminDeclarationTemplate: builder.mutation<AdminDeclarationTemplateResponse, { qualificationId: string; payload: Partial<DeclarationTemplate> }>({
      query: ({ qualificationId, payload }) => ({
        url: `/api/enrolments/admin/qualifications/${qualificationId}/learner-declaration-template/`,
        method: "PATCH",
        body: payload,
      }),
      invalidatesTags: (result, error, { qualificationId }) => [{ type: "DeclarationTemplate", id: qualificationId }],
    }),

    getLearnerDeclaration: builder.query<LearnerDeclarationResponse, string>({
      query: (enrolmentId) => ({
        url: `/api/enrolments/me/${enrolmentId}/learner-declaration/`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "LearnerDeclaration", id }],
    }),
    submitLearnerDeclaration: builder.mutation<DeclarationSubmissionResponse, { enrolmentId: string; payload: { accepted_items: string[]; typed_full_name?: string } }>({
      query: ({ enrolmentId, payload }) => ({
        url: `/api/enrolments/me/${enrolmentId}/learner-declaration/submission/`,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: (result, error, { enrolmentId }) => [{ type: "LearnerDeclaration", id: enrolmentId }],
    }),

    // Evaluation Endpoints
    getAdminEvaluationTemplate: builder.query<AdminEvaluationTemplateResponse, string>({
      query: (qualificationId) => ({
        url: `/api/enrolments/admin/qualifications/${qualificationId}/course-evaluation-template/`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "CourseEvaluationTemplate", id }],
    }),
    createAdminEvaluationTemplate: builder.mutation<AdminEvaluationTemplateResponse, { qualificationId: string; payload: Partial<EvaluationTemplate> }>({
      query: ({ qualificationId, payload }) => ({
        url: `/api/enrolments/admin/qualifications/${qualificationId}/course-evaluation-template/`,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: (result, error, { qualificationId }) => [{ type: "CourseEvaluationTemplate", id: qualificationId }],
    }),
    updateAdminEvaluationTemplate: builder.mutation<AdminEvaluationTemplateResponse, { qualificationId: string; payload: Partial<EvaluationTemplate> }>({
      query: ({ qualificationId, payload }) => ({
        url: `/api/enrolments/admin/qualifications/${qualificationId}/course-evaluation-template/`,
        method: "PATCH",
        body: payload,
      }),
      invalidatesTags: (result, error, { qualificationId }) => [{ type: "CourseEvaluationTemplate", id: qualificationId }],
    }),

    getLearnerEvaluation: builder.query<LearnerEvaluationResponse, string>({
      query: (enrolmentId) => ({
        url: `/api/enrolments/me/${enrolmentId}/course-evaluation/`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "CourseEvaluationSubmission", id }],
    }),
    submitLearnerEvaluation: builder.mutation<EvaluationSubmissionResponse, { enrolmentId: string; payload: { answers: Record<string, any> } }>({
      query: ({ enrolmentId, payload }) => ({
        url: `/api/enrolments/me/${enrolmentId}/course-evaluation/submission/`,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: (result, error, { enrolmentId }) => [{ type: "CourseEvaluationSubmission", id: enrolmentId }],
    }),
  }),
});

export const {
  useGetAdminDeclarationTemplateQuery,
  useCreateAdminDeclarationTemplateMutation,
  useUpdateAdminDeclarationTemplateMutation,
  useGetLearnerDeclarationQuery,
  useSubmitLearnerDeclarationMutation,
  useGetAdminEvaluationTemplateQuery,
  useCreateAdminEvaluationTemplateMutation,
  useUpdateAdminEvaluationTemplateMutation,
  useGetLearnerEvaluationQuery,
  useSubmitLearnerEvaluationMutation,
} = enrolmentDeclarationApi;
