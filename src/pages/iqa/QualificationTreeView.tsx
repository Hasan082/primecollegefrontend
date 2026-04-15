import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  GraduationCap,
  MinusCircle,
  ShieldCheck,
  Users,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useGetIqaAssignedEnrolmentsQuery,
  useGetIqaEnrolmentContentQuery,
  useGetIqaReviewQueueQuery,
} from "@/redux/apis/iqa/iqaApi";
import type {
  IQAAssignedEnrolmentItem,
  IQAReviewQueueItem,
} from "@/types/iqa.types";
import {
  getLifecycleLabel,
  getIqaWorkflowLabel,
} from "@/lib/iqaStatus";

type FrontendUnitStatus =
  | "Not Started"
  | "In Progress"
  | "Assessed"
  | "Awaiting IQA"
  | "Signed Off"
  | "Action Required";

type FilterMode = "requires_attention" | "all" | "signed_off";

const statusConfig: Record<
  FrontendUnitStatus,
  { icon: JSX.Element; badgeClass: string }
> = {
  "Not Started": {
    icon: <Clock className="w-3.5 h-3.5" />,
    badgeClass: "bg-muted text-muted-foreground",
  },
  "In Progress": {
    icon: <Clock className="w-3.5 h-3.5 text-blue-600" />,
    badgeClass: "bg-blue-100 text-blue-700 border-blue-200",
  },
  Assessed: {
    icon: <FileText className="w-3.5 h-3.5 text-amber-600" />,
    badgeClass: "bg-amber-100 text-amber-700 border-amber-200",
  },
  "Awaiting IQA": {
    icon: <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />,
    badgeClass: "bg-purple-100 text-purple-700 border-purple-200",
  },
  "Signed Off": {
    icon: <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />,
    badgeClass: "bg-green-100 text-green-700 border-green-200",
  },
  "Action Required": {
    icon: <AlertTriangle className="w-3.5 h-3.5 text-destructive" />,
    badgeClass: "bg-destructive/10 text-destructive border-destructive/20",
  },
};

const getQueueKey = (enrolmentId: string, unitId: string) => `${enrolmentId}:${unitId}`;

const mapQueueStatusToUnitStatus = (
  queueItem?: IQAReviewQueueItem,
): FrontendUnitStatus | null => {
  if (!queueItem) {
    return null;
  }

  if (queueItem.iqa_status === "Pending IQA Review") {
    return "Awaiting IQA";
  }
  if (getIqaWorkflowLabel(queueItem.iqa_status) === "Signed Off") {
    return "Signed Off";
  }
  if (
    getIqaWorkflowLabel(queueItem.iqa_status) === "Action Required" ||
    getIqaWorkflowLabel(queueItem.iqa_status) === "Escalated"
  ) {
    return "Action Required";
  }

  return null;
};

const mapDisplayStatusToUnitStatus = (displayStatus?: string | null): FrontendUnitStatus => {
  switch (getLifecycleLabel(displayStatus)) {
    case "Awaiting IQA":
      return "Awaiting IQA";
    case "Awaiting Assessment":
      return "Assessed";
    case "Action Required":
      return "Action Required";
    case "Signed Off":
    case "Completed":
      return "Signed Off";
    case "In Progress":
      return "In Progress";
    case "Not Started":
      return "Not Started";
    default:
      return "Not Started";
  }
};

const formatDate = (value?: string | null) => {
  if (!value) {
    return "-";
  }
  return new Date(value).toLocaleDateString();
};

const buildQueueMaps = (queueItems: IQAReviewQueueItem[]) => {
  const queueByUnit = new Map<string, IQAReviewQueueItem>();
  const queueByEnrolment = new Map<
    string,
    {
      awaiting: number;
      approved: number;
      actionRequired: number;
      tracked: number;
      requiresAttention: boolean;
    }
  >();

  queueItems.forEach((item) => {
    queueByUnit.set(getQueueKey(item.enrolment_id, item.unit.id), item);

    const current = queueByEnrolment.get(item.enrolment_id) || {
      awaiting: 0,
      approved: 0,
      actionRequired: 0,
      tracked: 0,
      requiresAttention: false,
    };

    const mappedStatus = mapQueueStatusToUnitStatus(item);
    current.tracked += 1;
    if (mappedStatus === "Awaiting IQA") {
      current.awaiting += 1;
      current.requiresAttention = true;
    } else if (mappedStatus === "Signed Off") {
      current.approved += 1;
    } else if (mappedStatus === "Action Required") {
      current.actionRequired += 1;
      current.requiresAttention = true;
    }

    queueByEnrolment.set(item.enrolment_id, current);
  });

  return { queueByUnit, queueByEnrolment };
};

