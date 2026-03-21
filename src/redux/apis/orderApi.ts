// /api/orders/checkout/online/

import { api } from "../api";

const orderApi = api.injectEndpoints({
  endpoints: (builder) => ({
    checkoutOnline: builder.mutation({
      query: (data) => ({
        url: `/api/orders/checkout/online/`,
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const { useCheckoutOnlineMutation } = orderApi;
