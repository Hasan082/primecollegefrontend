/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
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
  getIqaWorkflowBadgeVariant,
  getIqaWorkflowLabel,
  getLifecycleLabel,
  getSubmissionOutcomeLabel,
  getSubmissionTypeLabel,
} from "@/lib/iqaStatus";
import {
  useGetIqaEvidenceSubmissionDetailQuery,
  useGetIqaEnrolmentContentQuery,
  useGetIqaReviewQueueQuery,
  useGetIqaSubmissionHistoryQuery,
  useGetIqaWrittenAssignmentQuery,
  useGetIqaWrittenSubmissionDetailQuery,
  useRaiseIqaEvidenceConcernMutation,
  useRaiseIqaWrittenConcernMutation,
  useSubmitIqaEvidenceReviewMutation,
  useSubmitIqaWrittenReviewMutation,
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
  { value: "changes_required", label: "Changes Required" },
  { value: "referred_back", label: "Refer Back" },
] as const;

const AssessmentReview = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [decision, setDecision] = useState<
    "approved" | "changes_required" | "referred_back"
  >("approved");
  const [notes, setNotes] = useState("");
  const [concernNote, setConcernNote] = useState("");

  const { data: queueData, isLoading: isLoadingQueue } =
    useGetIqaReviewQueueQuery();
  const queueItem = useMemo(
    () =>
      queueData?.data?.results?.find((item) => item.submission_id === id) ||
      null,
    [queueData?.data?.results, id],
  );

  const submissionType = queueItem?.submission_type;
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
    useGetIqaWrittenSubmissionDetailQuery(id!, {
      skip: !id || !isWritten,
    });
  const { data: evidenceData, isLoading: isLoadingEvidence } =
    useGetIqaEvidenceSubmissionDetailQuery(id!, {
      skip: !id || !isEvidence,
    });
  const [submitWrittenReview, { isLoading: isSavingWritten }] =
    useSubmitIqaWrittenReviewMutation();
  const [submitEvidenceReview, { isLoading: isSavingEvidence }] =
    useSubmitIqaEvidenceReviewMutation();
  const [raiseWrittenConcern, { isLoading: isRaisingWrittenConcern }] =
    useRaiseIqaWrittenConcernMutation();
  const [raiseEvidenceConcern, { isLoading: isRaisingEvidenceConcern }] =
    useRaiseIqaEvidenceConcernMutation();

  const isLoading = isLoadingQueue || isLoadingWritten || isLoadingEvidence;
  const isSaving =
    isSavingWritten ||
    isSavingEvidence ||
    isRaisingWrittenConcern ||
    isRaisingEvidenceConcern;

  const writtenSubmission = writtenData?.data;
  const evidenceSubmission = evidenceData?.data;
  const submission = writtenSubmission || evidenceSubmission;
  const uiFlags = submission?.ui_flags;
  const adminConcerns = submission?.admin_concerns || [];
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
        (unit) => unit.id === queueItem?.unit.id,
      ) || null,
    [enrolmentContentData?.data?.units, queueItem?.unit.id],
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
    if (!id || !notes.trim()) {
      toast({ title: "IQA review notes are required", variant: "destructive" });
      return;
    }

    const payload = {
      iqa_sampled: true,
      iqa_decision: decision,
      iqa_review_notes: notes.trim(),
    };

    try {
      if (isWritten) {
        await submitWrittenReview({
          submissionId: id,
          body: payload,
        }).unwrap();
      } else if (isEvidence) {
        await submitEvidenceReview({
          submissionId: id,
          body: payload,
        }).unwrap();
      } else {
        toast({
          title: "Submission type not found in queue",
          variant: "destructive",
        });
        return;
      }

      toast({ title: "IQA review submitted" });
      navigate("/iqa/sampling");
    } catch {
      toast({ title: "Failed to submit IQA review", variant: "destructive" });
    }
  };

  const handleRaiseConcern = async () => {
    if (!id || !concernNote.trim()) {
      toast({ title: "Concern note is required", variant: "destructive" });
      return;
    }

    try {
      if (isWritten) {
        await raiseWrittenConcern({
          submissionId: id,
          body: { concern_note: concernNote.trim() },
        }).unwrap();
      } else if (isEvidence) {
        await raiseEvidenceConcern({
          submissionId: id,
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

  if (!queueItem) {
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

  console.log("currentUnit item:", currentUnit);

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
        <Badge
          variant={getIqaWorkflowBadgeVariant(
            getIqaWorkflowLabel(queueItem.iqa_status),
          )}
        >
          {getIqaWorkflowLabel(queueItem.iqa_status)}
        </Badge>
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
            {getSubmissionTypeLabel(queueItem.submission_type)}
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
                  <p>
                    Score:{" "}
                    {currentUnit.progress?.quiz_score != null
                      ? `${currentUnit.progress.quiz_score}%`
                      : "Not available"}
                  </p>
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
            <div className="space-y-2">
              <Label>IQA Notes</Label>
              <Textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={5}
                placeholder="Add IQA review notes..."
              />
            </div>
            <Button onClick={handleReviewSubmit} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              Submit IQA Review
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
