import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  CheckCircle2,
  Circle,
  ClipboardList,
  ShieldCheck,
  Loader2,
  Lock,
  CalendarPlus,
  FilePenLine,
  MessageSquare,
  Clock,
  AlertTriangle,
} from "lucide-react";
import ResourceSection from "@/components/shared/ResourceSection";
import { Button } from "@/components/ui/button";
import StrictQuizModal from "@/components/learner/StrictQuizModal";
import EvidenceUploadForm from "@/components/learner/EvidenceUploadForm";
import WrittenAssignmentForm from "@/components/learner/WrittenAssignmentForm";
import ExtensionRequestModal from "@/components/learner/ExtensionRequestModal";
import SubmissionHistory, { type SubmissionVersion } from "@/components/learner/SubmissionHistory";
import {
  useGetEnrolmentOverviewQuery,
  useGetLearnerEvidenceSubmissionsQuery,
  useGetLearnerUnitOverviewQuery,
  useGetLearnerWrittenAssignmentQuery,
  useMarkCpdUnitCompleteMutation,
} from "@/redux/apis/enrolmentApi";
import type {
  LearnerEvidenceSubmission,
  LearnerWrittenAssignmentSubmission,
} from "@/types/enrollment.types";
import { getLifecycleLabel } from "@/lib/iqaStatus";
import { useToast } from "@/hooks/use-toast";

type LearnerSubmission = LearnerEvidenceSubmission | LearnerWrittenAssignmentSubmission;

const statusConfig: Record<string, { label: string; color: string }> = {
  Competent: { label: "Competent", color: "bg-green-600 text-white" },
  Completed: { label: "Completed", color: "bg-green-600 text-white" },
  "Waiting for assessor review": { label: "Awaiting Assessment", color: "bg-amber-500 text-white" },
  Submitted: { label: "Submitted", color: "bg-amber-500 text-white" },
  "Waiting for IQA review": { label: "Awaiting IQA", color: "bg-blue-600 text-white" },
  "Resubmission required": { label: "Resubmission Required", color: "bg-orange-500 text-white" },
  "Not yet competent": { label: "Not Yet Competent", color: "bg-orange-500 text-white" },
  "Not started": { label: "Not Started", color: "bg-muted text-muted-foreground" },
  "In progress": { label: "In Progress", color: "bg-primary text-white" },
};

const lifecycleStatusConfig: Record<string, { label: string; color: string }> = {
  "Not Started": statusConfig["Not started"],
  "In Progress": statusConfig["In progress"],
  Submitted: statusConfig.Submitted,
  "Awaiting Assessment": statusConfig["Waiting for assessor review"],
  "Awaiting IQA": statusConfig["Waiting for IQA review"],
  "Action Required": statusConfig["Resubmission required"],
  "Signed Off": { label: "Signed Off", color: "bg-green-600 text-white" },
  Completed: statusConfig.Completed,
};

const getSubmissionActionState = (submission?: LearnerSubmission) => {
  if (!submission) return null;

  if (submission.iqa_decision === "changes_required") {
    return {
      label: "IQA Changes Required",
      color: "bg-orange-500 text-white",
      message:
        submission.ui_flags?.resubmission_message ||
        submission.iqa_review_notes ||
        "IQA requested changes. Update the work and submit again.",
    };
  }

  if (submission.iqa_decision === "referred_back") {
    return {
      label: "IQA Referred Back",
      color: "bg-orange-500 text-white",
      message:
        submission.ui_flags?.resubmission_message ||
        submission.iqa_review_notes ||
        "IQA referred this back. Improve the work and submit again.",
    };
  }

  if (submission.status === "resubmit") {
    return {
      label: "Resubmission Required",
      color: "bg-orange-500 text-white",
      message:
        submission.ui_flags?.resubmission_message ||
        submission.assessor_feedback ||
        "Your trainer requested changes before this unit can be signed off.",
    };
  }

  if (submission.status === "not_competent") {
    return {
      label: "Not Yet Competent",
      color: "bg-orange-500 text-white",
      message:
        submission.ui_flags?.resubmission_message ||
        submission.assessor_feedback ||
        "This submission is not yet competent. Improve the work and submit again.",
    };
  }

  return null;
};

const canCreateResubmission = (submission?: LearnerSubmission) =>
  Boolean(
    submission &&
      submission.ui_flags?.resubmission_required &&
      submission.ui_flags?.is_latest_submission &&
      submission.ui_flags?.can_create_resubmission
  );

