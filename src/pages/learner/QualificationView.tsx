import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2, Clock, AlertTriangle, Circle, ShieldCheck, Loader2, FileCheck, ClipboardList, Lock, CalendarPlus } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import CPDFinalAssessmentModal from "@/components/learner/CPDFinalAssessmentModal";
import LearnerDeclarationModal from "@/components/learner/LearnerDeclarationModal";
import CourseEvaluationModal from "@/components/learner/CourseEvaluationModal";
import ExtensionRequestModal from "@/components/learner/ExtensionRequestModal";
import { useGetEnrolmentOverviewQuery } from "@/redux/apis/enrolmentApi";
import type { EnrolmentOverviewUnit } from "@/types/enrollment.types";
import { getLifecycleLabel } from "@/lib/iqaStatus";

const statusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  competent: { label: "Competent", color: "bg-green-600 text-white", icon: CheckCircle2 },
  completed: { label: "Competent", color: "bg-green-600 text-white", icon: CheckCircle2 },
  pending: { label: "Awaiting Assessment", color: "bg-amber-500 text-white", icon: Clock },
  trainer_approved: { label: "Completed", color: "bg-green-600 text-white", icon: CheckCircle2 },
  iqa_review: { label: "Awaiting IQA", color: "bg-blue-600 text-white", icon: ShieldCheck },
  resubmit: { label: "Resubmission Required", color: "bg-orange-500 text-white", icon: AlertTriangle },
  not_competent: { label: "Not Yet Competent", color: "bg-orange-500 text-white", icon: AlertTriangle },
  in_progress: { label: "In Progress", color: "bg-primary text-white", icon: Clock },
  not_started: { label: "Not Started", color: "bg-muted text-muted-foreground", icon: Circle },
};

const normalizeStatusKey = (value?: string | null): string => {
  if (!value) return "not_started";
  const normalized = value.trim().toLowerCase().replace(/\s+/g, "_");

  const aliases: Record<string, string> = {
    awaiting_assessment: "pending",
    waiting_for_assessor_review: "pending",
    waiting_for_trainer_review: "pending",
    trainer_approved: "trainer_approved",
    awaiting_for_iqa_assessment: "iqa_review",
    waiting_for_iqa_review: "iqa_review",
    awaiting_iqa_review: "iqa_review",
    awaiting_iqa_assessment: "iqa_review",
    iqa_reviewed: "completed",
    iqa_approved: "completed",
    approved: "completed",
    competent: "competent",
    completed: "completed",
    resubmission_required: "resubmit",
    resubmit: "resubmit",
    not_yet_competent: "not_competent",
    not_competent: "not_competent",
    in_progress: "in_progress",
    not_started: "not_started",
    pending: "pending",
  };

  return aliases[normalized] || "not_started";
};

const getUnitStatusKey = (unit: EnrolmentOverviewUnit): string => {
  // API already provides learner-facing state via `display_status`.
  return normalizeStatusKey(unit.display_status || "not_started");
};

const getUnitDisplayStatus = (unit: EnrolmentOverviewUnit) => {
  const statusKey = getUnitStatusKey(unit);
  const display = statusConfig[statusKey] || statusConfig.not_started;
  const lifecycleLabel = getLifecycleLabel(unit.display_status || statusKey);

  if (lifecycleLabel === "Awaiting IQA") {
    return statusConfig.iqa_review;
  }
  if (lifecycleLabel === "Completed" || lifecycleLabel === "Signed Off") {
    return statusConfig.completed;
  }
  if (lifecycleLabel === "Awaiting Assessment") {
    return statusConfig.pending;
  }
  if (lifecycleLabel === "Action Required") {
    return {
      label: "Resubmission Required",
      color: "bg-orange-500 text-white",
      icon: AlertTriangle,
    };
  }

  return display;
};

