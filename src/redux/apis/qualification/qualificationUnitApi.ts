import { api } from "../../api";

export interface QualificationUnitConfigSummary {
  id: string;
  title: string;
  qualification_code: string;
  status: string;
  level: string;
  active_enrolments_count: number;
  current_price: string | null;
  currency: string;
  duration: string;
  total_units: number;
  is_cpd: boolean;
  awarding_body_name?: string;
  awarding_body?: string;
}

export interface UnitRow {
  id: string;
  qualification: string;
  title: string;
  unit_code: string;
  description: string;
  order: number;
  has_quiz: boolean;
  has_written_assignment: boolean;
  requires_evidence: boolean;
  resource_count: number;
  quiz_count: number;
  assignment_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UnitResource {
  id: string;
  unit: string;
  title: string;
  description: string;
  resource_type: string;
  file: string;
  external_url: string;
  estimated_minutes: number;
  is_downloadable: boolean;
  is_required: boolean;
  resource_version: string;
  citation_text: string;
  accessibility_notes: string;
  transcript_text: string;
  order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UnitCpdConfig {
  id: string;
  unit: string;
  learning_objectives: string;
  learning_outcomes: string;
  estimated_minutes: number;
  module_summary: string;
  accessibility_notes: string;
  created_at: string;
  updated_at: string;
}

const qualificationUnitApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getUnitConfigSummary: builder.query<QualificationUnitConfigSummary, string>({
      query: (id) => ({
        url: `/api/qualification/admin/${id}/unit-config/summary/`,
        method: "GET",
      }),
      transformResponse: (response: { data: QualificationUnitConfigSummary }) => response.data,
      providesTags: (_result, _error, id) => [{ type: "Qualifications", id: `SUMMARY-${id}` }],
    }),

    getUnits: builder.query<UnitRow[], string>({
      query: (qualificationId) => ({
        url: `/api/qualification/admin/${qualificationId}/units/`,
        method: "GET",
      }),
      transformResponse: (response: { data: any }) =>
        Array.isArray(response.data) ? response.data : (response?.data?.results || []),
      providesTags: (result, _error, qualificationId) =>
        Array.isArray(result)
          ? [
            ...result.map(({ id }) => ({ type: "QualificationUnits" as const, id })),
            { type: "QualificationUnits", id: `LIST-${qualificationId}` }
          ]
          : [{ type: "QualificationUnits", id: `LIST-${qualificationId}` }],
    }),

    createUnit: builder.mutation<UnitRow, { qualificationId: string; payload: Partial<UnitRow> }>({
      query: ({ qualificationId, payload }) => ({
        url: `/api/qualification/admin/${qualificationId}/units/`,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: (_result, _error, { qualificationId }) => [
        { type: "QualificationUnits", id: `LIST-${qualificationId}` }
      ],
    }),

    updateUnit: builder.mutation<UnitRow, { unitId: string; payload: Partial<UnitRow> }>({
      query: ({ unitId, payload }) => ({
        url: `/api/qualification/admin/units/${unitId}/`,
        method: "PATCH",
        body: payload,
      }),
      invalidatesTags: (_result, _error, { unitId }) => [{ type: "QualificationUnits", id: unitId }],
    }),

    deleteUnit: builder.mutation<void, { unitId: string; qualificationId: string }>({
      query: ({ unitId }) => ({
        url: `/api/qualification/admin/units/${unitId}/`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { qualificationId }) => [
        { type: "QualificationUnits", id: `LIST-${qualificationId}` }
      ],
    }),

    getUnitResources: builder.query<UnitResource[], string>({
      query: (unitId) => ({
        url: `/api/qualification/admin/units/${unitId}/resources/`,
        method: "GET",
      }),
      transformResponse: (response: { data: any }) =>
        Array.isArray(response.data) ? response.data : (response?.data?.results || []),
      providesTags: (result, _error, unitId) =>
        Array.isArray(result)
          ? [
            ...result.map(({ id }) => ({ type: "UnitResources" as const, id })),
            { type: "UnitResources", id: `LIST-${unitId}` }
          ]
          : [{ type: "UnitResources", id: `LIST-${unitId}` }],
    }),

    createUnitResource: builder.mutation<UnitResource | UnitResource[], { unitId: string; payload: FormData | Partial<UnitResource> }>({
      query: ({ unitId, payload }) => ({
        url: `/api/qualification/admin/units/${unitId}/resources/`,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: (_result, _error, { unitId }) => [
        { type: "UnitResources", id: `LIST-${unitId}` },
        { type: "QualificationUnits", id: unitId }
      ],
    }),

    updateUnitResource: builder.mutation<UnitResource, { resourceId: string; unitId: string; payload: Partial<UnitResource> }>({
      query: ({ resourceId, payload }) => ({
        url: `/api/qualification/admin/resources/${resourceId}/`,
        method: "PATCH",
        body: payload,
      }),
      invalidatesTags: (_result, _error, { resourceId, unitId }) => [
        { type: "UnitResources", id: resourceId },
        { type: "UnitResources", id: `LIST-${unitId}` }
      ],
    }),

    deleteUnitResource: builder.mutation<void, { resourceId: string; unitId: string }>({
      query: ({ resourceId }) => ({
        url: `/api/qualification/admin/resources/${resourceId}/`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { unitId }) => [
        { type: "UnitResources", id: `LIST-${unitId}` },
        { type: "QualificationUnits", id: unitId }
      ],
    }),

    getUnitCpdConfig: builder.query<UnitCpdConfig, string>({
      query: (unitId) => ({
        url: `/api/qualification/admin/units/${unitId}/cpd-config/`,
        method: "GET",
      }),
      transformResponse: (response: { data: UnitCpdConfig }) => response.data,
      providesTags: (_result, _error, unitId) => [{ type: "UnitCpdConfig", id: unitId }],
    }),

    createUnitCpdConfig: builder.mutation<UnitCpdConfig, { unitId: string; payload: Partial<UnitCpdConfig> }>({
      query: ({ unitId, payload }) => ({
        url: `/api/qualification/admin/units/${unitId}/cpd-config/`,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: (_result, _error, { unitId }) => [{ type: "UnitCpdConfig", id: unitId }],
    }),

    updateUnitCpdConfig: builder.mutation<UnitCpdConfig, { unitId: string; payload: Partial<UnitCpdConfig> }>({
      query: ({ unitId, payload }) => ({
        url: `/api/qualification/admin/units/${unitId}/cpd-config/`,
        method: "PATCH",
        body: payload,
      }),
      invalidatesTags: (_result, _error, { unitId }) => [{ type: "UnitCpdConfig", id: unitId }],
    }),
  }),
});

export const {
  useGetUnitConfigSummaryQuery,
  useGetUnitsQuery,
  useCreateUnitMutation,
  useUpdateUnitMutation,
  useDeleteUnitMutation,
  useGetUnitResourcesQuery,
  useCreateUnitResourceMutation,
  useUpdateUnitResourceMutation,
  useDeleteUnitResourceMutation,
  // unit cpd api's 
  useGetUnitCpdConfigQuery,
  useCreateUnitCpdConfigMutation,
  useUpdateUnitCpdConfigMutation,
} = qualificationUnitApi;
