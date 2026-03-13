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
  Download, Send,
} from "lucide-react";
import { iqaSamples } from "@/data/iqaMockData";
import { loadIQAQueue, updateIQAEntry, type IQAQueueEntry } from "@/lib/iqaQueue";
import { useToast } from "@/hooks/use-toast";
import VACSVerification, { initialVACSState, type VACSState } from "@/components/iqa/VACSVerification";
import IQADisagreeForm, { type DisagreeDecision } from "@/components/iqa/IQADisagreeForm";

type IQADecision = "agree" | "disagree" | "not_sampled" | "";

const AssessmentReview = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Find sample from static data or auto-flipped queue
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
  const vacsAllPassed = Object.values(vacsState).every(v => v === true);

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
      updateIQAEntry(sample.id, {
        iqaStatus: "IQA Approved",
        iqaComments: comments,
        iqaReviewDate: new Date().toLocaleDateString("en-GB"),
      });
    }
    setSubmitted(true);
    toast({ title: "✅ IQA Approved", description: "Assessment verified and approved." });
  };

  const handleNotSampled = () => {
    if (autoEntry) {
      updateIQAEntry(sample.id, {
        iqaStatus: "Not Sampled",
        iqaComments: "Not sampled — quick sign-off by IQA.",
        iqaReviewDate: new Date().toLocaleDateString("en-GB"),
      });
    }
    setSubmitted(true);
    toast({ title: "Unit marked as Not Sampled", description: "Quick sign-off recorded. Unit completion confirmed." });
    setTimeout(() => navigate("/iqa/sampling"), 1000);
  };

  const handleDisagreeSubmit = (disagreeDecision: DisagreeDecision) => {
    const fullComments = `DISAGREE — Action: ${disagreeDecision.action}\nReason: ${disagreeDecision.reason}${
      disagreeDecision.specificCriteria.length > 0
        ? `\nAffected Criteria: ${disagreeDecision.specificCriteria.join(", ")}`
        : ""
    }\n\nIQA Comments: ${comments}`;

    if (autoEntry) {
      updateIQAEntry(sample.id, {
        iqaStatus: "Assessor Action Required",
        iqaComments: fullComments,
        iqaReviewDate: new Date().toLocaleDateString("en-GB"),
      });
    }
    setSubmitted(true);
    setShowDisagreeForm(false);
    toast({
      title: "⚠️ Assessor Action Required",
      description: `Action sent to assessor: ${disagreeDecision.action.replace(/_/g, " ")}`,
    });
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
        {/* Left: Details */}
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

          {/* Assessment Criteria — what assessor claimed */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <GraduationCap className="w-4 h-4" /> Assessment Criteria (Assessor Claims)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {sample.criteria.map((c, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-foreground">{c}</span>
                    <Badge className="ml-auto bg-green-600 text-white text-[10px]">Met</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Evidence Files */}
          {sample.evidenceFiles.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2"><FileText className="w-4 h-4" /> Learner Evidence</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {sample.evidenceFiles.map((f, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 border border-border rounded-xl bg-muted/30">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm flex-1">{f}</span>
                      <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                        <Download className="w-3 h-3" /> Download
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Trainer Assessment */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Trainer Assessment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-4 text-sm flex-wrap">
                <div><span className="text-muted-foreground">Trainer:</span> <strong>{sample.trainerName}</strong></div>
                <div><span className="text-muted-foreground">Date:</span> <strong>{sample.assessmentDate}</strong></div>
                <Badge variant={sample.outcome === "Competent" ? "default" : "destructive"}>{sample.outcome}</Badge>
              </div>
              <div className="bg-muted/50 rounded-xl p-4">
                <p className="text-sm font-medium mb-1">Trainer Feedback</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{sample.trainerFeedback}</p>
              </div>
            </CardContent>
          </Card>

          {/* VACS Verification */}
          {!isReviewed && (
            <VACSVerification
              value={vacsState}
              onChange={setVacsState}
              readOnly={isReviewed}
            />
          )}

          {/* Disagree Form */}
          {showDisagreeForm && !isReviewed && (
            <IQADisagreeForm
              criteria={sample.criteria}
              onSubmit={handleDisagreeSubmit}
              onCancel={() => {
                setShowDisagreeForm(false);
                setDecision("");
              }}
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
              {/* Decision Buttons */}
              {!isReviewed && (
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Decision</Label>

                  <button
                    onClick={() => { setDecision("agree"); setShowDisagreeForm(false); }}
                    className={`w-full text-left p-3.5 rounded-xl border-2 transition-all flex items-center gap-3 ${
                      decision === "agree"
                        ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                        : "border-border hover:border-green-300 bg-card"
                    }`}
                  >
                    <CheckCircle2 className={`w-5 h-5 ${decision === "agree" ? "text-green-600" : "text-muted-foreground"}`} />
                    <div>
                      <p className="text-sm font-bold text-foreground">Agree — IQA Approved</p>
                      <p className="text-xs text-muted-foreground">Assessment is correct, VACS met</p>
                    </div>
                  </button>

                  <button
                    onClick={() => { setDecision("disagree"); setShowDisagreeForm(true); }}
                    className={`w-full text-left p-3.5 rounded-xl border-2 transition-all flex items-center gap-3 ${
                      decision === "disagree"
                        ? "border-destructive bg-destructive/5"
                        : "border-border hover:border-destructive/30 bg-card"
                    }`}
                  >
                    <AlertTriangle className={`w-5 h-5 ${decision === "disagree" ? "text-destructive" : "text-muted-foreground"}`} />
                    <div>
                      <p className="text-sm font-bold text-foreground">Disagree — Action Required</p>
                      <p className="text-xs text-muted-foreground">Issue with decision or feedback</p>
                    </div>
                  </button>

                  <button
                    onClick={() => { setDecision("not_sampled"); setShowDisagreeForm(false); }}
                    className={`w-full text-left p-3.5 rounded-xl border-2 transition-all flex items-center gap-3 ${
                      decision === "not_sampled"
                        ? "border-muted-foreground bg-muted"
                        : "border-border hover:border-muted-foreground/30 bg-card"
                    }`}
                  >
                    <MinusCircle className={`w-5 h-5 ${decision === "not_sampled" ? "text-muted-foreground" : "text-muted-foreground/50"}`} />
                    <div>
                      <p className="text-sm font-bold text-foreground">Not Sampled</p>
                      <p className="text-xs text-muted-foreground">Quick sign-off — no full review needed</p>
                    </div>
                  </button>
                </div>
              )}

              {/* Comments */}
              {decision !== "not_sampled" && !isReviewed && (
                <div>
                  <Label htmlFor="iqa-comments" className="text-sm font-medium mb-1.5 block">
                    IQA Comments <span className="text-xs text-muted-foreground">(Trainer & Admin only)</span>
                  </Label>
                  <Textarea
                    id="iqa-comments"
                    placeholder="Enter your quality assurance observations..."
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    rows={5}
                  />
                </div>
              )}

              {/* Submit Buttons */}
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

              {/* Submitted State */}
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

          {/* Audit Card */}
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

          {/* Quick Actions */}
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
