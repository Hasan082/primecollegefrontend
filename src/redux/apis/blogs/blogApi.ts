import { cleanObject } from "@/utils/cleanObject";
import { api } from "../../api";

export interface BlogFeatureImage {
    src: string;
    srcset?: string;
    sources?: {
        mobile?: string;
        desktop?: string;
        card?: string;
        tablet?: string;
        original?: string;
    };
    focus?: string | null;
}

export interface BlogListItem {
    id: string;
    blog_title: string;
    blog_slug: string;
    feature_image: BlogFeatureImage | null;
    feature_image_focus?: string | null;
    category_name: string;
    category_slug: string;
    blog_excerpt: string;
    is_active: boolean;
    created_at: string;
}

export interface BlogCategorySummary {
    id: string;
    name: string;
    category_slug: string;
    blog_count: number;
    is_active: boolean;
}

export interface BlogCategoryListResponse {
    success: boolean;
    message: string;
    data: BlogCategorySummary[];
}

export interface RelatedBlogArticle {
    id: string;
    blog_title: string;
    blog_slug: string;
    feature_image?: BlogFeatureImage | null;
    category_name?: string;
    category_slug?: string;
    blog_excerpt?: string;
    is_active?: boolean;
    created_at?: string;
}

export interface BlogDetail {
    id: string;
    blog_title: string;
    blog_slug: string;
    feature_image: BlogFeatureImage | null;
    feature_image_focus?: string | null;
    blog_category?: string | BlogCategorySummary | null;
    category_id?: string | null;
    category_name?: string;
    category_slug?: string;
    blog_excerpt: string;
    blog_description: string;
    related_articles?: RelatedBlogArticle[];
    is_active: boolean;
    created_at: string;
    updated_at?: string;
}

export interface BlogDetailResponse {
    success: boolean;
    message: string;
    data: BlogDetail;
}

export interface BlogCategoryMutationResponse {
    success: boolean;
    message: string;
    data: BlogCategorySummary;
}

export interface BlogListData {
    count: number;
    next: string | null;
    previous: string | null;
    results: BlogListItem[];
    categories_summary: BlogCategorySummary[];
}

export interface BlogListResponse {
    success: boolean;
    message: string;
    data: BlogListData;
}

export interface GetBlogsParams {
    page?: number;
    page_size?: number;
    search?: string;
    category_slug?: string;
    is_active?: boolean;
}

export const blogApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getBlogs: builder.query<BlogListResponse, GetBlogsParams | void>({
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
        createBlog: builder.mutation<BlogDetailResponse, FormData>({
            query: (body) => ({
                url: "/api/blogs/",
                method: "POST",
                body,
            }),
            invalidatesTags: ["BLOGS", "BLOG"],
        }),
        getBlog: builder.query<BlogDetailResponse, string>({
            query: (blogSlug) => ({
                url: `/api/blogs/${blogSlug}/`,
                method: "GET",
            }),
            providesTags: ["BLOG"],
        }),
        updateBlog: builder.mutation<BlogDetailResponse, { blogSlug: string; body: FormData }>({
            query: ({ blogSlug, body }) => ({
                url: `/api/blogs/${blogSlug}/`,
                method: "PUT",
                body,
            }),
            invalidatesTags: ["BLOGS", "BLOG"],
        }),
        patchBlog: builder.mutation<BlogDetailResponse, { blogSlug: string; body: FormData }>({
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
        getBlogCategories: builder.query<BlogCategoryListResponse, GetBlogsParams | void>({
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
        createBlogCategory: builder.mutation<BlogCategoryMutationResponse, { name: string; is_active: boolean }>({
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
