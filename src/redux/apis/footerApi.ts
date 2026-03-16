import { api } from "../api";

const footerApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getFooterPublic: builder.query({
      query: () => ({
        url: "/api/settings/footer/public/",
        method: "GET",
      }),
    }),
  }),
});

export const { useGetFooterPublicQuery } = footerApi;
