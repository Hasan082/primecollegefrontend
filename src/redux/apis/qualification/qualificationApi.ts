import { cleanObject } from "@/utils/cleanObject";
import { api } from "../../api";

const qualificationApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getQualificationsAdmin: builder.query({
      query: (args) => {
        const filteredParams = cleanObject(args);
        return {
          url: "/api/qualification/admin/",
          method: "GET",
          params: filteredParams,
        };
      },
      providesTags: ["Qualifications"],
    }),
  }),
});

export const { useGetQualificationsAdminQuery } = qualificationApi;
