/* eslint-disable @typescript-eslint/no-explicit-any */
import { api } from "../../api";

const qualificationSessionLocationDate = api.injectEndpoints({
  endpoints: (builder) => ({
    createQualificationSessionLocationDate: builder.mutation({
      query: ({
        locationId,
        payload,
      }: {
        locationId: string;
        payload: any;
      }) => ({
        url: `/api/qualification/admin/session-locations/${locationId}/dates/`,
        method: "POST",
        body: payload,
      }),
    }),
    updateQualificationSessionLocationDate: builder.mutation({
      query: ({ dateId, payload }) => ({
        url: `/api/qualification/admin/dates/${dateId}/`,
        method: "PATCH",
        body: payload,
      }),
    }),
    getQualificationSessionLocationDate: builder.query({
      query: (locationId) => ({
        url: `/api/qualification/admin/session-locations/${locationId}/dates/`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useCreateQualificationSessionLocationDateMutation,
  useUpdateQualificationSessionLocationDateMutation,
  useGetQualificationSessionLocationDateQuery,
} = qualificationSessionLocationDate;
