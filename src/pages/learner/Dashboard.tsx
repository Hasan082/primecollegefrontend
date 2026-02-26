import { Link } from "react-router-dom";
import { BookOpen, Clock, CheckCircle2, AlertTriangle, FileText, MessageSquare, Upload, GraduationCap } from "lucide-react";
import { learnerQualifications } from "@/data/learnerMockData";

// Build recent activity from mock data
const buildRecentActivity = () => {
  const activities: { icon: typeof FileText; label: string; detail: string; date: string; color: string }[] = [];

  learnerQualifications.forEach((q) => {
    q.units.forEach((u) => {
      if (u.assessedDate && u.feedback) {
        activities.push({
          icon: MessageSquare,
          label: "Feedback received",
          detail: `${u.code}: ${u.title}`,
          date: u.assessedDate,
          color: u.status === "competent" ? "text-green-600" : "text-orange-500",
        });
      }
      if (u.submittedDate) {
        activities.push({
          icon: Upload,
          label: "Evidence submitted",
          detail: `${u.code}: ${u.title}`,
          date: u.submittedDate,
          color: "text-primary",
        });
      }
    });
  });

  // Sort by date descending (DD/MM/YYYY)
  activities.sort((a, b) => {
    const parseDate = (d: string) => {
      const [day, month, year] = d.split("/").map(Number);
      return new Date(year, month - 1, day).getTime();
    };
    return parseDate(b.date) - parseDate(a.date);
  });

  return activities.slice(0, 5);
};

const Dashboard = () => {
  const allUnits = learnerQualifications.flatMap((q) => q.units);
  const enrolled = learnerQualifications.length;
  const awaiting = allUnits.filter((u) => u.status === "awaiting_assessment").length;
  const competent = allUnits.filter((u) => u.status === "competent").length;
  const resubmission = allUnits.filter((u) => u.status === "resubmission").length;
  const recentActivity = buildRecentActivity();

  const stats = [
    { label: "Enrolled", value: enrolled, icon: BookOpen, color: "bg-primary" },
    { label: "Awaiting Assessment", value: awaiting, icon: Clock, color: "bg-amber-500" },
    { label: "Competent", value: competent, icon: CheckCircle2, color: "bg-green-600" },
    { label: "Resubmission Required", value: resubmission, icon: AlertTriangle, color: "bg-orange-500" },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-3xl font-bold text-foreground">My Dashboard</h1>
        <Link
          to="/learner/qualifications"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg font-semibold hover:opacity-90 transition-opacity text-sm"
        >
          <GraduationCap className="w-4 h-4" />
          My Qualifications
        </Link>
      </div>
      <p className="text-muted-foreground mb-8">Track your progress and submit evidence for assessment</p>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
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

      {/* Recent Activity */}
      <div className="mb-10">
        <h2 className="text-xl font-bold text-foreground mb-4">Recent Activity</h2>
        <div className="bg-card border border-border rounded-xl divide-y divide-border">
          {recentActivity.map((a, i) => (
            <div key={i} className="flex items-center gap-4 p-4">
              <div className={`w-9 h-9 rounded-lg bg-muted flex items-center justify-center flex-shrink-0`}>
                <a.icon className={`w-4 h-4 ${a.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{a.label}</p>
                <p className="text-xs text-muted-foreground truncate">{a.detail}</p>
              </div>
              <span className="text-xs text-muted-foreground flex-shrink-0">{a.date}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
