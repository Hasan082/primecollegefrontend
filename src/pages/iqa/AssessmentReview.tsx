/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, FileText, Loader2, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  useGetIqaEvidenceSubmissionDetailQuery,
  useGetIqaReviewQueueQuery,
  useGetIqaWrittenSubmissionDetailQuery,
  useRaiseIqaEvidenceConcernMutation,
  useRaiseIqaWrittenConcernMutation,
  useSubmitIqaEvidenceReviewMutation,
  useSubmitIqaWrittenReviewMutation,
} from "@/redux/apis/iqa/iqaApi";

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
    () => queueData?.data.find((item) => item.submission_id === id) || null,
    [queueData?.data, id],
  );

  const submissionType = queueItem?.submission_type;
  const isWritten = submissionType === "written";
  const isEvidence = submissionType === "evidence";

  const { data: writtenData, isLoading: isLoadingWritten } =
    useGetIqaWrittenSubmissionDetailQuery(id!, {
      skip: !id || !isWritten,
    });
  const { data: evidenceData, isLoading: isLoadingEvidence } =
    useGetIqaEvidenceSubmissionDetailQuery(id!, {
      skip: !id || !isEvidence,
    });
  const ui_flags: any = evidenceData?.data?.ui_flags;
  console.log("ui_flags:", ui_flags);
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
        <Badge variant="outline">{queueItem.iqa_status}</Badge>
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
            {queueItem.submission_type.replace(/_/g, " ")}
          </p>
          <p>
            <strong>Trainer Outcome:</strong>{" "}
            {queueItem.status.replace(/_/g, " ")}
          </p>
          <p>
            <strong>Submitted:</strong>{" "}
            {queueItem.submitted_at
              ? new Date(queueItem.submitted_at).toLocaleString()
              : "—"}
          </p>
        </CardContent>
      </Card>

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
            <div className="space-y-3">
              {evidenceSubmission.evidence_items.map((item) => (
                <div key={item.id} className="rounded-lg border p-3 text-sm">
                  <p className="font-medium">{item.title}</p>
                  <a
                    className="text-primary underline"
                    href={item.file}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open evidence file
                  </a>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      {!ui_flags?.hide_iqa_review_form && (
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

      {!ui_flags?.hide_admin_concern_form && (
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
