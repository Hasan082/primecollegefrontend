import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, FileText, User, GraduationCap, CheckCircle2, AlertTriangle, ShieldAlert } from "lucide-react";
import { iqaSamples } from "@/data/iqaMockData";
import { useToast } from "@/hooks/use-toast";

type IQADecision = "IQA Approved" | "Assessor Action Required" | "Escalated to Admin";

const AssessmentReview = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const sample = iqaSamples.find(s => s.id === id);

  const [decision, setDecision] = useState<IQADecision | "">(
    sample?.iqaStatus === "Pending IQA Review" ? "" : (sample?.iqaStatus as IQADecision) || ""
  );
  const [comments, setComments] = useState(sample?.iqaComments || "");

  if (!sample) {
    return (
      <div className="space-y-4">
        <Link to="/iqa/sampling" className="inline-flex items-center gap-1.5 text-primary hover:underline text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Queue
        </Link>
        <p className="text-muted-foreground">Assessment not found.</p>
      </div>
    );
  }

  const isReviewed = sample.iqaStatus !== "Pending IQA Review";

  const handleSubmit = () => {
    if (!decision) {
      toast({ title: "Please select a decision", variant: "destructive" });
      return;
    }
    if (!comments.trim()) {
      toast({ title: "Please add IQA comments", variant: "destructive" });
      return;
    }
    toast({
      title: "IQA Review Submitted",
      description: `Decision: ${decision}. Notifications sent to relevant parties.`,
    });
    navigate("/iqa/sampling");
  };

  return (
    <div className="space-y-6">
      <Link to="/iqa/sampling" className="inline-flex items-center gap-1.5 text-primary hover:underline text-sm">
        <ArrowLeft className="w-4 h-4" /> Back to Sampling Queue
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">IQA Assessment Review</h1>
          <p className="text-sm text-muted-foreground">Review trainer assessment decision and provide quality assurance feedback</p>
        </div>
        <Badge
          variant={
            sample.iqaStatus === "IQA Approved" ? "default" :
            sample.iqaStatus === "Assessor Action Required" ? "secondary" :
            sample.iqaStatus === "Escalated to Admin" ? "destructive" : "outline"
          }
        >
          {sample.iqaStatus}
        </Badge>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Learner & Assessment Info */}
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
                <div><span className="text-muted-foreground">Sampling Reason:</span> <Badge variant="outline" className="text-xs ml-1">{sample.samplingReason}</Badge></div>
              </div>
            </CardContent>
          </Card>

          {/* Assessment Criteria */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2"><GraduationCap className="w-4 h-4" /> Assessment Criteria</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1.5">
                {sample.criteria.map((c, i) => (
                  <li key={i} className="text-sm flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    {c}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Evidence Files */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2"><FileText className="w-4 h-4" /> Learner Evidence</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {sample.evidenceFiles.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 border rounded-lg bg-muted/30">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{f}</span>
                    <Button variant="ghost" size="sm" className="ml-auto text-xs">View</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Trainer Assessment */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Trainer Assessment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <span className="text-muted-foreground">Trainer:</span>
                <strong>{sample.trainerName}</strong>
                <span className="text-muted-foreground ml-4">Date:</span>
                <strong>{sample.assessmentDate}</strong>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Outcome:</span>
                <Badge variant={sample.outcome === "Competent" ? "default" : "destructive"}>
                  {sample.outcome}
                </Badge>
              </div>
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm font-medium mb-1">Trainer Feedback</p>
                <p className="text-sm text-muted-foreground">{sample.trainerFeedback}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: IQA Decision */}
        <div className="space-y-6">
          <Card className="border-primary/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">IQA Quality Review</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-3 block">Decision</Label>
                <RadioGroup
                  value={decision}
                  onValueChange={(v) => setDecision(v as IQADecision)}
                  className="space-y-3"
                  disabled={isReviewed}
                >
                  <div className="flex items-start gap-3 border rounded-lg p-3">
                    <RadioGroupItem value="IQA Approved" id="approved" className="mt-0.5" />
                    <label htmlFor="approved" className="cursor-pointer">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium">IQA Approved</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">Assessment is correct and meets standards</p>
                    </label>
                  </div>
                  <div className="flex items-start gap-3 border rounded-lg p-3">
                    <RadioGroupItem value="Assessor Action Required" id="action" className="mt-0.5" />
                    <label htmlFor="action" className="cursor-pointer">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-orange-600" />
                        <span className="text-sm font-medium">Assessor Action Required</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">Feedback or decision needs improvement</p>
                    </label>
                  </div>
                  <div className="flex items-start gap-3 border rounded-lg p-3">
                    <RadioGroupItem value="Escalated to Admin" id="escalated" className="mt-0.5" />
                    <label htmlFor="escalated" className="cursor-pointer">
                      <div className="flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-red-600" />
                        <span className="text-sm font-medium">Escalate to Admin</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">Serious issue requiring compliance review</p>
                    </label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label htmlFor="iqa-comments" className="text-sm font-medium mb-1.5 block">
                  IQA Comments <span className="text-xs text-muted-foreground">(visible to Trainer & Admin only)</span>
                </Label>
                <Textarea
                  id="iqa-comments"
                  placeholder="Enter your quality assurance observations..."
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  rows={5}
                  disabled={isReviewed}
                />
              </div>

              {!isReviewed && (
                <Button className="w-full" onClick={handleSubmit}>
                  Submit IQA Review
                </Button>
              )}

              {isReviewed && sample.iqaReviewDate && (
                <p className="text-xs text-muted-foreground text-center">Reviewed on {sample.iqaReviewDate}</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <p className="text-xs font-medium mb-2">Audit Information</p>
              <div className="space-y-1 text-xs text-muted-foreground">
                <p>Sample ID: {sample.id}</p>
                <p>Submitted: {sample.submissionDate}</p>
                <p>Assessed: {sample.assessmentDate}</p>
                {sample.iqaReviewDate && <p>IQA Reviewed: {sample.iqaReviewDate}</p>}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AssessmentReview;
