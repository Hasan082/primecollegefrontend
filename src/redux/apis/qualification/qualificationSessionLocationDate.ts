/* eslint-disable @typescript-eslint/no-explicit-any */
import { api } from "../../api";

const qualificationSessionLocationDate = api.injectEndpoints({
  endpoints: (builder) => ({
    createQualificationSessionLocationDate: builder.mutation({
      query: ({ locationId, payload }) => ({
        url: `/api/qualification/admin/session-locations/${locationId}/dates/`,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["SessionLocationDates"],
    }),
    updateQualificationSessionLocationDate: builder.mutation({
      query: ({ dateId, payload }) => ({
        url: `/api/qualification/admin/dates/${dateId}/`,
        method: "PATCH",
        body: payload,
      }),
      invalidatesTags: ["SessionLocationDates"],
    }),
    deleteQualificationSessionLocationDate: builder.mutation({
      query: (id) => ({
        url: `/api/qualification/admin/dates/${id}/`,
        method: "DELETE",
      }),
      invalidatesTags: ["SessionLocationDates"],
    }),
    getQualificationSessionLocationDate: builder.query({
      query: (locationId) => ({
        url: `/api/qualification/admin/session-locations/${locationId}/dates/`,
        method: "GET",
      }),
      providesTags: ["SessionLocationDates"],
    }),
  }),
});

export const {
  useCreateQualificationSessionLocationDateMutation,
  useUpdateQualificationSessionLocationDateMutation,
  useDeleteQualificationSessionLocationDateMutation,
  useGetQualificationSessionLocationDateQuery,
} = qualificationSessionLocationDate;
