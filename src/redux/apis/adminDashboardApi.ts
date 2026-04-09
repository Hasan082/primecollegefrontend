import { api } from "../api";

export interface DashboardFilters {
  range?: "7d" | "30d" | "90d" | "6m" | "12m" | "custom";
  start_date?: string;
  end_date?: string;
  qualification_id?: string;
  is_cpd?: boolean;
  trainer_id?: string;
  iqa_id?: string;
}

export interface AnalyticsFilters extends DashboardFilters {
  group_by?: "day" | "week" | "month";
}

export interface DashboardOverviewResponse {
  success: boolean;
  message: string;
  data: {
    filters: {
      range: string;
      start_date?: string | null;
      end_date?: string | null;
      qualification_id: string | null;
      is_cpd: boolean | null;
      trainer_id: string | null;
      iqa_id: string | null;
    };
    kpis: {
      total_learners: number;
      active_enrolments: number;
      completed_enrolments: number;
      on_hold_enrolments: number;
      withdrawn_enrolments: number;
      certificates_issued: number;
      gross_revenue: string;
      paid_orders: number;
      average_completion_rate: number;
    };
    today: {
      new_enrolments: number;
      completed_enrolments: number;
      issued_certificates: number;
      paid_orders: number;
      revenue: string;
    };
    pipeline: {
      trainer_review_pending: number;
      iqa_review_pending: number;
      declaration_pending: number;
      evaluation_pending: number;
      final_assessment_pending: number;
    };
    alerts: any[];
    status_breakdown: Array<{
      key: string;
      label: string;
      count: number;
    }>;
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
    recent_enrolments: Array<{
      id: string;
      enrolment_number: string;
      learner_name: string;
      qualification_title: string;
      is_cpd: boolean;
      status: string;
      payment_status: string;
      enrolled_at: string;
    }>;
    recent_orders: Array<{
      id: string;
      order_number: string;
      customer_name: string;
      status: string;
      payment_method: string;
      currency: string;
      grand_total: string;
      paid_at: string;
    }>;
    top_qualifications: Array<{
      qualification_id: string;
      title: string;
      enrolments: number;
      completions: number;
      revenue: string;
    }>;
    trainer_overview?: Array<{
      id: string;
      name: string;
      assigned_learners: number;
      total_assessments: number;
      iqa_flags: number;
      iqa_approvals: number;
      status: string;
    }>;
    escalated_iqa_count?: number;
  };
}

export interface PaginatedEnrolmentResponse {
  success: boolean;
  message: string;
  data: {
    count: number;
    next: string | null;
    previous: string | null;
    results: Array<{
      id: string;
      enrolment_number: string;
      learner_name: string;
      qualification_title: string;
      status: string;
      payment_status: string;
      amount: string;
      currency: string;
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
    getRecentEnrolments: builder.query<PaginatedEnrolmentResponse, { page?: number }>({
      query: ({ page = 1 }) => ({
        url: "/api/admin/dashboard/recent-enrolments/",
        params: { page },
      }),
      providesTags: ["Enrolments"],
    }),
  }),
});

export const { useGetDashboardOverviewQuery, useGetDashboardAnalyticsQuery, useGetRecentEnrolmentsQuery } = adminDashboardApi;
