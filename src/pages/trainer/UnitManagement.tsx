import { type ReactNode, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  Loader2,
  Send,
  Upload,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useGetUnitAttemptsQuery } from "@/redux/apis/quiz/quizApi";
import {
  useGetTrainerEnrolmentContentQuery,
  useGetTrainerEvidenceSubmissionsQuery,
  useGetTrainerWrittenAssignmentQuery,
  useReviewTrainerEvidenceSubmissionMutation,
  useReviewTrainerWrittenAssignmentMutation,
} from "@/redux/apis/trainer/trainerReviewApi";

type TrainerOutcome = "competent" | "resubmit" | "not_competent";

const outcomeOptions: Array<{
  value: TrainerOutcome;
  label: string;
  description: string;
}> = [
  { value: "competent", label: "Competent", description: "Submission meets the required standard" },
  { value: "resubmit", label: "Resubmission Required", description: "Learner needs to revise and submit again" },
  { value: "not_competent", label: "Not Yet Competent", description: "Submission does not meet the required standard" },
];

function getBand(score?: number) {
  if (score == null) return undefined;
  if (score >= 85) return "high";
  if (score >= 70) return "good";
  return "satisfactory";
}

function SubmissionReviewCard({
  title,
  status,
  submittedAt,
  children,
}: {
  title: string;
  status: string;
  submittedAt: string;
  children: ReactNode;
}) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">
            Submitted {new Date(submittedAt).toLocaleDateString()}
          </p>
        </div>
        <Badge variant="secondary" className="capitalize">
          {status.replace(/_/g, " ")}
        </Badge>
      </div>
      {children}
    </Card>
  );
}