const QualificationView = () => {
  const { id } = useParams<{ id: string }>();
  const [showAssessment, setShowAssessment] = useState(false);
  const [showDeclaration, setShowDeclaration] = useState(false);
  const [showEvaluation, setShowEvaluation] = useState(false);
  const [showExtension, setShowExtension] = useState(false);

  const { data: enrolmentResponse, isLoading, error, refetch } = useGetEnrolmentOverviewQuery(id || "", {
    skip: !id,
  });

  const enrolment = enrolmentResponse?.data;
  const qualification = enrolment?.qualification;
  const units = enrolment?.units || [];
  const progress = enrolment?.overall_progress;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
        <Loader2 className="w-8 h-8 animate-spin" />
        <p className="text-sm">Loading course content...</p>
      </div>
    );
  }

  if (error || !enrolment || !qualification || !progress) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Qualification not found.</p>
        <Link to="/learner/qualifications" className="text-primary hover:underline mt-2 inline-block">
          Back to My Qualifications
        </Link>
      </div>
    );
  }

  const completed = progress.completed_units;
  const total = progress.total_units;
  const pct = progress.progress_percent;
  const allUnitsDone = total > 0 && completed === total;
  const isCpd = qualification.is_cpd;
  const isExpired = enrolment.access_expired;
  const requiresDeclaration = qualification.requires_learner_declaration !== false;
  const requiresEvaluation = qualification.requires_course_evaluation !== false;

  return (
    <div>
      <Link to="/learner/qualifications" className="inline-flex items-center gap-2 text-primary hover:underline mb-6 text-sm font-medium">
        <ArrowLeft className="w-4 h-4" /> Back to My Qualifications
      </Link>

      <div className="bg-card border border-border rounded-xl p-6 mb-8 shadow-sm">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <h1 className="text-2xl font-bold text-foreground">{qualification.title}</h1>
          {isCpd && (
            <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] font-bold uppercase tracking-wider">
              CPD Enabled
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground mb-4">Qualification Code: {qualification.code}</p>

        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Overall Progress</span>
          <span className="text-sm font-semibold text-primary">
            {completed} of {total} Units Complete ({pct}%)
          </span>
        </div>
        <Progress value={pct} className="h-3" />
      </div>

      {isExpired && (
        <div className="mb-8 rounded-2xl border border-destructive/30 bg-destructive/5 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                <Lock className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">Access Expired</h2>
                <p className="text-sm text-muted-foreground">
                  Your qualification access has expired. Unit actions are locked until you extend access.
                </p>
              </div>
            </div>
            <Button className="gap-2 self-start md:self-auto" onClick={() => setShowExtension(true)}>
              <CalendarPlus className="h-4 w-4" />
              Extend Access
            </Button>
          </div>
        </div>
      )}

      <h2 className="text-xl font-bold text-primary mb-1">Qualification Units</h2>
      <p className="text-sm text-muted-foreground mb-6">Select a unit to access learning resources {!qualification.is_cpd && "and submit assessment evidence"}</p>

      {allUnitsDone && qualification.is_cpd && (
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-bold text-primary mb-1">Final Assessment</h3>
              <p className="text-sm text-muted-foreground mb-4">
                This CPD qualification requires a single final assessment.
              </p>
              <Button size="sm" className="gap-2" onClick={() => setShowAssessment(true)}>
                <ShieldCheck className="w-4 h-4" />
                Start Final Assessment
              </Button>
            </div>
          </div>
        </div>
      )}


      {showAssessment && (
        <CPDFinalAssessmentModal
          qualificationId={qualification.id}
          qualificationTitle={qualification.title}
          onClose={() => setShowAssessment(false)}
          onSubmitted={(result) => {
            if (result.passed) {
              setShowAssessment(false);
              if (requiresDeclaration) {
                setShowDeclaration(true);
              } else if (requiresEvaluation) {
                setShowEvaluation(true);
              }
            }
          }}
        />
      )}

      {showDeclaration && (
        <LearnerDeclarationModal
          enrolmentId={id || ""}
          isOpen={showDeclaration}
          onClose={() => setShowDeclaration(false)}
          onSuccess={() => {
            setShowDeclaration(false);
            refetch();
            if (requiresEvaluation) {
              setShowEvaluation(true);
            }
          }}
        />
      )}

      {showEvaluation && (
        <CourseEvaluationModal
          enrolmentId={id || ""}
          isOpen={showEvaluation}
          onClose={() => setShowEvaluation(false)}
          onSuccess={() => {
            setShowEvaluation(false);
            refetch();
          }}
        />
      )}

      <div className="space-y-4 mb-6">
        {requiresDeclaration && (
          <div className="bg-card border border-border rounded-xl p-4 flex items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center flex-shrink-0">
                <FileCheck className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  Learner Declaration
                  <span className="text-xs font-normal text-muted-foreground">— Required before qualification completion</span>
                </h3>
              </div>
            </div>
            <Button asChild variant="outline" size="sm" className="flex-shrink-0">
              <Link to={`/learner/qualification/${id}/declaration`}>
                View Declaration
              </Link>
            </Button>
          </div>
        )}

        {units.map((unit) => {
          const statusKey = getUnitStatusKey(unit);
          const cfg = getUnitDisplayStatus(unit);
          const Icon = cfg.icon;

          return (
            <div key={unit.id} className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                    statusKey === "competent" || statusKey === "completed"
                      ? "text-green-600"
                      : statusKey === "pending"
                      ? "text-amber-500"
                      : statusKey === "trainer_approved" || statusKey === "iqa_review"
                      ? "text-blue-600"
                      : statusKey === "resubmit" || statusKey === "not_competent"
                      ? "text-orange-500"
                      : statusKey === "in_progress"
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-semibold text-foreground">
                        {unit.unit_code}: {unit.title}
                      </span>
                      {!qualification.is_cpd && (
                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded ${cfg.color}`}>
                          {cfg.label}
                        </span>
                      )}
                    </div>
                    {unit.progress?.completed_at && (
                      <p className="text-xs text-muted-foreground">Assessed: {new Date(unit.progress.completed_at).toLocaleDateString()}</p>
                    )}
                  </div>
                </div>
                {isExpired ? (
                  <Button size="sm" variant="outline" className="flex-shrink-0 gap-2" onClick={() => setShowExtension(true)}>
                    <Lock className="h-4 w-4" />
                    Access Locked
                  </Button>
                ) : (
                  <Button asChild size="sm" className="flex-shrink-0">
                    <Link to={`/learner/qualification/${id}/unit/${unit.id}`}>
                      View Unit
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          );
        })}

        {requiresEvaluation && (
          <div className="bg-card border border-border rounded-xl p-4 flex items-center justify-between gap-4 shadow-sm mt-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center flex-shrink-0">
                <ClipboardList className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  Course Evaluation
                  <span className="text-xs font-normal text-muted-foreground">— Complete after finishing the qualification</span>
                </h3>
              </div>
            </div>
            <Button asChild variant="outline" size="sm" className="flex-shrink-0">
              <Link to={`/learner/qualification/${id}/evaluation`}>
                View Evaluation
              </Link>
            </Button>
          </div>
        )}
      </div>


      <ExtensionRequestModal
        open={showExtension}
        onOpenChange={setShowExtension}
        enrolmentId={id || ""}
        qualificationTitle={qualification.title}
        currentExpiry={enrolment.access_expires_at ? new Date(enrolment.access_expires_at).toLocaleDateString("en-GB") : ""}
      />
    </div>
  );
};

export default QualificationView;
