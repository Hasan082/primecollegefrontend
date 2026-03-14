import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2, Clock, AlertTriangle, Circle, ShieldCheck } from "lucide-react";
import { learnerQualifications } from "@/data/learnerMockData";
import { Progress } from "@/components/ui/progress";
import type { UnitData } from "@/data/learnerMockData";

const statusConfig: Record<UnitData["status"], { label: string; color: string; icon: typeof CheckCircle2 }> = {
  competent: { label: "Competent", color: "bg-green-600 text-white", icon: CheckCircle2 },
  awaiting_assessment: { label: "Awaiting Assessment", color: "bg-amber-500 text-white", icon: Clock },
  awaiting_iqa: { label: "Awaiting IQA Verification", color: "bg-blue-600 text-white", icon: ShieldCheck },
  resubmission: { label: "Resubmission Required", color: "bg-orange-500 text-white", icon: AlertTriangle },
  not_started: { label: "Not Started", color: "bg-muted text-muted-foreground", icon: Circle },
};

const QualificationView = () => {
  const { id } = useParams();
  const qualification = learnerQualifications.find((q) => q.id === id);

  if (!qualification) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Qualification not found.</p>
        <Link to="/learner/dashboard" className="text-primary hover:underline mt-2 inline-block">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const completed = qualification.units.filter((u) => u.status === "competent").length;
  const total = qualification.units.length;
  const pct = Math.round((completed / total) * 100);

  return (
    <div>
      <Link to="/learner/dashboard" className="inline-flex items-center gap-2 text-primary hover:underline mb-6 text-sm font-medium">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      {/* Qualification header */}
      <div className="bg-card border border-border rounded-xl p-6 mb-8">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <h1 className="text-2xl font-bold text-foreground">{qualification.title}</h1>
          <span className={`${qualification.categoryColor} text-white text-xs font-bold px-2.5 py-0.5 rounded`}>
            {qualification.category}
          </span>
        </div>
        <p className="text-sm text-muted-foreground mb-4">Qualification Code: {qualification.code}</p>

        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Overall Progress</span>
          <span className="text-sm font-semibold text-primary">
            {completed} of {total} Units Complete ({pct}%)
          </span>
        </div>
        <Progress value={pct} className="h-3" />
      </div>

      {/* Units */}
      <h2 className="text-xl font-bold text-primary mb-1">Qualification Units</h2>
      <p className="text-sm text-muted-foreground mb-6">Select a unit to access resources and submit evidence</p>

      <div className="space-y-4">
        {qualification.units.map((unit) => {
          const cfg = statusConfig[unit.status];
          const Icon = cfg.icon;

          return (
            <div key={unit.id} className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${unit.status === "competent" ? "text-green-600" : unit.status === "awaiting_assessment" ? "text-amber-500" : unit.status === "awaiting_iqa" ? "text-blue-600" : unit.status === "resubmission" ? "text-orange-500" : "text-muted-foreground"}`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-semibold text-foreground">
                        {unit.code}: {unit.title}
                      </span>
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded ${cfg.color}`}>
                        {cfg.label}
                      </span>
                    </div>
                    {unit.submittedDate && (
                      <p className="text-xs text-muted-foreground">Submitted: {unit.submittedDate}</p>
                    )}
                    {unit.assessedDate && (
                      <p className="text-xs text-muted-foreground">Assessed: {unit.assessedDate}</p>
                    )}
                    {unit.feedback && (
                      <div className="mt-3 bg-muted/50 rounded-lg p-4">
                        <p className="text-sm font-semibold text-foreground mb-1">Assessor Feedback:</p>
                        <p className="text-sm text-muted-foreground">{unit.feedback}</p>
                      </div>
                    )}
                  </div>
                </div>
                <Button
                  asChild
                  size="sm"
                  className="flex-shrink-0"
                >
                  <Link to={`/learner/qualification/${id}/unit/${unit.id}`}>
                    View Unit
                  </Link>
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default QualificationView;