const getUnitStatusPresentation = (
  displayStatus?: string | null,
  latestSubmission?: LearnerSubmission,
) => {
  const submissionAction = getSubmissionActionState(latestSubmission);
  if (submissionAction) {
    return submissionAction;
  }

  const normalizedDisplay = (displayStatus || "").trim();
  if (statusConfig[normalizedDisplay]) {
    return statusConfig[normalizedDisplay];
  }

  const lifecycleLabel = getLifecycleLabel(normalizedDisplay);
  return lifecycleStatusConfig[lifecycleLabel] || statusConfig["Not started"];
};

const mapSubmissionStatus = (status?: string): SubmissionVersion["status"] => {
  switch (status) {
    case "competent":
      return "competent";
    case "under_review":
      return "under_review";
    case "resubmit":
      return "resubmission_required";
    case "not_competent":
      return "not_yet_competent";
    case "submitted":
    case "pending":
    default:
      return "submitted";
  }
};

const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString("en-GB") : "Not yet available";

const stripHtml = (value?: string | null) =>
  (value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const getDateValue = (value?: string | null) => (value ? new Date(value).getTime() : 0);

const fileNameFromUrl = (value?: string | null, fallback?: string) => {
  if (!value) return fallback || "Attachment";
  const cleaned = value.split("?")[0];
  const name = cleaned.split("/").pop();
  return name || fallback || "Attachment";
};

const normalizeCriteriaList = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  if (value && typeof value === "object") {
    return Object.values(value as Record<string, unknown>)
      .map((item) => String(item).trim())
      .filter(Boolean);
  }
  return [];
};

const buildEvidenceHistory = (submissions: LearnerEvidenceSubmission[]): SubmissionVersion[] =>
  [...submissions]
    .sort((a, b) => getDateValue(b.submitted_at) - getDateValue(a.submitted_at))
    .map((submission) => ({
      id: submission.id,
      version: submission.submission_number,
      evidenceRef: `EV-${String(submission.submission_number).padStart(3, "0")}`,
      files: submission.evidence_items.map((item) => ({
        name: item.title || fileNameFromUrl(item.file, "Evidence file"),
        size: "",
        url: item.file,
      })),
      description:
        submission.evidence_items
          .map((item) => item.description)
          .filter(Boolean)
          .join(" ") || submission.title || "Evidence submission",
      linkedCriteria: Array.from(
        new Set(
          submission.evidence_items.flatMap((item) => item.criteria.map((criterion) => criterion.code))
        )
      ),
      submittedDate: formatDate(submission.submitted_at),
      status: mapSubmissionStatus(submission.status),
      feedback: submission.assessor_feedback || undefined,
      assessedDate: submission.outcome_set_at ? formatDate(submission.outcome_set_at) : undefined,
      assessorName: submission.assessor?.name || undefined,
      iqaVerified: submission.iqa_decision === "approved",
      iqaDate: submission.iqa_reviewed_at ? formatDate(submission.iqa_reviewed_at) : undefined,
    }));

const buildWrittenHistory = (submissions: LearnerWrittenAssignmentSubmission[]): SubmissionVersion[] =>
  [...submissions]
    .sort((a, b) => getDateValue(b.submitted_at) - getDateValue(a.submitted_at))
    .map((submission) => ({
      id: submission.id,
      version: submission.submission_number,
      evidenceRef: `WA-${String(submission.submission_number).padStart(3, "0")}`,
      files: [],
      description: stripHtml(submission.response_html) || submission.title || "Written assignment submission",
      linkedCriteria: [],
      submittedDate: formatDate(submission.submitted_at),
      status: mapSubmissionStatus(submission.status),
      feedback: submission.assessor_feedback || undefined,
      assessedDate: submission.outcome_set_at ? formatDate(submission.outcome_set_at) : undefined,
      assessorName: submission.assessor?.name || undefined,
      iqaVerified: submission.iqa_decision === "approved",
      iqaDate: submission.iqa_reviewed_at ? formatDate(submission.iqa_reviewed_at) : undefined,
    }));

