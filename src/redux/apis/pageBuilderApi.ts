import { api } from "../api";

const pageBuilderApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createPage: builder.mutation({
      query: (payload) => ({
        url: "/api/cms/pages/",
        method: "POST",
        body: payload,
      }),
    }),
    updatePage: builder.mutation({
      query: ({ slug, payload }) => ({
        url: `/api/cms/pages/${slug}/`,
        method: "PATCH",
        body: payload,
      }),
    }),
    uploadCMSImage: builder.mutation({
      query: (payload) => ({
        url: `/api/cms/upload-image/`,
        method: "PATCH",
        body: payload,
      }),
    }),
    deletePage: builder.mutation({
      query: (slug) => ({
        url: `/api/cms/pages/${slug}/`,
        method: "DELETE",
      }),
    }),
    getPages: builder.query({
      query: () => ({
        url: "/api/cms/pages/",
        method: "GET",
      }),
    }),
    getPage: builder.query({
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
