import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
} from "chart.js";
import { Bar, Line, Pie, Doughnut } from "react-chartjs-2";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGetDashboardAnalyticsQuery, AnalyticsFilters } from "@/redux/apis/adminDashboardApi";
import { useGetQualificationsQuery } from "@/redux/apis/qualificationApi";
import { RefreshCcw, BarChart3, TrendingUp, PieChart, Users2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const emptyChartData = {
  labels: [],
  datasets: [],
};

const AdminAnalytics = () => {
  const [filters, setFilters] = useState<AnalyticsFilters>({
    range: "30d",
    group_by: "day",
    qualification_id: undefined,
    is_cpd: undefined,
    assessor_id: undefined,
    iqa_id: undefined,
  });

  const { data: analyticsResponse, isLoading, isError, refetch } = useGetDashboardAnalyticsQuery(filters);
  const { data: qualificationsResponse } = useGetQualificationsQuery();

  const handleFilterChange = (key: keyof AnalyticsFilters, value: string | boolean | undefined) => {
    setFilters((prev) => ({ ...prev, [key]: value === "all" ? undefined : value }));
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 11,
          },
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 12,
        titleFont: { size: 14 },
        bodyFont: { size: 13 },
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: { size: 10 },
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
        ticks: {
          font: { size: 10 },
        },
      },
    },
  };

  const pieOptions = {
    ...chartOptions,
    scales: undefined,
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-end">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardHeader><Skeleton className="h-5 w-32" /></CardHeader>
              <CardContent><Skeleton className="h-[200px] w-full" /></CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const charts = analyticsResponse?.data?.charts;
  const safeCharts = {
    enrolments_trend: charts?.enrolments_trend ?? emptyChartData,
    revenue_trend: charts?.revenue_trend ?? emptyChartData,
    qualification_type_split: charts?.qualification_type_split ?? emptyChartData,
    learners_by_category: charts?.learners_by_category ?? emptyChartData,
    enrolment_status_split: charts?.enrolment_status_split ?? emptyChartData,
    top_qualifications_by_enrolment: charts?.top_qualifications_by_enrolment ?? emptyChartData,
    top_qualifications_by_revenue: charts?.top_qualifications_by_revenue ?? emptyChartData,
    staff_workload: charts?.staff_workload ?? emptyChartData,
  };

  return (
    <div className="space-y-6">
      <Link to="/admin/dashboard" className="inline-flex items-center gap-1.5 text-primary hover:underline text-sm">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analytics Dashboard</h1>
          <p className="text-muted-foreground text-sm">Deep dive into performance metrics and trends</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} className="h-9">
            <RefreshCcw className="w-4 h-4 mr-2" /> Refresh
          </Button>
        </div>
      </div>

      {/* Filters Bar */}
      <Card className="bg-muted/30 border-none shadow-none">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Range</label>
              <Select value={filters.range} onValueChange={(v) => handleFilterChange("range", v)}>
                <SelectTrigger className="h-9 bg-background">
                  <SelectValue placeholder="Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 Days</SelectItem>
                  <SelectItem value="30d">Last 30 Days</SelectItem>
                  <SelectItem value="90d">Last 90 Days</SelectItem>
                  <SelectItem value="12m">Last 12 Months</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Group By</label>
              <Select value={filters.group_by} onValueChange={(v) => handleFilterChange("group_by", v)}>
                <SelectTrigger className="h-9 bg-background">
                  <SelectValue placeholder="Group By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Daily</SelectItem>
                  <SelectItem value="week">Weekly</SelectItem>
                  <SelectItem value="month">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Qualification</label>
              <Select value={filters.qualification_id || "all"} onValueChange={(v) => handleFilterChange("qualification_id", v)}>
                <SelectTrigger className="h-9 bg-background">
                  <SelectValue placeholder="All Qualifications" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Qualifications</SelectItem>
                  {qualificationsResponse?.data?.results?.map((q) => (
                    <SelectItem key={q.id} value={q.id}>{q.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Type</label>
              <Select value={filters.is_cpd === undefined ? "all" : filters.is_cpd.toString()} onValueChange={(v) => handleFilterChange("is_cpd", v === "all" ? undefined : v === "true")}>
                <SelectTrigger className="h-9 bg-background">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="true">CPD Only</SelectItem>
                  <SelectItem value="false">Non-CPD Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Note: Assessor and IQA filters would need lists from the backend */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Assessor</label>
              <Select value={filters.assessor_id || "all"} onValueChange={(v) => handleFilterChange("assessor_id", v)}>
                <SelectTrigger className="h-9 bg-background">
                  <SelectValue placeholder="All Assessors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Assessors</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">IQA</label>
              <Select value={filters.iqa_id || "all"} onValueChange={(v) => handleFilterChange("iqa_id", v)}>
                <SelectTrigger className="h-9 bg-background">
                  <SelectValue placeholder="All IQAs" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All IQAs</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {isError && (
        <Card className="border-destructive bg-destructive/5">
          <CardContent className="p-6 text-center">
            <p className="text-destructive font-medium">Failed to load analytics data. Please try again.</p>
            <Button variant="outline" size="sm" mt-4 onClick={() => refetch()}>Retry</Button>
          </CardContent>
        </Card>
      )}

      {charts && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Enrolments Trend */}
          <Card className="shadow-sm border-muted/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" /> Enrolment Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <Bar data={safeCharts.enrolments_trend} options={chartOptions} />
              </div>
            </CardContent>
          </Card>

          {/* Revenue Trend */}
          <Card className="shadow-sm border-muted/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" /> Revenue Growth
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <Line
                  data={safeCharts.revenue_trend}
                  options={{
                    ...chartOptions,
                    plugins: {
                      ...chartOptions.plugins,
                      filler: { propagate: true },
                    },
                    elements: {
                      line: {
                        tension: 0.4,
                        fill: true,
                        backgroundColor: "rgba(59, 130, 246, 0.1)",
                      },
                    },
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Qualification Type Split */}
          <Card className="shadow-sm border-muted/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <PieChart className="w-4 h-4 text-primary" /> Qualification Types
              </CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <div className="h-[280px] w-full max-w-[280px]">
                <Doughnut
                  data={safeCharts.qualification_type_split}
                  options={{
                    ...pieOptions,
                    cutout: "70%",
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Learners by Category */}
          <Card className="shadow-sm border-muted/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Users2 className="w-4 h-4 text-primary" /> Learners by Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <Bar data={safeCharts.learners_by_category} options={{ ...chartOptions, indexAxis: 'y' as const }} />
              </div>
            </CardContent>
          </Card>

          {/* Top Qualifications by Enrolment */}
          <Card className="shadow-sm border-muted/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Top Qualifications (Enrolments)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <Bar data={safeCharts.top_qualifications_by_enrolment} options={chartOptions} />
              </div>
            </CardContent>
          </Card>

          {/* Staff Workload */}
          <Card className="shadow-sm border-muted/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Staff Workload Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <Bar data={safeCharts.staff_workload} options={chartOptions} />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminAnalytics;
