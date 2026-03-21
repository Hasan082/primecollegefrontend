import { api } from "../api";

const qualificationApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getUpSales: builder.query({
      query: (slug) => ({
        url: `/api/qualification/${slug}/upsells/`,
        method: "GET",
      }),
    }),
  }),
});

export const { useGetUpSalesQuery } = qualificationApi;
