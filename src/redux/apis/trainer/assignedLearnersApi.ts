import { cleanObject } from "@/utils/cleanObject";
import { api } from "../../api";

export const assignedLearnersApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getTrainerEnrolments: builder.query({
      query: (args) => {
        const filteredParams = cleanObject(args);
        return {
          url: "/api/enrolments/trainer/my-enrolments/",
          method: "GET",
          params: filteredParams,
        };
      },
      providesTags: ["Enrolments"],
    }),
  }),
});

export const { useGetTrainerEnrolmentsQuery } = assignedLearnersApi;
