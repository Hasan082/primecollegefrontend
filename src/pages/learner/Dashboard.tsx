import { useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  BookOpen,
  CalendarPlus,
  CheckCircle2,
  Clock,
  FileText,
  GraduationCap,
  Loader2,
  MessageSquare,
  ShieldCheck,
  Timer,
  Upload,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ExtensionRequestModal from "@/components/learner/ExtensionRequestModal";
import {
  LearnerDashboardRecentActivity,
  useGetLearnerDashboardQuery,
} from "@/redux/apis/enrolmentApi";

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("en-GB");

const activityIconMap = (activity: LearnerDashboardRecentActivity) => {
  if (activity.type === "submission") {
    return { icon: Upload, color: "text-primary" };
  }
  if (activity.type === "assessment_outcome") {
    if (activity.label.toLowerCase().includes("competency")) {
      return { icon: MessageSquare, color: "text-green-600" };
    }
    if (activity.label.toLowerCase().includes("resubmission")) {
      return { icon: AlertTriangle, color: "text-orange-500" };
    }
    return { icon: MessageSquare, color: "text-amber-500" };
  }
  if (activity.type === "learner_declaration") {
    return { icon: FileText, color: "text-primary" };
  }
  if (activity.type === "course_evaluation") {
    return { icon: MessageSquare, color: "text-primary" };
  }
  return { icon: FileText, color: "text-muted-foreground" };
};

const Dashboard = () => {
  const [extensionOpen, setExtensionOpen] = useState(false);
  const [extensionQual, setExtensionQual] = useState<{ title: string; expiry: string }>({
    title: "",
    expiry: "",
  });

  const { data, isLoading, error, refetch } = useGetLearnerDashboardQuery();
  const dashboard = data?.data;

  const stats = [
    { label: "Enrolled", value: dashboard?.summary.enrolled ?? 0, icon: BookOpen, color: "bg-primary" },
    { label: "Awaiting Assessment", value: dashboard?.summary.awaiting_assessment ?? 0, icon: Clock, color: "bg-amber-500" },
    { label: "Awaiting IQA", value: dashboard?.summary.awaiting_iqa ?? 0, icon: ShieldCheck, color: "bg-blue-600" },
    { label: "Competent", value: dashboard?.summary.competent ?? 0, icon: CheckCircle2, color: "bg-green-600" },
    { label: "Resubmission Required", value: dashboard?.summary.resubmission_required ?? 0, icon: AlertTriangle, color: "bg-orange-500" },
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
        <Loader2 className="w-8 h-8 animate-spin" />
        <p className="text-sm">Loading your dashboard...</p>
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="text-center py-20 bg-destructive/5 rounded-xl border border-destructive/20 max-w-2xl mx-auto">
        <AlertTriangle className="w-10 h-10 text-destructive mx-auto mb-4" />
        <h2 className="text-lg font-bold text-destructive mb-2">Failed to load dashboard</h2>
        <p className="text-sm text-muted-foreground mb-6">
          There was an error loading your learner dashboard.
        </p>
        <Button onClick={() => refetch()}>Retry</Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-3xl font-bold text-foreground">My Dashboard</h1>
        <Button asChild>
          <Link to="/learner/qualifications" className="gap-2">
            <GraduationCap className="w-4 h-4" />
            My Qualifications
          </Link>
        </Button>
      </div>
      <p className="text-muted-foreground mb-8">Track your progress and submit evidence for assessment</p>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
        {stats.map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-5 flex items-center gap-4">
            <div className={`w-11 h-11 rounded-lg ${s.color} flex items-center justify-center flex-shrink-0`}>
              <s.icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {dashboard.expired_qualifications.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" /> Expired Qualifications
          </h2>
          <div className="space-y-2">
            {dashboard.expired_qualifications.map((alert) => (
              <div
                key={alert.enrolment_id}
                className="flex items-center gap-4 p-4 rounded-xl border border-destructive/50 bg-destructive/5"
              >
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 bg-destructive/10">
                  <AlertTriangle className="w-4 h-4 text-destructive" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{alert.qualification_title}</p>
                  <p className="text-xs text-muted-foreground">
                    Access expired on {formatDate(alert.access_expires_at)} — overdue by {alert.days_overdue} days
                  </p>
                </div>
                <Button
                  size="sm"
                  className="gap-1.5 flex-shrink-0"
                  onClick={() => {
                    setExtensionQual({
                      title: alert.qualification_title,
                      expiry: formatDate(alert.access_expires_at),
                    });
                    setExtensionOpen(true);
                  }}
                >
                  <CalendarPlus className="w-3.5 h-3.5" /> Extend & Pay
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {dashboard.upcoming_unit_deadlines.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Timer className="w-5 h-5" /> Upcoming Unit Deadlines
          </h2>
          <div className="space-y-2">
            {dashboard.upcoming_unit_deadlines.map((alert) => (
              <Link
                key={`${alert.enrolment_id}-${alert.unit_id}`}
                to={`/learner/qualification/${alert.enrolment_id}/unit/${alert.unit_id}`}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-colors hover:bg-muted/50 ${
                  alert.severity === "urgent"
                    ? "border-destructive/30 bg-destructive/5"
                    : "border-amber-500/30 bg-amber-500/5"
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    alert.severity === "urgent" ? "bg-destructive/10" : "bg-amber-500/10"
                  }`}
                >
                  <Timer
                    className={`w-4 h-4 ${
                      alert.severity === "urgent" ? "text-destructive" : "text-amber-500"
                    }`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {alert.unit_code}: {alert.unit_title}
                  </p>
                  <p className="text-xs text-muted-foreground">{alert.days_remaining} days remaining</p>
                </div>
                <Badge variant={alert.severity === "urgent" ? "destructive" : "secondary"} className="text-[10px]">
                  {alert.severity === "urgent" ? "Urgent" : "Warning"}
                </Badge>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="mb-10">
        <h2 className="text-xl font-bold text-foreground mb-4">Recent Activity</h2>
        <div className="bg-card border border-border rounded-xl divide-y divide-border">
          {dashboard.recent_activity.length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground">No recent activity yet.</div>
          ) : (
            dashboard.recent_activity.map((activity, index) => {
              const { icon: ActivityIcon, color } = activityIconMap(activity);
              return (
                <div key={`${activity.type}-${activity.date}-${index}`} className="flex items-center gap-4 p-4">
                  <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                    <ActivityIcon className={`w-4 h-4 ${color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{activity.label}</p>
                    <p className="text-xs text-muted-foreground truncate">{activity.detail}</p>
                  </div>
                  <span className="text-xs text-muted-foreground flex-shrink-0">
                    {formatDate(activity.date)}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>

      <ExtensionRequestModal
        open={extensionOpen}
        onOpenChange={setExtensionOpen}
        qualificationTitle={extensionQual.title}
        currentExpiry={extensionQual.expiry}
      />
    </div>
  );
};

export default Dashboard;
