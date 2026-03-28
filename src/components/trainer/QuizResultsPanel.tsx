import { useState } from "react";
import { CheckCircle2, XCircle, AlertTriangle, ChevronDown, ChevronUp, Shield, Clock, Target, BarChart3, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useGetQuizAttemptReviewQuery } from "@/redux/apis/quiz/quizApi";

interface QuizResultsPanelProps {
  attemptId?: string;
  unitCode: string;
}

const QuizResultsPanel = ({ attemptId, unitCode }: QuizResultsPanelProps) => {
  const { data: reviewData, isLoading, isError } = useGetQuizAttemptReviewQuery(attemptId!, {
    skip: !attemptId,
  });
  const [showQuestions, setShowQuestions] = useState(false);
  const [showViolations, setShowViolations] = useState(false);

  if (!attemptId) {
    return (
      <Card className="p-8 text-center bg-muted/20">
        <Clock className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">Select an attempt to view detailed results.</p>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <span className="ml-3 text-sm text-muted-foreground font-medium">Loading report...</span>
      </div>
    );
  }

  if (isError || !reviewData?.data) {
    return (
      <Card className="p-8 text-center border-destructive/20 bg-destructive/5">
        <AlertTriangle className="w-8 h-8 text-destructive mx-auto mb-2" />
        <p className="text-sm font-semibold text-destructive">Failed to load quiz results.</p>
        <p className="text-xs text-muted-foreground mt-1">Please try again later or contact support.</p>
      </Card>
    );
  }

  const result = reviewData.data;
  const scoreColor = result.passed ? "text-green-600" : "text-destructive";

  const formatTime = (seconds: number | null) => {
    if (seconds === null) return "N/A";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-4">
      {/* Score Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="p-3 text-center">
          <Target className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
          <p className={`text-2xl font-bold ${scoreColor}`}>{result.score_percent}%</p>
          <p className="text-xs text-muted-foreground">Score</p>
        </Card>
        <Card className="p-3 text-center">
          <BarChart3 className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
          <p className="text-2xl font-bold text-foreground">
            {result.review_questions.filter(q => q.is_correct).length}/{result.review_questions.length}
          </p>
          <p className="text-xs text-muted-foreground">Correct</p>
        </Card>
        <Card className="p-3 text-center">
          <CheckCircle2 className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
          <p className="text-2xl font-bold text-foreground">
            {/* If pass score is not in result, assume 80% */}
            80%
          </p>
          <p className="text-xs text-muted-foreground">Pass Mark</p>
        </Card>
        <Card className="p-3 text-center">
          <Clock className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
          <p className="text-xl font-bold text-foreground">{formatTime(result.time_taken_seconds)}</p>
          <p className="text-xs text-muted-foreground">Time Taken</p>
        </Card>
        <Card className="p-3 text-center">
          <Shield className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
          <p className={`text-2xl font-bold ${result.violations_count > 0 ? "text-amber-600" : "text-green-600"}`}>
            {result.violations_count}
          </p>
          <p className="text-xs text-muted-foreground">Violations</p>
        </Card>
      </div>

      {/* Pass/Fail Banner */}
      <div className={`rounded-xl p-3 flex items-center gap-3 ${result.passed ? "bg-green-50 border border-green-200" : "bg-destructive/5 border border-destructive/20"}`}>
        {result.passed ? (
          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
        ) : (
          <XCircle className="w-5 h-5 text-destructive flex-shrink-0" />
        )}
        <div>
          <p className={`font-semibold text-sm ${result.passed ? "text-green-700" : "text-destructive"}`}>
            {result.passed ? "PASSED" : "FAILED"} — {result.score_percent}%
          </p>
          <p className="text-xs text-muted-foreground">
            {result.passed ? "Learner demonstrated sufficient knowledge." : "Learner did not reach the required pass mark."}
          </p>
        </div>
      </div>

      {/* Score Progress Bar */}
      <div>
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
          <span>Score Progress</span>
          <span>{result.score_percent}% / 80% required</span>
        </div>
        <div className="relative">
          <Progress value={result.score_percent || 0} className="h-3" />
          <div
            className="absolute top-0 h-3 border-r-2 border-dashed border-foreground/40"
            style={{ left: "80%" }}
            title="Pass mark: 80%"
          />
        </div>
      </div>

      {/* Integrity Monitoring */}
      {result.violations_count > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <div className="flex items-center gap-2 text-sm font-bold text-amber-800 mb-2">
            <AlertTriangle className="w-4 h-4" />
            Integrity Warnings Recorded
          </div>
          <p className="text-xs text-amber-700 leading-relaxed">
            The system detected {result.violations_count} integrity violation(s) during this assessment attempt, 
            which may include tab switching, loss of window focus, or exiting fullscreen mode. 
            Please review the learner's performance accordingly.
          </p>
        </div>
      )}

      {/* Per-Question Breakdown */}
      <div>
        <button
          onClick={() => setShowQuestions(!showQuestions)}
          className="flex items-center gap-2 text-sm font-semibold text-foreground hover:underline"
        >
          📝 Question-by-Question Breakdown
          {showQuestions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showQuestions && (
          <div className="mt-3 space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {result.review_questions.map((q, idx) => (
              <Card key={q.question_id} className={`p-4 border-l-4 ${q.is_correct ? "border-l-green-500" : "border-l-destructive"}`}>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {q.is_correct ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-destructive" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground mb-2">
                      <span className="text-muted-foreground mr-1">Q{idx + 1}.</span>
                      {q.question_text}
                    </p>
                    <div className="space-y-1">
                      {q.options.map((opt, oi) => {
                        const isLearnerPick = q.learner_answers.includes(oi);
                        const isCorrectOption = q.correct_answers.includes(oi);
                        let optClass = "text-xs px-2 py-1.5 rounded-lg ";
                        if (isCorrectOption && isLearnerPick) optClass += "bg-green-50 border border-green-300 text-green-800";
                        else if (isCorrectOption) optClass += "bg-green-50 border border-green-200 text-green-700";
                        else if (isLearnerPick) optClass += "bg-destructive/5 border border-destructive/30 text-destructive";
                        else optClass += "bg-muted/30 text-muted-foreground";

                        return (
                          <div key={oi} className={`flex items-center gap-2 ${optClass}`}>
                            {isCorrectOption && isLearnerPick && <CheckCircle2 className="w-3 h-3 text-green-600 flex-shrink-0" />}
                            {isCorrectOption && !isLearnerPick && <CheckCircle2 className="w-3 h-3 text-green-500 flex-shrink-0" />}
                            {!isCorrectOption && isLearnerPick && <XCircle className="w-3 h-3 text-destructive flex-shrink-0" />}
                            {!isCorrectOption && !isLearnerPick && <span className="w-3 h-3 flex-shrink-0" />}
                            <span>{opt}</span>
                            {isLearnerPick && <Badge variant="outline" className="text-[10px] ml-auto px-1.5 py-0">Learner</Badge>}
                            {isCorrectOption && !isLearnerPick && <Badge variant="outline" className="text-[10px] ml-auto px-1.5 py-0 border-green-400 text-green-600">Correct</Badge>}
                          </div>
                        );
                      })}
                    </div>
                    {q.explanation && (
                      <div className="mt-3 p-2.5 bg-muted/40 rounded-lg border border-border">
                        <p className="text-[11px] font-bold text-muted-foreground uppercase mb-1 flex items-center gap-1.5">
                          <MessageSquare className="w-3 h-3" /> Explanation
                        </p>
                        <p className="text-xs text-muted-foreground leading-relaxed italic">
                          {q.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizResultsPanel;

export default QuizResultsPanel;
