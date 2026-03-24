/* eslint-disable @typescript-eslint/no-explicit-any */
import { api } from "../../api";

const footerApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createQualificationSessionLocation: builder.mutation({
      query: ({ id, payload }) => ({
        url: `/api/qualification/admin/${id}/session-locations/`,
        method: "POST",
        body: payload,
      }),
    }),
    updateQualificationSessionLocation: builder.mutation({
      query: ({ id, payload }) => ({
        url: `/api/qualification/admin/${id}/session-locations//`,
        method: "PATCH",
        body: payload,
      }),
    }),
    getQualificationSessionLocation: builder.query({
      query: (id) => ({
        url: `/api/qualification/admin/${id}/session-locations/`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useCreateQualificationSessionLocationMutation,
  useUpdateQualificationSessionLocationMutation,
  useGetQualificationSessionLocationQuery,
} = footerApi;
