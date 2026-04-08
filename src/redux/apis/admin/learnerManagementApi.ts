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
            providesTags: ["EnrollLearners"],
        }),
        getEnrolledLearnerActionModalData: builder.query({
            query: ({ enrolmentId, tab }) => ({
                url: `/api/enrolments/admin/${enrolmentId}/learner-action-modal/`,
                method: "GET",
                params: { tab },
            }),
        }),
        enrollLearner: builder.mutation({
            query: (body) => ({
                url: "/api/orders/admission/office/",
                method: "POST",
                body,
            }),
            invalidatesTags: ["EnrollLearners"],
        }),
        getQualificationOnly: builder.query({
            query: () => ({
                url: `/api/qualification/only/`,
                method: "GET",
            }),
        }),
    }),
});

export const {
    useGetEnrolledLearnersQuery,
    useGetEnrolledLearnerActionModalDataQuery,
    useEnrollLearnerMutation,
    useGetQualificationOnlyQuery,
} = learnerManagementApi;
