import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowLeft, FileText } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useGetTrainerDashboardQuery } from "@/redux/apis/trainer/trainerReviewApi";

const AssessmentReview = () => {
  const { id } = useParams();
  const { data, isLoading, isError } = useGetTrainerDashboardQuery();

  if (isLoading) {
    return <div className="py-20 text-center text-muted-foreground">Loading submission...</div>;
  }

  if (isError || !data?.data) {
    return <div className="py-20 text-center text-muted-foreground">Failed to load submission.</div>;
  }

  const submission = data.data.pending_submissions.find((item) => item.id === id);

  if (submission) {
    return <Navigate to={`/trainer/learner/${submission.enrolment_id}/unit/${submission.unit.id}`} replace />;
  }

  return (
    <div className="space-y-6">
      <Link
        to="/trainer/dashboard"
        className="inline-flex items-center gap-2 text-primary hover:underline text-sm font-medium"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <Card className="p-8 text-center">
        <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
        <h1 className="text-xl font-bold text-foreground mb-2">Submission review route updated</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Trainer review now happens from the learner unit management screen.
        </p>
        <Button asChild>
          <Link to="/trainer/dashboard">Go to Trainer Dashboard</Link>
        </Button>
      </Card>
    </div>
  );
};

export default AssessmentReview;
