import { api } from "@/redux/api";
import { cleanObject } from "@/utils/cleanObject";

const learnerManagementApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getEnrolledLearners: builder.query({
            query: (args) => {
                const filteredParams = cleanObject(args);
                return {
                    url: "/api/enrolments/admin/learners/",
                    method: "GET",
                    params: filteredParams,
                };
            },
            // providesTags: ["EnrolledLearners"],
        }),
    }),
});

export const {
    useGetEnrolledLearnersQuery,
} = learnerManagementApi;
