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
  Trophy,
  AlertCircle,
} from "lucide-react";
import ResourceSection from "@/components/shared/ResourceSection";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useGetUnitAttemptsQuery } from "@/redux/apis/quiz/quizApi";
import type {
  LearnerEvidenceSubmission,
  LearnerWrittenAssignmentSubmission,
} from "@/types/enrollment.types";
import {
  useGetTrainerEnrolmentContentQuery,
  useGetTrainerEvidenceSubmissionsQuery,
  useGetTrainerWrittenAssignmentQuery,
  useReviewTrainerEvidenceSubmissionMutation,
  useReviewTrainerWrittenAssignmentMutation,
  useGetTrainerUnitResourcesQuery,
} from "@/redux/apis/trainer/trainerReviewApi";

type TrainerOutcome = "competent" | "resubmit" | "not_competent";
type TrainerSubmission = LearnerWrittenAssignmentSubmission | LearnerEvidenceSubmission;

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

function getTrainerActionNotice(submission?: TrainerSubmission) {
  if (!submission) return null;

  if (submission.iqa_decision === "changes_required") {
    return {
      title: "IQA Requested Changes",
      description:
        submission.iqa_review_notes ||
        "IQA sent this submission back. The learner must revise and resubmit before you can reassess it.",
    };
  }

  if (submission.iqa_decision === "referred_back") {
    return {
      title: "IQA Referred Back",
      description:
        submission.iqa_review_notes ||
        "IQA referred this submission back. The learner must improve the work and resubmit before you can reassess it.",
    };
  }

  if (submission.status === "resubmit") {
    return {
      title: "Awaiting Learner Resubmission",
      description:
        submission.assessor_feedback ||
        "You requested a resubmission. There is no new trainer action until the learner submits revised work.",
    };
  }

  if (submission.status === "not_competent") {
    return {
      title: "Awaiting Learner Improvement",
      description:
        submission.assessor_feedback ||
        "This submission was marked not yet competent. The learner must improve the work and submit again.",
    };
  }

  return null;
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
        <Badge
          variant="secondary"
          className={`capitalize ${status === "competent"
            ? "bg-green-100 text-green-700 border-green-200"
            : status === "resubmit"
              ? "bg-amber-100 text-amber-700 border-amber-200"
              : status === "not_competent"
                ? "bg-red-100 text-red-700 border-red-200"
                : ""
            }`}
        >
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
      enrolmentId: enrolmentId!,
    },
    { skip: !unitId || !enrolmentId || !unit?.has_quiz },
  );

  const { data: resourcesResponse } = useGetTrainerUnitResourcesQuery(
    { enrolmentId: enrolmentId!, unitId: unitId! },
    { skip: !enrolmentId || !unitId }
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
  const latestActionNotice =
    getTrainerActionNotice(latestWritten) || getTrainerActionNotice(latestEvidence);

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


  console.log({ latestEvidence: latestEvidence?.status })
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

      {latestActionNotice && (
        <Card className="p-6 border-orange-500/20 bg-orange-500/5">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-orange-500/10 p-2.5">
              <AlertCircle className="w-4 h-4 text-orange-600" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">{latestActionNotice.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{latestActionNotice.description}</p>
            </div>
          </div>
        </Card>
      )}

<ResourceSection resources={resourcesResponse?.data || []} />

      {unit.has_quiz && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-foreground">Quiz Attempts</h2>
          </div>
          {isLoadingQuiz ? (
            <div className="text-sm text-muted-foreground">Loading quiz attempts...</div>
          ) : (quizAttemptsData?.data?.attempts?.length || quizAttemptsData?.data?.best_attempt) ? (
            <div className="grid gap-4">
              {(quizAttemptsData.data.attempts || []).map((attempt) => {
                const isPass = attempt.passed;
                return (
                  <div
                    key={attempt.id}
                    className={`rounded-xl border p-5 transition-all hover:shadow-md ${isPass ? "bg-green-50/30 border-green-100" : "bg-red-50/30 border-red-100"
                      }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div
                          className={`p-3 rounded-full ${isPass ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                            }`}
                        >
                          {isPass ? <Trophy className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="font-bold text-base text-foreground">
                            {isPass ? "Successful Attempt" : "Unsuccessful Attempt"}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                            <p className="text-xs text-muted-foreground font-medium">
                              {attempt.submitted_at
                                ? new Date(attempt.submitted_at).toLocaleDateString(undefined, {
                                  dateStyle: "long",
                                })
                                : "N/A"}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex flex-col items-end">
                          <span
                            className={`text-2xl font-black ${isPass ? "text-green-600" : "text-red-600"
                              }`}
                          >
                            {attempt.score_percent != null
                              ? `${Math.round(Number(attempt.score_percent))}%`
                              : attempt.status}
                          </span>
                          <Badge
                            variant={isPass ? "default" : "destructive"}
                            className={`mt-1 font-bold ${isPass ? "bg-green-600 hover:bg-green-700" : ""}`}
                          >
                            {isPass ? "PASSED" : "FAILED"}
                          </Badge>
                          {attempt.score_summary_text && (
                            <p className="text-[11px] font-semibold text-muted-foreground mt-1.5 uppercase tracking-wider">
                              {attempt.score_summary_text}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              {!quizAttemptsData.data.attempts?.length && quizAttemptsData.data.best_attempt && (() => {
                const attempt = quizAttemptsData.data.best_attempt;
                const isPass = attempt.passed;
                return (
                  <div
                    key={attempt.id}
                    className={`rounded-xl border p-6 transition-all hover:shadow-md ${isPass ? "bg-green-50/30 border-green-100" : "bg-red-50/30 border-red-100"
                      }`}
                  >
                    <div className="flex items-center justify-between gap-6">
                      <div className="flex items-center gap-5">
                        <div
                          className={`p-4 rounded-2xl shadow-sm ${isPass ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                            }`}
                        >
                          {isPass ? <Trophy className="w-7 h-7" /> : <AlertCircle className="w-7 h-7" />}
                        </div>
                        <div>
                          <h4 className="font-extrabold text-xl text-foreground tracking-tight">Best Performance</h4>
                          <div className="flex items-center gap-2.5 mt-2">
                            <Clock className="w-4 h-4 text-muted-foreground/70" />
                            <p className="text-sm font-semibold text-muted-foreground">
                              {attempt.submitted_at
                                ? new Date(attempt.submitted_at).toLocaleDateString(undefined, {
                                  dateStyle: "medium",
                                })
                                : "N/A"}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end">
                        <span
                          className={`text-4xl font-black tracking-tighter leading-none ${isPass ? "text-green-600" : "text-red-600"
                            }`}
                        >
                          {attempt.score_percent != null
                            ? `${Math.round(Number(attempt.score_percent))}%`
                            : attempt.status}
                        </span>
                        <div className="flex items-center gap-2 mt-3">
                          <Badge
                            className={`font-black px-4 py-1 text-xs shadow-sm uppercase tracking-widest ${isPass ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
                              } text-white border-none`}
                          >
                            {isPass ? "PASSED" : "FAILED"}
                          </Badge>
                        </div>
                        {attempt.score_summary_text && (
                          <p className="text-[11px] font-bold text-muted-foreground mt-2 uppercase tracking-tight">
                            {attempt.score_summary_text}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}
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
              {latestWritten?.status === "pending" ? (
                <div className="space-y-3">
                  <div className="grid gap-2 md:grid-cols-3">
                    {outcomeOptions.map((option) => (
                      <Button
                        key={option.value}
                        type="button"
                        variant={writtenOutcome === option.value ? "default" : "outline"}
                        className={`h-auto whitespace-normal py-3 px-4 flex flex-col items-start text-left transition-all ${writtenOutcome === option.value
                          ? option.value === "competent"
                            ? "bg-green-600 hover:bg-green-700 text-white border-green-600 shadow-sm"
                            : option.value === "resubmit"
                              ? "bg-amber-500 hover:bg-amber-600 text-white border-amber-500 shadow-sm"
                              : "bg-red-600 hover:bg-red-700 text-white border-red-600 shadow-sm"
                          : "hover:bg-muted/50"
                          }`}
                        onClick={() => setWrittenOutcome(option.value)}
                      >
                        <span className="block font-bold mb-1">{option.label}</span>
                        <span className={`block text-[10px] leading-tight opacity-90 ${writtenOutcome === option.value ? "text-white/90" : "text-muted-foreground"}`}>
                          {option.description}
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
              ) : (
                <div className="mt-4 p-4 rounded-xl bg-muted/30 border border-border/50">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    <h4 className="font-bold text-sm">Trainer Feedback</h4>
                  </div>
                  <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
                    {latestWritten.assessor_feedback || "No feedback provided."}
                  </p>
                  {(latestWritten.assessor_score !== null || latestWritten.assessor_band) && (
                    <div className="mt-4 pt-4 border-t flex flex-wrap gap-4">
                      {latestWritten.assessor_score !== null && (
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Score</p>
                          <p className="text-sm font-bold">{latestWritten.assessor_score} / {latestWritten.assessor_score_max || 100}</p>
                        </div>
                      )}
                      {latestWritten.assessor_band && (
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Band</p>
                          <Badge variant="outline" className="mt-0.5 capitalize">{latestWritten.assessor_band}</Badge>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
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
              {latestEvidence?.status === "pending" ? (
                <div className="space-y-3">
                  <div className="grid gap-2 md:grid-cols-3">
                    {outcomeOptions.map((option) => (
                      <Button
                        key={option.value}
                        type="button"
                        variant={evidenceOutcome === option.value ? "default" : "outline"}
                        className={`h-auto whitespace-normal py-3 px-4 flex flex-col items-start text-left transition-all ${evidenceOutcome === option.value
                          ? option.value === "competent"
                            ? "bg-green-600 hover:bg-green-700 text-white border-green-600 shadow-sm"
                            : option.value === "resubmit"
                              ? "bg-amber-500 hover:bg-amber-600 text-white border-amber-500 shadow-sm"
                              : "bg-red-600 hover:bg-red-700 text-white border-red-600 shadow-sm"
                          : "hover:bg-muted/50"
                          }`}
                        onClick={() => setEvidenceOutcome(option.value)}
                      >
                        <span className="block font-bold mb-1">{option.label}</span>
                        <span className={`block text-[10px] leading-tight opacity-90 ${evidenceOutcome === option.value ? "text-white/90" : "text-muted-foreground"}`}>
                          {option.description}
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
              ) : (
                <div className="mt-4 p-4 rounded-xl bg-muted/30 border border-border/50">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    <h4 className="font-bold text-sm">Trainer Feedback</h4>
                  </div>
                  <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
                    {latestEvidence.assessor_feedback || "No feedback provided."}
                  </p>
                  {(latestEvidence.assessor_score !== null || latestEvidence.assessor_band) && (
                    <div className="mt-4 pt-4 border-t flex flex-wrap gap-4">
                      {latestEvidence.assessor_score !== null && (
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Score</p>
                          <p className="text-sm font-bold">{latestEvidence.assessor_score} / {latestEvidence.assessor_score_max || 100}</p>
                        </div>
                      )}
                      {latestEvidence.assessor_band && (
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Band</p>
                          <Badge variant="outline" className="mt-0.5 capitalize">{latestEvidence.assessor_band}</Badge>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
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
