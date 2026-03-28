import { useState } from "react";
import { FileText, CheckCircle2, XCircle, AlertTriangle, Send, Loader2, MessageSquare, Download } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useGetAssignmentSubmissionQuery, useGradeAssignmentMutation } from "@/redux/apis/quiz/quizApi";

interface WrittenAssignmentReviewPanelProps {
  unitId: string;
  learnerId: string;
  onGraded?: () => void;
}

const WrittenAssignmentReviewPanel = ({ unitId, learnerId, onGraded }: WrittenAssignmentReviewPanelProps) => {
  const { toast } = useToast();
  const { data: submissionData, isLoading, isError, refetch } = useGetAssignmentSubmissionQuery({ unitId, learnerId });
  const [gradeAssignment, { isLoading: isGrading }] = useGradeAssignmentMutation();

  const [feedback, setFeedback] = useState("");
  const [outcome, setOutcome] = useState<"pass" | "refer" | "">("");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <span className="ml-3 text-sm text-muted-foreground font-medium">Loading submission...</span>
      </div>
    );
  }

  if (isError || !submissionData?.data) {
    return (
      <Card className="p-8 text-center border-destructive/20 bg-destructive/5">
        <AlertTriangle className="w-8 h-8 text-destructive mx-auto mb-2" />
        <p className="text-sm font-semibold text-destructive">No submission found or failed to load.</p>
        <p className="text-xs text-muted-foreground mt-1">Please ensure the learner has submitted their work.</p>
      </Card>
    );
  }

  const submission = submissionData.data;
  const isReviewed = submission.status === "graded";

  const handleGrade = async () => {
    if (!outcome) {
      toast({ title: "Please select an outcome", variant: "destructive" });
      return;
    }
    if (!feedback.trim()) {
      toast({ title: "Please provide feedback", variant: "destructive" });
      return;
    }

    try {
      await gradeAssignment({
        submissionId: submission.id,
        payload: { grade: outcome, feedback }
      }).unwrap();

      toast({ title: "Grading successful", description: `Assignment has been marked as ${outcome.toUpperCase()}.` });
      refetch();
      onGraded?.();
    } catch (err) {
      toast({ title: "Grading failed", description: "Could not save the grade. Please try again.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      {/* Submission Content */}
      <Card className="p-5 border-none shadow-sm bg-background/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            <h4 className="font-bold text-sm text-foreground">Learner Submission</h4>
          </div>
          <Badge variant={isReviewed ? "secondary" : "outline"} className="capitalize">
            {submission.status.replace("_", " ")}
          </Badge>
        </div>

        <div className="bg-muted/30 rounded-xl p-5 border border-border/50">
          <div className="flex items-center justify-between mb-3 text-xs text-muted-foreground">
            <span>Word Count: <span className="font-bold text-foreground">{submission.content?.split(/\s+/).length || 0}</span></span>
            <Button size="sm" variant="ghost" className="h-7 text-[10px] gap-1.5 opacity-60 hover:opacity-100">
              <Download className="w-3 h-3" /> Download Text
            </Button>
          </div>
          <div className="text-sm leading-relaxed text-foreground whitespace-pre-wrap max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {submission.content || "No content provided."}
          </div>
        </div>
      </Card>

      {/* Grading Section */}
      {!isReviewed ? (
        <Card className="p-5 border-primary/20 bg-primary/5 shadow-md">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="w-5 h-5 text-primary" />
            <h4 className="font-bold text-sm text-foreground">Assessor Feedback & Decision</h4>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase mb-2 block">Decision Outcome</label>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant={outcome === "pass" ? "default" : "outline"}
                  className={`h-11 gap-2 ${outcome === "pass" ? "bg-green-600 hover:bg-green-700" : "hover:border-green-200 hover:bg-green-50"}`}
                  onClick={() => setOutcome("pass")}
                >
                  <CheckCircle2 className="w-4 h-4" /> Pass
                </Button>
                <Button
                  variant={outcome === "refer" ? "destructive" : "outline"}
                  className={`h-11 gap-2 ${outcome === "refer" ? "bg-destructive" : "hover:border-destructive/20 hover:bg-destructive/5"}`}
                  onClick={() => setOutcome("refer")}
                >
                  <XCircle className="w-4 h-4" /> Refer
                </Button>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase mb-2 block">Feedback to Learner</label>
              <Textarea
                placeholder="Provide detailed feedback on the submission..."
                className="min-h-[120px] bg-white text-sm"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              />
            </div>

            <Button
              className="w-full h-11 gap-2 font-bold"
              disabled={isGrading || !outcome || !feedback.trim()}
              onClick={handleGrade}
            >
              {isGrading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Submit Assessment Decision
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="p-5 border-green-200 bg-green-50/50">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <h4 className="font-bold text-sm text-green-800">Assessed & Graded</h4>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Grade:</span>
              <Badge className={submission.grade === "pass" ? "bg-green-600" : "bg-destructive"}>
                {submission.grade?.toUpperCase()}
              </Badge>
            </div>
            <div className="p-4 bg-white rounded-lg border border-green-100 italic text-sm text-muted-foreground leading-relaxed">
              {submission.feedback || "No feedback provided."}
            </div>
            <p className="text-[10px] text-muted-foreground text-right italic">
              Assessed on {new Date(submission.graded_at).toLocaleDateString()}
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default WrittenAssignmentReviewPanel;
