import { cleanObject } from "@/utils/cleanObject";
import { api } from "../../api";

export const blogApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getBlogs: builder.query({
            query: (args) => {
                const filteredParams = cleanObject(args);
                return {
                    url: "/api/blogs/",
                    method: "GET",
                    params: filteredParams,
                };
            },
            providesTags: ["BLOGS"],
        }),
        createBlog: builder.mutation({
            query: (body) => ({
                url: "/api/blogs/",
                method: "POST",
                body,
            }),
            invalidatesTags: ["BLOGS", "BLOG"],
        }),
        getBlog: builder.query({
            query: (blogSlug) => ({
                url: `/api/blogs/${blogSlug}/`,
                method: "GET",
            }),
            providesTags: ["BLOG"],
        }),
        updateBlog: builder.mutation({
            query: ({ blogSlug, body }) => ({
                url: `/api/blogs/${blogSlug}/`,
                method: "PUT",
                body,
            }),
            invalidatesTags: ["BLOGS", "BLOG"],
        }),
        patchBlog: builder.mutation({
            query: ({ blogSlug, body }) => ({
                url: `/api/blogs/${blogSlug}/`,
                method: "PATCH",
                body,
            }),
            invalidatesTags: ["BLOGS", "BLOG"],
        }),
        deleteBlog: builder.mutation({
            query: (blogSlug) => ({
                url: `/api/blogs/${blogSlug}/`,
                method: "DELETE",
            }),
            invalidatesTags: ["BLOGS", "BLOG"],
        }),
        getBlogCategories: builder.query({
            query: (args) => {
                const filteredParams = cleanObject(args);
                return {
                    url: "/api/blogs/blog-categories/",
                    method: "GET",
                    params: filteredParams,
                };
            },
            providesTags: ["BLOGS_CATEGORIES"],
        }),
        createBlogCategory: builder.mutation({
            query: (body) => ({
                url: "/api/blogs/blog-categories/",
                method: "POST",
                body,
            }),
            invalidatesTags: ["BLOGS_CATEGORIES"],
        }),
        getBlogCategory: builder.query({
            query: (categorySlug) => ({
                url: `/api/blogs/blog-categories/${categorySlug}/`,
                method: "GET",
            }),
            providesTags: ["BLOGS_CATEGORIES"],
        }),
        updateBlogCategory: builder.mutation({
            query: ({ categorySlug, body }) => ({
                url: `/api/blogs/blog-categories/${categorySlug}/`,
                method: "PUT",
                body,
            }),
            invalidatesTags: ["BLOGS_CATEGORIES"],
        }),
        patchBlogCategory: builder.mutation({
            query: ({ categorySlug, body }) => ({
                url: `/api/blogs/blog-categories/${categorySlug}/`,
                method: "PATCH",
                body,
            }),
            invalidatesTags: ["BLOGS_CATEGORIES"],
        }),
        deleteBlogCategory: builder.mutation({
            query: (categorySlug) => ({
                url: `/api/blogs/blog-categories/${categorySlug}/`,
                method: "DELETE",
            }),
            invalidatesTags: ["BLOGS_CATEGORIES"],
        }),
    }),
});

export const {
    useGetBlogsQuery,
    useCreateBlogMutation,
    useGetBlogQuery,
    useUpdateBlogMutation,
    usePatchBlogMutation,
    useDeleteBlogMutation,
    useGetBlogCategoriesQuery,
    useCreateBlogCategoryMutation,
    useGetBlogCategoryQuery,
    useUpdateBlogCategoryMutation,
    usePatchBlogCategoryMutation,
    useDeleteBlogCategoryMutation,
} = blogApi;
