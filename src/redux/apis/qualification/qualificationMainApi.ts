import { api } from "../../api";

const qualificationMainApi = api.injectEndpoints({
  endpoints: (builder) => ({
    presignQualificationImageUpload: builder.mutation({
      query: (payload) => ({
        url: "/api/qualification/admin/uploads/presign-image/",
        method: "POST",
        body: payload,
      }),
    }),
    createQualificationMain: builder.mutation({
      query: (payload) => ({
        url: "/api/qualification/admin/",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["Qualifications"],
    }),
    updateQualificationMain: builder.mutation({
      query: ({ id, payload }) => ({
        url: "/api/qualification/admin/" + id + "/",
        method: "PATCH",
        body: payload,
      }),
      invalidatesTags: ["Qualifications"],
    }),
    getQualificationMain: builder.query({
      query: (id) => ({
        url: "/api/qualification/admin/" + id + "/",
        method: "GET",
      }),
      providesTags: ["Qualifications"],
    }),
    getQualificationQuickView: builder.query({
      query: (id) => ({
        url: `/api/qualification/admin/${id}/quick-view/`,
        method: "GET",
      }),
      transformResponse: (response: { data: any }) => response.data,
      providesTags: ["Qualifications"],
    }),
  }),
});

export const {
  usePresignQualificationImageUploadMutation,
  useCreateQualificationMainMutation,
  useUpdateQualificationMainMutation,
  useGetQualificationMainQuery,
  useGetQualificationQuickViewQuery,
} = qualificationMainApi;
