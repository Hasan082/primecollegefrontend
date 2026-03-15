import { api } from "../api";

const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    staffLogin: builder.mutation({
      query: (payload) => ({
        url: "/api/auth/login",
        method: "POST",
        body: payload,
      }),
    }),
    getMe: builder.query({
      query: (payload) => ({
        url: "api/auth/me",
        method: "GET",
        body: payload,
      }),
    }),
  }),
});

export const { useStaffLoginMutation, useGetMeQuery } = authApi;
