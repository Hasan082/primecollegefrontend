import { cleanObject } from "@/utils/cleanObject";
import { api } from "../../api";

export interface QualificationOption {
  id: string;
  title: string;
}

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
} = qualificationApi;
