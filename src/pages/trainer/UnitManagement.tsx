import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft, FileText, CheckCircle2, Clock,
  ClipboardList, PenLine, Download, Eye, MessageSquare, Send
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { trainerLearners, pendingSubmissions } from "@/data/trainerMockData";
import QuizResultsPanel from "@/components/trainer/QuizResultsPanel";
import UnitCriteriaTracker from "@/components/trainer/UnitCriteriaTracker";
import CriteriaChecklist, { type Criterion } from "@/components/trainer/CriteriaChecklist";
import FeedbackFileUpload from "@/components/trainer/FeedbackFileUpload";
import ResubmissionHistory, { type SubmissionVersion } from "@/components/trainer/ResubmissionHistory";
import UnitSignOff from "@/components/trainer/UnitSignOff";
import UnitAssessmentConfig, { loadUnitConfig, type UnitAssessmentRequirements } from "@/components/trainer/UnitAssessmentConfig";
import { addToIQAQueue, createIQAEntryFromSignOff } from "@/lib/iqaQueue";

const statusConfig: Record<string, { label: string; className: string }> = {
  Competent: { label: "Competent", className: "bg-green-600 text-white" },
  "Pending Assessment": { label: "Pending Assessment", className: "bg-amber-500 text-white" },
  "Resubmission Required": { label: "Resubmission Required", className: "bg-orange-500 text-white" },
  "Not Started": { label: "Not Started", className: "bg-muted text-muted-foreground" },
};

type Outcome = "Competent" | "Resubmission Required" | "Not Yet Competent" | "";

interface UnitSubmission {
  id: string;
  type: "quiz" | "written" | "evidence";
  title: string;
  submittedDate: string;
  status: "awaiting_review" | "reviewed";
  wordCount?: number;
  files?: string[];
  writtenContent?: string;
  versions: SubmissionVersion[];
  criteria: Criterion[];
}

function getDefaultCriteria(unitCode: string): Criterion[] {
  const sub = pendingSubmissions.find(s => s.unitCode === unitCode);
  if (sub) {
    return sub.criteria.map((c, i) => ({
      code: `${i + 1}.1`,
      title: c,
      met: false,
    }));
  }
  return [
    { code: "1.1", title: "Demonstrate understanding of key concepts", met: false },
    { code: "1.2", title: "Apply knowledge to practical scenarios", met: false },
    { code: "2.1", title: "Provide relevant evidence to support claims", met: false },
    { code: "2.2", title: "Reflect on professional practice", met: false },
  ];
}

function getMockSubmissions(learnerId: string, unitCode: string): UnitSubmission[] {
  const learner = trainerLearners.find((l) => l.id === learnerId);
  const unit = learner?.units.find((u) => u.code === unitCode);
  if (!unit || unit.status === "Not Started") return [];

  const criteria = getDefaultCriteria(unitCode);
  const isResubmission = unit.status === "Resubmission Required";

  return [
    {
      id: `${learnerId}-${unitCode}-quiz`,
      type: "quiz",
      title: "Knowledge Assessment Quiz",
      submittedDate: "05/02/2025",
      status: "awaiting_review",
      criteria,
      versions: isResubmission
        ? [
            { version: 2, submittedDate: "05/02/2025", outcome: "Awaiting Review" },
            { version: 1, submittedDate: "20/01/2025", outcome: "Resubmission Required", assessedDate: "22/01/2025", assessorName: "Sarah Jones", feedback: "Score below pass mark. Please review sections on safeguarding legislation and revise." },
          ]
        : [{ version: 1, submittedDate: "05/02/2025", outcome: "Awaiting Review" }],
    },
    {
      id: `${learnerId}-${unitCode}-written`,
      type: "written",
      title: `Reflective Account — ${unit.name}`,
      submittedDate: "03/02/2025",
      status: "awaiting_review",
      wordCount: 1420,
      writtenContent: "This is a sample written submission discussing the key principles and practical applications within the context of this unit. The learner has demonstrated understanding through real-world examples from their workplace...",
      criteria,
      versions: isResubmission
        ? [
            { version: 3, submittedDate: "03/02/2025", outcome: "Awaiting Review" },
            { version: 2, submittedDate: "18/01/2025", outcome: "Resubmission Required", assessedDate: "20/01/2025", assessorName: "Sarah Jones", feedback: "Good improvement but criterion 2.1 still not adequately evidenced. Please provide a specific workplace example." },
            { version: 1, submittedDate: "05/01/2025", outcome: "Not Yet Competent", assessedDate: "08/01/2025", assessorName: "Sarah Jones", feedback: "Insufficient depth. Criteria 1.2 and 2.1 not met. Please expand on practical application." },
          ]
        : [{ version: 1, submittedDate: "03/02/2025", outcome: "Awaiting Review" }],
    },
    {
      id: `${learnerId}-${unitCode}-evidence`,
      type: "evidence",
      title: "Portfolio Evidence Upload",
      submittedDate: "01/02/2025",
      status: "awaiting_review",
      files: [`${unit.name.replace(/\s/g, "_")}_Portfolio.pdf`, "Workplace_Observation.pdf"],
      criteria,
      versions: [{ version: 1, submittedDate: "01/02/2025", outcome: "Awaiting Review" }],
    },
  ];
}

