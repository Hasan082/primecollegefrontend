import { api } from "./api";

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
  status: "submitted" | "under_review" | "competent" | "resubmission_required" | "not_yet_competent";
  submitted_at: string;
  files: EvidenceFile[];
}

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

export interface EnrolmentContent {
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
  }),
});

export const { 
  useGetEnrolmentsQuery, 
  useGetEnrolmentContentQuery, 
  useSubmitEvidenceMutation 
} = enrolmentApi;
