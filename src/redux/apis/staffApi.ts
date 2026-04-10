import { api } from "../api";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface StaffCreateRequest {
  email: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  phone?: string;
  role: "trainer" | "iqa";
  qualification_held?: string;
  specialisms?: string[];
  centre_registration_number?: string;
  standardisation_last_attended?: string; // YYYY-MM-DD
  cpd_record_url?: string;
}

export interface StaffResponse {
  success: boolean;
  message: string;
  data?: any;
}

export interface StaffListItem {
  id: string;
  email: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  full_name: string;
  phone?: string;
  role: "trainer" | "iqa";
  is_active: boolean;
}

export interface StaffListResponse {
  success: boolean;
  message: string;
  data: StaffListItem[];
}

// ---------------------------------------------------------------------------
// Trainer Management types
// ---------------------------------------------------------------------------

export interface AssignedLearnerEntry {
  id: string;
  learner: {
    id: string;
    name: string;
    learner_id: string;
    qualification_learner_id: string;
    email: string;
    enrolled_qualification: string;
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

export interface TrainerManagementItem {
  id: string;
  email: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  full_name: string;
  phone: string;
  is_active: boolean;
  status: "active" | "inactive";
  specialisms: string[];
  assigned_learners_count: number;
  pending_reviews_count: number;
  average_progress_percent: number;
  assigned_learners: AssignedLearnerEntry[];
}

export interface TrainerManagementResponse {
  success: boolean;
  message: string;
  data: {
    count: number;
    next: string | null;
    previous: string | null;
    results: TrainerManagementItem[];
  };
}

export interface TrainerManagementParams {
  search?: string;
  is_active?: boolean | string;
  ordering?: string;
  page?: number;
  page_size?: number;
}

// Trainer options for reassign select
export interface TrainerOption {
  id: string;
  name: string;
}

export interface TrainerOptionsResponse {
  success: boolean;
  message: string;
  data: TrainerOption[];
}

// Reassign request
export interface ReassignLearnerRequest {
  enrolment_id: string;
  assessor_id: string;
}

// ---------------------------------------------------------------------------
// API
// ---------------------------------------------------------------------------

export const staffApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Existing: generic staff list
    getStaffList: builder.query<
      StaffListResponse,
      { role?: "trainer" | "iqa"; is_active?: boolean | string } | void
    >({
      query: (params) => ({
        url: "/api/auth/admin/staff/",
        params: params ?? undefined,
      }),
      providesTags: ["Enrolments"],
    }),

    // Create staff (trainer / iqa)
    createStaff: builder.mutation<StaffResponse, StaffCreateRequest>({
      query: (body) => ({
        url: "/api/auth/admin/staff/",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Trainers"],
    }),

    // Trainer management list (rich data)
    getTrainerManagement: builder.query<
      TrainerManagementResponse,
      TrainerManagementParams | void
    >({
      query: (params) => ({
        url: "/api/auth/admin/trainers/management/",
        params: params ?? undefined,
      }),
      providesTags: ["Trainers"],
    }),

    // Trainer options for reassign dropdown
    getTrainerOptions: builder.query<TrainerOptionsResponse, void>({
      query: () => "/api/auth/trainers/options/",
      providesTags: ["Trainers"],
    }),

    // Reassign learner to a different trainer
    reassignTrainer: builder.mutation<
      StaffResponse,
      ReassignLearnerRequest
    >({
      query: ({ enrolment_id, assessor_id }) => ({
        url: `/api/enrolments/admin/${enrolment_id}/assign-trainer/`,
        method: "POST",
        body: { assessor_id },
      }),
      invalidatesTags: ["Trainers"],
    }),
  }),
});

export const {
  useGetStaffListQuery,
  useCreateStaffMutation,
  useGetTrainerManagementQuery,
  useGetTrainerOptionsQuery,
  useReassignTrainerMutation,
} = staffApi;
