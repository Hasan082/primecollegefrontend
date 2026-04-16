import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ClipboardCheck, CheckCircle2, AlertTriangle, ShieldAlert, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useGetIqaDashboardQuery } from "@/redux/apis/iqa/iqaApi";
import {
  getIqaWorkflowBadgeVariant,
  getIqaWorkflowLabel,
  getSubmissionOutcomeLabel,
} from "@/lib/iqaStatus";

const IQADashboard = () => {
  const { data, isLoading, isError } = useGetIqaDashboardQuery();

  if (isLoading) {
    return <div className="py-20 text-center text-muted-foreground">Loading IQA dashboard...</div>;
  }

  if (isError || !data?.data) {
    return <div className="py-20 text-center text-muted-foreground">Failed to load IQA dashboard.</div>;
  }

  const { summary, pending_reviews, trainer_overview } = data.data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">IQA Dashboard</h1>
        <p className="text-sm text-muted-foreground">Internal Quality Assurance review and compliance overview</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Awaiting IQA", value: summary.pending_review, icon: ClipboardCheck, classes: "bg-amber-100 text-amber-600" },
          { label: "Signed Off", value: summary.approved, icon: CheckCircle2, classes: "bg-green-100 text-green-600" },
          { label: "Action Required", value: summary.action_required, icon: AlertTriangle, classes: "bg-orange-100 text-orange-600" },
          { label: "Escalated", value: summary.escalated, icon: ShieldAlert, classes: "bg-red-100 text-red-600" },
        ].map((item) => (
          <Card key={item.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${item.classes}`}>
                <item.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{item.value}</p>
                <p className="text-xs text-muted-foreground">{item.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Awaiting IQA</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/iqa/sampling" className="text-xs">Open Inbox <ArrowRight className="w-3 h-3 ml-1" /></Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {pending_reviews.length === 0 ? (
              <p className="text-sm text-muted-foreground">No pending reviews</p>
            ) : (
              pending_reviews.map((item) => (
                <Link key={item.submission_id} to={`/iqa/review/${item.submission_id}`} className="block border rounded-lg p-3 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{item.learner.name}</span>
                    <Badge
                      variant={getIqaWorkflowBadgeVariant(getIqaWorkflowLabel(item.iqa_status))}
                      className="text-xs"
                    >
                      {getIqaWorkflowLabel(item.iqa_status)}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{item.unit.unit_code}: {item.unit.title}</p>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-xs text-muted-foreground">Trainer: {item.trainer?.name || "Unassigned"}</span>
                    <Badge variant="outline" className="text-xs">{getSubmissionOutcomeLabel(item.status)}</Badge>
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Trainer Quality Overview</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/iqa/trainers" className="text-xs">View All <ArrowRight className="w-3 h-3 ml-1" /></Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {trainer_overview.length === 0 ? (
              <p className="text-sm text-muted-foreground">No reviewed trainer activity yet</p>
            ) : (
              trainer_overview.map((item) => {
                const approvalRate = item.total_assessments > 0
                  ? Math.round((item.iqa_approvals / item.total_assessments) * 100)
                  : 0;
                return (
                  <div key={item.trainer?.id || item.trainer?.name || "unassigned"} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{item.trainer?.name || "Unassigned trainer"}</span>
                      <Badge variant={approvalRate >= 80 ? "default" : approvalRate >= 60 ? "secondary" : "destructive"} className="text-xs">
                        {approvalRate}% approved
                      </Badge>
                    </div>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span>{item.total_assessments} assessed</span>
                      <span>{item.iqa_flags} flagged</span>
                      <span>{item.avg_turnaround_days}d avg turnaround</span>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default IQADashboard;
