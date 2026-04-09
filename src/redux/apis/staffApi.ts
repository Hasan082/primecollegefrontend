import { api } from "../api";

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

export const staffApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getStaffList: builder.query<
      StaffListResponse,
      { role?: "trainer" | "iqa"; is_active?: boolean | string } | void
    >({
      query: (params) => ({
        url: "/api/auth/admin/staff/",
        params,
      }),
      providesTags: ["Enrolments"],
    }),
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

export const { useGetStaffListQuery, useCreateStaffMutation } = staffApi;