const UnitManagement = () => {
  const { learnerId: enrolmentId, unitCode: unitId } = useParams();
  const { toast } = useToast();

  const { data: contentResponse, isLoading: isLoadingContent, isError: isContentError } =
    useGetTrainerEnrolmentContentQuery(enrolmentId!, { skip: !enrolmentId });
  const unit = contentResponse?.data.units.find((item) => item.id === unitId);

  const { data: writtenResponse, isLoading: isLoadingWritten } =
    useGetTrainerWrittenAssignmentQuery(
      { enrolmentId: enrolmentId!, unitId: unitId! },
      { skip: !enrolmentId || !unitId || !unit?.has_written_assignment },
    );

  const { data: evidenceResponse, isLoading: isLoadingEvidence } =
    useGetTrainerEvidenceSubmissionsQuery(
      { enrolmentId: enrolmentId!, unitId: unitId! },
      { skip: !enrolmentId || !unitId || !unit?.requires_evidence },
    );

  const { data: quizAttemptsData, isLoading: isLoadingQuiz } = useGetUnitAttemptsQuery(
    {
      unitId: unitId!,
      learnerId: enrolmentId!,
    },
    { skip: !unitId || !enrolmentId || !unit?.has_quiz },
  );

  const [reviewWritten, { isLoading: isSavingWritten }] = useReviewTrainerWrittenAssignmentMutation();
  const [reviewEvidence, { isLoading: isSavingEvidence }] = useReviewTrainerEvidenceSubmissionMutation();

  const [writtenOutcome, setWrittenOutcome] = useState<TrainerOutcome | "">("");
  const [writtenFeedback, setWrittenFeedback] = useState("");
  const [evidenceOutcome, setEvidenceOutcome] = useState<TrainerOutcome | "">("");
  const [evidenceFeedback, setEvidenceFeedback] = useState("");

  if (isLoadingContent) {
    return <div className="py-20 text-center text-muted-foreground">Loading unit...</div>;
  }

  if (isContentError || !contentResponse?.data || !unit) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground mb-4">Unit not found.</p>
        <Button asChild variant="outline" size="sm">
          <Link to="/trainer/learners">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Learners
          </Link>
        </Button>
      </div>
    );
  }

  const latestWritten = writtenResponse?.data.submissions?.[0];
  const latestEvidence = evidenceResponse?.data.submissions?.[0];

  const handleWrittenReview = async () => {
    if (!latestWritten || !writtenOutcome || !writtenFeedback.trim()) {
      toast({ title: "Written review requires outcome and feedback", variant: "destructive" });
      return;
    }

    const score = latestWritten.response_word_count ? Math.min(100, latestWritten.response_word_count) : undefined;

    try {
      await reviewWritten({
        submissionId: latestWritten.id,
        enrolmentId: enrolmentId!,
        unitId: unitId!,
        body: {
          status: writtenOutcome,
          assessor_feedback: writtenFeedback.trim(),
          assessor_score: score,
          assessor_score_max: score != null ? 100 : undefined,
          assessor_band: getBand(score),
        },
      }).unwrap();
      toast({ title: "Written assignment review submitted" });
      setWrittenOutcome("");
      setWrittenFeedback("");
    } catch {
      toast({ title: "Failed to submit written review", variant: "destructive" });
    }
  };

  const handleEvidenceReview = async () => {
    if (!latestEvidence || !evidenceOutcome || !evidenceFeedback.trim()) {
      toast({ title: "Evidence review requires outcome and feedback", variant: "destructive" });
      return;
    }

    const score = latestEvidence.evidence_items.length ? Math.min(100, latestEvidence.evidence_items.length * 20) : undefined;

    try {
      await reviewEvidence({
        submissionId: latestEvidence.id,
        enrolmentId: enrolmentId!,
        unitId: unitId!,
        body: {
          status: evidenceOutcome,
          assessor_feedback: evidenceFeedback.trim(),
          assessor_score: score,
          assessor_score_max: score != null ? 100 : undefined,
          assessor_band: getBand(score),
        },
      }).unwrap();
      toast({ title: "Evidence review submitted" });
      setEvidenceOutcome("");
      setEvidenceFeedback("");
    } catch {
      toast({ title: "Failed to submit evidence review", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <Link
        to={`/trainer/learner/${enrolmentId}`}
        className="inline-flex items-center gap-1.5 text-primary hover:underline text-sm"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Learner
      </Link>

      <Card className="p-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold text-foreground">{unit.title}</h1>
          <p className="text-sm text-muted-foreground">
            {unit.unit_code} · {contentResponse.data.qualification.title}
          </p>
          <div className="flex flex-wrap gap-2 pt-2">
            {unit.has_quiz && <Badge variant="outline">Quiz</Badge>}
            {unit.has_written_assignment && <Badge variant="outline">Written Assignment</Badge>}
            {unit.requires_evidence && <Badge variant="outline">Evidence Portfolio</Badge>}
          </div>
        </div>
      </Card>

      {unit.has_quiz && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-foreground">Quiz Attempts</h2>
          </div>
          {isLoadingQuiz ? (
            <div className="text-sm text-muted-foreground">Loading quiz attempts...</div>
          ) : quizAttemptsData?.data?.length ? (
            <div className="space-y-3">
              {quizAttemptsData.data.map((attempt) => (
                <div key={attempt.id} className="rounded-lg border p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-sm">Attempt {quizAttemptsData.data.indexOf(attempt) + 1}</p>
                      <p className="text-xs text-muted-foreground">
                        Submitted {attempt.submitted_at ? new Date(attempt.submitted_at).toLocaleDateString() : "N/A"}
                      </p>
                    </div>
                    <Badge variant="secondary">
                      {attempt.score_percent != null ? `${Math.round(Number(attempt.score_percent))}%` : attempt.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">No quiz attempts found.</div>
          )}
        </Card>
      )}

      {unit.has_written_assignment && (
        <SubmissionReviewCard
          title="Written Assignment"
          status={latestWritten?.status || "not_submitted"}
          submittedAt={latestWritten?.submitted_at || new Date().toISOString()}
        >
          {isLoadingWritten ? (
            <div className="text-sm text-muted-foreground">Loading written submissions...</div>
          ) : latestWritten ? (
            <div className="space-y-4">
              <div className="rounded-lg border p-4">
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: latestWritten.response_html || "<p>No response provided.</p>" }}
                />
              </div>
              <div className="text-sm text-muted-foreground">
                Word count: {latestWritten.response_word_count}
              </div>
              <div className="space-y-3">
                <div className="grid gap-2 md:grid-cols-3">
                  {outcomeOptions.map((option) => (
                    <Button
                      key={option.value}
                      type="button"
                      variant={writtenOutcome === option.value ? "default" : "outline"}
                      className="h-auto whitespace-normal py-3"
                      onClick={() => setWrittenOutcome(option.value)}
                    >
                      <span className="text-left">
                        <span className="block font-semibold">{option.label}</span>
                        <span className="block text-xs opacity-80">{option.description}</span>
                      </span>
                    </Button>
                  ))}
                </div>
                <Textarea
                  value={writtenFeedback}
                  onChange={(event) => setWrittenFeedback(event.target.value)}
                    placeholder="Provide trainer feedback for the learner"
                  className="min-h-[120px]"
                />
                <Button onClick={handleWrittenReview} disabled={isSavingWritten}>
                  {isSavingWritten ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  Submit Written Review
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">No written submission found.</div>
          )}
        </SubmissionReviewCard>
      )}

      {unit.requires_evidence && (
        <SubmissionReviewCard
          title="Evidence Portfolio"
          status={latestEvidence?.status || "not_submitted"}
          submittedAt={latestEvidence?.submitted_at || new Date().toISOString()}
        >
          {isLoadingEvidence ? (
            <div className="text-sm text-muted-foreground">Loading evidence submissions...</div>
          ) : latestEvidence ? (
            <div className="space-y-4">
              <div className="space-y-3">
                {latestEvidence.evidence_items.map((item) => (
                  <div key={item.id} className="rounded-lg border p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Upload className="w-4 h-4 text-primary" />
                          <p className="font-medium text-sm">{item.title}</p>
                        </div>
                        <p className="text-sm text-muted-foreground">{item.description || "No description provided."}</p>
                        {!!item.criteria?.length && (
                          <div className="flex flex-wrap gap-2 pt-1">
                            {item.criteria.map((criterion) => (
                              <Badge key={`${item.id}-${criterion.code}`} variant="outline">
                                {criterion.code}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <Button asChild size="sm" variant="outline">
                        <a href={item.file} target="_blank" rel="noreferrer">
                          <Download className="w-4 h-4 mr-2" />
                          Open
                        </a>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                <div className="grid gap-2 md:grid-cols-3">
                  {outcomeOptions.map((option) => (
                    <Button
                      key={option.value}
                      type="button"
                      variant={evidenceOutcome === option.value ? "default" : "outline"}
                      className="h-auto whitespace-normal py-3"
                      onClick={() => setEvidenceOutcome(option.value)}
                    >
                      <span className="text-left">
                        <span className="block font-semibold">{option.label}</span>
                        <span className="block text-xs opacity-80">{option.description}</span>
                      </span>
                    </Button>
                  ))}
                </div>
                <Textarea
                  value={evidenceFeedback}
                  onChange={(event) => setEvidenceFeedback(event.target.value)}
                  placeholder="Provide trainer feedback for the evidence portfolio"
                  className="min-h-[120px]"
                />
                <Button onClick={handleEvidenceReview} disabled={isSavingEvidence}>
                  {isSavingEvidence ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  Submit Evidence Review
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">No evidence submission found.</div>
          )}
        </SubmissionReviewCard>
      )}

      {!unit.has_quiz && !unit.has_written_assignment && !unit.requires_evidence && (
        <Card className="p-6 text-center text-muted-foreground">
          No assessment components are configured for this unit.
        </Card>
      )}
    </div>
  );
};

export default UnitManagement;
