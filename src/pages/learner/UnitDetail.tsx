import { useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft, Download, Upload, FileText, CheckCircle2, Clock,
  AlertTriangle, Circle, ClipboardList, PenLine, File as FileIcon, Lock, ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { learnerQualifications } from "@/data/learnerMockData";
import type { UnitData, AssignmentData } from "@/data/learnerMockData";
import { useToast } from "@/hooks/use-toast";
import StrictQuizModal from "@/components/learner/StrictQuizModal";
import SubmissionHistory from "@/components/learner/SubmissionHistory";
import EvidenceUploadForm from "@/components/learner/EvidenceUploadForm";
import ResourceLock from "@/components/learner/ResourceLock";

/* ── Status config ── */
const statusConfig: Record<UnitData["status"], { label: string; color: string }> = {
  competent: { label: "Competent", color: "bg-green-600 text-white" },
  awaiting_assessment: { label: "Awaiting Assessment", color: "bg-amber-500 text-white" },
  awaiting_iqa: { label: "Awaiting IQA Verification", color: "bg-blue-600 text-white" },
  resubmission: { label: "Resubmission Required", color: "bg-orange-500 text-white" },
  not_started: { label: "Not Started", color: "bg-muted text-muted-foreground" },
};

/* ── Quiz Component ── */
const QuizAssignment = ({ assignment }: { assignment: AssignmentData }) => {
  const [answers, setAnswers] = useState<Record<string, number[]>>({});
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

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
    toast({ title: "Quiz Submitted", description: "Your answers have been recorded and will be reviewed." });
  };

  return (
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
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    selected ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                  } ${submitted ? "pointer-events-none opacity-80" : ""}`}
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
                  <span className="text-sm text-foreground">{opt}</span>
                </label>
              );
            })}
          </div>
        </div>
      ))}
      {!submitted && (
        <Button
          onClick={handleSubmit}
          disabled={submitted}
        >
          {submitted ? "Quiz Submitted" : "Submit Quiz"}
        </Button>
      )}
      {submitted && (
        <div className="flex items-center gap-2 text-green-600 font-semibold text-sm">
          <CheckCircle2 className="w-5 h-5" /> Quiz submitted successfully
        </div>
      )}
    </div>
  );
};

/* ── Written Assignment Component ── */
const WrittenAssignment = ({ assignment, onSubmitted }: { assignment: AssignmentData; onSubmitted?: () => void }) => {
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  const handleSubmit = () => {
    if (wordCount < 50) {
      toast({ title: "Please write at least 50 words", variant: "destructive" });
      return;
    }
    setSubmitted(true);
    onSubmitted?.();
    toast({ title: "Assignment Submitted", description: "Your written assignment has been submitted for assessment." });
  };

  return (
    <div className="space-y-4">
      {!submitted ? (
        <>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write your answer here..."
            className="w-full min-h-[250px] p-4 rounded-xl border border-border bg-background text-foreground text-sm resize-y focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <div className="flex items-center justify-between">
            <span className={`text-sm ${assignment.wordLimit && wordCount > assignment.wordLimit ? "text-destructive" : "text-muted-foreground"}`}>
              {wordCount} {assignment.wordLimit ? `/ ${assignment.wordLimit}` : ""} words
            </span>
            <Button onClick={handleSubmit}>
              Submit Assignment
            </Button>
          </div>
        </>
      ) : (
        <div className="flex items-center gap-2 text-green-600 font-semibold text-sm">
          <CheckCircle2 className="w-5 h-5" /> Written assignment submitted successfully ({wordCount} words)
        </div>
      )}
    </div>
  );
};

/* ── File Upload Assignment Component ── */
const FileUploadAssignment = ({ assignment, onSubmitted }: { assignment: AssignmentData; onSubmitted?: () => void }) => {
  const [files, setFiles] = useState<{ name: string; size: string }[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    const newFiles = Array.from(fileList).map((f) => ({
      name: f.name,
      size: f.size < 1024 * 1024 ? `${(f.size / 1024).toFixed(0)} KB` : `${(f.size / (1024 * 1024)).toFixed(1)} MB`,
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  const handleSubmit = () => {
    if (!files.length) {
      toast({ title: "Please upload at least one file", variant: "destructive" });
      return;
    }
    setSubmitted(true);
    onSubmitted?.();
    toast({ title: "Evidence Submitted", description: "Your files have been uploaded for assessment." });
  };

  return (
    <div className="space-y-4">
      {!submitted ? (
        <>
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
          >
            <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-primary font-medium">Click to upload <span className="text-muted-foreground font-normal">or drag and drop</span></p>
            <p className="text-xs text-muted-foreground mt-1">PDF, DOCX, XLSX (max. 10MB)</p>
          </div>
          <input ref={fileInputRef} type="file" multiple accept=".pdf,.docx,.xlsx,.doc,.xls" className="hidden" onChange={(e) => handleFiles(e.target.files)} />

          {files.length > 0 && (
            <div className="space-y-2">
              {files.map((f, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <FileIcon className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-sm text-foreground flex-1">{f.name}</span>
                  <span className="text-xs text-muted-foreground">{f.size}</span>
                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => setFiles((prev) => prev.filter((_, j) => j !== i))}>Remove</Button>
                </div>
              ))}
            </div>
          )}

          <Button onClick={handleSubmit}>
            Submit Evidence
          </Button>
        </>
      ) : (
        <div className="flex items-center gap-2 text-green-600 font-semibold text-sm">
          <CheckCircle2 className="w-5 h-5" /> {files.length} file(s) uploaded successfully
        </div>
      )}
    </div>
  );
};

/* ── Assignment type icons ── */
const assignmentIcon: Record<AssignmentData["type"], typeof ClipboardList> = {
  quiz: ClipboardList,
  written: PenLine,
  file_upload: Upload,
};

/* ── Main Unit Detail Page ── */
const UnitDetail = () => {
  const { qualificationId, unitId } = useParams();
  const [activeAssignment, setActiveAssignment] = useState<string | null>(null);
  const [showStrictQuiz, setShowStrictQuiz] = useState(false);
  const [submittedAssignments, setSubmittedAssignments] = useState<Set<string>>(new Set());
  const [unitSubmitted, setUnitSubmitted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [extraUploads, setExtraUploads] = useState<{ name: string; size: string; date: string }[]>([]);
  const { toast } = useToast();

  const qualification = learnerQualifications.find((q) => q.id === qualificationId);
  const unit = qualification?.units.find((u) => u.id === unitId);

  if (!qualification || !unit) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Unit not found.</p>
        <Link to="/learner/dashboard" className="text-primary hover:underline mt-2 inline-block">Back to Dashboard</Link>
      </div>
    );
  }

  const detail = unit.detail;
  const cfg = statusConfig[unit.status];

  const isExpired = (() => {
    // Check qualification expiry from mock data
    const expiryMap: Record<string, string> = { "adult-care-l4": "01/02/2026", "business-admin-l3": "15/09/2026" };
    const expiry = expiryMap[qualificationId || ""];
    if (!expiry) return false;
    const [d, m, y] = expiry.split("/").map(Number);
    return new Date(y, m - 1, d) < new Date();
  })();

  const evidenceUploaded = (detail?.uploadedFiles.length || 0) + extraUploads.length > 0;
  const alreadySubmitted = unit.status === "awaiting_assessment" || unit.status === "competent" || unit.status === "awaiting_iqa" || unitSubmitted;
  const readyForAssessment = !alreadySubmitted && evidenceUploaded;

  const handleExtraUpload = (fileList: FileList | null) => {
    if (!fileList) return;
    const newFiles = Array.from(fileList).map((f) => ({
      name: f.name,
      size: f.size < 1024 * 1024 ? `${(f.size / 1024).toFixed(0)} KB` : `${(f.size / (1024 * 1024)).toFixed(1)} MB`,
      date: new Date().toLocaleDateString("en-GB"),
    }));
    setExtraUploads((prev) => [...prev, ...newFiles]);
    toast({ title: "File uploaded successfully" });
  };

  return (
    <div>
      {showStrictQuiz && unit.code && qualificationId && (
        <StrictQuizModal
          qualificationId={qualificationId}
          unitCode={unit.code}
          unitName={unit.title}
          onClose={() => setShowStrictQuiz(false)}
          onSubmitted={(result) => {
            // Mark quiz assignments as submitted
            detail?.assignments.filter(a => a.type === "quiz").forEach(a => {
              setSubmittedAssignments((prev) => new Set(prev).add(a.id));
            });
            setShowStrictQuiz(false);
          }}
        />
      )}
      <Link
        to={`/learner/qualification/${qualificationId}`}
        className="inline-flex items-center gap-2 text-primary hover:underline mb-6 text-sm font-medium"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Qualification
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── LEFT COLUMN ── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Unit Header */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-start justify-between gap-3 mb-1">
              <h1 className="text-xl font-bold text-foreground">{unit.code}: {unit.title}</h1>
              <span className={`text-xs font-bold px-2.5 py-1 rounded flex-shrink-0 ${cfg.color}`}>{cfg.label}</span>
            </div>
            <p className="text-sm text-muted-foreground mb-5">{qualification.awardingBody}</p>

            {detail && (
              <>
                <h3 className="text-base font-bold text-primary mb-2">Unit Overview</h3>
                <p className="text-sm text-muted-foreground mb-4">{detail.overview}</p>

                <h3 className="text-base font-bold text-primary mb-2">Assessment Requirements</h3>
                <p className="text-sm text-muted-foreground mb-2">Evidence must demonstrate that you can:</p>
                <ul className="space-y-1">
                  {detail.requirements.map((r, i) => (
                    <li key={i} className="text-sm text-muted-foreground">{r}</li>
                  ))}
                </ul>
              </>
            )}
          </div>

          {/* Assignments Section */}
          {detail?.assignments && detail.assignments.length > 0 && (
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-base font-bold text-primary mb-1">Assignments</h3>
              <p className="text-sm text-muted-foreground mb-5">Complete the following assignments for this unit</p>

              <div className="space-y-3">
                {detail.assignments.filter((a) => a.type !== "file_upload").map((a) => {
                  const Icon = assignmentIcon[a.type];
                  const isOpen = activeAssignment === a.id;
                  const isSubmitted = submittedAssignments.has(a.id) || a.status === "submitted" || a.status === "assessed";
                  const displayStatus = isSubmitted ? "submitted" : a.status;

                  return (
                    <div key={a.id} className="border border-border rounded-xl overflow-hidden">
                      <button
                        onClick={() => setActiveAssignment(isOpen ? null : a.id)}
                        className="w-full flex items-center gap-3 p-4 text-left hover:bg-muted/30 transition-colors"
                      >
                        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-sm text-foreground">{a.title}</p>
                          <p className="text-xs text-muted-foreground capitalize">{a.type.replace("_", " ")}</p>
                        </div>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded ${
                          displayStatus === "submitted" || displayStatus === "assessed"
                            ? "bg-green-600 text-white"
                            : displayStatus === "in_progress"
                            ? "bg-amber-500 text-white"
                            : "bg-muted text-muted-foreground"
                        }`}>
                          {displayStatus === "submitted" ? "Submitted" : displayStatus.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                        </span>
                      </button>

                      {isOpen && (
                        <div className="p-5 pt-0 border-t border-border">
                          <p className="text-sm text-muted-foreground mb-5 pt-4">{a.description}</p>
                          {a.type === "quiz" && !isSubmitted && (
                            <Button
                              onClick={() => setShowStrictQuiz(true)}
                              className="gap-2"
                            >
                              <ClipboardList className="w-4 h-4" /> Launch Quiz (Strict Mode)
                            </Button>
                          )}
                          {a.type === "quiz" && isSubmitted && (
                            <div className="flex items-center gap-2 text-green-600 font-semibold text-sm">
                              <CheckCircle2 className="w-5 h-5" /> Quiz submitted — awaiting assessment
                            </div>
                          )}
                          {a.type === "written" && !isSubmitted && (
                            <WrittenAssignment assignment={a} onSubmitted={() => setSubmittedAssignments((prev) => new Set(prev).add(a.id))} />
                          )}
                          {a.type === "written" && isSubmitted && (
                            <div className="flex items-center gap-2 text-green-600 font-semibold text-sm">
                              <CheckCircle2 className="w-5 h-5" /> Written assignment submitted — awaiting assessment
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Downloadable Resources — with locking */}
          {!qualification.paymentConfirmed && detail?.resources && detail.resources.length > 0 ? (
            <ResourceLock qualificationTitle={qualification.title} />
          ) : detail?.resources && detail.resources.length > 0 && (
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-base font-bold text-primary mb-1">Downloadable Resources</h3>
              <p className="text-sm text-muted-foreground mb-5">Access unit specifications, templates, and guidance materials</p>
              <div className="space-y-3">
                {detail.resources.map((r, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 border border-border rounded-lg">
                    <FileText className="w-5 h-5 text-primary flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-primary">{r.name}</p>
                      <p className="text-xs text-muted-foreground">{r.type} • {r.size}</p>
                    </div>
                    <button className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
                      <Download className="w-4 h-4" /> Download
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Evidence Upload Form — with description + criteria linking */}
          {detail && qualification.paymentConfirmed && (
            <EvidenceUploadForm
              requirements={detail.requirements}
              isLocked={!qualification.paymentConfirmed}
              onSubmit={(data) => {
                const version = (detail.submissionHistory?.length || 0) + extraUploads.length + 1;
                setExtraUploads((prev) => [
                  ...prev,
                  ...data.files.map((f) => ({
                    name: f.name,
                    size: f.size,
                    date: new Date().toLocaleDateString("en-GB"),
                    evidenceRef: data.evidenceRef,
                    description: data.description,
                    linkedCriteria: data.linkedCriteria,
                    version,
                  })),
                ]);
              }}
            />
          )}

          {/* Evidence not paid lock */}
          {detail && !qualification.paymentConfirmed && (
            <EvidenceUploadForm
              requirements={detail.requirements}
              isLocked={true}
              onSubmit={() => {}}
            />
          )}

          {/* Submission History / Evidence Versioning */}
          {detail?.submissionHistory && detail.submissionHistory.length > 0 && (
            <SubmissionHistory
              submissions={detail.submissionHistory}
              unitTitle={`${unit.code}: ${unit.title}`}
            />
          )}
        </div>

        {/* ── RIGHT SIDEBAR ── */}
        <div className="space-y-6">
          {/* Submit for Assessment */}
          <div className="bg-card border-2 border-secondary rounded-xl p-6">
            <h3 className="text-base font-bold text-primary mb-4">Submit for Assessment</h3>
            <div className="space-y-2.5 mb-4">
              <div className="flex items-center gap-2">
                {evidenceUploaded ? (
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                ) : (
                  <Circle className="w-4 h-4 text-muted-foreground" />
                )}
                <span className="text-sm text-foreground">Evidence uploaded</span>
              </div>
              <div className="flex items-center gap-2">
                {readyForAssessment ? (
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                ) : (
                  <Clock className="w-4 h-4 text-muted-foreground" />
                )}
                <span className="text-sm text-foreground">Ready for assessment</span>
              </div>
            </div>
            <hr className="border-border mb-4" />
            <p className="text-xs text-muted-foreground mb-4">
              Once submitted, your evidence will be reviewed by an assessor. You will receive feedback and an outcome notification.
            </p>
            <button
              onClick={() => toast({ title: "Submitted for Assessment", description: "Your work has been submitted. You will be notified when assessed." })}
              className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              Submit for Assessment
            </button>
          </div>

          {/* Unit Information */}
          {detail && (
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-base font-bold text-primary mb-4">Unit Information</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Credit Value</p>
                  <p className="text-sm font-semibold text-primary">{detail.creditValue} Credits</p>
                </div>
                <hr className="border-border" />
                <div>
                  <p className="text-sm text-muted-foreground">Guided Learning Hours</p>
                  <p className="text-sm font-semibold text-primary">{detail.guidedLearningHours} Hours</p>
                </div>
                <hr className="border-border" />
                <div>
                  <p className="text-sm text-muted-foreground">Assessment Method</p>
                  <p className="text-sm font-semibold text-primary">{detail.assessmentMethod}</p>
                </div>
              </div>
            </div>
          )}

          {/* Assessor Feedback */}
          {unit.feedback && (
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-base font-bold text-primary mb-3">Assessor Feedback</h3>
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground">{unit.feedback}</p>
              </div>
              {unit.assessedDate && (
                <p className="text-xs text-muted-foreground mt-3">Assessed: {unit.assessedDate}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UnitDetail;
