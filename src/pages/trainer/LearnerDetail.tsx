import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  GraduationCap,
  Mail,
  TrendingUp,
  User,
  XCircle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGetTrainerEnrolmentContentQuery } from "@/redux/apis/trainer/trainerReviewApi";

const statusConfig: Record<string, { className: string; icon: typeof CheckCircle }> = {
  competent: { className: "bg-green-600 text-white", icon: CheckCircle },
  completed: { className: "bg-green-600 text-white", icon: CheckCircle },
  pending: { className: "bg-secondary text-secondary-foreground", icon: Clock },
  trainer_approved: { className: "bg-green-600 text-white", icon: CheckCircle },
  iqa_review: { className: "bg-blue-600 text-white", icon: Clock },
  in_progress: { className: "bg-secondary text-secondary-foreground", icon: Clock },
  resubmit: { className: "bg-destructive text-destructive-foreground", icon: Clock },
  not_competent: { className: "bg-muted text-muted-foreground", icon: XCircle },
  not_started: { className: "bg-muted text-muted-foreground", icon: XCircle },
};

function getUnitBadge(unit: {
  has_quiz: boolean;
  has_written_assignment: boolean;
  requires_evidence: boolean;
  progress: { status: string; competency_status?: string | null } | null;
}) {
  const key =
    unit.progress?.competency_status ||
    unit.progress?.status ||
    "not_started";

  if (key === "pending") {
    return { ...statusConfig.pending, label: "Awaiting Assessment" };
  }
  if (key === "iqa_review") {
    return { ...statusConfig.iqa_review, label: "Awaiting IQA" };
  }
  if (key === "resubmit") {
    return { ...statusConfig.resubmit, label: "Resubmission Required" };
  }
  if (key === "not_competent") {
    return {
      className: "bg-orange-500 text-white",
      icon: XCircle,
      label: "Not Yet Competent",
    };
  }
  if (key === "trainer_approved") {
    return { ...statusConfig.trainer_approved, label: "Completed" };
  }
  if (key === "competent" || key === "completed") {
    return { ...statusConfig.completed, label: "Competent" };
  }
  if (key === "in_progress") {
    return { ...statusConfig.in_progress, label: "In Progress" };
  }
  if (key === "not_started") {
    return { ...statusConfig.not_started, label: "Not Started" };
  }

  return { ...(statusConfig[key] || statusConfig.not_started), label: "Not Started" };
}

function getOverallProgress(units: Array<{ progress: { status: string } | null }>) {
  const totalUnits = units.length;
  const completedUnits = units.filter((unit) => unit.progress?.status === "completed").length;
  return {
    totalUnits,
    completedUnits,
    progressPercent: totalUnits ? Math.round((completedUnits / totalUnits) * 100) : 0,
  };
}

const LearnerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, isError } = useGetTrainerEnrolmentContentQuery(id!, {
    skip: !id,
  });

  if (isLoading) {
    return <div className="py-20 text-center text-muted-foreground">Loading learner...</div>;
  }

  if (isError || !data?.data) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Learner not found.</p>
        <Link to="/trainer/learners" className="text-primary underline mt-2 inline-block">
          Back to Learners
        </Link>
      </div>
    );
  }

  const enrolment = data.data;
  const progress = getOverallProgress(enrolment.units);

  return (
    <div>
      <Link
        to="/trainer/learners"
        className="inline-flex items-center gap-1.5 text-primary hover:underline text-sm mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Assigned Learners
      </Link>

      <Card className="bg-primary text-primary-foreground p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
            <User className="w-8 h-8 text-secondary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{enrolment.learner.name}</h1>
            <p className="text-primary-foreground/80">
              Learner ID: {enrolment.learner.qualification_learner_id || "N/A"}
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-start gap-3">
            <Mail className="w-4 h-4 mt-0.5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Qualification</p>
              <p className="text-sm font-medium text-primary">{enrolment.qualification.title}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Calendar className="w-4 h-4 mt-0.5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Enrolled</p>
              <p className="text-sm font-medium text-primary">
                {new Date(enrolment.enrolled_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Clock className="w-4 h-4 mt-0.5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Status</p>
              <p className="text-sm font-medium text-primary capitalize">{enrolment.status}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <GraduationCap className="w-4 h-4 mt-0.5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Payment</p>
              <p className="text-sm font-medium text-primary capitalize">{enrolment.payment_status}</p>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <GraduationCap className="w-5 h-5 text-muted-foreground" />
          <h2 className="font-semibold text-foreground">{enrolment.qualification.title}</h2>
        </div>
        <div className="flex items-center gap-4">
          <Progress value={progress.progressPercent} className="flex-1 h-3" />
          <div className="flex items-center gap-1.5 text-sm font-semibold text-primary">
            <TrendingUp className="w-4 h-4" />
            {progress.progressPercent}%
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          {progress.completedUnits} of {progress.totalUnits} units completed
        </p>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-bold text-primary mb-1">Unit Progress</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Detailed breakdown of qualification units
        </p>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Unit Code</TableHead>
              <TableHead>Unit Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Completed Date</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {enrolment.units.map((unit) => {
              const config = getUnitBadge(unit);
              const Icon = config.icon;
              const actionLabel =
                unit.has_quiz || unit.has_written_assignment || unit.requires_evidence
                  ? "Manage"
                  : "View";
              return (
                <TableRow
                  key={unit.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => navigate(`/trainer/learner/${id}/unit/${unit.id}`)}
                >
                  <TableCell className="font-medium text-primary">{unit.unit_code}</TableCell>
                  <TableCell className="text-sm">{unit.title}</TableCell>
                  <TableCell>
                    <Badge className={`${config.className} text-xs gap-1`}>
                      <Icon className="w-3 h-3" />
                      {config.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {unit.progress?.completed_at
                      ? new Date(unit.progress.completed_at).toLocaleDateString()
                      : "—"}
                  </TableCell>
                  <TableCell>
                    <Link
                      to={`/trainer/learner/${id}/unit/${unit.id}`}
                      className="text-primary hover:underline text-xs font-medium"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {actionLabel}
                    </Link>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default LearnerDetail;
