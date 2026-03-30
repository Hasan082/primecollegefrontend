import { api } from "../api";

export interface CheckboxItem {
  key: string;
  label: string;
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

export interface LearnerDeclarationResponse {
  success: boolean;
  message: string;
  data: {
    template: DeclarationTemplate;
    submission: DeclarationSubmission | null;
  };
}

export interface DeclarationSubmissionResponse {
  success: boolean;
  message: string;
  data: DeclarationSubmission;
}

export interface AdminDeclarationTemplateResponse {
  success: boolean;
  message: string;
  data: DeclarationTemplate;
}

export const enrolmentDeclarationApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Admin Endpoints
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

    // Learner Endpoints
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
  }),
});

export const {
  useGetAdminDeclarationTemplateQuery,
  useCreateAdminDeclarationTemplateMutation,
  useUpdateAdminDeclarationTemplateMutation,
  useGetLearnerDeclarationQuery,
  useSubmitLearnerDeclarationMutation,
} = enrolmentDeclarationApi;