// Persistence helpers
const STORAGE_KEY = "trainer_assessment_decisions";

interface StoredDecision {
  outcome: Outcome;
  feedback: string;
  criteriaState: Criterion[];
  assessedDate: string;
  feedbackFileNames: string[];
}

function loadDecisions(): Record<string, StoredDecision> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch { return {}; }
}

function saveDecision(subId: string, decision: StoredDecision) {
  const all = loadDecisions();
  all[subId] = decision;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

const UnitManagement = () => {
  const { learnerId, unitCode } = useParams();
  const { toast } = useToast();

  const learner = trainerLearners.find((l) => l.id === learnerId);
  const unit = learner?.units.find((u) => u.code === unitCode);

  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<Outcome>("");
  const [feedback, setFeedback] = useState("");
  const [feedbackFiles, setFeedbackFiles] = useState<File[]>([]);
  const [reviewedIds, setReviewedIds] = useState<Set<string>>(new Set());
  const [criteriaState, setCriteriaState] = useState<Record<string, Criterion[]>>({});
  const [isSignedOff, setIsSignedOff] = useState(false);
  const [assessmentConfig, setAssessmentConfig] = useState<UnitAssessmentRequirements>(() => loadUnitConfig(unitCode || ""));

  // Load persisted decisions on mount
  useEffect(() => {
    const stored = loadDecisions();
    const restoredIds = new Set<string>();
    const restoredCriteria: Record<string, Criterion[]> = {};
    Object.entries(stored).forEach(([subId, decision]) => {
      if (subId.startsWith(`${learnerId}-${unitCode}`)) {
        restoredIds.add(subId);
        restoredCriteria[subId] = decision.criteriaState;
      }
    });
    if (restoredIds.size > 0) {
      setReviewedIds(restoredIds);
      setCriteriaState(restoredCriteria);
    }
    // Check sign-off
    const signOffKey = `unit_signoff_${learnerId}_${unitCode}`;
    if (localStorage.getItem(signOffKey) === "true") {
      setIsSignedOff(true);
    }
  }, [learnerId, unitCode]);

  if (!learner || !unit) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground mb-4">Unit not found.</p>
        <Button variant="outline" size="sm" className="gap-2" onClick={() => window.history.back()}>
          <ArrowLeft className="w-4 h-4" /> Back to Learners
        </Button>
      </div>
    );
  }

  const cfg = statusConfig[unit.status] || statusConfig["Not Started"];
  const allSubmissions = getMockSubmissions(learnerId!, unitCode!);
  const submissions = allSubmissions.filter((sub) => {
    if (sub.type === "quiz" && !assessmentConfig.quizRequired) return false;
    if (sub.type === "written" && !assessmentConfig.writtenRequired) return false;
    if (sub.type === "evidence" && !assessmentConfig.evidenceRequired) return false;
    return true;
  });

  const handleSubmitReview = (subId: string) => {
    if (!outcome) {
      toast({ title: "Please select an outcome", variant: "destructive" });
      return;
    }
    if (!feedback.trim()) {
      toast({ title: "Please provide feedback", variant: "destructive" });
      return;
    }
    const currentCriteria = criteriaState[subId] || [];
    saveDecision(subId, {
      outcome,
      feedback,
      criteriaState: currentCriteria,
      assessedDate: new Date().toLocaleDateString("en-GB"),
      feedbackFileNames: feedbackFiles.map(f => f.name),
    });
    setReviewedIds((prev) => new Set(prev).add(subId));
    setReviewingId(null);
    setOutcome("");
    setFeedback("");
    setFeedbackFiles([]);
    toast({ title: "Assessment submitted", description: `Outcome: ${outcome}` });
  };

  const handleCriteriaChange = (subId: string, criteria: Criterion[]) => {
    setCriteriaState(prev => ({ ...prev, [subId]: criteria }));
  };

  const handleSignOff = () => {
    setIsSignedOff(true);
    localStorage.setItem(`unit_signoff_${learnerId}_${unitCode}`, "true");

    // Auto-flip: create IQA queue entry
    const allCriteria = Object.values(criteriaState).flat();
    const iqaEntry = createIQAEntryFromSignOff({
      learnerId: learnerId!,
      learnerName: learner.name,
      qualification: learner.qualification,
      unitCode: unit.code,
      unitName: unit.name,
      trainerName: "Sarah Jones", // current trainer
      criteria: allCriteria,
    });
    addToIQAQueue(iqaEntry);

    const statusMsg = iqaEntry.autoSelected
      ? "Unit auto-selected for IQA review"
      : "Unit signed off (not sampled for IQA)";

    toast({
      title: "Unit signed off — Awaiting IQA",
      description: `${unit.code}: ${unit.name} → ${statusMsg}`,
    });
  };

  const allSubmissionsReviewed = submissions.length > 0 && submissions.every(s => reviewedIds.has(s.id));
  const allCriteriaMet = Object.values(criteriaState).length > 0 &&
    Object.values(criteriaState).every(criteria => criteria.every(c => c.met));

  const outcomes: { value: Outcome; label: string; desc: string; color: string }[] = [
    { value: "Competent", label: "Competent / Pass", desc: "All criteria met", color: "border-green-500 bg-green-50" },
    { value: "Resubmission Required", label: "Resubmission Required", desc: "Needs revision", color: "border-orange-500 bg-orange-50" },
    { value: "Not Yet Competent", label: "Not Yet Competent", desc: "Significant gaps", color: "border-destructive bg-destructive/5" },
  ];

  return (
    <div>
      <Button
        variant="outline"
        size="sm"
        className="gap-2 mb-6"
        onClick={() => window.history.back()}
      >
        <ArrowLeft className="w-4 h-4" /> Back to Learner Details
      </Button>

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

      {/* Assessment Requirements Config */}
      <div className="mb-6">
        <UnitAssessmentConfig
          unitCode={unit.code}
          unitName={unit.name}
          onChange={(config) => setAssessmentConfig(config)}
        />
      </div>

      {/* Unit Criteria Progress Tracker */}
      <div className="mb-6">
        <UnitCriteriaTracker
          unitCode={unit.code}
          unitName={unit.name}
          criteriaState={criteriaState}
          submissions={submissions.map(s => ({ id: s.id, title: s.title }))}
        />
      </div>

      {/* Unit Sign-Off */}
      <div className="mb-6">
        <UnitSignOff
          unitCode={unit.code}
          unitName={unit.name}
          learnerName={learner.name}
          allCriteriaMet={allCriteriaMet}
          allSubmissionsReviewed={allSubmissionsReviewed}
          isSignedOff={isSignedOff}
          onSignOff={handleSignOff}
        />
      </div>

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
            const resubCount = sub.versions.length - 1;
            const storedDecision = loadDecisions()[sub.id];

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
                        {resubCount > 0 && (
                          <>
                            <span className="text-xs text-muted-foreground">•</span>
                            <Badge variant="outline" className="text-[10px] text-orange-600 border-orange-300">
                              {resubCount} resubmission{resubCount !== 1 ? "s" : ""}
                            </Badge>
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
                          {storedDecision && ` — ${storedDecision.outcome}`}
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
                    {/* Resubmission History */}
                    {sub.versions.length > 1 && (
                      <div className="mb-6">
                        <ResubmissionHistory versions={sub.versions} />
                      </div>
                    )}

                    {/* Submission Details */}
                    <div className="mb-6">
                      <h4 className="font-bold text-foreground text-sm mb-3">📋 Submission Details</h4>

                      {sub.type === "quiz" && (
                        <QuizResultsPanel unitCode={unitCode!} />
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

                    {/* Criteria Checklist */}
                    <div className="mb-6">
                      <CriteriaChecklist
                        criteria={criteriaState[sub.id] || sub.criteria}
                        onChange={(c) => handleCriteriaChange(sub.id, c)}
                      />
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

                      {/* Feedback File Upload */}
                      <div className="mt-3">
                        <FeedbackFileUpload files={feedbackFiles} onChange={setFeedbackFiles} />
                      </div>

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
