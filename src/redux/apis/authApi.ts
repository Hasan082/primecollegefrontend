import { api, setCsrfToken } from "../api";

export interface StaffProfile {
  qualification_held?: string;
  specialisms?: string;
  centre_registration_number?: string;
  standardisation_last_attended?: string;
  cpd_record_url?: string;
}

export interface UpdateMeRequest {
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  phone?: string;
  profile_picture_file?: string | null;
  profile_picture_key?: string | null;
  clear_profile_picture?: boolean;
  bio?: string;
  date_of_birth?: string;
  staff_profile?: StaffProfile;
  address?: string; // Kept for backward compatibility
}

const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (payload) => ({
        url: "/api/auth/login/",
        method: "POST",
        body: payload,
      }),
    }),
    logout: builder.mutation({
      query: () => ({
        url: "/api/auth/logout/",
        method: "POST",
      }),
    }),
    getMe: builder.query({
      query: () => ({
        url: "/api/auth/me/",
        method: "GET",
      }),
    }),
    getCsrfToken: builder.query({
      query: () => ({
        url: "/api/auth/csrf/",
        method: "GET",
      }),
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const token = data?.data?.token ?? null;
          setCsrfToken(token);
        } catch {
          setCsrfToken(null);
        }
      },
    }),
    confirmPasswordSetup: builder.mutation({
      query: (payload) => ({
        url: "/api/auth/password-setup/confirm/",
        method: "POST",
        body: payload,
      }),
    }),
    changePassword: builder.mutation({
      query: (payload) => ({
        url: "/api/auth/change-password/",
        method: "POST",
        body: payload,
      }),
    }),
    forgotPassword: builder.mutation({
      query: (payload) => ({
        url: "/api/auth/forgot-password/",
        method: "POST",
        body: payload,
      }),
    }),
    forgotPasswordConfirm: builder.mutation({
      query: (payload) => ({
        url: "/api/auth/forgot-password/confirm/",
        method: "POST",
        body: payload,
      }),
    }),
    setPassword: builder.mutation({
      query: (payload) => ({
        url: "/api/auth/set-password/",
        method: "POST",
        body: payload,
      }),
    }),
    updateMe: builder.mutation<any, UpdateMeRequest>({
      query: (payload) => ({
        url: "/api/auth/me/",
        method: "PATCH",
        body: payload,
      }),
      // Invalidate getMe query after a successful update to refetch fresh data
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(authApi.util.invalidateTags(['User']));
        } catch {}
      }
    }),
    presignProfilePicture: builder.mutation<
      {
        success: boolean;
        message: string;
        data: {
          upload_url: string;
          fields: Record<string, string>;
          key: string;
          public_url?: string;
        };
      },
      { file_name: string; content_type: string }
    >({
      query: (body) => ({
        url: "/api/auth/me/presign-profile-picture/",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useLogoutMutation,
  useGetMeQuery,
  useGetCsrfTokenQuery,
  useConfirmPasswordSetupMutation,
  useChangePasswordMutation,
  useForgotPasswordMutation,
  useForgotPasswordConfirmMutation,
  useSetPasswordMutation,
  useUpdateMeMutation,
  usePresignProfilePictureMutation,
} = authApi;
