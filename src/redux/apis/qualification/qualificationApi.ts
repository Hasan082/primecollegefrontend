import { cleanObject } from "@/utils/cleanObject";
import { api } from "../../api";

export interface QualificationOption {
  id: string;
  title: string;
}

export interface AdminQualificationUpsell {
  id: string;
  source_qualification:
    | string
    | {
        id: string;
        title?: string;
        name?: string;
        slug?: string;
      };
  target_qualification:
    | string
    | {
        id: string;
        title?: string;
        name?: string;
        slug?: string;
      };
  title_override: string;
  message: string;
  discount_amount: string;
  discount_percent: string;
  sort_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface AdminQualificationUpsellPayload {
  source_qualification: string;
  target_qualification: string;
  title_override?: string;
  message?: string;
  discount_amount: string;
  discount_percent: string;
  sort_order?: number;
  is_active: boolean;
}

type AdminQualificationUpsellListResponse =
  | AdminQualificationUpsell[]
  | {
      data?:
        | AdminQualificationUpsell[]
        | {
            results?: AdminQualificationUpsell[];
          };
      results?: AdminQualificationUpsell[];
    };

type AdminQualificationUpsellResponse =
  | AdminQualificationUpsell
  | {
      data?: AdminQualificationUpsell;
    };

const normalizeAdminUpsellList = (
  response: AdminQualificationUpsellListResponse,
): AdminQualificationUpsell[] => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.results)) return response.data.results;
  if (Array.isArray(response?.results)) return response.results;
  return [];
};

const normalizeAdminUpsell = (
  response: AdminQualificationUpsellResponse,
): AdminQualificationUpsell =>
  "data" in response && response.data ? response.data : response;

const qualificationApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getQualificationOnlyList: builder.query({
      query: () => ({
        url: "/api/qualification/only/",
        method: "GET",
      }),
    }),
    getQualificationsAdmin: builder.query({
      query: (args) => {
        const filteredParams = cleanObject(args);
        return {
          url: "/api/qualification/admin/",
          method: "GET",
          params: filteredParams,
        };
      },
      providesTags: ["Qualifications"],
    }),
    getQualificationOptions: builder.query({
      query: () => ({
        url: "/api/qualification/options/",
        method: "GET",
      })
    }),
    getQualificationSliderOptions: builder.query<QualificationOption[], void>({
      query: () => ({
        url: "/api/qualification/options/",
        method: "GET",
      }),
      transformResponse: (response: QualificationOption[] | { data?: QualificationOption[] }) =>
        Array.isArray(response) ? response : response?.data || [],
    }),
    getUnitOptionsByQualification: builder.query({
      query: (qualificationId) => ({
        url: `/api/qualification/options/${qualificationId}/units/`,
        method: "GET",
      }),
    }),
    getChecklistTemplates: builder.query({
      query: (args) => {
        const filteredParams = cleanObject(args);
        return {
          url: `/api/v1/checklists/templates/`,
          method: "GET",
          params: filteredParams,
        };
      },
      providesTags: ["ChecklistTemplates"],
    }),
    createChecklistTemplate: builder.mutation({
      query: (data) => ({
        url: `/api/v1/checklists/templates/`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["ChecklistTemplates"],
    }),
    updateChecklistTemplate: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/api/v1/checklists/templates/${id}/`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["ChecklistTemplates"],
    }),
    getAdminQualificationUpsells: builder.query<AdminQualificationUpsell[], void>({
      query: () => ({
        url: "/api/qualification/admin/upsells/",
        method: "GET",
      }),
      transformResponse: normalizeAdminUpsellList,
      providesTags: (result) => [
        { type: "QualificationUpsells", id: "LIST" },
        ...(result || []).map((upsell) => ({
          type: "QualificationUpsells" as const,
          id: upsell.id,
        })),
      ],
    }),
    createAdminQualificationUpsell: builder.mutation<
      AdminQualificationUpsell,
      AdminQualificationUpsellPayload
    >({
      query: (body) => ({
        url: "/api/qualification/admin/upsells/",
        method: "POST",
        body,
      }),
      transformResponse: normalizeAdminUpsell,
      invalidatesTags: [
        { type: "QualificationUpsells", id: "LIST" },
        { type: "Qualifications", id: "LIST" },
      ],
    }),
    updateAdminQualificationUpsell: builder.mutation<
      AdminQualificationUpsell,
      { id: string; body: Partial<AdminQualificationUpsellPayload> }
    >({
      query: ({ id, body }) => ({
        url: `/api/qualification/admin/upsells/${id}/`,
        method: "PATCH",
        body,
      }),
      transformResponse: normalizeAdminUpsell,
      invalidatesTags: (_result, _error, { id }) => [
        { type: "QualificationUpsells", id },
        { type: "QualificationUpsells", id: "LIST" },
        { type: "Qualifications", id: "LIST" },
      ],
    }),
    deleteAdminQualificationUpsell: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/qualification/admin/upsells/${id}/`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "QualificationUpsells", id },
        { type: "QualificationUpsells", id: "LIST" },
        { type: "Qualifications", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetQualificationOnlyListQuery,
  useGetQualificationsAdminQuery,
  useGetQualificationOptionsQuery,
  useGetQualificationSliderOptionsQuery,
  useGetUnitOptionsByQualificationQuery,
  useLazyGetUnitOptionsByQualificationQuery,
  useGetChecklistTemplatesQuery,
  useCreateChecklistTemplateMutation,
  useUpdateChecklistTemplateMutation,
  useGetAdminQualificationUpsellsQuery,
  useCreateAdminQualificationUpsellMutation,
  useUpdateAdminQualificationUpsellMutation,
  useDeleteAdminQualificationUpsellMutation,
} = qualificationApi;
