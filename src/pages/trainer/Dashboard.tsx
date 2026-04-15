import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Clock,
  CheckCircle,
  Eye,
  FileText,
  ShieldAlert,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import TablePagination from "@/components/admin/TablePagination";
import {
  type TrainerNotification,
  useGetTrainerDashboardQuery,
  useGetTrainerNotificationsQuery,
} from "@/redux/apis/trainer/trainerReviewApi";
import IQANotificationsPanel from "@/components/trainer/IQANotificationsPanel";
import {
  getIqaDecisionLabel,
  getSubmissionOutcomeLabel,
  getSubmissionTypeLabel,
} from "@/lib/iqaStatus";

const ITEMS_PER_PAGE = 10;

const outcomeColors: Record<string, string> = {
  competent: "bg-green-600 text-white",
  resubmit: "bg-secondary text-secondary-foreground",
  not_competent: "bg-destructive text-destructive-foreground",
  under_review: "bg-secondary text-secondary-foreground",
  pending: "bg-secondary text-secondary-foreground",
};

const TrainerDashboard = () => {
  const [pendingPage, setPendingPage] = useState(1);
  const [learnersPage, setLearnersPage] = useState(1);
  const [recentPage, setRecentPage] = useState(1);
  const [iqaActionsPage, setIqaActionsPage] = useState(1);
  const { data, isLoading, isError } = useGetTrainerDashboardQuery();
  const {
    data: notificationsResponse,
    isLoading: isNotificationsLoading,
    isError: isNotificationsError,
  } = useGetTrainerNotificationsQuery();

  if (isLoading) {
    return <div className="py-20 text-center text-muted-foreground">Loading dashboard...</div>;
  }

  if (isError || !data?.data) {
    return <div className="py-20 text-center text-muted-foreground">Failed to load trainer dashboard.</div>;
  }

  const { summary, pending_submissions, assigned_learners, recent_assessments } = data.data;
  const notifications = notificationsResponse?.data || [];
  const actionRequiredNotifications = useMemo(
    () =>
      notifications.filter((item) =>
        ["changes_required", "referred_back"].includes(item.iqa_decision),
      ),
    [notifications],
  );

  const getActionRequiredReviewLink = (notification: TrainerNotification) =>
    `/trainer/learner/${notification.enrolment_id}/unit/${notification.unit.id}`;

  const stats = [
    {
      label: "Assigned Learners",
      value: summary.assigned_learners,
      icon: Users,
      color: "bg-primary text-primary-foreground",
    },
    {
      label: "Pending Assessments",
      value: summary.pending_assessments,
      icon: Clock,
      color: "bg-secondary text-secondary-foreground",
    },
    {
      label: "Assessed This Week",
      value: summary.assessed_this_week,
      icon: CheckCircle,
      color: "bg-green-600 text-white",
    },
    {
      label: "Action Required",
      value: summary.iqa_actions,
      icon: ShieldAlert,
      color:
        summary.iqa_actions > 0
          ? "bg-destructive text-destructive-foreground"
          : "bg-muted text-muted-foreground",
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-foreground mb-1">Assessment Dashboard</h1>
      <p className="text-muted-foreground mb-8">
        Review submissions and provide assessment outcomes
      </p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-5 flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            </div>
          </Card>
        ))}
      </div>

      <IQANotificationsPanel
        notifications={notifications}
        isLoading={isNotificationsLoading}
        isError={isNotificationsError}
      />

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">Pending Submissions</TabsTrigger>
          <TabsTrigger value="iqa-actions">
            IQA Action Required
            {actionRequiredNotifications.length > 0 ? ` (${actionRequiredNotifications.length})` : ""}
          </TabsTrigger>
          <TabsTrigger value="learners">Assigned Learners</TabsTrigger>
          <TabsTrigger value="recent">Recent Assessments</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card className="p-6">
            <h2 className="text-lg font-bold text-primary mb-1">Submissions Awaiting Assessment</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Review and assess submitted learner work
            </p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Learner</TableHead>
                  <TableHead>Qualification</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Wait</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pending_submissions
                  .slice((pendingPage - 1) * ITEMS_PER_PAGE, pendingPage * ITEMS_PER_PAGE)
                  .map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell className="font-medium text-primary">
                        {submission.learner.name}
                      </TableCell>
                      <TableCell>
                        <div>{submission.qualification.title}</div>
                        <Badge className="bg-primary text-primary-foreground text-[10px] mt-0.5">
                          {submission.qualification.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {submission.unit.unit_code}: {submission.unit.title}
                      </TableCell>
                      <TableCell className="text-sm capitalize">
                        {getSubmissionTypeLabel(submission.submission_type)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(submission.submitted_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`${submission.days_waiting >= 4
                              ? "bg-destructive"
                              : submission.days_waiting >= 3
                                ? "bg-secondary"
                                : "bg-green-600"
                            } text-white text-xs`}
                        >
                          {submission.days_waiting}d
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Link
                          to={`/trainer/learner/${submission.enrolment_id}/unit/${submission.unit.id}`}
                          className="inline-flex items-center px-3 py-1.5 bg-secondary text-secondary-foreground text-xs font-semibold rounded-md hover:opacity-90 transition-opacity"
                        >
                          Review
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
            <TablePagination
              currentPage={pendingPage}
              totalItems={pending_submissions.length}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={setPendingPage}
            />
          </Card>
        </TabsContent>

        <TabsContent value="iqa-actions">
          <Card className="p-6">
            <h2 className="text-lg font-bold text-primary mb-1">IQA Action Required</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Returned IQA decisions that need assessor follow-up
            </p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Learner</TableHead>
                  <TableHead>Qualification</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>IQA Outcome</TableHead>
                  <TableHead>Reviewed</TableHead>
                  <TableHead>IQA Note</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {actionRequiredNotifications.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="py-10 text-center text-sm text-muted-foreground"
                    >
                      No IQA follow-up actions are currently assigned to you.
                    </TableCell>
                  </TableRow>
                ) : (
                  actionRequiredNotifications
                    .slice(
                      (iqaActionsPage - 1) * ITEMS_PER_PAGE,
                      iqaActionsPage * ITEMS_PER_PAGE,
                    )
                    .map((notification) => (
                      <TableRow key={notification.id}>
                        <TableCell className="font-medium text-primary">
                          {notification.learner.name}
                        </TableCell>
                        <TableCell className="text-sm">
                          {notification.qualification.title}
                        </TableCell>
                        <TableCell className="text-sm">
                          {notification.unit.unit_code}: {notification.unit.title}
                        </TableCell>
                        <TableCell>
                          <Badge variant="destructive" className="text-xs">
                            {getIqaDecisionLabel(notification.iqa_decision)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {notification.iqa_reviewed_at
                            ? new Date(notification.iqa_reviewed_at).toLocaleDateString()
                            : "—"}
                        </TableCell>
                        <TableCell className="max-w-[320px] text-sm text-muted-foreground">
                          <div className="line-clamp-3">
                            {notification.iqa_review_notes || "No IQA notes provided."}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Link
                            to={getActionRequiredReviewLink(notification)}
                            className="inline-flex items-center px-3 py-1.5 bg-destructive text-destructive-foreground text-xs font-semibold rounded-md hover:opacity-90 transition-opacity"
                          >
                            Review Action
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
            <TablePagination
              currentPage={iqaActionsPage}
              totalItems={actionRequiredNotifications.length}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={setIqaActionsPage}
            />
          </Card>
        </TabsContent>

        <TabsContent value="learners">
          <Card className="p-6">
            <h2 className="text-lg font-bold text-primary mb-1">Assigned Learners</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Monitor progress of learners in your cohort
            </p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Learner Name</TableHead>
                  <TableHead>Qualification</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Pending</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assigned_learners
                  .slice((learnersPage - 1) * ITEMS_PER_PAGE, learnersPage * ITEMS_PER_PAGE)
                  .map((learner) => (
                    <TableRow key={learner.id}>
                      <TableCell className="font-medium text-primary">
                        {learner.learner.name}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{learner.qualification.title}</div>
                        <Badge className="bg-primary text-primary-foreground text-[10px] mt-0.5">
                          {learner.qualification.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {learner.progress.completed_units}/{learner.progress.total_units} (
                        {learner.progress.progress_percent}%)
                      </TableCell>
                      <TableCell>
                        {learner.pending_count > 0 ? (
                          <Badge className="bg-secondary text-secondary-foreground text-xs">
                            {learner.pending_count}
                          </Badge>
                        ) : (
                          <span className="text-sm text-muted-foreground">None</span>
                        )}
                      </TableCell>
                      <TableCell>{learner?.email}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="icon" className="h-8 w-8" asChild>
                          <Link to={`/trainer/learner/${learner.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
            <TablePagination
              currentPage={learnersPage}
              totalItems={assigned_learners.length}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={setLearnersPage}
            />
          </Card>
        </TabsContent>

        <TabsContent value="recent">
          <Card className="p-6">
            <h2 className="text-lg font-bold text-primary mb-1">Recent Assessments</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Your recently completed assessments
            </p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Learner</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Outcome</TableHead>
                  <TableHead>Assessed Date</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recent_assessments
                  .slice((recentPage - 1) * ITEMS_PER_PAGE, recentPage * ITEMS_PER_PAGE)
                  .map((assessment) => (
                    <TableRow key={assessment.id}>
                      <TableCell className="font-medium text-primary">
                        {assessment.learner.name}
                      </TableCell>
                      <TableCell className="text-sm">
                        {assessment.unit.unit_code}: {assessment.unit.title}
                      </TableCell>
                      <TableCell className="text-sm capitalize">
                        {getSubmissionTypeLabel(assessment.submission_type)}
                      </TableCell>
                      <TableCell>
                        <Badge className={outcomeColors[assessment.status] || "bg-muted text-muted-foreground"}>
                          {getSubmissionOutcomeLabel(assessment.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {assessment.assessed_at
                          ? new Date(assessment.assessed_at).toLocaleDateString()
                          : "—"}
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="icon" className="h-8 w-8" asChild>
                          <Link to={`/trainer/learner/${assessment.enrolment_id}/unit/${assessment.unit.id}`}>
                            <FileText className="h-4 w-4" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
            <TablePagination
              currentPage={recentPage}
              totalItems={recent_assessments.length}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={setRecentPage}
            />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TrainerDashboard;
