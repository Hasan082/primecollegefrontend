import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft, FileText, User, GraduationCap, CheckCircle2,
  AlertTriangle, ShieldAlert, ShieldCheck, MinusCircle,
  Send,
} from "lucide-react";
import { iqaSamples } from "@/data/iqaMockData";
import { loadIQAQueue, updateIQAEntry, type IQAQueueEntry } from "@/lib/iqaQueue";
import { addIQANotification, createDisagreeNotification, createApprovalNotification } from "@/lib/iqaNotifications";
import { useToast } from "@/hooks/use-toast";
import VACSVerification, { initialVACSState, type VACSState } from "@/components/iqa/VACSVerification";
import IQADisagreeForm, { type DisagreeDecision } from "@/components/iqa/IQADisagreeForm";
import EvidencePreview from "@/components/iqa/EvidencePreview";
import FeedbackHistory, { type FeedbackEntry } from "@/components/iqa/FeedbackHistory";

type IQADecision = "agree" | "disagree" | "not_sampled" | "";

// Demo feedback history data
const demoFeedbackHistories: Record<string, FeedbackEntry[]> = {
  "iqa-001": [
    { date: "2026-02-14", assessorName: "Sarah Jones", outcome: "Competent", feedback: "Good understanding demonstrated. Evidence meets all criteria with strong reflective practice.", submissionNumber: 2 },
    { date: "2026-01-28", assessorName: "Sarah Jones", outcome: "Resubmission Required", feedback: "AC 1.2 needs more depth — please provide specific examples of leadership styles applied in your workplace context.", submissionNumber: 1 },
  ],
  "iqa-002": [
    { date: "2026-02-12", assessorName: "Sarah Jones", outcome: "Resubmission Required", feedback: "Needs more depth in AC 2.2. Please expand on practical examples.", submissionNumber: 2 },
    { date: "2026-01-20", assessorName: "Sarah Jones", outcome: "Resubmission Required", feedback: "Initial submission lacks evidence for AC 2.1 and AC 2.2. Please review the unit guidance and resubmit with workplace examples.", submissionNumber: 1 },
  ],
  "iqa-003": [
    { date: "2026-01-25", assessorName: "David Wilson", outcome: "Competent", feedback: "Excellent work. All criteria clearly evidenced.", submissionNumber: 1 },
  ],
  "iqa-004": [
    { date: "2026-02-05", assessorName: "David Wilson", outcome: "Not Yet Competent", feedback: "Insufficient evidence. Work does not meet the required standard.", submissionNumber: 2 },
    { date: "2026-01-15", assessorName: "David Wilson", outcome: "Resubmission Required", feedback: "Partial evidence provided. AC 1.2 on legislation needs specific references to current UK safeguarding laws.", submissionNumber: 1 },
  ],
  "iqa-005": [
    { date: "2026-02-18", assessorName: "Rachel Green", outcome: "Competent", feedback: "Pass. Evidence uploaded.", submissionNumber: 1 },
  ],
  "iqa-006": [
    { date: "2026-03-04", assessorName: "Sarah Jones", outcome: "Competent", feedback: "Learner demonstrates strong communication skills. Well-evidenced portfolio.", submissionNumber: 3 },
    { date: "2026-02-20", assessorName: "Sarah Jones", outcome: "Resubmission Required", feedback: "AC 2.1 on active listening needs a reflective account from a workplace scenario, not just theory.", submissionNumber: 2 },
    { date: "2026-02-05", assessorName: "Sarah Jones", outcome: "Resubmission Required", feedback: "Submission is mostly theoretical. Please add practical workplace examples for all criteria.", submissionNumber: 1 },
  ],
  "iqa-007": [
    { date: "2026-02-24", assessorName: "Rachel Green", outcome: "Resubmission Required", feedback: "Partial criteria met. Please address AC 1.3 with organisational examples.", submissionNumber: 2 },
    { date: "2026-02-10", assessorName: "Rachel Green", outcome: "Resubmission Required", feedback: "AC 1.1 and AC 1.3 not sufficiently addressed. Needs real-world management theory application.", submissionNumber: 1 },
  ],
};

