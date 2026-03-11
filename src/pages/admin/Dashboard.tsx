import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users, GraduationCap, UserCheck, FileText, TrendingUp, AlertCircle,
  ClipboardCheck, Shield, BookOpen, Blocks, BarChart3, Download,
  Eye, ChevronRight
} from "lucide-react";
import { adminStats, adminLearners, adminQualifications, adminTrainers } from "@/data/adminMockData";
import { iqaSamples, trainerPerformances } from "@/data/iqaMockData";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ["hsl(var(--primary))", "hsl(var(--secondary))", "hsl(var(--accent))", "hsl(var(--muted))"];

const AdminDashboard = () => {
  const recentEnrolments = adminLearners
    .sort((a, b) => b.enrolledDate.localeCompare(a.enrolledDate))
    .slice(0, 5);

  const pendingIQA = iqaSamples.filter(s => s.iqaStatus === "Pending IQA Review").length;
  const escalatedIQA = iqaSamples.filter(s => s.iqaStatus === "Escalated to Admin").length;
  const pendingAssessments = adminStats.pendingSubmissions;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground text-sm">System-wide monitoring and management</p>
      </div>

      {/* Top Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{adminStats.activeLearners}</p>
                <p className="text-xs text-muted-foreground">Active Learners</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{adminStats.activeQualifications}</p>
                <p className="text-xs text-muted-foreground">Active Qualifications</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingAssessments}</p>
                <p className="text-xs text-muted-foreground">Pending Assessments</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingIQA}</p>
                <p className="text-xs text-muted-foreground">Pending IQA Reviews</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Escalated Alert */}
      {escalatedIQA > 0 && (
        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-destructive" />
              <div>
                <p className="text-sm font-semibold text-destructive">{escalatedIQA} IQA Escalation{escalatedIQA > 1 ? "s" : ""} Require Admin Attention</p>
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
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={adminStats.monthlyEnrolments}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis allowDecimals={false} className="text-xs" />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <GraduationCap className="w-4 h-4" /> Learners by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={adminStats.categoryDistribution} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {adminStats.categoryDistribution.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Trainer Overview Table */}
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
                {trainerPerformances.map((t) => {
                  const adminTrainer = adminTrainers.find(at => at.name === t.name);
                  return (
                    <tr key={t.id} className="border-b border-border/50">
                      <td className="py-2.5 font-medium">{t.name}</td>
                      <td className="py-2.5 text-center">{adminTrainer?.assignedLearners ?? t.totalAssessments}</td>
                      <td className="py-2.5 text-center">{t.totalAssessments}</td>
                      <td className="py-2.5 text-center">
                        {t.iqaFlags > 3 ? (
                          <Badge variant="destructive" className="text-xs">{t.iqaFlags}</Badge>
                        ) : (
                          <span>{t.iqaFlags}</span>
                        )}
                      </td>
                      <td className="py-2.5 text-center">{t.iqaApprovals}</td>
                      <td className="py-2.5 text-center">
                        <Badge variant={t.status === "Active" ? "default" : "secondary"} className="text-xs">
                          {t.status}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions + Recent */}
      <div className="grid lg:grid-cols-2 gap-6">
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
                  <p className="text-xs text-muted-foreground">{adminQualifications.length} qualifications configured</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </Link>
            <Link to="/admin/learners" className="block p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4 text-primary" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Manage Learners</p>
                  <p className="text-xs text-muted-foreground">{adminStats.activeLearners} active enrolments</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </Link>
            <Link to="/admin/trainers" className="block p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <UserCheck className="w-4 h-4 text-primary" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Manage Trainers</p>
                  <p className="text-xs text-muted-foreground">{adminStats.activeTrainers} active trainers</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </Link>
            <Link to="/admin/progress" className="block p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <BarChart3 className="w-4 h-4 text-primary" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Progress Monitoring</p>
                  <p className="text-xs text-muted-foreground">Track learner progress & at-risk alerts</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </Link>
            <Link to="/admin/question-bank" className="block p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <BookOpen className="w-4 h-4 text-primary" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Question Bank</p>
                  <p className="text-xs text-muted-foreground">Manage quizzes & assessment questions</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </Link>
            <Link to="/admin/final-assessments" className="block p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <ClipboardCheck className="w-4 h-4 text-primary" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Final Assessments</p>
                  <p className="text-xs text-muted-foreground">Qualification-wide final assessment management</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </Link>
            <Link to="/admin/reports" className="block p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-primary" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Reports & Export</p>
                  <p className="text-xs text-muted-foreground">Generate compliance reports</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </Link>
            <Link to="/admin/eqa-export" className="block p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <Download className="w-4 h-4 text-primary" />
                <div className="flex-1">
                  <p className="text-sm font-medium">EQA Portfolio Export</p>
                  <p className="text-xs text-muted-foreground">Full learner portfolios for external quality assurers</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </Link>
            <Link to="/admin/pages" className="block p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <Blocks className="w-4 h-4 text-primary" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Page Builder</p>
                  <p className="text-xs text-muted-foreground">Manage website content & pages</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Recent Enrolments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentEnrolments.map((l) => (
                <div key={l.id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium">{l.name}</p>
                    <p className="text-xs text-muted-foreground">{l.qualification}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-muted-foreground">{l.enrolledDate}</span>
                    <div>
                      <Badge variant={l.paymentStatus === "paid" ? "default" : l.paymentStatus === "pending" ? "secondary" : "destructive"} className="text-xs mt-0.5">
                        {l.paymentStatus}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
