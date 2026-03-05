import { useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Clock, CheckCircle2, AlertTriangle, FileText, MessageSquare, Upload, GraduationCap, Timer, CalendarPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { learnerQualifications } from "@/data/learnerMockData";
import ExtensionRequestModal from "@/components/learner/ExtensionRequestModal";

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

// Mock deadline alerts for demo
const deadlineAlerts = [
  { unit: "Unit 5: Person-Centred Approaches", daysLeft: 5, status: "warning" as const, link: "/learner/qualification/adult-care-l4/unit/u5" },
  { unit: "Unit 4: Safeguarding and Protection", daysLeft: 2, status: "urgent" as const, link: "/learner/qualification/adult-care-l4/unit/u4" },
  { unit: "Unit 6: Communication in Care Settings", daysLeft: -3, status: "overdue" as const, link: "/learner/qualification/adult-care-l4/unit/u6" },
];

const Dashboard = () => {
  const [extensionOpen, setExtensionOpen] = useState(false);
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
    <div>
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

      {/* Deadline Alerts */}
      {deadlineAlerts.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Timer className="w-5 h-5" /> Upcoming Deadlines
          </h2>
          <div className="space-y-2">
            {deadlineAlerts.map((alert, i) => (
              <Link
                key={i}
                to={alert.link}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-colors hover:bg-muted/50 ${
                  alert.status === "overdue" ? "border-destructive/50 bg-destructive/5" :
                  alert.status === "urgent" ? "border-destructive/30 bg-destructive/5" :
                  "border-amber-500/30 bg-amber-500/5"
                }`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  alert.status === "overdue" ? "bg-destructive/10" :
                  alert.status === "urgent" ? "bg-destructive/10" :
                  "bg-amber-500/10"
                }`}>
                  <Timer className={`w-4 h-4 ${
                    alert.status === "overdue" ? "text-destructive" :
                    alert.status === "urgent" ? "text-destructive" :
                    "text-amber-500"
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{alert.unit}</p>
                  <p className="text-xs text-muted-foreground">
                    {alert.status === "overdue"
                      ? `Overdue by ${Math.abs(alert.daysLeft)} days — contact your trainer`
                      : `${alert.daysLeft} days remaining`
                    }
                  </p>
                </div>
                <Badge variant={alert.status === "overdue" || alert.status === "urgent" ? "destructive" : "secondary"} className="text-[10px]">
                  {alert.status === "overdue" ? "Overdue" : alert.status === "urgent" ? "Urgent" : "Warning"}
                </Badge>
              </Link>
            ))}
          </div>
        </div>
      )}

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
