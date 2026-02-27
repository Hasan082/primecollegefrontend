import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft, FileText, CheckCircle2, Clock, AlertTriangle,
  ClipboardList, PenLine, Download, Eye, MessageSquare, Send
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { trainerLearners } from "@/data/trainerMockData";

const statusConfig: Record<string, { label: string; className: string }> = {
  Competent: { label: "Competent", className: "bg-green-600 text-white" },
  "Pending Assessment": { label: "Pending Assessment", className: "bg-amber-500 text-white" },
  "Resubmission Required": { label: "Resubmission Required", className: "bg-orange-500 text-white" },
  "Not Started": { label: "Not Started", className: "bg-muted text-muted-foreground" },
};

type Outcome = "Competent" | "Resubmission Required" | "Not Yet Competent" | "";

/* Mock submissions per unit - keyed by learnerId::unitCode */
interface UnitSubmission {
  id: string;
  type: "quiz" | "written" | "evidence";
  title: string;
  submittedDate: string;
  status: "awaiting_review" | "reviewed";
  wordCount?: number;
  score?: number;
  files?: string[];
  quizDetails?: { totalQuestions: number; answered: number; violations: number; timeTaken: string };
  writtenContent?: string;
}

function getMockSubmissions(learnerId: string, unitCode: string): UnitSubmission[] {
  // Generate contextual submissions based on unit status
  const learner = trainerLearners.find((l) => l.id === learnerId);
  const unit = learner?.units.find((u) => u.code === unitCode);
  if (!unit || unit.status === "Not Started") return [];

  return [
    {
      id: `${learnerId}-${unitCode}-quiz`,
      type: "quiz",
      title: "Knowledge Assessment Quiz",
      submittedDate: "05/02/2025",
      status: "awaiting_review",
      quizDetails: { totalQuestions: 25, answered: 25, violations: 0, timeTaken: "32:15" },
    },
    {
      id: `${learnerId}-${unitCode}-written`,
      type: "written",
      title: `Reflective Account — ${unit.name}`,
      submittedDate: "03/02/2025",
      status: "awaiting_review",
      wordCount: 1420,
      writtenContent: "This is a sample written submission discussing the key principles and practical applications within the context of this unit. The learner has demonstrated understanding through real-world examples from their workplace...",
    },
    {
      id: `${learnerId}-${unitCode}-evidence`,
      type: "evidence",
      title: "Portfolio Evidence Upload",
      submittedDate: "01/02/2025",
      status: "awaiting_review",
      files: [`${unit.name.replace(/\s/g, "_")}_Portfolio.pdf`, "Workplace_Observation.pdf"],
    },
  ];
}

