import { api } from "../../api";

const qualificationMainApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createQualificationMain: builder.mutation({
      query: (payload) => ({
        url: "/api/qualification/admin/",
        method: "POST",
        body: payload,
      }),
    }),
    updateQualificationMain: builder.mutation({
      query: ({ id, payload }) => ({
        url: "/api/qualification/admin/" + id,
        method: "PATCH",
        body: payload,
      }),
    }),
    getQualificationMain: builder.query({
      query: (id) => ({
        url: "/api/qualification/admin/" + id,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useCreateQualificationMainMutation,
  useUpdateQualificationMainMutation,
  useGetQualificationMainQuery,
} = qualificationMainApi;
