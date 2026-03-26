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
      invalidatesTags: ["SessionLocations"],
    }),
    updateQualificationSessionLocation: builder.mutation({
      query: ({ id, payload }) => ({
        url: `/api/qualification/admin/session-locations/${id}/`,
        method: "PATCH",
        body: payload,
      }),
      invalidatesTags: ["SessionLocations"],
    }),
    deleteQualificationSessionLocation: builder.mutation({
      query: (id) => ({
        url: `/api/qualification/admin/session-locations/${id}/`,
        method: "DELETE",
      }),
      invalidatesTags: ["SessionLocations"],
    }),
    getQualificationSessionLocation: builder.query({
      query: (id) => ({
        url: `/api/qualification/admin/${id}/session-locations/`,
        method: "GET",
      }),
      providesTags: ["SessionLocations"],
    }),
  }),
});

export const {
  useCreateQualificationSessionLocationMutation,
  useUpdateQualificationSessionLocationMutation,
  useDeleteQualificationSessionLocationMutation,
  useGetQualificationSessionLocationQuery,
} = footerApi;
