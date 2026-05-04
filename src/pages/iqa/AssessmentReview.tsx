/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  AlertTriangle,
  Loader2,
  ShieldAlert,
  Image as ImageIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import {
  getIqaDecisionLabel,
  getIqaWorkflowBadgeProps,
  getIqaWorkflowLabel,
  getLifecycleLabel,
  getSubmissionOutcomeLabel,
  getSubmissionTypeLabel,
} from "@/lib/iqaStatus";
import {
  useCreateChecklistCompletionMutation,
  useGetChecklistTemplatesForIqaQuery,
  useGetIqaEvidenceSubmissionDetailQuery,
  useGetIqaEnrolmentContentQuery,
  useGetIqaReviewQueueQuery,
  useGetIqaSampleDetailQuery,
  useGetIqaSamplesQuery,
  useGetIqaSubmissionHistoryQuery,
  useGetIqaWrittenAssignmentQuery,
  useGetIqaWrittenSubmissionDetailQuery,
  useGetSampleFeedbackQuery,
  useRaiseIqaEvidenceConcernMutation,
  useRaiseIqaWrittenConcernMutation,
  useStartIqaSampleReviewMutation,
  useSubmitIqaSampleDecisionMutation,
} from "@/redux/apis/iqa/iqaApi";
import ResourceSection from "@/components/shared/ResourceSection";

const imageExtensions = [".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg"];

function getFileExtension(url?: string | null) {
  if (!url) {
    return "";
  }
  const cleanUrl = url.split("?")[0].toLowerCase();
  const lastDotIndex = cleanUrl.lastIndexOf(".");
  return lastDotIndex >= 0 ? cleanUrl.slice(lastDotIndex) : "";
}

function canInlinePreview(url?: string | null) {
  const extension = getFileExtension(url);
  return extension === ".pdf" || imageExtensions.includes(extension);
}

function isImageFile(url?: string | null) {
  return imageExtensions.includes(getFileExtension(url));
}

function buildSubmissionTimeline(submission: any, queueItem: any) {
  return [
    {
      label: "Submitted",
      value: queueItem?.submitted_at || submission?.submitted_at,
      description: "Learner submitted work for assessment.",
    },
    {
      label: "Trainer Outcome",
      value: queueItem?.outcome_set_at || submission?.outcome_set_at,
      description: queueItem?.status
        ? `Trainer marked this as ${getSubmissionOutcomeLabel(queueItem.status)}.`
        : "Trainer outcome not yet recorded.",
    },
    {
      label: "IQA Review",
      value: submission?.iqa_reviewed_at,
      description: submission?.iqa_decision
        ? `IQA decision: ${getIqaDecisionLabel(submission.iqa_decision)}.`
        : "IQA decision not yet recorded.",
    },
  ];
}

const decisions = [
  { value: "approved", label: "Approve" },
  { value: "action_required", label: "Refer Back to Trainer" },
] as const;

const ACTION_TYPE_OPTIONS = [
  { value: "reassess_criteria", label: "Reassess criteria" },
  { value: "additional_evidence", label: "Additional evidence needed" },
  { value: "clarification_needed", label: "Clarification needed" },
  { value: "refer_back", label: "Refer back to trainer" },
  { value: "other", label: "Other" },
] as const;

function getChecklistResponseOptions(responseType: string): { value: string; label: string }[] {
  if (responseType === "yes_no") return [{ value: "yes", label: "Yes" }, { value: "no", label: "No" }];
  if (responseType === "yes_no_na") return [{ value: "yes", label: "Yes" }, { value: "no", label: "No" }, { value: "na", label: "N/A" }];
  return [{ value: "met", label: "Met" }, { value: "not_met", label: "Not Met" }, { value: "na", label: "N/A" }];
}