const UnitRow = ({
  enrolmentId,
  trainerName,
  unit,
  queueItem,
}: {
  enrolmentId: string;
  trainerName: string;
  unit: {
    id: string;
    title: string;
    unit_code: string;
    description: string;
    progress: {
      status: string;
      competency_status?: string | null;
      started_at: string | null;
      completed_at: string | null;
      quiz_passed: boolean;
      evidence_met: boolean;
      assignment_met: boolean;
    } | null;
  };
  queueItem?: IQAReviewQueueItem;
}) => {
  const unitStatus =
    mapQueueStatusToUnitStatus(queueItem) ||
    mapDisplayStatusToUnitStatus(
      unit.progress?.competency_status === "iqa_review"
        ? "Waiting for IQA review"
        : unit.progress?.status === "in_progress"
          ? "In progress"
          : unit.progress?.status === "completed"
            ? "Completed"
            : null,
    );

  const config = statusConfig[unitStatus];
  const reviewLink = queueItem?.submission_id
    ? `/iqa/review/${queueItem.submission_id}`
    : null;

  return (
    <div className="flex items-center gap-3 rounded-lg border bg-card p-3 transition-colors hover:bg-muted/30">
      {config.icon}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">
            Unit {unit.unit_code}
          </span>
          <span className="truncate text-sm text-muted-foreground">
            — {unit.title}
          </span>
        </div>
        <div className="mt-1 flex items-center gap-3 text-[11px] text-muted-foreground">
          <span>Trainer: {trainerName || "Unassigned"}</span>
          {queueItem?.submission_type ? (
            <span className="flex items-center gap-0.5">
              <FileText className="h-3 w-3" />
              {queueItem.submission_type}
            </span>
          ) : null}
          <span>
            Last:{" "}
            {formatDate(
              queueItem?.iqa_reviewed_at ||
                queueItem?.outcome_set_at ||
                queueItem?.submitted_at ||
                unit.progress?.completed_at ||
                unit.progress?.started_at,
            )}
          </span>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Badge className={`text-[10px] ${config.badgeClass}`}>{unitStatus}</Badge>
        {unitStatus === "Awaiting IQA" && reviewLink ? (
          <Button variant="default" size="sm" className="ml-1 h-7 gap-1 text-xs" asChild>
            <Link to={reviewLink}>
              <Eye className="h-3 w-3" />
              Review
            </Link>
          </Button>
        ) : null}
      </div>
    </div>
  );
};

