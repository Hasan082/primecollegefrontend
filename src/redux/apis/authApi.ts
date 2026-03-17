import { api } from "../api";

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
    }),
  }),
});

export const {
  useLoginMutation,
  useLogoutMutation,
  useGetMeQuery,
  useGetCsrfTokenQuery,
} = authApi;
