import type {
  CMSImageUploadResponse,
  CMSPage,
  CMSPageDetailResponse,
  CMSPageListResponse,
  ContentBlock,
} from "@/types/pageBuilder";
import { prepareBlocksForSave } from "@/utils/pageBuilder";
import { api } from "../api";

export interface CMSPageMutationPayload {
  title?: string;
  slug?: string;
  blocks?: ContentBlock[];
  is_published?: boolean;
  seo_title?: string;
  seo_description?: string;
}

export interface CreateCMSPagePayload extends Required<Pick<CMSPageMutationPayload, "title" | "slug">> {
  blocks?: ContentBlock[];
  is_published?: boolean;
  seo_title?: string;
  seo_description?: string;
}

export interface UpdateCMSPageArgs {
  slug: string;
  payload: CMSPageMutationPayload;
}

export interface UpdateCMSImageFocusArgs {
  id: string;
  payload: {
    focus_x: number;
    focus_y: number;
  };
}

const sanitizePagePayload = (payload: CMSPageMutationPayload | CreateCMSPagePayload) => ({
  ...payload,
  ...(payload.blocks ? { blocks: prepareBlocksForSave(payload.blocks) } : {}),
});

const extractPages = (response?: CMSPageListResponse): CMSPage[] => response?.data?.results || [];
const extractPage = (response?: CMSPageDetailResponse): CMSPage | undefined => response?.data;

const pageBuilderApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createPage: builder.mutation<CMSPageDetailResponse, CreateCMSPagePayload>({
      invalidatesTags: ["Pages"],
      query: (payload) => ({
        url: "/api/cms/pages/",
        method: "POST",
        body: sanitizePagePayload(payload),
      }),
    }),
    updatePage: builder.mutation<CMSPageDetailResponse, UpdateCMSPageArgs>({
      invalidatesTags: (_result, _error, arg) => [
        { type: "Pages", id: arg.slug },
        "Pages",
      ],
      query: ({ slug, payload }) => ({
        url: `/api/cms/pages/${slug}/`,
        method: "PATCH",
        body: sanitizePagePayload(payload),
      }),
    }),
    publishPage: builder.mutation<CMSPageDetailResponse, string>({
      invalidatesTags: (_result, _error, slug) => [
        { type: "Pages", id: slug },
        "Pages",
      ],
      query: (slug) => ({
        url: `/api/cms/pages/${slug}/publish/`,
        method: "POST",
      }),
    }),
    uploadCMSImage: builder.mutation<CMSImageUploadResponse, FormData>({
      query: (payload) => ({
        url: "/api/cms/upload-image/",
        method: "POST",
        body: payload,
      }),
    }),
    updateCMSImageFocus: builder.mutation<CMSImageUploadResponse, UpdateCMSImageFocusArgs>({
      query: ({ id, payload }) => ({
        url: `/api/cms/update-image-focus/${id}/`,
        method: "PATCH",
        body: payload,
      }),
    }),
    deletePage: builder.mutation<{ success?: boolean; message?: string }, string>({
      invalidatesTags: (_result, _error, slug) => [
        { type: "Pages", id: slug },
        "Pages",
      ],
      query: (slug) => ({
        url: `/api/cms/pages/${slug}/`,
        method: "DELETE",
      }),
    }),
    getPages: builder.query<CMSPageListResponse, void>({
      providesTags: (result) => {
        const tags = extractPages(result).map((page) => ({
          type: "Pages" as const,
          id: page.slug,
        }));
        return ["Pages", ...tags];
      },
      query: () => ({
        url: "/api/cms/pages/",
        method: "GET",
      }),
    }),
    getPage: builder.query<CMSPageDetailResponse, string>({
      providesTags: (result, _error, slug) => [
        { type: "Pages", id: slug },
        ...(extractPage(result)?.id ? [{ type: "Pages" as const, id: extractPage(result)!.id }] : []),
      ],
      query: (slug) => ({
        url: `/api/cms/pages/${slug}/`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useCreatePageMutation,
  useUpdatePageMutation,
  usePublishPageMutation,
  useUploadCMSImageMutation,
  useUpdateCMSImageFocusMutation,
  useDeletePageMutation,
  useGetPagesQuery,
  useGetPageQuery,
} = pageBuilderApi;