const UnitManagement = () => {
  const { learnerId, unitCode } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const learner = trainerLearners.find((l) => l.id === learnerId);
  const unit = learner?.units.find((u) => u.code === unitCode);

  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<Outcome>("");
  const [feedback, setFeedback] = useState("");
  const [reviewedIds, setReviewedIds] = useState<Set<string>>(new Set());

  if (!learner || !unit) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Unit not found.</p>
        <Link to="/trainer/learners" className="text-primary underline mt-2 inline-block">Back to Learners</Link>
      </div>
    );
  }

  const cfg = statusConfig[unit.status] || statusConfig["Not Started"];
  const submissions = getMockSubmissions(learnerId!, unitCode!);

  const handleSubmitReview = (subId: string) => {
    if (!outcome) {
      toast({ title: "Please select an outcome", variant: "destructive" });
      return;
    }
    if (!feedback.trim()) {
      toast({ title: "Please provide feedback", variant: "destructive" });
      return;
    }
    setReviewedIds((prev) => new Set(prev).add(subId));
    setReviewingId(null);
    setOutcome("");
    setFeedback("");
    toast({ title: "Assessment submitted", description: `Outcome: ${outcome}` });
  };

  const outcomes: { value: Outcome; label: string; desc: string; color: string }[] = [
    { value: "Competent", label: "Competent / Pass", desc: "All criteria met", color: "border-green-500 bg-green-50" },
    { value: "Resubmission Required", label: "Resubmission Required", desc: "Needs revision", color: "border-orange-500 bg-orange-50" },
    { value: "Not Yet Competent", label: "Not Yet Competent", desc: "Significant gaps", color: "border-destructive bg-destructive/5" },
  ];

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

      {submissions.length === 0 ? (
        <Card className="p-12 text-center">
          <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-bold text-foreground mb-1">No Submissions Yet</h3>
          <p className="text-sm text-muted-foreground">This learner has not submitted any work for this unit.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {submissions.map((sub) => {
            const Icon = sub.type === "quiz" ? ClipboardList : sub.type === "written" ? PenLine : FileText;
            const isReviewed = reviewedIds.has(sub.id);
            const isReviewing = reviewingId === sub.id;

            return (
              <Card key={sub.id} className="overflow-hidden">
                {/* Submission Header */}
                <div className="p-5">
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
                      {isReviewed ? (
                        <Badge className="bg-green-600 text-white text-xs gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Reviewed
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-500 text-white text-xs">Awaiting Review</Badge>
                      )}
                      {!isReviewed && (
                        <Button
                          size="sm"
                          variant={isReviewing ? "default" : "outline"}
                          className="gap-1"
                          onClick={() => setReviewingId(isReviewing ? null : sub.id)}
                        >
                          <Eye className="w-3.5 h-3.5" /> {isReviewing ? "Close" : "Review"}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Review Panel */}
                {isReviewing && (
                  <div className="border-t border-border p-5 bg-muted/20">
                    {/* Submission Details */}
                    <div className="mb-6">
                      <h4 className="font-bold text-foreground text-sm mb-3">📋 Submission Details</h4>

                      {sub.type === "quiz" && sub.quizDetails && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-card border border-border rounded-xl p-4">
                          <div>
                            <p className="text-xs text-muted-foreground">Questions</p>
                            <p className="font-semibold text-sm">{sub.quizDetails.answered}/{sub.quizDetails.totalQuestions}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Time Taken</p>
                            <p className="font-semibold text-sm">{sub.quizDetails.timeTaken}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Violations</p>
                            <p className={`font-semibold text-sm ${sub.quizDetails.violations > 0 ? "text-amber-600" : "text-green-600"}`}>
                              {sub.quizDetails.violations}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Status</p>
                            <p className="font-semibold text-sm text-foreground">Auto-scored</p>
                          </div>
                        </div>
                      )}

                      {sub.type === "written" && (
                        <div className="bg-card border border-border rounded-xl p-4">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs text-muted-foreground">{sub.wordCount} words</span>
                            <Button size="sm" variant="outline" className="gap-1 text-xs">
                              <Download className="w-3 h-3" /> Download Full Text
                            </Button>
                          </div>
                          <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground italic leading-relaxed max-h-40 overflow-y-auto">
                            {sub.writtenContent}
                          </div>
                        </div>
                      )}

                      {sub.type === "evidence" && sub.files && (
                        <div className="space-y-2">
                          {sub.files.map((f) => (
                            <div key={f} className="flex items-center justify-between bg-card border border-border rounded-xl p-4">
                              <div className="flex items-center gap-3">
                                <FileText className="w-5 h-5 text-muted-foreground" />
                                <div>
                                  <p className="font-medium text-sm">{f}</p>
                                  <p className="text-xs text-muted-foreground">PDF • Uploaded {sub.submittedDate}</p>
                                </div>
                              </div>
                              <Button size="sm" variant="outline" className="gap-1 text-xs">
                                <Download className="w-3 h-3" /> Download
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Assessment Form */}
                    <div className="border-t border-border pt-5">
                      <h4 className="font-bold text-foreground text-sm mb-3 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-primary" /> Assessment Decision
                      </h4>

                      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Outcome</Label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2 mb-4">
                        {outcomes.map((o) => (
                          <button
                            key={o.value}
                            onClick={() => setOutcome(o.value)}
                            className={`text-left p-3 rounded-xl border-2 transition-all ${
                              outcome === o.value ? o.color : "border-border hover:border-primary/30"
                            }`}
                          >
                            <p className="font-semibold text-sm">{o.label}</p>
                            <p className="text-xs text-muted-foreground">{o.desc}</p>
                          </button>
                        ))}
                      </div>

                      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Feedback</Label>
                      <textarea
                        className="w-full mt-2 border border-border rounded-xl p-3 text-sm min-h-[100px] focus:outline-none focus:ring-2 focus:ring-ring resize-none bg-background"
                        placeholder="Provide detailed feedback for the learner..."
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                      />

                      <div className="flex justify-end mt-3">
                        <Button onClick={() => handleSubmitReview(sub.id)} className="gap-2">
                          <Send className="w-4 h-4" /> Submit Assessment
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
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
