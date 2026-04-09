import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users, GraduationCap, UserCheck, FileText, TrendingUp, AlertCircle,
  ClipboardCheck, Shield, BookOpen, Blocks, BarChart3, Download,
  Eye, ChevronRight, Clock, RefreshCcw, UserPlus, CheckCircle2,
  CreditCard, PoundSterling, Wallet
} from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import {
  DashboardFilters,
  DashboardOverviewResponse,
  useGetDashboardOverviewQuery,
  useGetRecentEnrolmentsQuery,
} from "@/redux/apis/adminDashboardApi";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import TablePagination from "@/components/admin/TablePagination";

// Vibrant color palettes for dashboard charts
const chartColors = {
  primary: ["#3b82f6", "#8b5cf6", "#ec4899", "#f97316", "#14b8a6"],
  warm: ["#f97316", "#ef4444", "#eab308", "#f43f5e", "#fb923c"],
};

const adjustColorBrightness = (color: string, factor: number) => {
  const hex = color.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const newR = Math.min(255, Math.round(r * factor));
  const newG = Math.min(255, Math.round(g * factor));
  const newB = Math.min(255, Math.round(b * factor));
  return `#${newR.toString(16).padStart(2, "0")}${newG.toString(16).padStart(2, "0")}${newB.toString(16).padStart(2, "0")}`;
};

