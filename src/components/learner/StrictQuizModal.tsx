import { useState, useEffect, useCallback, useRef } from "react";
import { CheckCircle2, AlertTriangle, Shield, Maximize, Eye, X } from "lucide-react";
import type { AssignmentData } from "@/data/learnerMockData";
import { useToast } from "@/hooks/use-toast";

interface StrictQuizModalProps {
  assignment: AssignmentData;
  onClose: () => void;
  onSubmitted: () => void;
}

const MAX_WARNINGS = 3;

const StrictQuizModal = ({ assignment, onClose, onSubmitted }: StrictQuizModalProps) => {
  const [phase, setPhase] = useState<"intro" | "active" | "submitted">("intro");
  const [answers, setAnswers] = useState<Record<string, number[]>>({});
  const [submitted, setSubmitted] = useState(false);
  const [warnings, setWarnings] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [tabSwitchLog, setTabSwitchLog] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Request fullscreen
  const enterFullscreen = useCallback(async () => {
    try {
      const el = document.documentElement;
      if (el.requestFullscreen) {
        await el.requestFullscreen();
      } else if ((el as any).webkitRequestFullscreen) {
        await (el as any).webkitRequestFullscreen();
      }
      setIsFullscreen(true);
    } catch {
      // Fullscreen may not be supported in iframe/preview
      setIsFullscreen(true); // Continue anyway
    }
  }, []);

  const exitFullscreen = useCallback(() => {
    try {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
    } catch {}
    setIsFullscreen(false);
  }, []);

  // Trigger a warning
  const triggerWarning = useCallback((reason: string) => {
    if (submitted) return;
    const timestamp = new Date().toLocaleTimeString();
    setTabSwitchLog((prev) => [...prev, `${timestamp} - ${reason}`]);
    setWarnings((prev) => {
      const next = prev + 1;
      if (next >= MAX_WARNINGS) {
        setWarningMessage(`⚠️ Maximum violations reached (${MAX_WARNINGS}). Your quiz has been auto-submitted with a flag for review.`);
        setShowWarning(true);
        // Auto-submit
        setTimeout(() => {
          setSubmitted(true);
          setPhase("submitted");
        }, 2000);
      } else {
        setWarningMessage(`⚠️ Warning ${next}/${MAX_WARNINGS}: ${reason}. After ${MAX_WARNINGS} violations, your quiz will be auto-submitted.`);
        setShowWarning(true);
        setTimeout(() => setShowWarning(false), 4000);
      }
      return next;
    });
  }, [submitted]);

  // Monitor tab visibility
  useEffect(() => {
    if (phase !== "active") return;

    const handleVisibility = () => {
      if (document.hidden) {
        triggerWarning("Tab switch or window change detected");
      }
    };

    const handleBlur = () => {
      triggerWarning("Browser window lost focus");
    };

    const handleFullscreenChange = () => {
      const inFS = !!document.fullscreenElement;
      setIsFullscreen(inFS);
      if (!inFS && phase === "active" && !submitted) {
        triggerWarning("Exited fullscreen mode");
      }
    };

    // Prevent right-click
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      triggerWarning("Right-click attempted");
    };

    // Prevent copy/paste shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // Block Ctrl+C, Ctrl+V, Ctrl+A, Ctrl+P, F12, Alt+Tab won't be caught but blur will
      if (
        (e.ctrlKey && ["c", "v", "a", "p", "u"].includes(e.key.toLowerCase())) ||
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && ["i", "j"].includes(e.key.toLowerCase()))
      ) {
        e.preventDefault();
        triggerWarning("Restricted keyboard shortcut detected");
      }
      // Block Escape in fullscreen
      if (e.key === "Escape") {
        e.preventDefault();
      }
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
  }, [phase, submitted, triggerWarning]);

  // Cleanup fullscreen on unmount
  useEffect(() => {
    return () => {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    };
  }, []);

  const startQuiz = async () => {
    await enterFullscreen();
    setPhase("active");
  };

  const handleSingle = (qId: string, idx: number) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [qId]: [idx] }));
  };

  const handleMultiple = (qId: string, idx: number) => {
    if (submitted) return;
    setAnswers((prev) => {
      const current = prev[qId] || [];
      return { ...prev, [qId]: current.includes(idx) ? current.filter((i) => i !== idx) : [...current, idx] };
    });
  };

  const handleSubmit = () => {
    const unanswered = (assignment.questions || []).filter((q) => !answers[q.id]?.length);
    if (unanswered.length) {
      toast({ title: "Please answer all questions before submitting", variant: "destructive" });
      return;
    }
    setSubmitted(true);
    setPhase("submitted");
    exitFullscreen();
    toast({ title: "Quiz Submitted", description: "Your answers have been recorded." });
  };

  const handleClose = () => {
    exitFullscreen();
    if (submitted) onSubmitted();
    onClose();
  };

  const totalQuestions = assignment.questions?.length || 0;
  const answeredCount = Object.keys(answers).filter((k) => answers[k]?.length > 0).length;

  return (
    <div className="fixed inset-0 z-[9999] bg-background flex flex-col" ref={containerRef}>
      {/* Top Bar */}
      <div className="bg-primary text-primary-foreground px-6 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5" />
          <span className="font-bold text-sm">Strict Assessment Mode</span>
          {phase === "active" && (
            <span className="text-xs opacity-80 ml-2">
              {answeredCount}/{totalQuestions} answered
            </span>
          )}
        </div>
        <div className="flex items-center gap-4">
          {phase === "active" && (
            <>
              <div className="flex items-center gap-1.5 text-xs">
                <Eye className="w-3.5 h-3.5" />
                <span>Proctored</span>
              </div>
              <div className={`flex items-center gap-1.5 text-xs ${warnings > 0 ? "text-yellow-300" : ""}`}>
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{warnings}/{MAX_WARNINGS} warnings</span>
              </div>
            </>
          )}
          {(phase === "intro" || phase === "submitted") && (
            <button onClick={handleClose} className="p-1 hover:opacity-80">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Warning Banner */}
      {showWarning && (
        <div className="bg-destructive text-destructive-foreground px-6 py-3 text-sm font-semibold flex items-center gap-2 animate-pulse flex-shrink-0">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          {warningMessage}
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
            <h2 className="text-2xl font-bold text-foreground mb-3">{assignment.title}</h2>
            <p className="text-muted-foreground mb-8">{assignment.description}</p>

            <div className="bg-card border border-border rounded-xl p-6 text-left mb-8">
              <h3 className="font-bold text-foreground mb-4">📋 Assessment Rules</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-3">
                  <Maximize className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  <span>The quiz will open in <strong className="text-foreground">fullscreen mode</strong>. Do not exit fullscreen.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Eye className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  <span><strong className="text-foreground">Tab switching</strong> and window changes are monitored and logged.</span>
                </li>
                <li className="flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  <span>After <strong className="text-foreground">{MAX_WARNINGS} violations</strong>, the quiz will be auto-submitted and flagged.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Shield className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  <span><strong className="text-foreground">Copy, paste, right-click, and dev tools</strong> are disabled during the quiz.</span>
                </li>
              </ul>
            </div>

            <p className="text-xs text-muted-foreground mb-6">
              {totalQuestions} question{totalQuestions !== 1 ? "s" : ""} • All violations are logged and reported to your assessor
            </p>

            <button
              onClick={startQuiz}
              className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-bold text-sm hover:opacity-90 transition-opacity"
            >
              I Understand — Start Quiz
            </button>
          </div>
        )}

        {/* Active Quiz */}
        {phase === "active" && (
          <div className="max-w-3xl mx-auto py-8 px-6">
            <h2 className="text-xl font-bold text-foreground mb-6">{assignment.title}</h2>

            <div className="space-y-6">
              {assignment.questions?.map((q, qi) => (
                <div key={q.id} className="bg-card border border-border rounded-xl p-5">
                  <p className="font-semibold text-foreground mb-3">
                    {qi + 1}. {q.question}
                  </p>
                  <p className="text-xs text-muted-foreground mb-3">
                    {q.type === "single" ? "Select one answer" : "Select all that apply"}
                  </p>
                  <div className="space-y-2">
                    {q.options.map((opt, oi) => {
                      const selected = answers[q.id]?.includes(oi);
                      return (
                        <label
                          key={oi}
                          className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors select-none ${
                            selected ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                          }`}
                        >
                          {q.type === "single" ? (
                            <input
                              type="radio"
                              name={q.id}
                              checked={selected || false}
                              onChange={() => handleSingle(q.id, oi)}
                              className="accent-primary w-4 h-4"
                            />
                          ) : (
                            <input
                              type="checkbox"
                              checked={selected || false}
                              onChange={() => handleMultiple(q.id, oi)}
                              className="accent-primary w-4 h-4 rounded"
                            />
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
              <p className="text-sm text-muted-foreground">
                {answeredCount} of {totalQuestions} questions answered
              </p>
              <button
                onClick={handleSubmit}
                className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-bold text-sm hover:opacity-90 transition-opacity"
              >
                Submit Quiz
              </button>
            </div>
          </div>
        )}

        {/* Submitted Screen */}
        {phase === "submitted" && (
          <div className="max-w-xl mx-auto py-16 px-6 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-3">Quiz Submitted</h2>
            <p className="text-muted-foreground mb-6">
              Your answers have been recorded and will be reviewed by your assessor.
            </p>

            {warnings > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-left">
                <p className="text-sm font-semibold text-amber-800 mb-2">
                  ⚠️ {warnings} violation{warnings !== 1 ? "s" : ""} recorded
                </p>
                <ul className="space-y-1">
                  {tabSwitchLog.map((log, i) => (
                    <li key={i} className="text-xs text-amber-700">{log}</li>
                  ))}
                </ul>
                <p className="text-xs text-amber-600 mt-2">These have been logged and will be visible to your assessor.</p>
              </div>
            )}

            <div className="bg-card border border-border rounded-xl p-4 mb-8 text-left">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Questions answered</span>
                <span className="font-semibold text-foreground">{answeredCount}/{totalQuestions}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Violations</span>
                <span className={`font-semibold ${warnings > 0 ? "text-amber-600" : "text-green-600"}`}>{warnings}</span>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-bold text-sm hover:opacity-90 transition-opacity"
            >
              Close & Return to Unit
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StrictQuizModal;