const LearnerAccordionItem = ({
  enrolment,
  queueByUnit,
}: {
  enrolment: IQAAssignedEnrolmentItem;
  queueByUnit: Map<string, IQAReviewQueueItem>;
}) => {
  const { data: contentResponse, isLoading } = useGetIqaEnrolmentContentQuery(enrolment.id);
  const units = contentResponse?.data?.units || [];

  const overallProgress = useMemo(() => {
    if (!units.length) {
      return 0;
    }
    const completedUnits = units.filter((unit) => {
      const queueItem = queueByUnit.get(getQueueKey(enrolment.id, unit.id));
      const unitStatus =
        mapQueueStatusToUnitStatus(queueItem) || mapDisplayStatusToUnitStatus(unit.progress?.status);
        return unitStatus === "Signed Off";
    }).length;
    return Math.round((completedUnits / units.length) * 100);
  }, [enrolment.id, queueByUnit, units]);

  const learnerAwaitingIqa = units.filter((unit) => {
    const queueItem = queueByUnit.get(getQueueKey(enrolment.id, unit.id));
    return mapQueueStatusToUnitStatus(queueItem) === "Awaiting IQA";
  }).length;

  const learnerActionRequired = units.filter((unit) => {
    const queueItem = queueByUnit.get(getQueueKey(enrolment.id, unit.id));
    return mapQueueStatusToUnitStatus(queueItem) === "Action Required";
  }).length;

  return (
    <AccordionItem value={enrolment.id} className="overflow-hidden rounded-lg border">
      <AccordionTrigger className="px-4 py-3 hover:bg-muted/20 hover:no-underline">
        <div className="flex flex-1 items-center gap-3 text-left">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary">
            <Users className="h-4 w-4 text-secondary-foreground" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-foreground">
                {enrolment.learner.name}
              </span>
              <span className="text-[11px] text-muted-foreground">
                ({enrolment.learner.qualification_learner_id || "No ID"})
              </span>
            </div>
            <div className="mt-1 flex items-center gap-3">
              <Progress value={overallProgress} className="h-1.5 w-24" />
              <span className="text-[10px] text-muted-foreground">
                {overallProgress}% overall
              </span>
              {learnerAwaitingIqa > 0 ? (
                <Badge className="border-purple-200 bg-purple-100 text-[10px] text-purple-700">
                  {learnerAwaitingIqa} awaiting
                </Badge>
              ) : null}
              {learnerActionRequired > 0 ? (
                <Badge className="border-destructive/20 bg-destructive/10 text-[10px] text-destructive">
                  {learnerActionRequired} action req
                </Badge>
              ) : null}
            </div>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="space-y-2 px-4 pb-3">
        {isLoading ? (
          <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
            Loading learner units...
          </div>
        ) : units.length ? (
          units
            .slice()
            .sort((a, b) => a.order - b.order)
            .map((unit) => (
              <UnitRow
                key={unit.id}
                enrolmentId={enrolment.id}
                trainerName={enrolment.trainer?.name || ""}
                unit={unit}
                queueItem={queueByUnit.get(getQueueKey(enrolment.id, unit.id))}
              />
            ))
        ) : (
          <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
            No units available for this enrolment.
          </div>
        )}
      </AccordionContent>
    </AccordionItem>
  );
};

