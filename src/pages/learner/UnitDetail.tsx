import { useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft, Download, FileText, CheckCircle2, Clock,
  Circle, ClipboardList, ShieldCheck, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { UnitData } from "@/data/learnerMockData";
import { useToast } from "@/hooks/use-toast";
import StrictQuizModal from "@/components/learner/StrictQuizModal";
import EvidenceUploadForm from "@/components/learner/EvidenceUploadForm";
import { useGetEnrolmentContentQuery } from "@/redux/apis/enrolmentApi";

/* ── Status config ── */
const statusConfig: Record<string, { label: string; color: string }> = {
  competent: { label: "Competent", color: "bg-green-600 text-white" },
  completed: { label: "Completed", color: "bg-green-600 text-white" },
  awaiting_assessment: { label: "Awaiting Assessment", color: "bg-amber-500 text-white" },
  submitted: { label: "Submitted", color: "bg-amber-500 text-white" },
  awaiting_iqa: { label: "Awaiting IQA Verification", color: "bg-blue-600 text-white" },
  resubmission: { label: "Resubmission Required", color: "bg-orange-500 text-white" },
  not_started: { label: "Not Started", color: "bg-muted text-muted-foreground" },
  in_progress: { label: "In Progress", color: "bg-primary text-white" },
};

/* ── Main Unit Detail Page ── */
const UnitDetail = () => {
  const { qualificationId, unitId } = useParams<{ qualificationId: string; unitId: string }>();
  const [activeAssignment, setActiveAssignment] = useState<string | null>(null);
  const [showStrictQuiz, setShowStrictQuiz] = useState(false);
  const [submittedAssignments, setSubmittedAssignments] = useState<Set<string>>(new Set());
  const [unitSubmitted, setUnitSubmitted] = useState(false);
  const { toast } = useToast();

  const { data: enrolmentResponse, isLoading, error } = useGetEnrolmentContentQuery(qualificationId || "");
  const enrolment = enrolmentResponse?.data;
  const qualification = enrolment?.qualification;
  const unit = enrolment?.units.find((u) => u.id === unitId);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
        <Loader2 className="w-8 h-8 animate-spin" />
        <p className="text-sm">Loading unit details...</p>
      </div>
    );
  }

  if (error || !enrolment || !qualification || !unit) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Unit not found.</p>
        <Link to="/learner/dashboard" className="text-primary hover:underline mt-2 inline-block">Back to Dashboard</Link>
      </div>
    );
  }

  const status = unit.progress?.status || "not_started";
  const cfg = statusConfig[status as UnitData["status"]] || statusConfig.not_started;
  const isExpired = enrolment.access_expired;
  const evidenceUploaded = unit.progress?.evidence_met || false;
  const alreadySubmitted = status === "awaiting_assessment" || status === "competent" || status === "awaiting_iqa" || unitSubmitted;
  const readyForAssessment = !alreadySubmitted && evidenceUploaded;

  return (
    <div>
      {showStrictQuiz && unitId && (
        <StrictQuizModal
          qualificationId={qualificationId || ""}
          unitCode={unit.unit_code}
          unitName={unit.title}
          onClose={() => setShowStrictQuiz(false)}
          onSubmitted={() => {
            setSubmittedAssignments((prev) => new Set(prev).add("quiz"));
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
              <h1 className="text-xl font-bold text-foreground">{unit.unit_code}: {unit.title}</h1>
              <span className={`text-xs font-bold px-2.5 py-1 rounded flex-shrink-0 ${cfg.color}`}>{cfg.label}</span>
            </div>
            <p className="text-sm text-muted-foreground mb-5">{qualification.title}</p>

            <h3 className="text-base font-bold text-primary mb-2">Unit Overview</h3>
            <p className="text-sm text-muted-foreground mb-4">{unit.description}</p>

            <h3 className="text-base font-bold text-primary mb-2">Assessment Requirements</h3>
            <p className="text-sm text-muted-foreground mb-2">Evidence must demonstrate that you meet all unit criteria.</p>
          </div>

          {/* Assignments Section — Only show if NOT CPD */}
          {!qualification.is_cpd && (unit.has_quiz || unit.has_written_assignment) && (
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-base font-bold text-primary mb-1">Assignments</h3>
              <p className="text-sm text-muted-foreground mb-5">Complete the following assignments for this unit</p>

              <div className="space-y-3">
                {unit.has_quiz && (
                  <div className="border border-border rounded-xl overflow-hidden">
                    <button
                      onClick={() => setActiveAssignment(activeAssignment === "quiz" ? null : "quiz")}
                      className="w-full flex items-center gap-3 p-4 text-left hover:bg-muted/30 transition-colors"
                    >
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <ClipboardList className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm text-foreground">Unit Quiz</p>
                        <p className="text-xs text-muted-foreground">Knowledge Assessment</p>
                      </div>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded ${
                        unit.progress?.quiz_passed || submittedAssignments.has("quiz")
                          ? "bg-green-600 text-white"
                          : "bg-muted text-muted-foreground"
                      }`}>
                        {unit.progress?.quiz_passed ? "Passed" : submittedAssignments.has("quiz") ? "Submitted" : "Not Started"}
                      </span>
                    </button>
                    {activeAssignment === "quiz" && (
                      <div className="p-5 pt-0 border-t border-border">
                        <p className="text-sm text-muted-foreground mb-5 pt-4">Complete this quiz to demonstrate your theoretical understanding. You must score 80% or above to pass.</p>
                        {!(unit.progress?.quiz_passed || submittedAssignments.has("quiz")) ? (
                          <Button onClick={() => setShowStrictQuiz(true)} className="gap-2">
                            <ClipboardList className="w-4 h-4" /> Launch Quiz
                          </Button>
                        ) : (
                          <div className="flex items-center gap-2 text-green-600 font-semibold text-sm">
                            <CheckCircle2 className="w-5 h-5" /> Quiz completed successfully
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Downloadable Resources */}
          {unit.resources && unit.resources.length > 0 && (
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-base font-bold text-primary mb-1">Downloadable Resources</h3>
              <p className="text-sm text-muted-foreground mb-5">Access unit specifications, templates, and guidance materials</p>
              <div className="space-y-3">
                {unit.resources.map((r: any, i: number) => (
                  <div key={i} className="flex items-center gap-3 p-3 border border-border rounded-lg">
                    <FileText className="w-5 h-5 text-primary flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-primary">{r.title}</p>
                      <p className="text-xs text-muted-foreground">{r.resource_type} {r.estimated_minutes ? `• ${r.estimated_minutes} mins` : ""}</p>
                    </div>
                    {r.is_downloadable && r.file && (
                      <Button variant="ghost" size="sm" className="gap-1.5" asChild>
                        <a href={r.file}>
                          <Download className="w-4 h-4" /> Download
                        </a>
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CPD Final Assessment Note */}
          {qualification.is_cpd && (
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 mb-6 flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-primary mb-1">CPD Qualification</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  This is a CPD-enabled qualification. Unit-level assessments and portfolio evidence are not required. 
                  Please complete the learning resources for each unit, followed by the <strong>Final Assessment</strong> 
                  available on the qualification overview page.
                </p>
              </div>
            </div>
          )}

          {/* Evidence Upload Form — Only show if NOT CPD */}
          {!isExpired && !qualification.is_cpd && (
            <EvidenceUploadForm
              requirements={["Standard unit criteria implementation evidence"]}
              enrolmentId={enrolment.id}
              unitId={unit.id}
              onSuccess={() => {
                setUnitSubmitted(true);
                toast({ title: "Evidence submitted successfully" });
              }}
            />
          )}
        </div>

        {/* ── RIGHT SIDEBAR ── */}
        <div className="space-y-6">
          {/* Submit for Assessment — Only show if NOT CPD */}
          {!qualification.is_cpd && (
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
              </div>
              <hr className="border-border mb-4" />
              <p className="text-xs text-muted-foreground mb-4">
                Once submitted, your evidence will be reviewed by an assessor. You will receive feedback and an outcome notification.
              </p>
              <Button
                className="w-full"
                disabled={!evidenceUploaded || alreadySubmitted || isExpired}
                onClick={() => {
                  setUnitSubmitted(true);
                  toast({ title: "Submitted for Assessment", description: "Your work has been submitted. You will be notified when assessed." });
                }}
              >
                {alreadySubmitted ? "Submitted — Awaiting Assessment" : "Submit for Assessment"}
              </Button>
            </div>
          )}

          {/* Unit Information */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-base font-bold text-primary mb-4">Unit Information</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Unit Code</p>
                <p className="text-sm font-semibold text-primary">{unit.unit_code}</p>
              </div>
              <hr className="border-border" />
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="text-sm font-semibold text-primary capitalize">{status.replace("_", " ")}</p>
              </div>
            </div>
          </div>

          {/* Assessor Feedback */}
          {unit.feedback && (
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-base font-bold text-primary mb-3">Assessor Feedback</h3>
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground">{unit.feedback}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UnitDetail;
