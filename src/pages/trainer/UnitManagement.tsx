import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft, FileText, CheckCircle2, Clock, AlertTriangle,
  ClipboardList, PenLine, Download, Eye
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { trainerLearners } from "@/data/trainerMockData";

const statusConfig: Record<string, { label: string; className: string; icon: typeof CheckCircle2 }> = {
  Competent: { label: "Competent", className: "bg-green-600 text-white", icon: CheckCircle2 },
  "Pending Assessment": { label: "Pending Assessment", className: "bg-amber-500 text-white", icon: Clock },
  "Resubmission Required": { label: "Resubmission Required", className: "bg-orange-500 text-white", icon: AlertTriangle },
  "Not Started": { label: "Not Started", className: "bg-muted text-muted-foreground", icon: Clock },
};

/* Mock submissions for the unit */
const mockSubmissions = [
  { id: "sub1", type: "quiz" as const, title: "Knowledge Assessment Quiz", submittedDate: "05/02/2025", status: "submitted", score: null },
  { id: "sub2", type: "written" as const, title: "Reflective Account — Duty of Care", submittedDate: "03/02/2025", status: "submitted", wordCount: 1420 },
  { id: "sub3", type: "evidence" as const, title: "Portfolio Evidence Upload", submittedDate: "01/02/2025", status: "submitted", files: ["Duty_of_Care_Portfolio.pdf", "Workplace_Observation.pdf"] },
];

const UnitManagement = () => {
  const { learnerId, unitCode } = useParams();

  const learner = trainerLearners.find((l) => l.id === learnerId);
  const unit = learner?.units.find((u) => u.code === unitCode);

  if (!learner || !unit) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Unit not found.</p>
        <Link to="/trainer/learners" className="text-primary underline mt-2 inline-block">Back to Learners</Link>
      </div>
    );
  }

  const cfg = statusConfig[unit.status] || statusConfig["Not Started"];

  return (
    <div>
      <Link
        to={`/trainer/learner/${learnerId}`}
        className="inline-flex items-center gap-1.5 text-primary hover:underline text-sm mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Learner Details
      </Link>

      {/* Unit Header */}
      <Card className="bg-primary text-primary-foreground p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-primary-foreground/70 text-sm mb-1">{learner.name} • {learner.learnerId}</p>
            <h1 className="text-2xl font-bold">{unit.code}: {unit.name}</h1>
            <p className="text-primary-foreground/80 text-sm mt-1">{learner.qualification}</p>
          </div>
          <Badge className={`text-xs font-bold ${cfg.className}`}>{cfg.label}</Badge>
        </div>
      </Card>

      {/* Submissions */}
      <h2 className="text-lg font-bold text-foreground mb-4">Learner Submissions</h2>

      {unit.status === "Not Started" ? (
        <Card className="p-12 text-center">
          <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-bold text-foreground mb-1">No Submissions Yet</h3>
          <p className="text-sm text-muted-foreground">This learner has not submitted any work for this unit.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {mockSubmissions.map((sub) => {
            const Icon = sub.type === "quiz" ? ClipboardList : sub.type === "written" ? PenLine : FileText;
            return (
              <Card key={sub.id} className="p-5">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground text-sm">{sub.title}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs text-muted-foreground capitalize">{sub.type}</span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">Submitted: {sub.submittedDate}</span>
                      {sub.wordCount && (
                        <>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground">{sub.wordCount} words</span>
                        </>
                      )}
                    </div>
                    {sub.files && (
                      <div className="flex gap-2 mt-2">
                        {sub.files.map((f) => (
                          <span key={f} className="text-xs bg-muted px-2 py-1 rounded flex items-center gap-1">
                            <FileText className="w-3 h-3" /> {f}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-amber-500 text-white text-xs">Awaiting Review</Badge>
                    <Link to={`/trainer/review/${sub.id}`}>
                      <Button size="sm" variant="outline" className="gap-1">
                        <Eye className="w-3.5 h-3.5" /> Review
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Link to question bank */}
      <Card className="p-4 mt-6 bg-muted/30">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">Question Bank for this Unit</p>
            <p className="text-xs text-muted-foreground">Manage question pool, quiz settings, and written assignments</p>
          </div>
          <Link to="/trainer/question-bank">
            <Button variant="outline" size="sm">Go to Question Bank</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default UnitManagement;