const QualificationTreeView = () => {
  const [filterMode, setFilterMode] = useState<FilterMode>("requires_attention");

  const { data: enrolmentsResponse, isLoading: enrolmentsLoading, isError: enrolmentsError } =
    useGetIqaAssignedEnrolmentsQuery();
  const { data: queueResponse, isLoading: queueLoading, isError: queueError } =
    useGetIqaReviewQueueQuery();

  const enrolments = enrolmentsResponse?.data?.results || [];
  const queueItems = queueResponse?.data?.results || [];
  const { queueByUnit, queueByEnrolment } = useMemo(
    () => buildQueueMaps(queueItems),
    [queueItems],
  );

  const filteredEnrolments = useMemo(() => {
    if (filterMode === "all") {
      return enrolments;
    }

    return enrolments.filter((enrolment) => {
      const stats = queueByEnrolment.get(enrolment.id);
      if (filterMode === "requires_attention") {
        return Boolean(stats?.requiresAttention);
      }
      return Boolean(stats?.approved) && !stats?.requiresAttention;
    });
  }, [enrolments, filterMode, queueByEnrolment]);

  const qualificationGroups = useMemo(() => {
    const grouped = new Map<
      string,
      {
        qualificationId: string;
        qualificationName: string;
        learnerCount: number;
        trackedCount: number;
        awaitingCount: number;
        signedOffCount: number;
        actionRequiredCount: number;
        learners: IQAAssignedEnrolmentItem[];
      }
    >();

    filteredEnrolments.forEach((enrolment) => {
      const existing = grouped.get(enrolment.qualification.id) || {
        qualificationId: enrolment.qualification.id,
        qualificationName: enrolment.qualification.title,
        learnerCount: 0,
        trackedCount: 0,
        awaitingCount: 0,
        signedOffCount: 0,
        actionRequiredCount: 0,
        learners: [],
      };
      const stats = queueByEnrolment.get(enrolment.id);

      existing.learnerCount += 1;
      existing.trackedCount += stats?.tracked || 0;
      existing.awaitingCount += stats?.awaiting || 0;
      existing.signedOffCount += stats?.approved || 0;
      existing.actionRequiredCount += stats?.actionRequired || 0;
      existing.learners.push(enrolment);

      grouped.set(enrolment.qualification.id, existing);
    });

    return Array.from(grouped.values()).sort((a, b) =>
      a.qualificationName.localeCompare(b.qualificationName),
    );
  }, [filteredEnrolments, queueByEnrolment]);

  const totalLearners = enrolmentsResponse?.data?.summary?.total_learners ?? enrolments.length;
  const awaitingIqa =
    queueItems.filter((item) => item.iqa_status === "Pending IQA Review").length;
  const approved = queueItems.filter((item) => item.iqa_decision === "approved").length;
  const actionRequired = queueItems.filter((item) =>
    ["changes_required", "referred_back"].includes(item.iqa_decision || ""),
  ).length;

  if (enrolmentsLoading || queueLoading) {
    return (
      <div className="py-20 text-center text-muted-foreground">
        Loading qualification overview...
      </div>
    );
  }

  if (enrolmentsError || queueError) {
    return (
      <div className="py-20 text-center text-muted-foreground">
        Failed to load qualification overview.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="outline" size="sm" className="gap-2" onClick={() => window.history.back()}>
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Button>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Qualification Overview</h1>
          <p className="text-sm text-muted-foreground">
            Drill down: Qualification → Learners → Units → Status
          </p>
        </div>
        <div className="w-full max-w-xs">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Learner Filter
          </p>
          <Select value={filterMode} onValueChange={(value) => setFilterMode(value as FilterMode)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="requires_attention">Requires IQA Action</SelectItem>
              <SelectItem value="all">All Assigned Learners</SelectItem>
              <SelectItem value="signed_off">Signed Off Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100">
              <Users className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-xl font-bold">{totalLearners}</p>
              <p className="text-[11px] text-muted-foreground">Total Learners</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-100">
              <ShieldCheck className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <p className="text-xl font-bold">{awaitingIqa}</p>
              <p className="text-[11px] text-muted-foreground">Awaiting IQA</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-100">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="text-xl font-bold">{approved}</p>
              <p className="text-[11px] text-muted-foreground">Signed Off</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-100">
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </div>
            <div>
              <p className="text-xl font-bold">{actionRequired}</p>
              <p className="text-[11px] text-muted-foreground">Action Required</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {qualificationGroups.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No learners match the current filter.
          </CardContent>
        </Card>
      ) : (
        <Accordion type="multiple" className="space-y-4">
          {qualificationGroups.map((qualification) => (
            <AccordionItem
              key={qualification.qualificationId}
              value={qualification.qualificationId}
              className="overflow-hidden rounded-xl border"
            >
              <AccordionTrigger className="px-5 py-4 hover:bg-muted/30 hover:no-underline">
                <div className="flex flex-1 items-center gap-3 text-left">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <GraduationCap className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-foreground">
                        {qualification.qualificationName}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-[11px] text-muted-foreground">
                      <span>
                        {qualification.learnerCount} learner
                        {qualification.learnerCount !== 1 ? "s" : ""}
                      </span>
                      <span>{qualification.trackedCount} tracked units</span>
                      {qualification.awaitingCount > 0 ? (
                        <Badge className="border-purple-200 bg-purple-100 text-[10px] text-purple-700">
                          {qualification.awaitingCount} awaiting IQA
                        </Badge>
                      ) : null}
                      {qualification.actionRequiredCount > 0 ? (
                        <Badge className="border-destructive/20 bg-destructive/10 text-[10px] text-destructive">
                          {qualification.actionRequiredCount} action req
                        </Badge>
                      ) : null}
                      <span className="text-[10px]">
                        {qualification.signedOffCount}/{qualification.trackedCount || 0} signed off
                      </span>
                    </div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-5 pb-4">
                <Accordion type="multiple" className="space-y-3">
                  {qualification.learners.map((enrolment) => (
                    <LearnerAccordionItem
                      key={enrolment.id}
                      enrolment={enrolment}
                      queueByUnit={queueByUnit}
                    />
                  ))}
                </Accordion>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
};

export default QualificationTreeView;
