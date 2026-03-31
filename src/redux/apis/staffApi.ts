import { api } from "../api";

export interface StaffCreateRequest {
  email: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  phone?: string;
  role: "trainer" | "iqa";
  qualification_held?: string;
  awarding_bodies?: string[]; // IDs of awarding bodies
  centre_registration_number?: string;
  standardisation_last_attended?: string; // YYYY-MM-DD
  cpd_record_url?: string;
  send_setup_email: boolean;
}

export interface StaffResponse {
  success: boolean;
  message: string;
  data?: any;
}

export const staffApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createStaff: builder.mutation<StaffResponse, StaffCreateRequest>({
      query: (body) => ({
        url: "/api/auth/admin/staff/",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Enrolments"], // Adjust tags if needed
    }),
  }),
});

export const { useCreateStaffMutation } = staffApi;
