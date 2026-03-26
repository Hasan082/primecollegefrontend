import { api } from "../../api";

const qualificationApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getQualificationsAdmin: builder.query({
      query: () => ({
        url: "/api/qualification/admin/",
        method: "GET",
      }),
      providesTags: ["Qualifications"],
    }),
  }),
});

export const { useGetQualificationsAdminQuery } = qualificationApi;
