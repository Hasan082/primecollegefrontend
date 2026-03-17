import { api } from "../api";
import { setCsrfToken } from "../authSlice";

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
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          // ApiRenderer wraps response: { success, message, data: { token } }
          const token = data?.data?.token || data?.token;
          if (token) {
            dispatch(setCsrfToken(token));
          }
        } catch (err) {
          console.error("Failed to fetch CSRF token:", err);
        }
      },
    }),
  }),
});

export const { useLoginMutation, useLogoutMutation, useGetMeQuery, useGetCsrfTokenQuery } = authApi;
