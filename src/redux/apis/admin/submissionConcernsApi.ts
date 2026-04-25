import { api } from "@/redux/api";
import { cleanObject } from "@/utils/cleanObject";

export type SubmissionConcernStatus =
  | "open"
  | "in_progress"
  | "resolved"
  | "dismissed";

export type SubmissionConcernSubmissionType = "written" | "evidence";

export interface SubmissionConcernPerson {
  id: string;
  name: string;
  email: string;
  role?: string;
}

export interface SubmissionConcernSubmission {
  id: string;
  submission_number: number;
  title: string;
  submission_type: SubmissionConcernSubmissionType;
  status: string;
  unit_id: string;
  enrolment_id: string;
  learner: SubmissionConcernPerson;
  trainer: SubmissionConcernPerson | null;
}

export interface SubmissionConcern {
  id: string;
  submission: SubmissionConcernSubmission;
  status: SubmissionConcernStatus;
  concern_note: string;
  admin_response_note: string;
  raised_by: SubmissionConcernPerson | null;
  resolved_by: SubmissionConcernPerson | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SubmissionConcernListResponse {
  success: boolean;
  message: string;
  data: SubmissionConcern[];
}

export interface SubmissionConcernDetailResponse {
  success: boolean;
  message: string;
  data: SubmissionConcern;
}

export interface SubmissionConcernListParams {
  status?: SubmissionConcernStatus;
  submission_type?: SubmissionConcernSubmissionType;
}

export interface UpdateSubmissionConcernPayload {
  concernId: string;
  status: SubmissionConcernStatus;
  admin_response_note?: string;
}

const submissionConcernsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAdminSubmissionConcerns: builder.query<
      SubmissionConcernListResponse,
      SubmissionConcernListParams | void
    >({
      query: (params) => ({
        url: "/api/enrolments/admin/submission-concerns/",
        method: "GET",
        params: cleanObject(params || {}),
      }),
      providesTags: ["Enrolments"],
    }),
    updateAdminSubmissionConcern: builder.mutation<
      SubmissionConcernDetailResponse,
      UpdateSubmissionConcernPayload
    >({
      query: ({ concernId, ...body }) => ({
        url: `/api/enrolments/admin/submission-concerns/${concernId}/`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Enrolments"],
    }),
  }),
});

export const {
  useGetAdminSubmissionConcernsQuery,
  useUpdateAdminSubmissionConcernMutation,
} = submissionConcernsApi;
