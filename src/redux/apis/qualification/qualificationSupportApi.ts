import { api } from "../../api";

const qualificationSupportApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAwardingBodies: builder.query<any, void>({
      query: () => ({
        url: "/api/qualification/awarding-bodies/",
        method: "GET",
      }),
    }),
    getCategories: builder.query({
      query: () => ({
        url: "/api/qualification/categories/",
        method: "GET",
      }),
    }),
    getDeliveryModes: builder.query({
      query: () => ({
        url: "/api/qualification/delivery-modes/",
        method: "GET",
      }),
    }),
    getLevels: builder.query({
      query: () => ({
        url: "/api/qualification/levels/",
        method: "GET",
      }),
    }),
    getTypes: builder.query({
      query: () => ({
        url: "/api/qualification/types/",
        method: "GET",
      }),
    }),
  }),
});

export const {
  useGetAwardingBodiesQuery,
  useGetCategoriesQuery,
  useGetDeliveryModesQuery,
  useGetLevelsQuery,
  useGetTypesQuery,
} = qualificationSupportApi;
