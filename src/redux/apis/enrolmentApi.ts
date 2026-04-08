import { EnrollmentAdminProgressResponse, EnrolmentContentResponse, EnrolmentListResponse, EvidenceSubmissionResponse } from "@/types/enrollment.types";
import { api } from "../api";
import { cleanObject } from "@/utils/cleanObject";


const enrolmentApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getEnrolments: builder.query<EnrolmentListResponse, void>({
      query: () => ({
        url: "/api/enrolments/me/",
        method: "GET",
      }),
      providesTags: ["Enrolments"],
    }),
    getEnrolmentContent: builder.query<EnrolmentContentResponse, string>({
      query: (enrolmentId) => ({
        url: `/api/enrolments/me/${enrolmentId}/content/`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Enrolments", id }],
    }),
    submitEvidence: builder.mutation<EvidenceSubmissionResponse, { enrolmentId: string; unitId: string; body: FormData }>({
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
  useGetEnrolmentsQuery,
  useGetEnrolmentContentQuery,
  useSubmitEvidenceMutation,
  useGetEnrollmentAdminProgressQuery,
} = enrolmentApi;
