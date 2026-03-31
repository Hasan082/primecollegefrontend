import { api } from "../api";

export interface DashboardFilters {
  range?: "7d" | "30d" | "90d" | "12m";
  qualification_id?: string;
  is_cpd?: boolean;
  assessor_id?: string;
  iqa_id?: string;
}

export interface AnalyticsFilters extends DashboardFilters {
  group_by?: "day" | "week" | "month";
}

export interface DashboardOverviewResponse {
  success: boolean;
  message: string;
  data: {
    kpis: {
      total_learners: number;
      active_qualifications: number;
    };
    pipeline: {
      trainer_review_pending: number;
      iqa_review_pending: number;
    };
    escalated_iqa_count: number;
    charts: {
      enrolments_trend_simple: Array<{
        month: string;
        count: number;
      }>;
      learners_by_category_simple: Array<{
        name: string;
        value: number;
      }>;
    };
    trainer_overview: Array<{
      id: string;
      name: string;
      assigned_learners: number;
      total_assessments: number;
      iqa_flags: number;
      iqa_approvals: number;
      status: string;
    }>;
    recent_enrolments: Array<{
      id: string;
      learner_name: string;
      qualification_title: string;
      payment_status: string;
      enrolled_at: string;
    }>;
  };
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface DashboardAnalyticsResponse {
  success: boolean;
  message: string;
  data: {
    filters: AnalyticsFilters;
    charts: {
      enrolments_trend: ChartData;
      revenue_trend: ChartData;
      qualification_type_split: ChartData;
      learners_by_category: ChartData;
      enrolment_status_split: ChartData;
      top_qualifications_by_enrolment: ChartData;
      top_qualifications_by_revenue: ChartData;
      staff_workload: ChartData;
    };
  };
}

export const adminDashboardApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardOverview: builder.query<DashboardOverviewResponse, DashboardFilters>({
      query: (filters) => ({
        url: "/api/admin/dashboard/",
        params: filters,
      }),
      providesTags: ["Enrolments"],
    }),
    getDashboardAnalytics: builder.query<DashboardAnalyticsResponse, AnalyticsFilters>({
      query: (filters) => ({
        url: "/api/admin/dashboard/analytics/",
        params: filters,
      }),
    }),
  }),
});

export const { useGetDashboardOverviewQuery, useGetDashboardAnalyticsQuery } = adminDashboardApi;
