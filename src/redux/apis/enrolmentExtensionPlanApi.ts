import { api } from "../api";

export interface ExtensionPlanRecord {
  id: string;
  label: string;
  duration_mode: "preset" | "custom";
  duration_months: number;
  amount: string;
  currency: string;
  sort_order: number;
  is_active: boolean;
}

export interface ExtensionPlanPayload {
  label: string;
  duration_mode: "preset" | "custom";
  duration_months: number;
  amount: string;
  currency: string;
  sort_order: number;
  is_active: boolean;
}

const enrolmentExtensionPlanApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getExtensionPlans: builder.query<{ data: ExtensionPlanRecord[] }, void>({
      query: () => ({
        url: "/api/enrolments/admin/extension-plans/",
        method: "GET",
      }),
      providesTags: ["ExtensionPlans"],
    }),
    createExtensionPlan: builder.mutation<
      unknown,
      ExtensionPlanPayload
    >({
      query: (payload) => ({
        url: "/api/enrolments/admin/extension-plans/",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["ExtensionPlans"],
    }),
    updateExtensionPlan: builder.mutation<
      unknown,
      { id: string; payload: Partial<ExtensionPlanPayload> }
    >({
      query: ({ id, payload }) => ({
        url: `/api/enrolments/admin/extension-plans/${id}/`,
        method: "PATCH",
        body: payload,
      }),
      invalidatesTags: ["ExtensionPlans"],
    }),
    deleteExtensionPlan: builder.mutation<unknown, string>({
      query: (id) => ({
        url: `/api/enrolments/admin/extension-plans/${id}/`,
        method: "DELETE",
      }),
      invalidatesTags: ["ExtensionPlans"],
    }),
  }),
});

export const {
  useGetExtensionPlansQuery,
  useCreateExtensionPlanMutation,
  useUpdateExtensionPlanMutation,
  useDeleteExtensionPlanMutation,
} = enrolmentExtensionPlanApi;