const AdminDashboard = () => {
  const [filters] = useState<DashboardFilters>({
    range: "30d",
  });

  const { data: dashboardResponse, isLoading, isError, refetch } = useGetDashboardOverviewQuery(filters);


  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-end">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-20 w-full" />)}
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <Skeleton className="h-[250px] w-full" />
          <Skeleton className="h-[250px] w-full" />
        </div>
      </div>
    );
  }

  const data: DashboardOverviewResponse["data"] | undefined = dashboardResponse?.data;

  const stats = {
    totalLearners: data?.kpis?.total_learners || 0,
    activeEnrolments: data?.kpis?.active_enrolments || 0,
    completedEnrolments: data?.kpis?.completed_enrolments || 0,
    certificatesIssued: data?.kpis?.certificates_issued || 0,
    grossRevenue: data?.kpis?.gross_revenue || "0.00",
    paidOrders: data?.kpis?.paid_orders || 0,
    pendingAssessments: data?.pipeline?.trainer_review_pending || 0,
    pendingIQA: data?.pipeline?.iqa_review_pending || 0,
    escalatedIQA: data?.escalated_iqa_count || 0,
    monthlyEnrolments: data?.charts?.enrolments_trend_simple || [],
    categoryDistribution: data?.charts?.learners_by_category_simple || [],
    trainerPerformances: data?.trainer_overview || [],
    recentEnrolments: data?.recent_enrolments || [],

    recentOrders: data?.recent_orders || [],
    topQualifications: data?.top_qualifications || [],
    statusBreakdown: data?.status_breakdown || [],
    todayStats: data?.today || {
      new_enrolments: 0,
      completed_enrolments: 0,
      issued_certificates: 0,
      paid_orders: 0,
      revenue: "0.00",
    },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground text-sm">System-wide monitoring and management</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="h-9">
          <RefreshCcw className="w-4 h-4 mr-2" /> Sync Data
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Learners */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalLearners}</p>
                <p className="text-xs text-muted-foreground">Total Learners</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Enrolments */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.activeEnrolments}</p>
                <p className="text-xs text-muted-foreground">Active Enrolments</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Paid Orders */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.paidOrders}</p>
                <p className="text-xs text-muted-foreground">Paid Orders</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pending IQA */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pendingIQA}</p>
                <p className="text-xs text-muted-foreground">Pending IQA</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* New Enrolments */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.todayStats.new_enrolments}</p>
                <p className="text-xs text-muted-foreground">New Enrolments</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Completed */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.todayStats.completed_enrolments}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Paid Orders - Today */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.todayStats.paid_orders}</p>
                <p className="text-xs text-muted-foreground">Paid Orders (Today)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Revenue */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">£{stats.todayStats.revenue}</p>
                <p className="text-xs text-muted-foreground">Revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>



      {/* Escalated Alert */}
      {stats.escalatedIQA > 0 && (
        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-destructive" />
              <div>
                <p className="text-sm font-semibold text-destructive">{stats.escalatedIQA} IQA Escalation{stats.escalatedIQA > 1 ? "s" : ""} Require Admin Attention</p>
                <p className="text-xs text-muted-foreground">Flagged by Internal Quality Assurer for compliance review</p>
              </div>
            </div>
            <Link to="/admin/reports" className="text-sm text-primary hover:underline font-medium">Review →</Link>
          </CardContent>
        </Card>
      )}

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> Monthly Enrolments
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.monthlyEnrolments.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={stats.monthlyEnrolments} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis
                    dataKey="month"
                    className="text-xs"
                    tick={{ fill: "#6b7280", fontSize: 11, fontWeight: 500 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    className="text-xs"
                    tick={{ fill: "#6b7280", fontSize: 11, fontWeight: 500 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(59, 130, 246, 0.1)" }}
                    contentStyle={{
                      backgroundColor: "rgba(0, 0, 0, 0.85)",
                      border: "none",
                      borderRadius: "10px",
                      padding: "12px 16px",
                      color: "#fff",
                      fontSize: "13px",
                      fontWeight: 500,
                    }}
                  />
                  <Bar
                    dataKey="count"
                    fill="#3b82f6"
                    radius={[6, 6, 0, 0]}
                    animationDuration={800}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">
                No enrolment data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <GraduationCap className="w-4 h-4" /> Learners by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.categoryDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={stats.categoryDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={75}
                    innerRadius={35}
                    dataKey="value"
                    paddingAngle={3}
                    stroke="#fff"
                    strokeWidth={2}
                    label={({ name, value }) => `${name}: ${value}`}
                    labelLine={false}
                  >
                    {stats.categoryDistribution.map((entry: any, i: number) => (
                      <Cell
                        key={i}
                        fill={chartColors.warm[i % chartColors.warm.length]}
                        stroke={adjustColorBrightness(chartColors.warm[i % chartColors.warm.length], 1.15)}
                        strokeWidth={3}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(0, 0, 0, 0.85)",
                      border: "none",
                      borderRadius: "10px",
                      padding: "12px 16px",
                      color: "#fff",
                      fontSize: "13px",
                      fontWeight: 500,
                    }}
                    itemStyle={{ color: "#fff" }}
                    labelStyle={{ color: "#fff" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">
                No category data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Trainer Overview Table */}
      {stats.trainerPerformances.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <UserCheck className="w-4 h-4" /> Trainer Overview
              </CardTitle>
              <Link to="/admin/trainers" className="text-xs text-primary hover:underline">View All →</Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="py-2 font-medium text-muted-foreground">Trainer</th>
                    <th className="py-2 font-medium text-muted-foreground text-center">Learners</th>
                    <th className="py-2 font-medium text-muted-foreground text-center">Assessments</th>
                    <th className="py-2 font-medium text-muted-foreground text-center">IQA Flags</th>
                    <th className="py-2 font-medium text-muted-foreground text-center">IQA Approvals</th>
                    <th className="py-2 font-medium text-muted-foreground text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.trainerPerformances.map((t) => (
                    <tr key={t.id} className="border-b border-border/50">
                      <td className="py-2.5 font-medium">{t.name}</td>
                      <td className="py-2.5 text-center">{t.assigned_learners}</td>
                      <td className="py-2.5 text-center">{t.total_assessments}</td>
                      <td className="py-2.5 text-center">
                        {t.iqa_flags > 3 ? (
                          <Badge variant="destructive" className="text-xs">{t.iqa_flags}</Badge>
                        ) : (
                          <span>{t.iqa_flags}</span>
                        )}
                      </td>
                      <td className="py-2.5 text-center">{t.iqa_approvals}</td>
                      <td className="py-2.5 text-center">
                        <Badge variant={t.status === "Active" ? "default" : "secondary"} className="text-xs">
                          {t.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Enrolments */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Recent Enrollments</CardTitle>
            <Link to="/admin/enrollments" className="text-xs text-primary hover:underline">View All →</Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="py-2 font-medium text-muted-foreground">Learner</th>
                  <th className="py-2 font-medium text-muted-foreground">Qualification</th>
                  <th className="py-2 font-medium text-muted-foreground text-center">Status</th>
                  <th className="py-2 font-medium text-muted-foreground text-center">Payment</th>
                  <th className="py-2 font-medium text-muted-foreground text-center">Amount</th>

                  <th className="py-2 font-medium text-muted-foreground text-right">Enrolled</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentEnrolments?.map((enrolment) => (
                  <tr key={enrolment.id} className="border-b border-border/50">
                    <td className="py-2.5 font-medium">{enrolment.learner_name}</td>
                    <td className="py-2.5 text-muted-foreground">{enrolment.qualification_title}</td>
                    <td className="py-2.5 text-center">
                      <Badge variant={enrolment.status === "active" ? "default" : "secondary"} className="text-xs">
                        {enrolment.status}
                      </Badge>
                    </td>
                    <td className="py-2.5 text-center">
                      <Badge variant={enrolment.payment_status === "paid" ? "default" : "secondary"} className="text-xs">
                        {enrolment.payment_status}
                      </Badge>
                    </td>
                    <td className="py-2.5 text-center">

                      {`${enrolment?.currency} ${enrolment?.amount}`}

                    </td>

                    <td className="py-2.5 text-right text-muted-foreground">
                      {new Date(enrolment.enrolled_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </CardContent>
      </Card>

      {/* Quick Actions + Recent Orders + Top Qualifications */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link to="/admin/qualifications" className="block p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <GraduationCap className="w-4 h-4 text-primary" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Manage Qualifications</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </Link>
            <Link to="/admin/learners" className="block p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4 text-primary" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Manage Learners</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </Link>
            <Link to="/admin/trainers" className="block p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <UserCheck className="w-4 h-4 text-primary" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Manage Trainers</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentOrders.slice(0, 4).map((order) => (
                <div key={order.id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium">{order.order_number}</p>
                    <p className="text-xs text-muted-foreground">{order.customer_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">£{order.grand_total}</p>
                    <Badge variant={order.status === "paid" ? "default" : "secondary"} className="text-xs mt-0.5">
                      {order.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Top Qualifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.topQualifications.slice(0, 4).map((qual) => (
                <div key={qual.qualification_id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium truncate max-w-[180px]">{qual.title}</p>
                    <p className="text-xs text-muted-foreground">{qual.enrolments} enrolments</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">£{qual.revenue}</p>
                    <p className="text-xs text-muted-foreground">{qual.completions} completed</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {isError && (
        <Card className="border-destructive bg-destructive/5">
          <CardContent className="p-6 text-center">
            <p className="text-destructive font-medium">Failed to sync with server. Using cached data.</p>
            <Button variant="outline" size="sm" mt-4 onClick={() => refetch()}>Retry Sync</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminDashboard;
