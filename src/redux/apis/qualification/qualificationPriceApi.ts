import { api } from "../../api";

const qualificationPriceApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createQualificationPrice: builder.mutation({
      query: ({ id, payload }) => ({
        url: `/api/qualification/admin/${id}/prices/`,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["QualificationPrices"],
    }),
    updateQualificationPrice: builder.mutation({
      query: ({ id, payload }) => ({
        url: `/api/qualification/admin/prices/${id}/`,
        method: "PATCH",
        body: payload,
      }),
      invalidatesTags: ["QualificationPrices"],
    }),
    deleteQualificationPrice: builder.mutation({
      query: (id) => ({
        url: `/api/qualification/admin/prices/${id}/`,
        method: "DELETE",
      }),
      invalidatesTags: ["QualificationPrices"],
    }),
    getQualificationPrices: builder.query({
      query: (id) => ({
        url: `/api/qualification/admin/${id}/prices/`,
        method: "GET",
      }),
      providesTags: ["QualificationPrices"],
    }),
  }),
});

export const {
  useCreateQualificationPriceMutation,
  useUpdateQualificationPriceMutation,
  useDeleteQualificationPriceMutation,
  useGetQualificationPricesQuery,
} = qualificationPriceApi;
