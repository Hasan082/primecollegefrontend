import { useState, useEffect, useCallback, useRef } from "react";
import { CheckCircle2, AlertTriangle, Shield, Maximize, Eye, X, Clock, Trophy, XCircle, RotateCcw, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  useStartQuizMutation,
  useSubmitQuizMutation,
  useGetUnitAttemptsQuery,
  type QuizAttempt,
} from "@/redux/apis/quiz/quizApi";
import { Progress } from "@/components/ui/progress";

interface StrictQuizModalProps {
  qualificationId: string;
  unitId?: string;
  unitCode?: string;
  unitName: string;
  onClose: () => void;
  onSubmitted: (result: QuizAttempt) => void;
  isFinal?: boolean;
}

const MAX_WARNINGS = 3;

const getAttemptId = (attempt: QuizAttempt | null) => {
  if (!attempt) return undefined;
  return attempt.id || (attempt as unknown as { attempt_id?: string }).attempt_id;
};

const StrictQuizModal = ({ qualificationId, unitId, unitCode, unitName, onClose, onSubmitted }: StrictQuizModalProps) => {
  const [phase, setPhase] = useState<"intro" | "active" | "results">("intro");
  const [quiz, setQuiz] = useState<QuizAttempt | null>(null);
  const [answers, setAnswers] = useState<Record<string, number[]>>({});
  const [warnings, setWarnings] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [tabSwitchLog, setTabSwitchLog] = useState<string[]>([]);
  const [result, setResult] = useState<QuizAttempt | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const { data: attemptsData, isLoading: isLoadingAttempts } = useGetUnitAttemptsQuery(
    { unitId: unitId || "" },
    { skip: !unitId }
  );
  const [startQuizMutation, { isLoading: isStarting }] = useStartQuizMutation();
  const [submitQuizMutation, { isLoading: isSubmitting }] = useSubmitQuizMutation();

  const previousAttempts = attemptsData?.data || [];
  // For mock/development, we'll assume canAttempt is true if we don't have a config yet
  // Ideally we should check the unit's quiz config
  const canTake = true; 

  // Timer countdown
  useEffect(() => {
    if (phase !== "active" || timeLeft === null) return;
    if (timeLeft <= 0) {
      handleAutoSubmit();
      return;
    }
    const interval = setInterval(() => setTimeLeft((t) => (t !== null ? t - 1 : null)), 1000);
    return () => clearInterval(interval);
  }, [phase, timeLeft]);

  const handleAutoSubmit = useCallback(async () => {
    const attemptId = getAttemptId(quiz);
    if (!attemptId) return;
    try {
      const res = await submitQuizMutation({
        attemptId,
        data: {
          answers,
          violations_count: warnings,
        },
      }).unwrap();

      if (res.success) {
        setResult(res.data);
        setPhase("results");
        exitFullscreen();
      }
    } catch (error) {
      toast({ title: "Error submitting quiz", variant: "destructive" });
    }
  }, [quiz, answers, warnings, submitQuizMutation, toast]);

  // Fullscreen helpers
  const enterFullscreen = useCallback(async () => {
    try {
      const el = document.documentElement;
      if (el.requestFullscreen) await el.requestFullscreen();
      else if ((el as any).webkitRequestFullscreen) await (el as any).webkitRequestFullscreen();
      setIsFullscreen(true);
    } catch {
      setIsFullscreen(true);
    }
  }, []);

  const exitFullscreen = useCallback(() => {
    try {
      if (document.fullscreenElement) document.exitFullscreen();
    } catch {}
    setIsFullscreen(false);
  }, []);

  // Warning system
  const triggerWarning = useCallback((reason: string) => {
    if (result) return;
    const timestamp = new Date().toLocaleTimeString();
    setTabSwitchLog((prev) => [...prev, `${timestamp} - ${reason}`]);
    setWarnings((prev) => {
      const next = prev + 1;
      if (next >= MAX_WARNINGS) {
        setWarningMessage(`⚠️ Maximum violations reached (${MAX_WARNINGS}). Quiz auto-submitted.`);
        setShowWarning(true);
        setTimeout(() => handleAutoSubmit(), 2000);
      } else {
        setWarningMessage(`⚠️ Warning ${next}/${MAX_WARNINGS}: ${reason}`);
        setShowWarning(true);
        setTimeout(() => setShowWarning(false), 4000);
      }
      return next;
    });
  }, [result, handleAutoSubmit]);

  // Anti-cheat monitoring
  useEffect(() => {
    if (phase !== "active") return;

    const handleVisibility = () => { if (document.hidden) triggerWarning("Tab switch detected"); };
    const handleBlur = () => triggerWarning("Window lost focus");
    const handleFullscreenChange = () => {
      const inFS = !!document.fullscreenElement;
      setIsFullscreen(inFS);
      if (!inFS && phase === "active" && !result) triggerWarning("Exited fullscreen");
    };
    const handleContextMenu = (e: MouseEvent) => { e.preventDefault(); triggerWarning("Right-click attempted"); };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey && ["c", "v", "a", "p", "u"].includes(e.key.toLowerCase())) ||
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && ["i", "j"].includes(e.key.toLowerCase()))
      ) {
        e.preventDefault();
        triggerWarning("Restricted shortcut detected");
      }
      if (e.key === "Escape") e.preventDefault();
    };

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("blur", handleBlur);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [phase, result, triggerWarning]);

  useEffect(() => {
    return () => { if (document.fullscreenElement) document.exitFullscreen().catch(() => {}); };
  }, []);

  const startQuiz = async () => {
    try {
      if (!unitId) return;
      const res = await startQuizMutation(unitId).unwrap();
      if (res.success) {
        const startedQuiz = {
          ...(res.data as QuizAttempt),
          id: (res.data as QuizAttempt & { attempt_id?: string }).id || (res.data as { attempt_id?: string }).attempt_id || "",
        };
        if (!startedQuiz.id) {
          toast({ title: "Failed to start quiz", description: "Quiz attempt ID was missing.", variant: "destructive" });
          return;
        }
        setQuiz(startedQuiz);
        // Assuming strict mode for now, or we can check a field in res.data if available
        await enterFullscreen();
        setPhase("active");
        // Set time limit if available (e.g., from a config object returned by backend)
        // For now, let's assume no hardcoded limit unless provided
      }
    } catch (error) {
      toast({ title: "Failed to start quiz", variant: "destructive" });
    }
  };

  const handleSingle = (qId: string, idx: number) => {
    if (result) return;
    setAnswers((prev) => ({ ...prev, [qId]: [idx] }));
  };

  const handleMultiple = (qId: string, idx: number) => {
    if (result) return;
    setAnswers((prev) => {
      const current = prev[qId] || [];
      return { ...prev, [qId]: current.includes(idx) ? current.filter((i) => i !== idx) : [...current, idx] };
    });
  };

  const handleSubmit = async () => {
    const attemptId = getAttemptId(quiz);
    if (!quiz || !attemptId) return;
    const unanswered = quiz.questions.filter((q) => !answers[q.id]?.length);
    if (unanswered.length) {
      toast({ title: `${unanswered.length} question(s) unanswered`, description: "Please answer all questions before submitting.", variant: "destructive" });
      return;
    }
    
    try {
      const res = await submitQuizMutation({
        attemptId,
        data: {
          answers,
          violations_count: warnings,
        },
      }).unwrap();

      if (res.success) {
        setResult(res.data);
        setPhase("results");
        exitFullscreen();
      }
    } catch (error) {
      toast({ title: "Error submitting quiz", variant: "destructive" });
    }
  };

  const handleClose = () => {
    exitFullscreen();
    if (result) onSubmitted(result);
    onClose();
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const totalQuestions = quiz?.questions.length || 0;
  const answeredCount = Object.keys(answers).filter((k) => answers[k]?.length > 0).length;

  if (isLoadingAttempts || isStarting) {
    return (
      <div className="fixed inset-0 z-[9999] bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground font-medium">Preparing your assessment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-background flex flex-col" ref={containerRef}>
      {/* Top Bar */}
      <div className="bg-primary text-primary-foreground px-6 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5" />
          <span className="font-bold text-sm">Strict Assessment Mode</span>
          {phase === "active" && (
            <span className="text-xs opacity-80 ml-2">{answeredCount}/{totalQuestions} answered</span>
          )}
        </div>
        <div className="flex items-center gap-4">
          {phase === "active" && (
            <>
              {timeLeft !== null && (
                <div className={`flex items-center gap-1.5 text-xs font-mono ${timeLeft < 300 ? "text-yellow-300 animate-pulse" : ""}`}>
                  <Clock className="w-3.5 h-3.5" />
                  <span>{formatTime(timeLeft)}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5 text-xs">
                <Eye className="w-3.5 h-3.5" /><span>Proctored</span>
              </div>
              <div className={`flex items-center gap-1.5 text-xs ${warnings > 0 ? "text-yellow-300" : ""}`}>
                <AlertTriangle className="w-3.5 h-3.5" /><span>{warnings}/{MAX_WARNINGS}</span>
              </div>
            </>
          )}
          {(phase === "intro" || phase === "results") && (
            <button onClick={handleClose} className="p-1 hover:opacity-80"><X className="w-5 h-5" /></button>
          )}
        </div>
      </div>

      {/* Warning Banner */}
      {showWarning && (
        <div className="bg-destructive text-destructive-foreground px-6 py-3 text-sm font-semibold flex items-center gap-2 animate-pulse flex-shrink-0">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />{warningMessage}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Intro Screen */}
        {phase === "intro" && (
          <div className="max-w-xl mx-auto py-16 px-6 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">{unitCode}: {unitName}</h2>
            <p className="text-muted-foreground mb-8">Knowledge Assessment Quiz</p>

            {/* Quiz Info */}
            <div className="bg-card border border-border rounded-xl p-6 text-left mb-6">
              <h3 className="font-bold text-foreground mb-4">📊 Quiz Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <p className="font-semibold text-foreground">Strict Mode Enabled</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Attempts Taken</p>
                  <p className="font-semibold text-foreground">
                    {previousAttempts.length}
                  </p>
                </div>
              </div>
            </div>

            {/* Previous Attempts */}
            {previousAttempts.length > 0 && (
              <div className="bg-card border border-border rounded-xl p-6 text-left mb-6">
                <h3 className="font-bold text-foreground mb-3">📝 Previous Attempts</h3>
                <div className="space-y-2">
                  {previousAttempts.map((a, i) => (
                    <div key={a.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Attempt {i + 1}</span>
                        {a.violations_count > 0 && (
                          <span className="text-xs text-amber-600">({a.violations_count} violation{a.violations_count !== 1 ? "s" : ""})</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold">{a.score_percent}%</span>
                        {a.passed ? (
                          <span className="text-xs font-bold px-2 py-0.5 rounded bg-green-600 text-white">PASS</span>
                        ) : (
                          <span className="text-xs font-bold px-2 py-0.5 rounded bg-destructive text-destructive-foreground">FAIL</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rules */}
            <div className="bg-card border border-border rounded-xl p-6 text-left mb-8">
              <h3 className="font-bold text-foreground mb-4">📋 Assessment Rules</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-3">
                  <Maximize className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  <span>Quiz opens in <strong className="text-foreground">fullscreen mode</strong>. Do not exit.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Eye className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  <span><strong className="text-foreground">Tab switching</strong> is monitored and logged.</span>
                </li>
                <li className="flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  <span>After <strong className="text-foreground">{MAX_WARNINGS} violations</strong>, quiz auto-submits.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Shield className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  <span><strong className="text-foreground">Copy, paste, right-click, dev tools</strong> are disabled.</span>
                </li>
              </ul>
            </div>

            {canTake ? (
              <button 
                onClick={startQuiz} 
                disabled={isStarting}
                className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isStarting ? "Initializing..." : "I Understand — Start Quiz"}
              </button>
            ) : (
              <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4">
                <p className="text-sm font-semibold text-destructive">No attempts remaining</p>
                <p className="text-xs text-muted-foreground mt-1">You have used all available attempts for this quiz.</p>
              </div>
            )}
          </div>
        )}

        {/* Active Quiz */}
        {phase === "active" && quiz && (
          <div className="max-w-3xl mx-auto py-8 px-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">{unitCode}: {unitName}</h2>
              {timeLeft !== null && (
                <div className={`text-sm font-mono font-semibold px-3 py-1 rounded-lg ${timeLeft < 300 ? "bg-destructive/10 text-destructive" : "bg-muted text-foreground"}`}>
                  ⏱ {formatTime(timeLeft)}
                </div>
              )}
            </div>

            {/* Progress bar */}
            <div className="mb-6">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Progress</span>
                <span>{answeredCount}/{totalQuestions}</span>
              </div>
              <Progress value={(answeredCount / totalQuestions) * 100} className="h-2" />
            </div>

            <div className="space-y-6">
              {quiz.questions.map((q, qi) => (
                <div key={q.id} className="bg-card border border-border rounded-xl p-5">
                  <p className="font-semibold text-foreground mb-3">{qi + 1}. {q.question_text}</p>
                  <p className="text-xs text-muted-foreground mb-3">
                    {q.question_type === "single" ? "Select one answer" : "Select all that apply"}
                  </p>
                  <div className="space-y-2">
                    {q.options.map((opt, oi) => {
                      const selected = answers[q.id]?.includes(oi);
                      return (
                        <label key={oi} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors select-none ${selected ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}>
                          {q.question_type === "single" ? (
                            <input type="radio" name={q.id} checked={selected || false} onChange={() => handleSingle(q.id, oi)} className="accent-primary w-4 h-4" />
                          ) : (
                            <input type="checkbox" checked={selected || false} onChange={() => handleMultiple(q.id, oi)} className="accent-primary w-4 h-4 rounded" />
                          )}
                          <span className="text-sm text-foreground select-none">{opt}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
              <p className="text-sm text-muted-foreground">{answeredCount} of {totalQuestions} answered</p>
              <button 
                onClick={handleSubmit} 
                disabled={isSubmitting}
                className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isSubmitting ? "Submitting..." : "Submit Quiz"}
              </button>
            </div>
          </div>
        )}

        {/* Results Screen */}
        {phase === "results" && result && (
          <div className="max-w-xl mx-auto py-16 px-6 text-center">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${result.passed ? "bg-green-100" : "bg-destructive/10"}`}>
              {result.passed ? <Trophy className="w-10 h-10 text-green-600" /> : <XCircle className="w-10 h-10 text-destructive" />}
            </div>

            <h2 className="text-2xl font-bold text-foreground mb-2">
              {result.passed ? "Quiz Passed! 🎉" : "Quiz Not Passed"}
            </h2>
            <p className="text-muted-foreground mb-8">
              {result.passed
                ? "Congratulations! You've demonstrated sufficient knowledge."
                : "You did not reach the required pass mark. You can review and try again if attempts remain."}
            </p>

            {/* Score Circle */}
            <div className="mb-8">
              <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full border-4 ${result.passed ? "border-green-500" : "border-destructive"}`}>
                <div>
                  <p className={`text-3xl font-bold ${result.passed ? "text-green-600" : "text-destructive"}`}>{result.score_percent}%</p>
                  <p className="text-xs text-muted-foreground">Score</p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-card border border-border rounded-xl p-5 mb-6 text-left">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Questions</span>
                  <span className="font-semibold text-foreground">{result.questions.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Violations</span>
                  <span className={`font-semibold ${result.violations_count > 0 ? "text-amber-600" : "text-green-600"}`}>{result.violations_count}</span>
                </div>
              </div>
            </div>

            {/* Violations log */}
            {warnings > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-left">
                <p className="text-sm font-semibold text-amber-800 mb-2">⚠️ {warnings} violation{warnings !== 1 ? "s" : ""} recorded</p>
                <ul className="space-y-1">
                  {tabSwitchLog.map((log, i) => (
                    <li key={i} className="text-xs text-amber-700">{log}</li>
                  ))}
                </ul>
                <p className="text-xs text-amber-600 mt-2">Logged and visible to your assessor.</p>
              </div>
            )}

            <button onClick={handleClose} className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-bold text-sm hover:opacity-90 transition-opacity">
              Close & Return to Unit
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StrictQuizModal;