const AssessmentReview = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [decision, setDecision] = useState<"approved" | "action_required">("approved");
  const [actionType, setActionType] = useState("reassess_criteria");
  const [notes, setNotes] = useState("");
  const [concernNote, setConcernNote] = useState("");
  const [checklistResponses, setChecklistResponses] = useState<Record<string, Record<string, string>>>({});
  const [checklistSummaries, setChecklistSummaries] = useState<Record<string, string>>({});

  const { data: sampleDetail, isLoading: isLoadingSampleDetail, isError: isSampleDetailError } =
    useGetIqaSampleDetailQuery(id || "", { skip: !id });
  const { data: samplesResponse, isLoading: isLoadingSamples } = useGetIqaSamplesQuery(
    { mine: true },
    { skip: !id || Boolean(sampleDetail) },
  );
  const sample = useMemo(() => {
    if (sampleDetail) return sampleDetail;
    return (samplesResponse?.results || []).find(
      (item) => item.id === id || item.trigger_submission.id === id,
    ) || null;
  }, [sampleDetail, samplesResponse?.results, id]);

  const { data: queueData, isLoading: isLoadingQueue } = useGetIqaReviewQueueQuery();
  const queueItem = useMemo(() => {
    const submissionId = sample?.trigger_submission.id || id;
    const matched = queueData?.data?.results?.find(
      (item) => item.sample_id === id || item.submission_id === id || item.submission_id === submissionId,
    );
    if (matched) {
      return matched;
    }
    if (!sample) {
      return null;
    }

    const workflowStatus =
      sample.review_status === "approved"
        ? "IQA Approved"
        : sample.review_status === "trainer_review"
          ? "IQA Referred — Awaiting Trainer Response"
          : sample.review_status === "action_required"
            ? "Assessor Action Required"
            : sample.review_status === "escalated"
              ? "Escalated to Admin"
              : sample.review_status === "auto_cleared"
                ? "Auto-Cleared (Not Sampled)"
                : "Pending IQA Review";

    return {
      sample_id: sample.id,
      submission_id: sample.trigger_submission.id,
      enrolment_id: "",
      submission_type: sample.trigger_submission.submission_type,
      learner: sample.learner,
      trainer: sample.trainer,
      qualification: sample.qualification,
      unit: {
        id: sample.unit.id,
        unit_code: sample.unit.code,
        title: sample.unit.title,
      },
      status: sample.trigger_submission.status,
      iqa_decision: sample.review_status === "approved" ? "approved" : sample.review_status === "trainer_review" ? "referred_back" : null,
      iqa_reviewed_at: sample.reviewed_at,
      submitted_at: sample.trigger_submission.submitted_at,
      outcome_set_at: sample.trigger_submission.outcome_set_at,
      iqa_status: workflowStatus,
      sampling_reason: sample.sampling_reason,
      has_open_admin_concern: false,
    };
  }, [id, queueData?.data?.results, sample]);

  const submissionType = sample?.trigger_submission.submission_type || queueItem?.submission_type;
  const isWritten = submissionType === "written";
  const isEvidence = submissionType === "evidence";
  const { data: historyData } = useGetIqaSubmissionHistoryQuery(
    {
      enrolmentId: queueItem?.enrolment_id || "",
      unitId: queueItem?.unit.id || "",
    },
    {
      skip: !queueItem?.enrolment_id || !queueItem?.unit.id,
    },
  );
  const { data: enrolmentContentData } = useGetIqaEnrolmentContentQuery(
    queueItem?.enrolment_id || "",
    {
      skip: !queueItem?.enrolment_id,
    },
  );
  const { data: writtenAssignmentData } = useGetIqaWrittenAssignmentQuery(
    {
      enrolmentId: queueItem?.enrolment_id || "",
      unitId: queueItem?.unit.id || "",
    },
    {
      skip: !queueItem?.enrolment_id || !queueItem?.unit.id,
    },
  );

  const { data: writtenData, isLoading: isLoadingWritten } =
    useGetIqaWrittenSubmissionDetailQuery(sample?.trigger_submission.id || "", {
      skip: !sample?.trigger_submission.id || !isWritten,
    });
  const { data: evidenceData, isLoading: isLoadingEvidence } =
    useGetIqaEvidenceSubmissionDetailQuery(sample?.trigger_submission.id || "", {
      skip: !sample?.trigger_submission.id || !isEvidence,
    });
  const { data: feedbackData } = useGetSampleFeedbackQuery(id || "", {
    skip: !id || !["action_required", "trainer_review"].includes(sample?.review_status ?? ""),
  });
  const feedbackItems = feedbackData?.results || [];

  const { data: checklistData } = useGetChecklistTemplatesForIqaQuery(
    sample ? { qualification_id: sample.qualification.id, is_active: "true" } : undefined,
    { skip: !sample },
  );
  const applicableTemplates = useMemo(() => {
    if (!sample || !checklistData?.results) return [];
    return checklistData.results.filter(
      (t) => t.unit_id === null || t.unit_id === sample.unit.id,
    );
  }, [checklistData?.results, sample]);

  const [startSampleReview] = useStartIqaSampleReviewMutation();
  const [submitSampleDecision, { isLoading: isSavingDecision }] =
    useSubmitIqaSampleDecisionMutation();
  const [createChecklistCompletion] = useCreateChecklistCompletionMutation();
  const [raiseWrittenConcern, { isLoading: isRaisingWrittenConcern }] =
    useRaiseIqaWrittenConcernMutation();
  const [raiseEvidenceConcern, { isLoading: isRaisingEvidenceConcern }] =
    useRaiseIqaEvidenceConcernMutation();

  const isLoading = isLoadingSampleDetail || isLoadingSamples || isLoadingQueue || isLoadingWritten || isLoadingEvidence;
  const isSaving =
    isSavingDecision ||
    isRaisingWrittenConcern ||
    isRaisingEvidenceConcern;

  const writtenSubmission = writtenData?.data;
  const evidenceSubmission = evidenceData?.data;
  const submission = writtenSubmission || evidenceSubmission;
  const uiFlags = submission?.ui_flags;
  const adminConcerns = (submission as any)?.admin_concerns || [];
  const evidenceCriteria = useMemo(() => {
    if (!evidenceSubmission) {
      return [];
    }

    const byCode = new Map<string, { code: string; description: string }>();
    evidenceSubmission.evidence_items.forEach((item) => {
      item.criteria.forEach((criterion) => {
        if (!byCode.has(criterion.code)) {
          byCode.set(criterion.code, {
            code: criterion.code,
            description: criterion.description,
          });
        }
      });
    });

    return Array.from(byCode.values()).sort((left, right) =>
      left.code.localeCompare(right.code),
    );
  }, [evidenceSubmission]);
  const submissionTimeline = useMemo(
    () => buildSubmissionTimeline(submission, queueItem),
    [submission, queueItem],
  );
  const submissionHistory = historyData?.data?.results || [];
  const latestOpenConcern = adminConcerns[0] || null;
  const currentUnit = useMemo(
    () =>
      enrolmentContentData?.data?.units?.find(
        (unit) => unit.id === sample?.unit.id,
      ) || null,
    [enrolmentContentData?.data?.units, sample?.unit.id],
  );
  const writtenAssignmentSubmissions =
    writtenAssignmentData?.data?.submissions || [];
  const writtenAttempts = useMemo(
    () =>
      submissionHistory.filter((item) => item.submission_type === "written"),
    [submissionHistory],
  );
  const evidenceAttempts = useMemo(
    () =>
      submissionHistory.filter((item) => item.submission_type === "evidence"),
    [submissionHistory],
  );
  const latestWrittenAttempt = writtenAttempts[0] || null;
  const latestEvidenceAttempt = evidenceAttempts[0] || null;
  const latestWrittenSubmissionForUnit = useMemo(
    () =>
      [...writtenAssignmentSubmissions].sort(
        (left, right) =>
          new Date(right.submitted_at).getTime() -
          new Date(left.submitted_at).getTime(),
      )[0] || null,
    [writtenAssignmentSubmissions],
  );

  const handleReviewSubmit = async () => {
    if (!sample || !notes.trim()) {
      toast({ title: "IQA review notes are required", variant: "destructive" });
      return;
    }

    try {
      if (sample.review_status === "pending") {
        await startSampleReview(sample.id).unwrap();
      }

      const enrolmentId = sample.enrolment_id || queueItem?.enrolment_id || "";
      if (enrolmentId) {
        for (const template of applicableTemplates) {
          const responses = checklistResponses[template.id] || {};
          if (Object.keys(responses).length > 0) {
            await createChecklistCompletion({
              template_id: template.id,
              enrolment_id: enrolmentId,
              responses,
              summary_comment: checklistSummaries[template.id] || "",
            }).unwrap();
          }
        }
      }

      await submitSampleDecision({
        sampleId: sample.id,
        body: {
          decision,
          comments: notes.trim(),
          action_type: decision === "action_required" ? actionType : "",
        },
      }).unwrap();

      toast({ title: "IQA review submitted" });
      navigate("/iqa/sampling");
    } catch {
      toast({ title: "Failed to submit IQA review", variant: "destructive" });
    }
  };

  const handleRaiseConcern = async () => {
    if (!sample?.trigger_submission.id || !concernNote.trim()) {
      toast({ title: "Concern note is required", variant: "destructive" });
      return;
    }

    try {
      if (isWritten) {
        await raiseWrittenConcern({
          submissionId: sample.trigger_submission.id,
          body: { concern_note: concernNote.trim() },
        }).unwrap();
      } else if (isEvidence) {
        await raiseEvidenceConcern({
          submissionId: sample.trigger_submission.id,
          body: { concern_note: concernNote.trim() },
        }).unwrap();
      } else {
        toast({
          title: "Submission type not found in queue",
          variant: "destructive",
        });
        return;
      }

      toast({ title: "Concern raised to admin" });
      navigate("/iqa/sampling");
    } catch {
      toast({ title: "Failed to raise concern", variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 text-center text-muted-foreground">
        Loading review...
      </div>
    );
  }

  if ((!sample && isSampleDetailError) || !queueItem) {
    return (
      <div className="space-y-4">
        <Button variant="outline" size="sm" asChild>
          <Link to="/iqa/sampling">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Queue
          </Link>
        </Button>
        <p className="text-muted-foreground">
          Submission not found in the current IQA queue.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="outline" size="sm" asChild>
        <Link to="/iqa/sampling">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Queue
        </Link>
      </Button>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">IQA Assessment Review</h1>
          <p className="text-sm text-muted-foreground">
            {queueItem.qualification.title} · {queueItem.unit.unit_code}:{" "}
            {queueItem.unit.title}
          </p>
        </div>
        {(() => {
          const workflowLabel = getIqaWorkflowLabel(queueItem.iqa_status);
          const badgeProps = getIqaWorkflowBadgeProps(workflowLabel);
          return (
            <Badge variant={badgeProps.variant} className={badgeProps.className}>
              {workflowLabel}
            </Badge>
          );
        })()}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Submission Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <strong>Learner:</strong> {queueItem.learner.name}
          </p>
          <p>
            <strong>Trainer:</strong> {queueItem.trainer?.name || "Unassigned"}
          </p>
          <p>
            <strong>Submission Type:</strong>{" "}
            {getSubmissionTypeLabel(sample?.trigger_submission.submission_type)}
          </p>
          <p>
            <strong>Trainer Outcome:</strong>{" "}
            {getSubmissionOutcomeLabel(queueItem.status)}
          </p>
          <p>
            <strong>Submitted:</strong>{" "}
            {queueItem.submitted_at
              ? new Date(queueItem.submitted_at).toLocaleString()
              : "—"}
          </p>
          {queueItem.has_open_admin_concern ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
              <p className="font-medium text-destructive">
                Admin Escalation Active
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Status: {getLifecycleLabel(queueItem.admin_concern_status)}.
                Raised{" "}
                {queueItem.admin_concern_raised_at
                  ? new Date(queueItem.admin_concern_raised_at).toLocaleString()
                  : "—"}
                .
              </p>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {currentUnit ? (
        <Card>
          <CardHeader>
            <CardTitle>Unit Requirements Overview</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 lg:grid-cols-3">
            <div className="rounded-lg border p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">Quiz</p>
                  <p className="text-xs text-muted-foreground">
                    {currentUnit.has_quiz
                      ? "Required for this unit"
                      : "Not required"}
                  </p>
                </div>
                <Badge
                  variant={
                    currentUnit.progress?.quiz_passed ? "default" : "outline"
                  }
                >
                  {currentUnit.has_quiz
                    ? currentUnit.progress?.quiz_passed
                      ? "Completed"
                      : "Pending"
                    : "N/A"}
                </Badge>
              </div>
              {currentUnit.has_quiz ? (
                <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                  <p>Attempts: {currentUnit.progress?.quiz_attempts ?? 0}</p>
                </div>
              ) : null}
            </div>

            <div className="rounded-lg border p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">Written Assignment</p>
                  <p className="text-xs text-muted-foreground">
                    {currentUnit.has_written_assignment
                      ? "Required for this unit"
                      : "Not required"}
                  </p>
                </div>
                <Badge
                  variant={
                    currentUnit.progress?.assignment_met ? "default" : "outline"
                  }
                >
                  {currentUnit.has_written_assignment
                    ? currentUnit.progress?.assignment_met
                      ? "Completed"
                      : "Pending"
                    : "N/A"}
                </Badge>
              </div>
              {currentUnit.has_written_assignment ? (
                <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                  <p>Attempts: {writtenAttempts.length}</p>
                  <p>
                    Latest:{" "}
                    {latestWrittenAttempt
                      ? `${getSubmissionOutcomeLabel(latestWrittenAttempt.status)} on ${new Date(latestWrittenAttempt.submitted_at).toLocaleDateString()}`
                      : "No written assignment submitted"}
                  </p>
                </div>
              ) : null}
            </div>

            <div className="rounded-lg border p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">Evidence Portfolio</p>
                  <p className="text-xs text-muted-foreground">
                    {currentUnit.requires_evidence
                      ? "Required for this unit"
                      : "Not required"}
                  </p>
                </div>
                <Badge
                  variant={
                    currentUnit.progress?.evidence_met ? "default" : "outline"
                  }
                >
                  {currentUnit.requires_evidence
                    ? currentUnit.progress?.evidence_met
                      ? "Completed"
                      : "Pending"
                    : "N/A"}
                </Badge>
              </div>
              {currentUnit.requires_evidence ? (
                <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                  <p>Attempts: {evidenceAttempts.length}</p>
                  <p>
                    Latest:{" "}
                    {latestEvidenceAttempt
                      ? `${getSubmissionOutcomeLabel(latestEvidenceAttempt.status)} on ${new Date(latestEvidenceAttempt.submitted_at).toLocaleDateString()}`
                      : "No evidence portfolio submitted"}
                  </p>
                </div>
              ) : null}
            </div>
          </CardContent>
        </Card>
      ) : null}

      {currentUnit?.resources && currentUnit.resources.length > 0 ? (
        <ResourceSection resources={currentUnit.resources} />
      ) : null}

      {isWritten && writtenSubmission && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-4 h-4" /> Written Submission
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              className="rounded-lg border p-4 prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{
                __html:
                  writtenSubmission.response_html ||
                  "<p>No response provided.</p>",
              }}
            />
            <div className="text-sm text-muted-foreground">
              Word count: {writtenSubmission.response_word_count || 0}
            </div>
            <div className="text-sm whitespace-pre-wrap">
              <strong>Trainer feedback:</strong>{" "}
              {writtenSubmission.assessor_feedback ||
                "No trainer feedback recorded."}
            </div>
          </CardContent>
        </Card>
      )}

      {isEvidence && evidenceSubmission && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-4 h-4" /> Evidence Submission
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm whitespace-pre-wrap">
              <strong>Trainer feedback:</strong>{" "}
              {evidenceSubmission.assessor_feedback ||
                "No trainer feedback recorded."}
            </div>
            <p className="text-sm text-muted-foreground">
              {evidenceSubmission.evidence_items.length} evidence file
              {evidenceSubmission.evidence_items.length !== 1 ? "s" : ""}{" "}
              attached.
            </p>
          </CardContent>
        </Card>
      )}

      {!isWritten && latestWrittenSubmissionForUnit ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-4 h-4" /> Latest Written Assignment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="outline">
                Attempt {latestWrittenSubmissionForUnit.submission_number}
              </Badge>
              <Badge variant="outline">
                {getSubmissionOutcomeLabel(
                  latestWrittenSubmissionForUnit.status,
                )}
              </Badge>
              <span>
                Submitted{" "}
                {new Date(
                  latestWrittenSubmissionForUnit.submitted_at,
                ).toLocaleString()}
              </span>
            </div>
            <div
              className="rounded-lg border p-4 prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{
                __html:
                  latestWrittenSubmissionForUnit.response_html ||
                  "<p>No written response recorded.</p>",
              }}
            />
            <div className="text-sm text-muted-foreground">
              Word count:{" "}
              {latestWrittenSubmissionForUnit.response_word_count ?? 0}
            </div>
            <div className="rounded-lg border bg-muted/30 p-4 text-sm">
              <p className="font-medium text-foreground">Trainer Feedback</p>
              <p className="mt-1 whitespace-pre-wrap text-muted-foreground">
                {latestWrittenSubmissionForUnit.assessor_feedback ||
                  "No trainer feedback recorded."}
              </p>
            </div>
            {latestWrittenSubmissionForUnit.iqa_review_notes ? (
              <div className="rounded-lg border bg-muted/30 p-4 text-sm">
                <p className="font-medium text-foreground">IQA Notes</p>
                <p className="mt-1 whitespace-pre-wrap text-muted-foreground">
                  {latestWrittenSubmissionForUnit.iqa_review_notes}
                </p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Assessment Timeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {submissionTimeline.map((event) => (
              <div key={event.label} className="rounded-lg border p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold">{event.label}</p>
                  <Badge variant="outline">
                    {event.value
                      ? new Date(event.value).toLocaleString()
                      : "Pending"}
                  </Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {event.description}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Criteria Visibility</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEvidence && evidenceSubmission ? (
              evidenceCriteria.length > 0 ? (
                <div className="space-y-2">
                  {evidenceCriteria.map((criterion) => (
                    <div
                      key={criterion.code}
                      className="rounded-lg border p-3 text-sm"
                    >
                      <p className="font-semibold text-foreground">
                        {criterion.code}
                      </p>
                      <p className="text-muted-foreground">
                        {criterion.description}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No criteria were linked to this evidence submission.
                </p>
              )
            ) : isWritten && writtenSubmission ? (
              <div className="space-y-3 text-sm">
                <div className="rounded-lg border p-3">
                  <p className="font-semibold">Assignment Title</p>
                  <p className="text-muted-foreground">
                    {writtenSubmission.assignment_snapshot?.title ||
                      writtenSubmission.title}
                  </p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="font-semibold">Assignment Brief</p>
                  <p className="whitespace-pre-wrap text-muted-foreground">
                    {writtenSubmission.assignment_snapshot?.instructions ||
                      "Detailed criteria are not exposed by the current IQA submission detail endpoint."}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No criteria metadata available.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Submission History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {submissionHistory.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No prior submissions were found for this enrolment unit.
            </p>
          ) : (
            <Accordion type="single" collapsible className="w-full">
              {submissionHistory.map((historyItem) => (
                <AccordionItem value={historyItem.id} key={historyItem.id}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex w-full flex-wrap items-center justify-between gap-3 pr-4 text-left">
                      <div>
                        <p className="text-sm font-semibold">
                          Attempt {historyItem.submission_number} ·{" "}
                          {getSubmissionTypeLabel(historyItem.submission_type)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Submitted{" "}
                          {new Date(historyItem.submitted_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {getSubmissionOutcomeLabel(historyItem.status)}
                        </Badge>
                        {historyItem.iqa_decision ? (
                          <Badge variant="secondary">
                            {getIqaDecisionLabel(historyItem.iqa_decision)}
                          </Badge>
                        ) : null}
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid gap-3 lg:grid-cols-2">
                      {historyItem.submission_type === "written" ? (
                        <div className="rounded-lg border p-3 text-sm lg:col-span-2">
                          <p className="font-medium text-foreground">
                            Learner Submission
                          </p>
                          <div
                            className="prose prose-sm mt-2 max-w-none text-foreground"
                            dangerouslySetInnerHTML={{
                              __html:
                                historyItem.response_html ||
                                "<p>No written response recorded.</p>",
                            }}
                          />
                          <p className="mt-2 text-xs text-muted-foreground">
                            Word count: {historyItem.response_word_count ?? 0}
                          </p>
                        </div>
                      ) : null}
                      <div className="rounded-lg bg-muted/30 p-3 text-sm">
                        <p className="font-medium text-foreground">
                          Trainer Feedback
                        </p>
                        <p className="mt-1 whitespace-pre-wrap text-muted-foreground">
                          {historyItem.assessor_feedback ||
                            "No trainer feedback recorded."}
                        </p>
                      </div>
                      <div className="rounded-lg bg-muted/30 p-3 text-sm">
                        <p className="font-medium text-foreground">IQA Notes</p>
                        <p className="mt-1 whitespace-pre-wrap text-muted-foreground">
                          {historyItem.iqa_review_notes ||
                            "No IQA notes recorded."}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 grid gap-3 lg:grid-cols-3">
                      <div className="rounded-lg border p-3 text-sm">
                        <p className="font-medium text-foreground">Assessor</p>
                        <p className="mt-1 text-muted-foreground">
                          {historyItem.assessor?.name || "Not recorded"}
                        </p>
                      </div>
                      <div className="rounded-lg border p-3 text-sm">
                        <p className="font-medium text-foreground">
                          IQA Reviewer
                        </p>
                        <p className="mt-1 text-muted-foreground">
                          {historyItem.iqa_reviewer?.name || "Not recorded"}
                        </p>
                      </div>
                      <div className="rounded-lg border p-3 text-sm">
                        <p className="font-medium text-foreground">
                          Reviewed At
                        </p>
                        <p className="mt-1 text-muted-foreground">
                          {historyItem.iqa_reviewed_at
                            ? new Date(
                                historyItem.iqa_reviewed_at,
                              ).toLocaleString()
                            : "Pending"}
                        </p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>

      {isEvidence && evidenceSubmission && (
        <Card>
          <CardHeader>
            <CardTitle>Evidence Preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {evidenceSubmission.evidence_items.map((item) => (
              <div key={item.id} className="rounded-lg border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-foreground">
                      {item.title}
                    </p>
                    {item.description ? (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    ) : null}
                  </div>
                  <a
                    className="text-sm text-primary underline"
                    href={item.file}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open file
                  </a>
                </div>

                <div className="mt-3 rounded-lg border bg-muted/20 p-3">
                  {canInlinePreview(item.file) ? (
                    isImageFile(item.file) ? (
                      <img
                        src={item.file}
                        alt={item.title}
                        className="max-h-[420px] w-full rounded-md object-contain"
                      />
                    ) : (
                      <iframe
                        src={item.file}
                        title={item.title}
                        className="h-[420px] w-full rounded-md border"
                      />
                    )
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <ImageIcon className="h-4 w-4" />
                      Inline preview is available for PDF and image files only.
                    </div>
                  )}
                </div>

                {item.criteria.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {item.criteria.map((criterion) => (
                      <Badge
                        key={criterion.id}
                        variant="outline"
                        className="text-xs"
                      >
                        {criterion.code}
                      </Badge>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
      {submission?.iqa_decision && (
        <Card>
          <CardHeader>
            <CardTitle>IQA Review Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <strong>Decision:</strong>
              <Badge variant="outline">
                {getIqaDecisionLabel(submission.iqa_decision)}
              </Badge>
            </div>
            <p className="whitespace-pre-wrap">
              <strong>Notes:</strong>{" "}
              {submission.iqa_review_notes || "No IQA notes recorded."}
            </p>
            <p>
              <strong>Reviewed By:</strong>{" "}
              {submission.iqa_reviewer?.name || "Unknown IQA"}
            </p>
            <p>
              <strong>Reviewed At:</strong>{" "}
              {submission.iqa_reviewed_at
                ? new Date(submission.iqa_reviewed_at).toLocaleString()
                : "—"}
            </p>
          </CardContent>
        </Card>
      )}

      {feedbackItems.length > 0 && (
        <Card className="border-orange-200 bg-orange-50/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <AlertTriangle className="w-4 h-4" /> IQA Action Required — Feedback
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {feedbackItems.map((item) => (
              <div key={item.id} className="rounded-lg border border-orange-200 bg-white p-4 text-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-orange-700">
                    {item.action_type || "Action required"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(item.created_at).toLocaleDateString()} · {item.created_by.name}
                  </span>
                </div>
                {item.comments && (
                  <p className="whitespace-pre-wrap text-muted-foreground">{item.comments}</p>
                )}
                {item.affected_criteria.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {item.affected_criteria.map((c) => (
                      <Badge key={c} variant="outline" className="text-xs border-orange-300 text-orange-700">
                        {c}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {!uiFlags?.hide_iqa_review_form && applicableTemplates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>IQA Checklists</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {applicableTemplates.map((template) => (
              <div key={template.id} className="space-y-3">
                <p className="text-sm font-semibold">
                  {template.title}
                  {template.unit_title ? (
                    <span className="ml-2 text-xs font-normal text-muted-foreground">
                      (Unit: {template.unit_title})
                    </span>
                  ) : null}
                </p>
                <div className="space-y-2">
                  {template.items
                    .filter((item) => item.is_active)
                    .map((item) => {
                      const selected = checklistResponses[template.id]?.[item.id];
                      return (
                        <div
                          key={item.id}
                          className="rounded-lg border p-3 text-sm space-y-2"
                        >
                          <p className="font-medium">{item.label}</p>
                          <div className="flex flex-wrap gap-2">
                            {getChecklistResponseOptions(item.response_type).map((opt) => (
                              <Button
                                key={opt.value}
                                type="button"
                                size="sm"
                                variant={selected === opt.value ? "default" : "outline"}
                                onClick={() =>
                                  setChecklistResponses((prev) => ({
                                    ...prev,
                                    [template.id]: {
                                      ...(prev[template.id] || {}),
                                      [item.id]: opt.value,
                                    },
                                  }))
                                }
                              >
                                {opt.label}
                              </Button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">
                    Summary comment (optional)
                  </Label>
                  <Textarea
                    rows={2}
                    value={checklistSummaries[template.id] || ""}
                    onChange={(e) =>
                      setChecklistSummaries((prev) => ({
                        ...prev,
                        [template.id]: e.target.value,
                      }))
                    }
                    placeholder="Add any overall notes for this checklist..."
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {!uiFlags?.hide_iqa_review_form && (
        <Card>
          <CardHeader>
            <CardTitle>IQA Decision</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {decisions.map((item) => (
                <Button
                  key={item.value}
                  type="button"
                  variant={decision === item.value ? "default" : "outline"}
                  onClick={() => setDecision(item.value)}
                >
                  {item.label}
                </Button>
              ))}
            </div>

            {decision === "action_required" && (
              <>
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                  This will be sent back to the <strong>trainer only</strong>. The learner will not be
                  notified. Only the trainer can decide whether to request a learner resubmission.
                </div>
                <div className="space-y-2">
                  <Label>Action Type</Label>
                  <div className="flex flex-wrap gap-2">
                    {ACTION_TYPE_OPTIONS.map((opt) => (
                      <Button
                        key={opt.value}
                        type="button"
                        size="sm"
                        variant={actionType === opt.value ? "default" : "outline"}
                        onClick={() => setActionType(opt.value)}
                      >
                        {opt.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label>
                {decision === "action_required" ? "Feedback to Trainer" : "IQA Notes"}
              </Label>
              <Textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={5}
                placeholder={
                  decision === "action_required"
                    ? "Describe the issue with the assessment — the trainer will see this..."
                    : "Add IQA review notes..."
                }
              />
            </div>
            <Button onClick={handleReviewSubmit} disabled={isSaving}>
              {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              {decision === "action_required" ? "Refer Back to Trainer" : "Approve Assessment"}
            </Button>
          </CardContent>
        </Card>
      )}

      {adminConcerns.length > 0 && (
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" /> Admin Concern History
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {latestOpenConcern ? (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm">
                <p className="font-semibold text-destructive">
                  Latest Escalation State
                </p>
                <p className="mt-2 text-muted-foreground">
                  Current status: {getLifecycleLabel(latestOpenConcern.status)}.
                </p>
                {latestOpenConcern.admin_response_note ? (
                  <p className="mt-2 whitespace-pre-wrap text-muted-foreground">
                    Admin response: {latestOpenConcern.admin_response_note}
                  </p>
                ) : null}
              </div>
            ) : null}
            {adminConcerns.map((concern: any) => (
              <div
                key={concern.id}
                className="rounded-lg border p-4 space-y-2 text-sm"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <strong>Status:</strong>
                  <Badge variant="outline">
                    {getLifecycleLabel(concern.status)}
                  </Badge>
                </div>
                <p className="whitespace-pre-wrap">
                  <strong>Concern:</strong> {concern.concern_note}
                </p>
                <p>
                  <strong>Raised By:</strong>{" "}
                  {concern.raised_by?.name || "Unknown"}
                </p>
                <p>
                  <strong>Raised At:</strong>{" "}
                  {concern.created_at
                    ? new Date(concern.created_at).toLocaleString()
                    : "—"}
                </p>
                {concern.admin_response_note ? (
                  <p className="whitespace-pre-wrap">
                    <strong>Admin Response:</strong>{" "}
                    {concern.admin_response_note}
                  </p>
                ) : null}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {!uiFlags?.hide_admin_concern_form && (
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" /> Raise Concern to Admin
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={concernNote}
              onChange={(event) => setConcernNote(event.target.value)}
              rows={4}
              placeholder="Explain why this submission needs admin follow-up..."
            />
            <Button
              variant="destructive"
              onClick={handleRaiseConcern}
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              Raise Concern
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AssessmentReview;
