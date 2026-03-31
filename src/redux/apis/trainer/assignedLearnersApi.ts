import { api } from "../../api";

export interface TrainerAssignedEnrolment {
  id: string;
  enrolment_number: string;
  status: string;
  payment_status: string;
  enrolled_at: string;
  access_expires_at: string | null;
  completed_at: string | null;
  learner: {
    id: string;
    name: string;
    email: string;
  };
  qualification: {
    id: string;
    title: string;
    slug: string;
    is_cpd: boolean;
  };
  trainer: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  iqa: {
    id: string;
    name: string;
    email: string;
    role: string;
  } | null;
}

export interface TrainerAssignedEnrolmentsResponse {
  success: boolean;
  message: string;
  data: TrainerAssignedEnrolment[];
}

export const assignedLearnersApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getTrainerEnrolments: builder.query<TrainerAssignedEnrolmentsResponse, void>({
      query: () => ({
        url: "/api/enrolments/trainer/my-enrolments/",
        method: "GET",
      }),
      providesTags: ["Enrolments"],
    }),
  }),
});

export const { useGetTrainerEnrolmentsQuery } = assignedLearnersApi;
