import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ClipboardCheck, CheckCircle2, AlertTriangle, ShieldAlert, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { iqaSamples, trainerPerformances } from "@/data/iqaMockData";

const IQADashboard = () => {
  const pending = iqaSamples.filter(s => s.iqaStatus === "Pending IQA Review").length;
  const approved = iqaSamples.filter(s => s.iqaStatus === "IQA Approved").length;
  const flagged = iqaSamples.filter(s => s.iqaStatus === "Assessor Action Required").length;
  const escalated = iqaSamples.filter(s => s.iqaStatus === "Escalated to Admin").length;

  const recentPending = iqaSamples.filter(s => s.iqaStatus === "Pending IQA Review").slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">IQA Dashboard</h1>
        <p className="text-sm text-muted-foreground">Internal Quality Assurance — monitor assessment quality and compliance</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <ClipboardCheck className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{pending}</p>
              <p className="text-xs text-muted-foreground">Pending Review</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{approved}</p>
              <p className="text-xs text-muted-foreground">IQA Approved</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{flagged}</p>
              <p className="text-xs text-muted-foreground">Action Required</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{escalated}</p>
              <p className="text-xs text-muted-foreground">Escalated</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Pending Queue */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Pending IQA Reviews</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/iqa/sampling" className="text-xs">View All <ArrowRight className="w-3 h-3 ml-1" /></Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentPending.length === 0 ? (
              <p className="text-sm text-muted-foreground">No pending reviews</p>
            ) : (
              recentPending.map((s) => (
                <Link key={s.id} to={`/iqa/review/${s.id}`} className="block border rounded-lg p-3 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{s.learnerName}</span>
                    <Badge variant={s.outcome === "Competent" ? "default" : "destructive"} className="text-xs">
                      {s.outcome}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{s.unit}</p>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-xs text-muted-foreground">Trainer: {s.trainerName}</span>
                    <Badge variant="outline" className="text-xs">{s.samplingReason}</Badge>
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        {/* Trainer Overview */}
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
            {trainerPerformances.map((t) => {
              const approvalRate = t.totalAssessments > 0 ? Math.round((t.iqaApprovals / t.totalAssessments) * 100) : 0;
              return (
                <div key={t.id} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{t.name}</span>
                    <Badge variant={approvalRate >= 80 ? "default" : approvalRate >= 60 ? "secondary" : "destructive"} className="text-xs">
                      {approvalRate}% approved
                    </Badge>
                  </div>
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span>{t.totalAssessments} assessed</span>
                    <span>{t.iqaFlags} flagged</span>
                    <span>{t.avgTurnaroundDays}d avg turnaround</span>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default IQADashboard;
