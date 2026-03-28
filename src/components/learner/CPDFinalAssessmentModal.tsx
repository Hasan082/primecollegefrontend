import { useState, useEffect, useCallback, useMemo } from "react";
import { 
  CheckCircle2, 
  ShieldCheck, 
  Clock, 
  Loader2, 
  ChevronLeft, 
  ChevronRight,
  Send,
  Save,
  AlertCircle,
  X,
  Trophy,
  XCircle,
  RotateCcw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  useStartCPDFinalAssessmentMutation,
  useSubmitCPDFinalAssessmentMutation,
  useSaveCPDFinalAssessmentProgressMutation,
  type CPDFinalAssessmentAttempt,
} from "@/redux/apis/quiz/quizApi";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  AlertDialog, 
  AlertDialogContent, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogCancel, 
  AlertDialogAction 
} from "@/components/ui/alert-dialog";

interface CPDFinalAssessmentModalProps {
  qualificationId: string;
  qualificationTitle: string;
  onClose: () => void;
  onSubmitted: (result: CPDFinalAssessmentAttempt) => void;
}

const CPDFinalAssessmentModal = ({ qualificationId, qualificationTitle, onClose, onSubmitted }: CPDFinalAssessmentModalProps) => {
  const [phase, setPhase] = useState<"intro" | "active" | "submitting" | "results">("intro");
  const [attempt, setAttempt] = useState<CPDFinalAssessmentAttempt | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number[]>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const { toast } = useToast();

  const [startAssessment, { isLoading: isStarting }] = useStartCPDFinalAssessmentMutation();
  const [submitAssessment, { isLoading: isSubmitting }] = useSubmitCPDFinalAssessmentMutation();
  const [saveProgress, { isLoading: isSaving }] = useSaveCPDFinalAssessmentProgressMutation();

  const currentQuestion = useMemo(() => attempt?.questions[currentQuestionIndex], [attempt, currentQuestionIndex]);
  
  const answeredCount = useMemo(() => {
    return attempt?.questions.filter(q => (answers[q.id]?.length || 0) > 0).length || 0;
  }, [attempt, answers]);

  const progressPercent = useMemo(() => {
    if (!attempt) return 0;
    return Math.round((answeredCount / attempt.total_questions) * 100);
  }, [attempt, answeredCount]);

  const handleStart = async () => {
    try {
      const res = await startAssessment(qualificationId).unwrap();
      // Handle standard QuizResponse structure or direct data if startAssessment unwraps it
      setAttempt(res);
      
      const initialAnswers: Record<string, number[]> = {};
      res.questions.forEach(q => {
        initialAnswers[q.id] = q.learner_answers || [];
      });
      setAnswers(initialAnswers);
      
      setTimeLeft(res.time_limit_minutes * 60);
      setPhase("active");
    } catch (err: any) {
      toast({
        title: "Cannot start assessment",
        description: err.data?.message || err.message || "Something went wrong",
        variant: "destructive"
      });
    }
  };

  const handleOptionToggle = (questionId: string, optionIndex: number, isMultiple: boolean) => {
    setAnswers(prev => {
      const current = prev[questionId] || [];
      if (isMultiple) {
        if (current.includes(optionIndex)) {
          return { ...prev, [questionId]: current.filter(i => i !== optionIndex) };
        } else {
          return { ...prev, [questionId]: [...current, optionIndex].sort((a, b) => a - b) };
        }
      } else {
        return { ...prev, [questionId]: [optionIndex] };
      }
    });
  };

  // Autosave logic
  useEffect(() => {
    if (phase !== "active" || !attempt) return;
    
    const interval = setInterval(async () => {
      try {
        await saveProgress({ attemptId: attempt.id, answers }).unwrap();
        setLastSaved(new Date());
      } catch (err) {
        console.error("Autosave failed", err);
      }
    }, 45000); // 45 seconds

    return () => clearInterval(interval);
  }, [phase, attempt, answers, saveProgress]);

  const handleSubmit = async () => {
    if (!attempt) return;
    setPhase("submitting");
    try {
      const res = await submitAssessment({ attemptId: attempt.id, answers }).unwrap();
      setAttempt(res);
      setPhase("results");
      onSubmitted(res);
    } catch (err: any) {
      setPhase("active");
      toast({
        title: "Submission failed",
        description: err.data?.message || "Something went wrong",
        variant: "destructive"
      });
    }
  };

  // Timer logic
  useEffect(() => {
    if (phase !== "active" || timeLeft === null) return;
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    const timer = setInterval(() => setTimeLeft(t => (t ? t - 1 : 0)), 1000);
    return () => clearInterval(timer);
  }, [phase, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (phase === "intro") {
    return (
      <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-card border border-border rounded-2xl shadow-2xl max-w-2xl w-full p-8 overflow-hidden relative animate-in fade-in zoom-in duration-300">
          <Button variant="ghost" size="icon" className="absolute top-4 right-4" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
          
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <ShieldCheck className="w-10 h-10 text-primary" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tight">Final Assessment</h2>
              <p className="text-muted-foreground text-lg">{qualificationTitle}</p>
            </div>

            <div className="grid grid-cols-3 gap-4 w-full">
              <div className="bg-muted/50 p-4 rounded-xl border border-border">
                <Clock className="w-5 h-5 text-primary mb-2 mx-auto" />
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Time Limit</p>
                <p className="font-semibold text-sm">60 Minutes</p>
              </div>
              <div className="bg-muted/50 p-4 rounded-xl border border-border">
                <ShieldCheck className="w-5 h-5 text-primary mb-2 mx-auto" />
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Pass Mark</p>
                <p className="font-semibold text-sm">70%</p>
              </div>
              <div className="bg-muted/50 p-4 rounded-xl border border-border">
                <AlertCircle className="w-5 h-5 text-primary mb-2 mx-auto" />
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Type</p>
                <p className="font-semibold text-sm">Final Quiz</p>
              </div>
            </div>

            <div className="bg-primary/5 p-6 rounded-xl border border-primary/10 text-left w-full space-y-3">
              <h4 className="font-bold text-primary">Instructions</h4>
              <ul className="text-sm space-y-2 list-disc pl-4 text-muted-foreground">
                <li>You must complete all questions before submitting.</li>
                <li>Your progress is auto-saved periodically.</li>
                <li>Do not refresh or close the browser during the assessment.</li>
                <li>Once started, the timer cannot be paused.</li>
              </ul>
            </div>

            <Button size="lg" className="w-full h-14 text-lg font-bold shadow-lg shadow-primary/20" onClick={handleStart} disabled={isStarting}>
              {isStarting ? <Loader2 className="w-6 h-6 animate-spin mr-2" /> : <Send className="w-5 h-5 mr-2" />}
              Begin Assessment
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "active" && attempt) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col md:flex-row animate-in fade-in duration-300">
        {/* Sidebar for Navigation */}
        <aside className="w-full md:w-80 border-r border-border bg-card flex flex-col">
          <div className="p-6 border-b border-border">
            <h2 className="font-bold text-lg mb-1 truncate">{qualificationTitle}</h2>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Final Assessment</span>
              <span>Question {currentQuestionIndex + 1} of {attempt.total_questions}</span>
            </div>
          </div>

          <div className="p-6 flex-1 overflow-hidden flex flex-col gap-4">
            <div>
              <div className="flex justify-between text-xs font-bold mb-2 uppercase tracking-wider text-muted-foreground">
                <span>Progress</span>
                <span>{progressPercent}%</span>
              </div>
              <Progress value={progressPercent} className="h-2" />
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              <div className="grid grid-cols-5 gap-2">
                {attempt.questions.map((q, idx) => {
                  const isAnswered = (answers[q.id]?.length || 0) > 0;
                  const isCurrent = idx === currentQuestionIndex;
                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentQuestionIndex(idx)}
                      className={cn(
                        "h-10 w-full rounded-md flex items-center justify-center text-sm font-medium transition-all",
                        isCurrent 
                          ? "ring-2 ring-primary bg-primary text-white" 
                          : isAnswered 
                            ? "bg-primary/20 text-primary border border-primary/30" 
                            : "bg-muted text-muted-foreground border border-transparent hover:border-border"
                      )}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-auto space-y-4 pt-4 border-t border-border">
              <div className="flex items-center justify-center gap-2 text-sm font-mono font-bold text-primary bg-primary/10 p-3 rounded-lg border border-primary/20">
                <Clock className="w-4 h-4" />
                {timeLeft !== null && formatTime(timeLeft)}
              </div>
              
              {lastSaved && (
                <p className="text-[10px] text-center text-muted-foreground flex items-center justify-center gap-1">
                  <Save className="w-3 h-3" /> Last saved: {lastSaved.toLocaleTimeString()}
                </p>
              )}

              <Button 
                variant="outline" 
                className="w-full text-destructive hover:bg-destructive/5 hover:text-destructive border-transparent"
                onClick={() => setShowExitConfirm(true)}
              >
                Exit Assessment
              </Button>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0 bg-muted/30">
          <ScrollArea className="flex-1">
            <div className="max-w-3xl mx-auto p-6 md:p-12">
              {currentQuestion && (
                <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-300">
                  <div className="space-y-4">
                    <span className="text-xs font-bold uppercase tracking-widest text-primary px-3 py-1 bg-primary/10 rounded-full">
                      Question {currentQuestionIndex + 1}
                    </span>
                    <h3 className="text-2xl md:text-3xl font-bold text-foreground leading-tight">
                      {currentQuestion.question_text_snapshot}
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {currentQuestion.options_snapshot.map((option, idx) => {
                      const isSelected = (answers[currentQuestion.id] || []).includes(idx);
                      const isMultiple = false; // Add logic if question type info is in snapshot

                      return (
                        <button
                          key={idx}
                          onClick={() => handleOptionToggle(currentQuestion.id, idx, isMultiple)}
                          className={cn(
                            "w-full p-5 rounded-2xl border text-left flex items-start gap-4 transition-all duration-200 group",
                            isSelected
                              ? "bg-primary border-primary text-white shadow-lg shadow-primary/20"
                              : "bg-card border-border hover:border-primary/50 text-foreground"
                          )}
                        >
                          <div className={cn(
                            "w-6 h-6 rounded-full border flex items-center justify-center flex-shrink-0 mt-0.5",
                            isSelected 
                              ? "bg-white border-white text-primary" 
                              : "bg-muted border-border group-hover:border-primary/50"
                          )}>
                            {isSelected && <CheckCircle2 className="w-4 h-4" />}
                          </div>
                          <span className="text-lg leading-relaxed">{option}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Bottom Bar */}
          <footer className="p-4 md:p-6 bg-card border-t border-border mt-auto h-24">
            <div className="max-w-3xl mx-auto flex items-center justify-between gap-4 h-full">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setCurrentQuestionIndex(v => Math.max(0, v - 1))}
                disabled={currentQuestionIndex === 0}
                className="h-14 px-8 rounded-xl font-bold"
              >
                <ChevronLeft className="w-5 h-5 mr-2" /> Previous
              </Button>

              {currentQuestionIndex === attempt.total_questions - 1 ? (
                <Button
                  size="lg"
                  onClick={handleSubmit}
                  disabled={isSubmitting || answeredCount < attempt.total_questions}
                  className="h-14 px-8 rounded-xl font-bold shadow-lg shadow-primary/20"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Send className="w-5 h-5 mr-2" />}
                  Submit Assessment
                </Button>
              ) : (
                <Button
                  size="lg"
                  onClick={() => setCurrentQuestionIndex(v => Math.min(attempt.total_questions - 1, v + 1))}
                  className="h-14 px-8 rounded-xl font-bold"
                >
                  Next Question <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              )}
            </div>
          </footer>
        </main>

        <AlertDialog open={showExitConfirm} onOpenChange={setShowExitConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Abandon Assessment?</AlertDialogTitle>
              <AlertDialogDescription>
                You are about to leave the assessment. Any unsaved progress may be lost. The timer will continue to run.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Stay</AlertDialogCancel>
              <AlertDialogAction onClick={onClose} className="bg-destructive hover:bg-destructive/90">Exit Anyway</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }

  if (phase === "results" && attempt) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex items-center justify-center p-4 animate-in fade-in zoom-in duration-500">
        <div className="bg-card border border-border rounded-2xl shadow-2xl max-w-2xl w-full p-10 text-center space-y-8">
          <div className="relative">
            <div className={cn(
              "w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4",
              attempt.passed ? "bg-green-100 dark:bg-green-950" : "bg-red-100 dark:bg-red-950"
            )}>
              {attempt.passed ? (
                <Trophy className="w-12 h-12 text-green-600" />
              ) : (
                <XCircle className="w-12 h-12 text-red-600" />
              )}
            </div>
          </div>

          <div className="space-y-2">
            <h2 className={cn(
              "text-4xl font-extrabold tracking-tight",
              attempt.passed ? "text-green-600" : "text-red-600"
            )}>
              {attempt.passed ? "Congratulations!" : "Keep Practicing"}
            </h2>
            <p className="text-muted-foreground text-lg">
              {attempt.passed 
                ? "You have successfully passed the final assessment." 
                : "You did not reach the required pass mark this time."}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted p-6 rounded-2xl">
              <p className="text-sm text-muted-foreground font-medium mb-1 uppercase tracking-wider">Your Score</p>
              <p className="text-4xl font-black text-foreground">{attempt.score_percent}%</p>
            </div>
            <div className="bg-muted p-6 rounded-2xl">
              <p className="text-sm text-muted-foreground font-medium mb-1 uppercase tracking-wider">Pass Mark</p>
              <p className="text-4xl font-black text-foreground">{attempt.pass_mark}%</p>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-border">
            {attempt.passed ? (
              <Button size="lg" className="w-full h-14 text-lg font-bold" onClick={onClose}>
                Continue to Certification
              </Button>
            ) : (
              <Button size="lg" className="w-full h-14 text-lg font-bold" onClick={() => setPhase("intro")}>
                <RotateCcw className="w-5 h-5 mr-2" /> Try Again
              </Button>
            )}
            <Button variant="ghost" className="w-full" onClick={onClose}>
              Back to Overview
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "submitting") {
    return (
      <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="text-lg font-bold">Grading your assessment...</p>
        </div>
      </div>
    );
  }

  return null;
};

export default CPDFinalAssessmentModal;
