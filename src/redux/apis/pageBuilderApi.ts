import { api } from "../api";

const pageBuilderApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createPage: builder.mutation({
      invalidatesTags: ["Pages"],
      query: (payload) => ({
        url: "/api/cms/pages/",
        method: "POST",
        body: payload,
      }),
    }),
    updatePage: builder.mutation({
      invalidatesTags: (_result, _error, arg) => [
        { type: "Pages", id: arg.slug },
        "Pages",
      ],
      query: ({ slug, payload }) => ({
        url: `/api/cms/pages/${slug}/`,
        method: "PATCH",
        body: payload,
      }),
    }),
    uploadCMSImage: builder.mutation({
      query: (payload) => ({
        url: `/api/cms/upload-image/`,
        method: "POST",
        body: payload,
      }),
    }),
    deletePage: builder.mutation({
      invalidatesTags: (_result, _error, slug) => [
        { type: "Pages", id: slug },
        "Pages",
      ],
      query: (slug) => ({
        url: `/api/cms/pages/${slug}/`,
        method: "DELETE",
      }),
    }),
    getPages: builder.query({
      providesTags: ["Pages"],
      query: () => ({
        url: "/api/cms/pages/",
        method: "GET",
      }),
    }),
    getPage: builder.query({
      providesTags: (_result, _error, slug) => [{ type: "Pages", id: slug }],
      query: (slug) => ({
        url: `/api/cms/pages/${slug}`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useCreatePageMutation,
  useUpdatePageMutation,
  useUploadCMSImageMutation,
  useDeletePageMutation,
  useGetPagesQuery,
  useGetPageQuery,
} = pageBuilderApi;
