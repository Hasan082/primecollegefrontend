import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  User,
  GraduationCap,
  Calendar,
  CheckCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useGetTrainerSubmissionRecordQuery } from "@/redux/apis/trainer/trainerReviewApi";
import {
  getIqaDecisionLabel,
  getSubmissionOutcomeLabel,
  getSubmissionTypeLabel,
} from "@/lib/iqaStatus";

const outcomeColors: Record<string, string> = {
  competent: "bg-green-600 text-white",
  resubmit: "bg-secondary text-secondary-foreground",
  not_competent: "bg-destructive text-destructive-foreground",
};

const AssessmentRecord = () => {
  const { id } = useParams();
  const { data, isLoading, isError } = useGetTrainerSubmissionRecordQuery(id!, {
    skip: !id,
  });

  if (isLoading) {
    return <div className="py-20 text-center text-muted-foreground">Loading assessment record...</div>;
  }

  if (isError || !data?.data) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Assessment record not found.</p>
        <Link to="/trainer/dashboard" className="text-primary underline mt-2 inline-block">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const record = data.data;

  return (
    <div>
      <Link
        to="/trainer/history"
        className="inline-flex items-center gap-1.5 text-primary hover:underline text-sm mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Assessment History
      </Link>

      <Card className="bg-primary text-primary-foreground p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center">
              <FileText className="w-7 h-7 text-secondary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Assessment Record</h1>
              <p className="text-primary-foreground/80">
                {record.unit_data.unit_code}: {record.unit_data.title}
              </p>
            </div>
          </div>
          <Badge
            className={`${outcomeColors[record.status] || "bg-muted text-muted-foreground"} text-sm px-4 py-1.5 flex items-center gap-1.5`}
          >
            <CheckCircle className="w-4 h-4" />
            {getSubmissionOutcomeLabel(record.status)}
          </Badge>
        </div>
      </Card>

      <Card className="p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
          <div className="flex items-start gap-3">
            <User className="w-4 h-4 mt-0.5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Learner</p>
              <p className="font-semibold text-primary">{record.learner.name}</p>
              <p className="text-xs text-muted-foreground">{record.learner.qualification_learner_id}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <GraduationCap className="w-4 h-4 mt-0.5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Qualification</p>
              <p className="font-semibold text-primary">{record.qualification.title}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Calendar className="w-4 h-4 mt-0.5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Assessed By</p>
              <p className="font-semibold text-primary">{record.assessor?.name || "N/A"}</p>
              <p className="text-xs text-muted-foreground">
                {record.outcome_set_at ? new Date(record.outcome_set_at).toLocaleDateString() : "—"}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Calendar className="w-4 h-4 mt-0.5 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Submitted Date</p>
            <p className="font-semibold text-primary">
              {new Date(record.submitted_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6 mb-6">
        <h2 className="text-lg font-bold text-primary mb-1">Trainer Feedback</h2>
        <p className="text-sm text-muted-foreground mb-6">Outcome and feedback recorded by trainer</p>

        <div className="space-y-3">
          <div className="rounded-xl p-4 bg-muted/30 border">
            <p className="text-sm text-muted-foreground mb-1">Submission Type</p>
            <p className="font-semibold text-primary capitalize">
              {getSubmissionTypeLabel(record.submission_type)}
            </p>
          </div>
          <div className="rounded-xl p-4 bg-muted/30 border">
            <p className="text-sm text-muted-foreground mb-1">Score</p>
            <p className="font-semibold text-primary">
              {record.assessor_score != null && record.assessor_score_max != null
                ? `${record.assessor_score}/${record.assessor_score_max}`
                : "—"}
            </p>
          </div>
          <div className="rounded-xl p-4 bg-muted/30 border">
            <p className="text-sm text-muted-foreground mb-1">Band</p>
            <p className="font-semibold text-primary">
              {record.assessor_band ? record.assessor_band.replace(/_/g, " ") : "—"}
            </p>
          </div>
          <div className="rounded-xl p-4 bg-muted/30 border">
            <p className="text-sm text-muted-foreground mb-1">Feedback</p>
            <p className="font-semibold text-primary whitespace-pre-wrap">
              {record.assessor_feedback || "No trainer feedback recorded."}
            </p>
          </div>
        </div>
      </Card>

      {(record.iqa_decision || record.iqa_review_notes) && (
        <Card className="p-6">
          <h2 className="text-lg font-bold text-primary mb-1">IQA Review</h2>
          <p className="text-sm text-muted-foreground mb-6">Most recent IQA review information</p>

          <div className="space-y-3">
            <div className="rounded-xl p-4 bg-muted/30 border">
              <p className="text-sm text-muted-foreground mb-1">IQA Decision</p>
              <p className="font-semibold text-primary">
                {getIqaDecisionLabel(record.iqa_decision)}
              </p>
            </div>
            <div className="rounded-xl p-4 bg-muted/30 border">
              <p className="text-sm text-muted-foreground mb-1">IQA Notes</p>
              <p className="font-semibold text-primary whitespace-pre-wrap">
                {record.iqa_review_notes || "No IQA notes recorded."}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default AssessmentRecord;