const UnitDetail = () => {
  const { qualificationId, unitId } = useParams<{ qualificationId: string; unitId: string }>();
  const [activeAssignment, setActiveAssignment] = useState<string | null>(null);
  const [showStrictQuiz, setShowStrictQuiz] = useState(false);
  const [showExtension, setShowExtension] = useState(false);
  const { toast } = useToast();
  const [markCpdUnitComplete, { isLoading: isMarkingCpdComplete }] = useMarkCpdUnitCompleteMutation();

  const { data: enrolmentResponse, isLoading: isLoadingOverview, error: overviewError, refetch: refetchOverview } =
    useGetEnrolmentOverviewQuery(qualificationId || "", {
      skip: !qualificationId,
    });

  const { data: unitResponse, isLoading: isLoadingUnit, error: unitError, refetch: refetchUnit } =
    useGetLearnerUnitOverviewQuery(
      { enrolmentId: qualificationId || "", unitId: unitId || "" },
      { skip: !qualificationId || !unitId }
    );

  const enrolment = enrolmentResponse?.data;
  const qualification = enrolment?.qualification;
  const unit = unitResponse?.data;
  const resolvedEnrolmentId = enrolment?.id || qualificationId || "";
  const resolvedUnitId = unit?.id || unitId || "";

  const {
    data: evidenceResponse,
    isLoading: isLoadingEvidence,
    error: evidenceError,
    refetch: refetchEvidence,
  } = useGetLearnerEvidenceSubmissionsQuery(
    { enrolmentId: resolvedEnrolmentId, unitId: resolvedUnitId },
    {
      skip: !resolvedEnrolmentId || !resolvedUnitId || !unit?.requires_evidence,
    }
  );

  const {
    data: writtenResponse,
    isLoading: isLoadingWritten,
    refetch: refetchWritten,
  } = useGetLearnerWrittenAssignmentQuery(
    { enrolmentId: resolvedEnrolmentId, unitId: resolvedUnitId },
    {
      skip: !resolvedEnrolmentId || !resolvedUnitId || !unit?.written_assignment_summary?.enabled,
    }
  );

  if (isLoadingOverview || isLoadingUnit) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
        <Loader2 className="w-8 h-8 animate-spin" />
        <p className="text-sm">Loading unit details...</p>
      </div>
    );
  }

  if (overviewError || unitError || !enrolment || !qualification || !unit) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Unit not found.</p>
        <Link to="/learner/qualifications" className="text-primary hover:underline mt-2 inline-block">
          Back to My Qualifications
        </Link>
      </div>
    );
  }

  const isExpired = enrolment.access_expired;

  const evidenceSubmissions = evidenceResponse?.data?.submissions || [];
  const evidenceConfig = evidenceResponse?.data?.config;
  const writtenSubmissions = writtenResponse?.data?.submissions || [];
  const writtenConfig = writtenResponse?.data?.config;

  const evidenceHistory = buildEvidenceHistory(evidenceSubmissions);
  const writtenHistory = buildWrittenHistory(writtenSubmissions);

  const latestEvidenceSubmission = [...evidenceSubmissions].sort(
    (a, b) => getDateValue(b.submitted_at) - getDateValue(a.submitted_at)
  )[0];
  const latestWrittenSubmission = [...writtenSubmissions].sort(
    (a, b) => getDateValue(b.submitted_at) - getDateValue(a.submitted_at)
  )[0];

  const latestFeedbackSubmission = [...evidenceSubmissions, ...writtenSubmissions]
    .filter((submission) => submission.assessor_feedback)
    .sort(
      (a, b) =>
        getDateValue(b.outcome_set_at || b.submitted_at) - getDateValue(a.outcome_set_at || a.submitted_at)
    )[0];

  const evidenceUploaded = evidenceSubmissions.length > 0 || unit.evidence_portfolio_summary.submission_count > 0 || false;
  const writtenSubmitted = writtenSubmissions.length > 0 || unit.written_assignment_summary.submission_count > 0 || false;
  const latestAssessmentSubmission = [latestEvidenceSubmission, latestWrittenSubmission]
    .filter(Boolean)
    .sort(
      (a, b) =>
        getDateValue((b as LearnerEvidenceSubmission | LearnerWrittenAssignmentSubmission).submitted_at) -
        getDateValue((a as LearnerEvidenceSubmission | LearnerWrittenAssignmentSubmission).submitted_at)
    )[0] as LearnerEvidenceSubmission | LearnerWrittenAssignmentSubmission | undefined;
  const writtenActionState = getSubmissionActionState(latestWrittenSubmission);
  const evidenceActionState = getSubmissionActionState(latestEvidenceSubmission);
  const latestActionState = getSubmissionActionState(latestAssessmentSubmission);
  const canSubmitWrittenAssignment =
    !latestWrittenSubmission || canCreateResubmission(latestWrittenSubmission);
  const canSubmitEvidence =
    !latestEvidenceSubmission || canCreateResubmission(latestEvidenceSubmission);
  const status = getUnitStatusPresentation(unit.display_status, latestAssessmentSubmission);

  const evidenceRequirements = normalizeCriteriaList(evidenceConfig?.required_criteria);
  const evidenceRequirementList =
    evidenceRequirements.length > 0
      ? evidenceRequirements
      : ["Standard unit criteria implementation evidence"];
  const evidenceSetupMissing = Boolean(unit.requires_evidence && !isLoadingEvidence && (evidenceError || !evidenceConfig));
  const hasWrittenAssignmentEnabled = Boolean(unit.written_assignment_summary.enabled);
  const isCpdUnitComplete = qualification.is_cpd && unit.progress?.status === "completed";
  const cpdRequiredMinutes = unit.cpd_estimated_minutes || 0;
  const isQuizAwaitingTrainerReview =
    !unit.quiz_summary.passed &&
    unit.quiz_summary.attempts_used > 0 &&
    unit.quiz_summary.can_retake === false;

  return (
    <div>
      {showStrictQuiz && unitId && (
        <StrictQuizModal
          qualificationId={qualificationId || ""}
          unitId={unit.id}
          unitCode={unit.unit_code}
          unitName={unit.title}
          onClose={() => setShowStrictQuiz(false)}
          onSubmitted={() => {
            setShowStrictQuiz(false);
            void refetchOverview();
            void refetchUnit();
          }}
        />
      )}

      <Link
        to={`/learner/qualification/${qualificationId}`}
        className="inline-flex items-center gap-2 text-primary hover:underline mb-6 text-sm font-medium"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Qualification
      </Link>

      {isExpired && (
        <div className="mb-6 rounded-2xl border border-destructive/30 bg-destructive/5 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                <Lock className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">Access Expired</h2>
                <p className="text-sm text-muted-foreground">
                  This unit is now locked for quiz, assignment, evidence upload, and assessment submission until access is extended.
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-start justify-between gap-3 mb-1">
              <h1 className="text-xl font-bold text-foreground">
                {unit.unit_code}: {unit.title}
              </h1>
              <span className={`text-xs font-bold px-2.5 py-1 rounded flex-shrink-0 ${status.color}`}>{status.label}</span>
            </div>
            <p className="text-sm text-muted-foreground mb-5">{qualification.title}</p>

            <h3 className="text-base font-bold text-primary mb-2">Unit Overview</h3>
            <p className="text-sm text-muted-foreground mb-4">{unit.description}</p>

            <h3 className="text-base font-bold text-primary mb-2">Assessment Requirements</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Evidence must demonstrate that you meet all unit criteria.
            </p>
          </div>

          {latestActionState && !qualification.is_cpd && (
            <div className="rounded-2xl border border-orange-500/25 bg-orange-500/5 p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500/10">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-foreground">{latestActionState.label}</p>
                  <p className="text-sm text-muted-foreground">{latestActionState.message}</p>
                </div>
              </div>
            </div>
          )}
          <ResourceSection resources={unit.resources} />
          {!qualification.is_cpd && (unit.has_quiz || hasWrittenAssignmentEnabled) && (
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-base font-bold text-primary mb-1">Assignments</h3>
              <p className="text-sm text-muted-foreground mb-5">
                Complete the following assignments for this unit.
              </p>

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
                      <span className={`text-xs font-bold px-2.5 py-1 rounded ${unit.quiz_summary.passed ? "bg-green-600 text-white" : "bg-muted text-muted-foreground"}`}>
                        {unit.quiz_summary.passed ? "Passed" : unit.quiz_summary.attempts_used > 0 ? "Attempted" : "Not Started"}
                      </span>
                    </button>
                    {activeAssignment === "quiz" && (
                      <div className="p-5 pt-0 border-t border-border">
                        <p className="text-sm text-muted-foreground mb-5 pt-4">
                          Complete this quiz to demonstrate your theoretical understanding. You must score {unit.quiz_summary.pass_mark || 80}% or above to pass.
                        </p>
                        {unit.quiz_summary.score_summary_text && (
                          <div className="mb-4 rounded-lg border border-border bg-muted/30 p-4 text-sm text-foreground">
                            Latest result: <strong>{unit.quiz_summary.score_summary_text}</strong>
                          </div>
                        )}
                        {isQuizAwaitingTrainerReview && (
                          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                            Maximum attempts reached. Your final attempt has been submitted to your trainer for review.
                          </div>
                        )}
                        {!unit.quiz_summary.passed ? (
                          isExpired ? (
                            <Button variant="outline" className="gap-2" onClick={() => setShowExtension(true)}>
                              <Lock className="w-4 h-4" /> Access Locked
                            </Button>
                          ) : isQuizAwaitingTrainerReview ? (
                            <Button variant="outline" className="gap-2" disabled>
                              <Clock className="w-4 h-4" /> Await Trainer Review
                            </Button>
                          ) : (
                            <Button onClick={() => setShowStrictQuiz(true)} className="gap-2">
                              <ClipboardList className="w-4 h-4" /> Launch Quiz
                            </Button>
                          )
                        ) : (
                          <div className="flex items-center gap-2 text-green-600 font-semibold text-sm">
                            <CheckCircle2 className="w-5 h-5" /> Quiz completed successfully
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {hasWrittenAssignmentEnabled && (
                  <div className="border border-border rounded-xl overflow-hidden">
                    <button
                      onClick={() => setActiveAssignment(activeAssignment === "written" ? null : "written")}
                      className="w-full flex items-center gap-3 p-4 text-left hover:bg-muted/30 transition-colors"
                    >
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <FilePenLine className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm text-foreground">
                          {writtenConfig?.title || unit.written_assignment_summary.title || "Written Assignment"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {writtenSubmitted
                            ? `Submitted ${writtenSubmissions.length || unit.written_assignment_summary.submission_count} time${(writtenSubmissions.length || unit.written_assignment_summary.submission_count) === 1 ? "" : "s"}`
                            : "No submission yet"}
                        </p>
                      </div>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded ${latestWrittenSubmission
                        ? (writtenActionState?.color ||
                          (latestWrittenSubmission.status === "competent"
                            ? statusConfig["Competent"].color
                            : latestWrittenSubmission.status === "under_review"
                              ? statusConfig["Waiting for assessor review"].color
                              : statusConfig.Submitted.color))
                        : "bg-muted text-muted-foreground"
                        }`}>
                        {latestWrittenSubmission
                          ? (writtenActionState?.label ||
                            (latestWrittenSubmission.status === "competent"
                              ? statusConfig["Competent"].label
                              : latestWrittenSubmission.status === "under_review"
                                ? statusConfig["Waiting for assessor review"].label
                                : statusConfig.Submitted.label))
                          : "Not Started"}
                      </span>
                    </button>
                    {activeAssignment === "written" && (
                      <div className="p-5 pt-0 border-t border-border space-y-4">
                        {isLoadingWritten ? (
                          <div className="flex items-center gap-2 pt-4 text-sm text-muted-foreground">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Loading written assignment details...
                          </div>
                        ) : (
                          <>
                            <div className="pt-4">
                              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                {stripHtml(writtenConfig?.instructions) || "Written assignment instructions will appear here."}
                              </p>
                            </div>
                            {((writtenConfig?.min_words || writtenConfig?.max_words) || (unit.written_assignment_summary.min_words || unit.written_assignment_summary.max_words)) && (
                              <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
                                Word count
                                {(writtenConfig?.min_words || unit.written_assignment_summary.min_words) ? `: minimum ${writtenConfig?.min_words || unit.written_assignment_summary.min_words}` : ""}
                                {(writtenConfig?.min_words || unit.written_assignment_summary.min_words) && (writtenConfig?.max_words || unit.written_assignment_summary.max_words) ? " • " : ""}
                                {(writtenConfig?.max_words || unit.written_assignment_summary.max_words) ? `maximum ${writtenConfig?.max_words || unit.written_assignment_summary.max_words}` : ""}
                              </div>
                            )}
                            {latestWrittenSubmission ? (
                              <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2">
                                <p className="text-sm font-semibold text-foreground">
                                  Latest submission on {formatDate(latestWrittenSubmission.submitted_at)}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Word count: {latestWrittenSubmission.response_word_count}
                                </p>
                                {latestWrittenSubmission.assessor_feedback && (
                                  <p className="text-sm text-muted-foreground">
                                    Trainer feedback is available below in the submission history.
                                  </p>
                                )}
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground">
                                No written assignment has been submitted for this unit yet.
                              </p>
                            )}
                            {writtenActionState && (
                              <div className="rounded-lg border border-orange-500/20 bg-orange-500/5 p-4 text-sm text-muted-foreground">
                                {writtenActionState.message}
                              </div>
                            )}
                            {canSubmitWrittenAssignment && (
                                <WrittenAssignmentForm
                                  enrolmentId={resolvedEnrolmentId}
                                  unitId={resolvedUnitId}
                                  title={writtenConfig?.title || unit.written_assignment_summary.title}
                                  minWords={writtenConfig?.min_words || unit.written_assignment_summary.min_words}
                                  maxWords={writtenConfig?.max_words || unit.written_assignment_summary.max_words}
                                  isLocked={isExpired}
                                  mode={latestWrittenSubmission ? "resubmission" : "initial"}
                                  onSuccess={() => {
                                    void refetchOverview();
                                    void refetchUnit();
                                    void refetchWritten();
                                  }}
                                />
                              )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}



          {qualification.is_cpd && (
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 mb-6 flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-primary mb-1">CPD Qualification</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  This is a CPD-enabled qualification. Unit-level assessments and portfolio evidence are not required.
                  Complete the learning resources, confirm this unit, then take the <strong>Final Assessment</strong>
                  after every unit is complete.
                </p>
                <div className="mt-4 rounded-lg border border-primary/20 bg-background/70 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-foreground">Required learning time</p>
                      <p className="text-sm text-muted-foreground">{cpdRequiredMinutes} minutes</p>
                    </div>
                    {isCpdUnitComplete ? (
                      <div className="inline-flex items-center gap-2 text-sm font-semibold text-green-600">
                        <CheckCircle2 className="h-4 w-4" />
                        Unit Completed
                      </div>
                    ) : (
                      <Button
                        className="gap-2"
                        disabled={isExpired || isMarkingCpdComplete}
                        onClick={async () => {
                          if (!resolvedEnrolmentId || !resolvedUnitId) return;
                          try {
                            await markCpdUnitComplete({
                              enrolmentId: resolvedEnrolmentId,
                              unitId: resolvedUnitId,
                            }).unwrap();
                            toast({ title: "Unit completed", description: "Your CPD unit progress has been updated." });
                            void refetchOverview();
                            void refetchUnit();
                          } catch {
                            toast({
                              title: "Could not complete unit",
                              description: "Please try again or contact support if the problem continues.",
                              variant: "destructive",
                            });
                          }
                        }}
                      >
                        {isMarkingCpdComplete ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4" />
                        )}
                        Mark Unit Complete
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {canSubmitEvidence && !isExpired && !qualification.is_cpd && unit.requires_evidence && !evidenceSetupMissing && (
            <EvidenceUploadForm
              requirements={evidenceRequirementList}
              enrolmentId={resolvedEnrolmentId}
              unitId={resolvedUnitId}
              mode={latestEvidenceSubmission ? "resubmission" : "initial"}
              onSuccess={() => {
                void refetchOverview();
                void refetchUnit();
                void refetchEvidence();
              }}
            />
          )}



          {isExpired && !qualification.is_cpd && (
            <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                <Lock className="h-5 w-5 text-destructive" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Assessment Actions Locked</h3>
              <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
                Your qualification access has expired. Please extend access to continue uploading evidence or completing assessment steps for this unit.
              </p>
              <Button className="mt-4 gap-2" onClick={() => setShowExtension(true)}>
                <CalendarPlus className="h-4 w-4" />
                Extend Access
              </Button>
            </div>
          )}

          {writtenHistory.length > 0 && (
            <SubmissionHistory
              submissions={writtenHistory}
              unitTitle={unit.title}
              title="Written Assignment History"
              subtitle="Review your written assignment submissions, outcomes, and trainer feedback."
            />
          )}

          {evidenceHistory.length > 0 && (
            <SubmissionHistory
              submissions={evidenceHistory}
              unitTitle={unit.title}
              title="Evidence Submission History"
              subtitle="Review your uploaded evidence, assessment outcomes, and trainer feedback."
            />
          )}

          {evidenceActionState && !canSubmitEvidence && (
            <div className="rounded-lg border border-orange-500/20 bg-orange-500/5 p-4 text-sm text-muted-foreground">
              {evidenceActionState.message}
            </div>
          )}
        </div>

        <div className="space-y-6">
          {!qualification.is_cpd && (
            <div className="bg-card border-2 border-secondary rounded-xl p-6">
              <h3 className="text-base font-bold text-primary mb-4">Assessment Status</h3>
              <div className="space-y-2.5 mb-4">
                {unit.has_quiz && (
                  <div className="flex items-center gap-2">
                    {unit.quiz_summary.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    ) : (
                      <Circle className="w-4 h-4 text-muted-foreground" />
                    )}
                    <span className="text-sm text-foreground">Quiz passed</span>
                  </div>
                )}
                {hasWrittenAssignmentEnabled && (
                  <div className="flex items-center gap-2">
                    {writtenSubmitted ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    ) : (
                      <Circle className="w-4 h-4 text-muted-foreground" />
                    )}
                    <span className="text-sm text-foreground">Written assignment submitted</span>
                  </div>
                )}
                {unit.requires_evidence && !evidenceSetupMissing && (
                  <div className="flex items-center gap-2">
                    {evidenceUploaded ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    ) : (
                      <Circle className="w-4 h-4 text-muted-foreground" />
                    )}
                    <span className="text-sm text-foreground">Evidence submitted</span>
                  </div>
                )}
              </div>
              <hr className="border-border mb-4" />
              {latestAssessmentSubmission ? (
                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground">
                    Latest submission sent on {formatDate(latestAssessmentSubmission.submitted_at)}.
                    Trainer feedback and outcomes appear below once reviewed.
                  </p>
                  <div className="rounded-lg bg-muted/40 p-3">
                    <p className="text-sm font-semibold text-foreground">Current review status: {status.label}</p>
                  </div>
                </div>
              ) : unit.quiz_summary.score_summary_text ? (
                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground">Latest quiz result recorded for this unit.</p>
                  <div className="rounded-lg bg-muted/40 p-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Clock className="w-4 h-4 text-primary" />
                    {unit.quiz_summary.score_summary_text}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Upload evidence below to create your first learner submission for this unit.
                </p>
              )}
              {isExpired && (
                <Button variant="outline" className="mt-3 w-full gap-2" onClick={() => setShowExtension(true)}>
                  <Lock className="w-4 h-4" />
                  Extend To Unlock
                </Button>
              )}
            </div>
          )}

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
                <p className="text-sm font-semibold text-primary">{status.label}</p>
              </div>
              {latestAssessmentSubmission && (
                <>
                  <hr className="border-border" />
                  <div>
                    <p className="text-sm text-muted-foreground">Latest Submission</p>
                    <p className="text-sm font-semibold text-primary">
                      {formatDate(latestAssessmentSubmission.submitted_at)}
                    </p>
                  </div>
                </>
              )}
              {qualification.is_cpd && (
                <>
                  <hr className="border-border" />
                  <div>
                    <p className="text-sm text-muted-foreground">Required Time</p>
                    <p className="text-sm font-semibold text-primary">{cpdRequiredMinutes} minutes</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {latestFeedbackSubmission && (
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="w-4 h-4 text-primary" />
                <h3 className="text-base font-bold text-primary">Trainer Feedback</h3>
              </div>
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <p className="text-sm text-muted-foreground">{latestFeedbackSubmission.assessor_feedback}</p>
                <div className="text-xs text-muted-foreground">
                  {latestFeedbackSubmission.assessor?.name || "Trainer"} • {formatDate(latestFeedbackSubmission.outcome_set_at || latestFeedbackSubmission.submitted_at)}
                </div>
                {latestFeedbackSubmission.assessor_feedback_file && (
                  <Button variant="outline" size="sm" className="gap-2" asChild>
                    <a href={latestFeedbackSubmission.assessor_feedback_file} target="_blank" rel="noreferrer">
                      <Download className="w-4 h-4" />
                      Download Feedback File
                    </a>
                  </Button>
                )}
              </div>
            </div>
          )}

          {(isLoadingEvidence || isLoadingWritten) && (
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading learner submission history...
              </div>
            </div>
          )}
        </div>
      </div>

      <ExtensionRequestModal
        open={showExtension}
        onOpenChange={setShowExtension}
        enrolmentId={enrolment.id}
        qualificationTitle={qualification.title}
        currentExpiry={enrolment.access_expires_at ? new Date(enrolment.access_expires_at).toLocaleDateString("en-GB") : ""}
      />
    </div>
  );
};

export default UnitDetail;
