import { api } from "../api";

const navbarApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getNavbarPublic: builder.query({
      query: () => ({
        url: "/api/settings/navigation/",
        method: "GET",
      }),
    }),
  }),
});

export const { useGetNavbarPublicQuery } = navbarApi;