const AssessmentReview = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const staticSample = iqaSamples.find(s => s.id === id);
  const autoEntry = loadIQAQueue().find((e: IQAQueueEntry) => e.id === id);

  const sample = useMemo(() => {
    if (staticSample) return {
      id: staticSample.id,
      learnerName: staticSample.learnerName,
      qualification: staticSample.qualification,
      unit: staticSample.unit,
      trainerName: staticSample.trainerName,
      outcome: staticSample.outcome,
      submissionDate: staticSample.submissionDate,
      assessmentDate: staticSample.assessmentDate,
      trainerFeedback: staticSample.trainerFeedback,
      evidenceFiles: staticSample.evidenceFiles,
      criteria: staticSample.criteria,
      criteriaSnapshot: staticSample.criteria.map(c => ({ code: c.split(" ")[0] || "", title: c, met: true })),
      iqaStatus: staticSample.iqaStatus,
      iqaComments: staticSample.iqaComments,
      iqaReviewDate: staticSample.iqaReviewDate,
      samplingReason: staticSample.samplingReason,
    };
    if (autoEntry) return {
      id: autoEntry.id,
      learnerName: autoEntry.learnerName,
      qualification: autoEntry.qualification,
      unit: `${autoEntry.unitCode}: ${autoEntry.unitName}`,
      trainerName: autoEntry.trainerName,
      outcome: autoEntry.outcome,
      submissionDate: autoEntry.signOffDate,
      assessmentDate: autoEntry.signOffDate,
      trainerFeedback: autoEntry.trainerFeedback,
      evidenceFiles: [] as string[],
      criteria: autoEntry.criteriaSnapshot?.map(c => `${c.code} ${c.title}`) || [],
      criteriaSnapshot: autoEntry.criteriaSnapshot || [],
      iqaStatus: autoEntry.iqaStatus,
      iqaComments: autoEntry.iqaComments,
      iqaReviewDate: autoEntry.iqaReviewDate,
      samplingReason: autoEntry.samplingReason,
    };
    return null;
  }, [staticSample, autoEntry]);

  const [decision, setDecision] = useState<IQADecision>("");
  const [comments, setComments] = useState(sample?.iqaComments || "");
  const [vacsState, setVacsState] = useState<VACSState>(initialVACSState);
  const [showDisagreeForm, setShowDisagreeForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!sample) {
    return (
      <div className="space-y-4">
        <Button variant="outline" size="sm" className="gap-2" onClick={() => navigate("/iqa/sampling")}>
          <ArrowLeft className="w-4 h-4" /> Back to Queue
        </Button>
        <p className="text-muted-foreground">Assessment not found.</p>
      </div>
    );
  }

  const isAlreadyReviewed = sample.iqaStatus !== "Pending IQA Review" && sample.iqaStatus !== "Not Sampled";
  const isReviewed = isAlreadyReviewed || submitted;
  const vacsAllChecked = Object.values(vacsState).every(v => v !== null);

  // Get feedback history
  const feedbackHistory = demoFeedbackHistories[sample.id] || [
    { date: sample.assessmentDate, assessorName: sample.trainerName, outcome: sample.outcome, feedback: sample.trainerFeedback, submissionNumber: 1 },
  ];

  const handleAgreeSubmit = () => {
    if (!vacsAllChecked) {
      toast({ title: "Please complete all VACS checks", variant: "destructive" });
      return;
    }
    if (!comments.trim()) {
      toast({ title: "Please add IQA comments", variant: "destructive" });
      return;
    }
    if (autoEntry) {
      updateIQAEntry(sample.id, { iqaStatus: "IQA Approved", iqaComments: comments, iqaReviewDate: new Date().toLocaleDateString("en-GB") });
    }
    addIQANotification(createApprovalNotification({
      learnerId: sample.learnerName, learnerName: sample.learnerName, qualification: sample.qualification,
      unitCode: sample.unit.split(":")[0]?.trim() || "", unitName: sample.unit, iqaComments: comments,
    }));
    setSubmitted(true);
    toast({ title: "✅ IQA Approved", description: "Assessment verified. Assessor notified." });
  };

  const handleNotSampled = () => {
    if (autoEntry) {
      updateIQAEntry(sample.id, { iqaStatus: "Not Sampled", iqaComments: "Not sampled — quick sign-off by IQA.", iqaReviewDate: new Date().toLocaleDateString("en-GB") });
    }
    setSubmitted(true);
    toast({ title: "Unit marked as Not Sampled", description: "Quick sign-off recorded." });
    setTimeout(() => navigate("/iqa/sampling"), 1000);
  };

  const handleDisagreeSubmit = (disagreeDecision: DisagreeDecision) => {
    const fullComments = `DISAGREE — Action: ${disagreeDecision.action}\nReason: ${disagreeDecision.reason}${
      disagreeDecision.specificCriteria.length > 0 ? `\nAffected Criteria: ${disagreeDecision.specificCriteria.join(", ")}` : ""
    }\n\nIQA Comments: ${comments}`;

    if (autoEntry) {
      updateIQAEntry(sample.id, { iqaStatus: "Assessor Action Required", iqaComments: fullComments, iqaReviewDate: new Date().toLocaleDateString("en-GB") });
    }
    addIQANotification(createDisagreeNotification({
      learnerId: sample.learnerName, learnerName: sample.learnerName, qualification: sample.qualification,
      unitCode: sample.unit.split(":")[0]?.trim() || "", unitName: sample.unit,
      action: disagreeDecision.action, reason: disagreeDecision.reason,
      affectedCriteria: disagreeDecision.specificCriteria, iqaComments: comments,
    }));
    setSubmitted(true);
    setShowDisagreeForm(false);
    toast({ title: "⚠️ Assessor Action Required", description: `Notification sent to assessor: ${disagreeDecision.action.replace(/_/g, " ")}` });
  };

  return (
    <div className="space-y-6">
      <Button variant="outline" size="sm" className="gap-2" onClick={() => navigate("/iqa/sampling")}>
        <ArrowLeft className="w-4 h-4" /> Back to Sampling Queue
      </Button>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">IQA Assessment Review</h1>
          <p className="text-sm text-muted-foreground">Review assessment, verify VACS standards, and record your decision</p>
        </div>
        <Badge
          variant={
            isReviewed && decision === "agree" ? "default" :
            isReviewed && decision === "disagree" ? "destructive" :
            isReviewed && decision === "not_sampled" ? "secondary" : "outline"
          }
          className="text-xs"
        >
          {submitted
            ? decision === "agree" ? "IQA Approved" : decision === "disagree" ? "Assessor Action Required" : "Not Sampled"
            : sample.iqaStatus
          }
        </Badge>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Submission Details */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2"><User className="w-4 h-4" /> Submission Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid sm:grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Learner:</span> <strong>{sample.learnerName}</strong></div>
                <div><span className="text-muted-foreground">Qualification:</span> <strong>{sample.qualification}</strong></div>
                <div><span className="text-muted-foreground">Unit:</span> <strong>{sample.unit}</strong></div>
                <div><span className="text-muted-foreground">Submission Date:</span> <strong>{sample.submissionDate}</strong></div>
                <div>
                  <span className="text-muted-foreground">Sampling Reason:</span>
                  <Badge variant="outline" className="text-xs ml-2">{sample.samplingReason}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Assessor Criteria Tick-State */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <GraduationCap className="w-4 h-4" /> Assessor Criteria Tick-State
              </CardTitle>
              <p className="text-xs text-muted-foreground">Shows exactly which criteria the assessor ticked as met or not met</p>
            </CardHeader>
            <CardContent>
              {sample.criteriaSnapshot && (
                <div className="flex items-center gap-3 mb-4 p-3 rounded-lg bg-muted/50">
                  <span className="text-xs text-muted-foreground">Assessor claimed:</span>
                  <Badge className="bg-green-600 text-white text-xs">{sample.criteriaSnapshot.filter(c => c.met).length} Met</Badge>
                  {sample.criteriaSnapshot.filter(c => !c.met).length > 0 && (
                    <Badge variant="destructive" className="text-xs">{sample.criteriaSnapshot.filter(c => !c.met).length} Not Met</Badge>
                  )}
                  <span className="text-xs text-muted-foreground ml-auto">
                    {Math.round((sample.criteriaSnapshot.filter(c => c.met).length / sample.criteriaSnapshot.length) * 100)}% complete
                  </span>
                </div>
              )}
              <div className="space-y-2">
                {(sample.criteriaSnapshot || []).map((c, i) => (
                  <div key={i} className={`flex items-start gap-3 p-3 rounded-lg border ${
                    c.met ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800" : "bg-destructive/5 border-destructive/20"
                  }`}>
                    {c.met ? <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" /> : <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />}
                    <div className="flex-1">
                      <span className="text-xs font-bold text-muted-foreground mr-1.5">{c.code}</span>
                      <span className="text-sm text-foreground">{c.title}</span>
                    </div>
                    <Badge className={`text-[10px] ${c.met ? "bg-green-600 text-white" : "bg-destructive text-destructive-foreground"}`}>
                      {c.met ? "✓ Met" : "✗ Not Met"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Evidence Files with Numbering + Inline Preview */}
          {sample.evidenceFiles.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2"><FileText className="w-4 h-4" /> Learner Evidence</CardTitle>
                <p className="text-xs text-muted-foreground">Each file has an auto-generated evidence reference number</p>
              </CardHeader>
              <CardContent>
                <EvidencePreview files={sample.evidenceFiles} sampleId={sample.id} />
              </CardContent>
            </Card>
          )}

          {/* Full Feedback History */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Assessment Feedback History</CardTitle>
              <p className="text-xs text-muted-foreground">All assessor feedback for this unit — not just the latest</p>
            </CardHeader>
            <CardContent>
              <FeedbackHistory entries={feedbackHistory} />
            </CardContent>
          </Card>

          {/* VACS Verification */}
          {!isReviewed && (
            <VACSVerification value={vacsState} onChange={setVacsState} readOnly={isReviewed} />
          )}

          {/* Disagree Form */}
          {showDisagreeForm && !isReviewed && (
            <IQADisagreeForm
              criteria={sample.criteria}
              onSubmit={handleDisagreeSubmit}
              onCancel={() => { setShowDisagreeForm(false); setDecision(""); }}
            />
          )}
        </div>

        {/* Right: IQA Decision Panel */}
        <div className="space-y-4">
          <Card className="border-primary/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">IQA Decision</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isReviewed && (
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Decision</Label>
                  <button onClick={() => { setDecision("agree"); setShowDisagreeForm(false); }}
                    className={`w-full text-left p-3.5 rounded-xl border-2 transition-all flex items-center gap-3 ${
                      decision === "agree" ? "border-green-500 bg-green-50 dark:bg-green-950/20" : "border-border hover:border-green-300 bg-card"
                    }`}>
                    <CheckCircle2 className={`w-5 h-5 ${decision === "agree" ? "text-green-600" : "text-muted-foreground"}`} />
                    <div>
                      <p className="text-sm font-bold text-foreground">Agree — IQA Approved</p>
                      <p className="text-xs text-muted-foreground">Assessment is correct, VACS met</p>
                    </div>
                  </button>
                  <button onClick={() => { setDecision("disagree"); setShowDisagreeForm(true); }}
                    className={`w-full text-left p-3.5 rounded-xl border-2 transition-all flex items-center gap-3 ${
                      decision === "disagree" ? "border-destructive bg-destructive/5" : "border-border hover:border-destructive/30 bg-card"
                    }`}>
                    <AlertTriangle className={`w-5 h-5 ${decision === "disagree" ? "text-destructive" : "text-muted-foreground"}`} />
                    <div>
                      <p className="text-sm font-bold text-foreground">Disagree — Action Required</p>
                      <p className="text-xs text-muted-foreground">Issue with decision or feedback</p>
                    </div>
                  </button>
                  <button onClick={() => { setDecision("not_sampled"); setShowDisagreeForm(false); }}
                    className={`w-full text-left p-3.5 rounded-xl border-2 transition-all flex items-center gap-3 ${
                      decision === "not_sampled" ? "border-muted-foreground bg-muted" : "border-border hover:border-muted-foreground/30 bg-card"
                    }`}>
                    <MinusCircle className={`w-5 h-5 ${decision === "not_sampled" ? "text-muted-foreground" : "text-muted-foreground/50"}`} />
                    <div>
                      <p className="text-sm font-bold text-foreground">Not Sampled</p>
                      <p className="text-xs text-muted-foreground">Quick sign-off — no full review needed</p>
                    </div>
                  </button>
                </div>
              )}

              {decision !== "not_sampled" && !isReviewed && (
                <div>
                  <Label htmlFor="iqa-comments" className="text-sm font-medium mb-1.5 block">
                    IQA Comments <span className="text-xs text-muted-foreground">(Trainer & Admin only)</span>
                  </Label>
                  <Textarea id="iqa-comments" placeholder="Enter your quality assurance observations..." value={comments} onChange={(e) => setComments(e.target.value)} rows={5} />
                </div>
              )}

              {!isReviewed && decision === "agree" && (
                <Button className="w-full gap-2" onClick={handleAgreeSubmit}>
                  <ShieldCheck className="w-4 h-4" /> Submit IQA Approval
                </Button>
              )}
              {!isReviewed && decision === "not_sampled" && (
                <Button variant="secondary" className="w-full gap-2" onClick={handleNotSampled}>
                  <MinusCircle className="w-4 h-4" /> Confirm Not Sampled
                </Button>
              )}

              {isReviewed && (
                <div className="text-center py-4">
                  <ShieldCheck className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm font-bold text-foreground">Review Complete</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {sample.iqaReviewDate ? `Reviewed on ${sample.iqaReviewDate}` : "Just submitted"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <p className="text-xs font-bold mb-2 text-foreground">Audit Information</p>
              <div className="space-y-1.5 text-xs text-muted-foreground">
                <p>Sample ID: <span className="font-mono">{sample.id}</span></p>
                <p>Submitted: {sample.submissionDate}</p>
                <p>Assessed: {sample.assessmentDate}</p>
                {sample.iqaReviewDate && <p>IQA Reviewed: {sample.iqaReviewDate}</p>}
                <p>Sampling: {sample.samplingReason}</p>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-2">
            <Button variant="outline" size="sm" className="w-full gap-2" onClick={() => navigate("/iqa/sampling")}>
              <ArrowLeft className="w-4 h-4" /> Back to Queue
            </Button>
            <Button variant="outline" size="sm" className="w-full gap-2" onClick={() => navigate("/iqa/trainers")}>
              <User className="w-4 h-4" /> Trainer Performance
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentReview;
