import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2, Clock, AlertTriangle, Circle, ShieldCheck, Loader2, FileCheck, ClipboardList, Lock, CalendarPlus, User, Mail, MapPin, Calendar } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import CPDFinalAssessmentModal from "@/components/learner/CPDFinalAssessmentModal";
import LearnerDeclarationModal from "@/components/learner/LearnerDeclarationModal";
import CourseEvaluationModal from "@/components/learner/CourseEvaluationModal";
import ExtensionRequestModal from "@/components/learner/ExtensionRequestModal";
import { CertificateDownloadButton } from "@/components/learner/CertificateDownloadButton";
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

  if (statusKey === "resubmit" || statusKey === "not_competent") {
    return display;
  }

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
    return display;
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
  const isAccess = units?.some((unit) => unit.is_mandatory === true);
  // True when every mandatory unit has been marked competent
  const allMandatoryCompetent =
    units
      .filter((u) => u.is_mandatory === true)
      .every((u) => u.progress?.competency_status === "competent");
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
  const isSession = qualification.is_session === true;
  const session = enrolment.session || null;
  const isExpired = enrolment.access_expired;
  const canExtend = isExpired && enrolment.status !== "completed";
  const requiresDeclaration = qualification.requires_learner_declaration === true;
  const requiresEvaluation = qualification.requires_course_evaluation === true;

  const isStaffMissing = !enrolment.trainer || !enrolment.iqa;
  const isLocked = isExpired || isStaffMissing;

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

        {!isSession && (
          <>
            {qualification.instructions && (
              <div className="mb-6 p-5 rounded-xl bg-primary/5 border border-primary/10">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-4 w-1 bg-primary rounded-full" />
                  <h4 className="text-[10px] font-bold text-primary uppercase tracking-widest">
                    Qualification Instructions
                  </h4>
                </div>
                <div 
                  className="prose prose-sm max-w-none text-muted-foreground"
                  dangerouslySetInnerHTML={{ __html: qualification.instructions }}
                />
              </div>
            )}


            <div className="mt-6 pt-6 border-t border-border grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
                  <User className="w-3 h-3 text-primary" /> Assigned Trainer
                </h4>
                {enrolment.trainer ? (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/5 border border-primary/10 flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground leading-none mb-1">{enrolment.trainer.name}</p>
                      <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                        <Mail className="w-3 h-3" /> {enrolment.trainer.email}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 text-muted-foreground/60">
                    <div className="w-10 h-10 rounded-full bg-muted/30 border border-border/50 flex items-center justify-center">
                      <User className="w-5 h-5" />
                    </div>
                    <p className="text-xs italic">Awaiting Assignment</p>
                  </div>
                )}
              </div>
              <div>
                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
                  <ShieldCheck className="w-3 h-3 text-blue-500" /> Internal Quality Assurer (IQA)
                </h4>
                {enrolment.iqa ? (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground leading-none mb-1">{enrolment.iqa.name}</p>
                      <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                        <Mail className="w-3 h-3" /> {enrolment.iqa.email}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 text-muted-foreground/60">
                    <div className="w-10 h-10 rounded-full bg-muted/30 border border-border/50 flex items-center justify-center">
                      <User className="w-5 h-5" />
                    </div>
                    <p className="text-xs italic">Awaiting Assignment</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {!isSession && isStaffMissing && !isExpired && (
        <div className="mb-8 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 border border-amber-500/20">
              <Lock className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground leading-none mb-2">Staff Assignment Pending</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Your qualification access is currently restricted because a Trainer or IQA has not yet been assigned to your enrolment.
                Unit actions will be automatically unlocked once both staff members are assigned.
              </p>
            </div>
          </div>
        </div>
      )}

      {!isSession && isExpired && !allMandatoryCompetent && (
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
            {canExtend && (
              <Button className="gap-2 self-start md:self-auto" onClick={() => setShowExtension(true)}>
                <CalendarPlus className="h-4 w-4" />
                Extend Access
              </Button>
            )}
          </div>
        </div>
      )}

      {/* ── Session info card (only for session-based qualifications) ── */}
      {isSession && (
        <div className="bg-card border border-border rounded-xl p-6 mb-8 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-primary/5 border border-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Calendar className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">Purchase Date</p>
                <p className="font-medium text-foreground">
                  {enrolment.enrolled_at
                    ? new Date(enrolment.enrolled_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
                    : "—"}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-primary/5 border border-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <MapPin className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">Location</p>
                <p className="font-medium text-foreground capitalize">
                  {session?.location ?? "—"}
                </p>
              </div>
            </div>
          </div>
          {qualification.instructions && (
            <div className="mt-6 p-5 rounded-xl bg-primary/5 border border-primary/10">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-4 w-1 bg-primary rounded-full" />
                <h4 className="text-[10px] font-bold text-primary uppercase tracking-widest">
                  Qualification Instructions
                </h4>
              </div>
              <div 
                className="prose prose-sm max-w-none text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: qualification.instructions }}
              />
            </div>
          )}
        </div>
      )}

      {/* ── Non-session content (units, declaration, evaluation) ── */}
      {!isSession && (
        <>
          <h2 className="text-xl font-bold text-primary mb-1">Qualification Units</h2>
          <p className="text-sm text-muted-foreground mb-6">Select a unit to access learning resources {!qualification.is_cpd && "and submit assessment evidence"}</p>

      {qualification.is_cpd && (
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-bold text-primary mb-1">Final Assessment</h3>
              <p className="text-sm text-muted-foreground mb-4">
                This CPD qualification requires every unit to be completed before the final assessment.
              </p>
              <Button size="sm" className="gap-2" disabled={!allUnitsDone || isLocked} onClick={() => setShowAssessment(true)}>
                <ShieldCheck className="w-4 h-4" />
                {allUnitsDone ? "Start Final Assessment" : "Complete All Units First"}
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
          enrolmentId={enrolment?.id || ""}
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
            {isLocked && !allMandatoryCompetent  ? (
              <Button size="sm" variant="outline" className="flex-shrink-0 gap-2" onClick={() => isExpired ? setShowExtension(true) : null}>
                <Lock className="h-4 w-4" />
                {isExpired ? "Access Locked" : "Staff Pending"}
              </Button>
            ) : (
              <Button asChild variant="outline" size="sm" className="flex-shrink-0">
                <Link to={`/learner/qualification/${id}/declaration`}>
                  View Declaration
                </Link>
              </Button>
            )}
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
                  <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${statusKey === "competent" || statusKey === "completed"
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
                      )}<span className={`text-xs font-bold px-2.5 py-0.5 rounded ${unit?.is_mandatory ? "bg-red-600 text-white" : "bg-muted text-muted-foreground"}`}>
                          {unit.is_mandatory ? "Mandatory" : "Optional"}
                      </span>
                    </div>
                     
                    
                    {unit.progress?.completed_at && (
                      <p className="text-xs text-muted-foreground">
                        {qualification.is_cpd ? "Completed" : "Assessed"}: {new Date(unit.progress.completed_at).toLocaleDateString()}
                      </p>
                    )}
                    {qualification.is_cpd && (
                      <p className="text-xs text-muted-foreground">
                        Required time: {unit.cpd_estimated_minutes || 0} minutes
                      </p>
                    )}
                  </div>
                </div>
                {isExpired && !allMandatoryCompetent ? (
                  <Button size="sm" variant="outline" className="flex-shrink-0 gap-2" onClick={() => setShowExtension(true)}>
                    <Lock className="h-4 w-4" />
                    Access Locked
                  </Button>
                ) : isLocked && !allMandatoryCompetent ? (
                  <Button size="sm" variant="outline" className="flex-shrink-0 gap-2">
                    <Lock className="h-4 w-4" />
                    Staff Pending
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

        {requiresEvaluation  ? (
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
            {isExpired && !allMandatoryCompetent ? (
              <Button size="sm" variant="outline" className="flex-shrink-0 gap-2" onClick={() => setShowExtension(true)}>
                <Lock className="h-4 w-4" />
                Access Locked
              </Button>
            ) : !allMandatoryCompetent ? (
              <Button size="sm" variant="outline" className="flex-shrink-0 gap-2" disabled>
                <Lock className="h-4 w-4" />
                Complete Mandatory Units First
              </Button>
            ) : (
              <Button asChild variant="outline" size="sm" className="flex-shrink-0">
                <Link to={`/learner/qualification/${id}/evaluation`}>
                  View Evaluation
                </Link>
              </Button>
            )}
          </div> 
        ) : null}
      </div>

      {isCpd && id && (
        <div className="mt-4">
          <CertificateDownloadButton enrolmentId={id} />
        </div>
      )}
        </>
      )}


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
