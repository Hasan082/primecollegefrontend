import { api } from "../../api";

const qualificationDetailsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createQualificationDetails: builder.mutation({
      query: ({ id, payload }) => ({
        url: `/api/qualification/admin/${id}/details/`,
        method: "POST",
        body: payload,
      }),
    }),
    updateQualificationDetails: builder.mutation({
      query: ({ id, payload }) => ({
        url: `/api/qualification/admin/${id}/details/`,
        method: "PATCH",
        body: payload,
      }),
    }),
    getQualificationDetails: builder.query({
      query: (id) => ({
        url: `/api/qualification/admin/${id}/details`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useCreateQualificationDetailsMutation,
  useUpdateQualificationDetailsMutation,
  useGetQualificationDetailsQuery,
} = qualificationDetailsApi;
