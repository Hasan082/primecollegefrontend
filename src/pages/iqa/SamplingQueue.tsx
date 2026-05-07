/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Eye,
  Inbox,
  ShieldAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import {
  useGetIqaAssignedEnrolmentsQuery,
  useGetIqaSamplesQuery,
  useStartIqaSampleReviewMutation,
  useSubmitIqaSampleDecisionMutation,
} from "@/redux/apis/iqa/iqaApi";
import {
  getIqaWorkflowBadgeProps,
  getIqaWorkflowLabel,
  getSubmissionOutcomeLabel,
} from "@/lib/iqaStatus";
import type { UnitIQASampleItem } from "@/types/iqa.types";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const inboxScopes = [
  { value: "needs_attention", label: "Needs Attention" },
  { value: "escalated", label: "Escalated" },
  { value: "all", label: "All Items" },
  { value: "resolved", label: "Resolved" },
] as const;

function getDaysWaiting(submittedAt?: string | null) {
  if (!submittedAt) return null;
  const submitted = new Date(submittedAt);
  const now = new Date();
  return Math.max(0, Math.floor((now.getTime() - submitted.getTime()) / (1000 * 60 * 60 * 24)));
}

function getSampleWorkflowStatus(item: UnitIQASampleItem) {
  if (item.review_status === "approved") return "IQA Approved";
  if (item.review_status === "action_required") return "Assessor Action Required";
  if (item.review_status === "escalated") return "Escalated to Admin";
  if (item.review_status === "auto_cleared") return "Auto-Cleared (Not Sampled)";
  return "Pending IQA Review";
}

function matchesInboxScope(
  item: UnitIQASampleItem,
  scope: (typeof inboxScopes)[number]["value"],
) {
  const label = getIqaWorkflowLabel(getSampleWorkflowStatus(item));

  if (scope === "resolved") {
    return label === "Signed Off" || label === "Auto Cleared";
  }
  if (scope === "escalated") {
    return label === "Escalated";
  }
  if (scope === "all") {
    return true;
  }

  return label === "Awaiting IQA" || label === "Action Required" || label === "Escalated";
}

const SamplingQueue = () => {
  const { toast } = useToast();
  const [scope, setScope] = useState<(typeof inboxScopes)[number]["value"]>("needs_attention");
  const [query, setQuery] = useState({
    trainer: "",
    qualification: "",
  });
  const [selectedSampleIds, setSelectedSampleIds] = useState<string[]>([]);
  const [bulkDecision, setBulkDecision] = useState<"approved" | "action_required">("approved");
  const [bulkNotes, setBulkNotes] = useState("");

  const { data, isLoading, isError } = useGetIqaSamplesQuery({
    ...query,
    mine: true,
  });
  const { data: enrolmentsResponse } = useGetIqaAssignedEnrolmentsQuery();
  const [startSampleReview] = useStartIqaSampleReviewMutation();
  const [submitSampleDecision, { isLoading: isSubmittingBulk }] = useSubmitIqaSampleDecisionMutation();

  const enrollmentsData = enrolmentsResponse?.data?.results || [];
  const trainers: any = useMemo(
    () => Array.from(new Map(
      enrollmentsData
        .map((enrollment) => enrollment.trainer)
        .filter(Boolean)
        .map((trainer) => [trainer.id, trainer]),
    ).values()),
    [enrollmentsData],
  );
  const qualifications: any = useMemo(
    () => Array.from(new Map(
      enrollmentsData
        .map((enrollment) => enrollment.qualification)
        .filter(Boolean)
        .map((qualification) => [qualification.id, qualification]),
    ).values()),
    [enrollmentsData],
  );

  const entries = useMemo(
    () => [...(data?.results || [])]
      .filter((item) => matchesInboxScope(item, scope))
      .sort((left, right) => {
        const leftDate = left.trigger_submission.submitted_at ? new Date(left.trigger_submission.submitted_at).getTime() : 0;
        const rightDate = right.trigger_submission.submitted_at ? new Date(right.trigger_submission.submitted_at).getTime() : 0;
        return leftDate - rightDate;
      }),
    [data?.results, scope],
  );

  const scopeCounts = useMemo(() => {
    const allItems = data?.results || [];
    return {
      needsAttention: allItems.filter((item) => matchesInboxScope(item, "needs_attention")).length,
      escalated: allItems.filter((item) => matchesInboxScope(item, "escalated")).length,
      resolved: allItems.filter((item) => matchesInboxScope(item, "resolved")).length,
      all: allItems.length,
    };
  }, [data?.results]);

  const selectableEntries = useMemo(
    () => entries.filter((item) => item.review_status === "pending" || item.review_status === "in_progress"),
    [entries],
  );
  const selectedEntries = useMemo(
    () => entries.filter((item) => selectedSampleIds.includes(item.id)),
    [entries, selectedSampleIds],
  );

  const canBulkReview = scope === "needs_attention" || scope === "all";

  const toggleSample = (sampleId: string, checked: boolean) => {
    setSelectedSampleIds((prev) =>
      checked ? (prev.includes(sampleId) ? prev : [...prev, sampleId]) : prev.filter((id) => id !== sampleId),
    );
  };

  const toggleAllCurrent = (checked: boolean) => {
    setSelectedSampleIds(checked ? selectableEntries.map((item) => item.id) : []);
  };

  const handleBulkReview = async () => {
    if (!selectedEntries.length) {
      toast({ title: "Select at least one sample", variant: "destructive" });
      return;
    }

    const body = {
      decision: bulkDecision,
      comments: bulkNotes.trim(),
      action_type: bulkDecision === "action_required" ? "bulk_review" : "",
    } as const;

    const processed: string[] = [];
    const failed: string[] = [];

    for (const item of selectedEntries) {
      try {
        if (item.review_status === "pending") {
          await startSampleReview(item.id).unwrap();
        }
        await submitSampleDecision({ sampleId: item.id, body }).unwrap();
        processed.push(item.id);
      } catch {
        failed.push(item.id);
      }
    }

    if (failed.length > 0) {
      toast({
        title: "Bulk review completed with some skipped items",
        description: `${processed.length} processed, ${failed.length} skipped.`,
      });
    } else {
      toast({
        title: "Bulk IQA review completed",
        description: `${processed.length} samples updated.`,
      });
    }

    setSelectedSampleIds([]);
    setBulkNotes("");
  };

  if (isLoading) {
    return <div className="py-20 text-center text-muted-foreground">Loading sampling queue...</div>;
  }

  if (isError) {
    return <div className="py-20 text-center text-muted-foreground">Failed to load sampling queue.</div>;
  }

  return (
    <div className="space-y-6">
      <Button variant="outline" size="sm" className="gap-2" onClick={() => window.history.back()}>
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Button>

      <div>
        <h1 className="text-2xl font-bold">IQA Inbox</h1>
        <p className="text-sm text-muted-foreground">
          Active IQA work for review, sign-off, and follow-up
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {(
          [
            {
              value: "needs_attention",
              label: "Needs Attention",
              count: scopeCounts.needsAttention,
              icon: AlertTriangle,
              tone: "bg-amber-50 border-amber-200 text-amber-700",
              iconBg: "bg-amber-100 text-amber-600",
              activeRing: "ring-amber-400",
            },
            {
              value: "escalated",
              label: "Escalated",
              count: scopeCounts.escalated,
              icon: ShieldAlert,
              tone: "bg-rose-50 border-rose-200 text-rose-700",
              iconBg: "bg-rose-100 text-rose-600",
              activeRing: "ring-rose-400",
            },
            {
              value: "resolved",
              label: "Resolved",
              count: scopeCounts.resolved,
              icon: CheckCircle2,
              tone: "bg-emerald-50 border-emerald-200 text-emerald-700",
              iconBg: "bg-emerald-100 text-emerald-600",
              activeRing: "ring-emerald-400",
            },
            {
              value: "all",
              label: "All Items",
              count: scopeCounts.all,
              icon: Inbox,
              tone: "bg-sky-50 border-sky-200 text-sky-700",
              iconBg: "bg-sky-100 text-sky-600",
              activeRing: "ring-sky-400",
            },
          ] as const
        ).map((card) => {
          const Icon = card.icon;
          const isActive = scope === card.value;
          return (
            <button
              key={card.value}
              type="button"
              onClick={() => setScope(card.value)}
              className={cn(
                "rounded-lg border p-4 text-left transition shadow-sm hover:shadow-md hover:-translate-y-0.5",
                card.tone,
                isActive && `ring-2 ring-offset-2 ${card.activeRing}`,
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-wide">
                  {card.label}
                </p>
                <span
                  className={cn(
                    "rounded-full p-1.5 inline-flex items-center justify-center",
                    card.iconBg,
                  )}
                >
                  <Icon className="w-4 h-4" />
                </span>
              </div>
              <p className="mt-2 text-3xl font-bold text-foreground">
                {card.count}
              </p>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-3">
        <Tabs value={scope} onValueChange={(value) => setScope(value as typeof scope)} className="w-full lg:w-auto">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 lg:w-auto">
            <TabsTrigger value="needs_attention">Needs Attention ({scopeCounts.needsAttention})</TabsTrigger>
            <TabsTrigger value="escalated">Escalated ({scopeCounts.escalated})</TabsTrigger>
            <TabsTrigger value="resolved">Resolved ({scopeCounts.resolved})</TabsTrigger>
            <TabsTrigger value="all">All Items ({scopeCounts.all})</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex flex-wrap gap-3">
        <Select value={query.trainer || "all"} onValueChange={(value) => setQuery((prev) => ({ ...prev, trainer: value === "all" ? "" : value }))}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Trainers" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Trainers</SelectItem>
            {trainers.map((trainer) => (
              <SelectItem key={trainer?.id} value={trainer?.id}>{trainer?.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={query.qualification || "all"} onValueChange={(value) => setQuery((prev) => ({ ...prev, qualification: value === "all" ? "" : value }))}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="All Qualifications" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Qualifications</SelectItem>
            {qualifications?.map((qualification) => (
              <SelectItem key={qualification?.id} value={qualification?.id}>{qualification?.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {canBulkReview ? (
        <Card className="border-primary/20 bg-primary/[0.03]">
          <CardContent className="p-4 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-sm font-medium flex items-center gap-2">
                Bulk Review
                {selectedSampleIds.length > 0 && (
                  <Badge variant="default" className="text-[10px]">
                    {selectedSampleIds.length} selected
                  </Badge>
                )}
              </p>
              <Select value={bulkDecision} onValueChange={(value) => setBulkDecision(value as typeof bulkDecision)}>
                <SelectTrigger className="w-[220px]">
                  <SelectValue placeholder="Bulk Decision" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="approved">Approve</SelectItem>
                  <SelectItem value="action_required">Action Required</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleBulkReview} disabled={isSubmittingBulk || selectedSampleIds.length === 0}>
                Apply to Selected
              </Button>
            </div>
            <Textarea
              value={bulkNotes}
              onChange={(event) => setBulkNotes(event.target.value)}
              rows={3}
              placeholder="Optional shared IQA note for all selected samples..."
            />
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                {canBulkReview ? (
                  <TableHead className="w-10">
                    <Checkbox
                      aria-label="Select all current samples"
                      disabled={selectableEntries.length === 0}
                      checked={
                        selectableEntries.length > 0 &&
                        selectedSampleIds.length === selectableEntries.length
                      }
                      onCheckedChange={(checked) =>
                        toggleAllCurrent(checked === true)
                      }
                    />
                  </TableHead>
                ) : null}
                <TableHead>Learner</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Qualification</TableHead>
                <TableHead>Trainer</TableHead>
                <TableHead>Outcome</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Waiting</TableHead>
                <TableHead>Reviewed</TableHead>
                <TableHead>IQA Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={canBulkReview ? 11 : 10} className="text-center text-sm text-muted-foreground py-10">
                    {scope === "needs_attention"
                      ? "No active IQA items need attention."
                      : scope === "escalated"
                        ? "No escalated IQA items found."
                        : "No IQA items found for this view."}
                  </TableCell>
                </TableRow>
              ) : (
                entries.map((item) => {
                  const submittedAt = item.trigger_submission.submitted_at;
                  const daysWaiting = getDaysWaiting(submittedAt);
                  const workflowStatus = getSampleWorkflowStatus(item);

                  return (
                    <TableRow key={item.id}>
                      {canBulkReview ? (
                        <TableCell>
                          <Checkbox
                            aria-label={`Select ${item.learner.name}`}
                            disabled={
                              !(
                                item.review_status === "pending" ||
                                item.review_status === "in_progress"
                              )
                            }
                            checked={selectedSampleIds.includes(item.id)}
                            onCheckedChange={(checked) =>
                              toggleSample(item.id, checked === true)
                            }
                          />
                        </TableCell>
                      ) : null}
                      <TableCell className="font-medium text-sm">{item.learner.name}</TableCell>
                      <TableCell className="text-sm">{item.unit.code}: {item.unit.title}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{item.qualification.title}</TableCell>
                      <TableCell className="text-sm">{item.trainer?.name || "Unassigned"}</TableCell>
                      <TableCell>
                        <Badge variant={item.trigger_submission.status === "competent" ? "default" : "secondary"} className="text-xs">
                          {getSubmissionOutcomeLabel(item.trigger_submission.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {submittedAt ? new Date(submittedAt).toLocaleDateString() : "—"}
                      </TableCell>
                      <TableCell>
                        {daysWaiting === null ? (
                          <span className="text-sm text-muted-foreground">—</span>
                        ) : (
                          <Badge variant={daysWaiting >= 5 ? "destructive" : "outline"} className="text-xs">
                            {daysWaiting}d
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {item.reviewed_at ? new Date(item.reviewed_at).toLocaleDateString() : "—"}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {(() => {
                            const workflowLabel = getIqaWorkflowLabel(workflowStatus);
                            const badgeProps = getIqaWorkflowBadgeProps(workflowLabel);
                            return (
                              <Badge
                                variant={badgeProps.variant}
                                className={`text-xs ${badgeProps.className}`}
                              >
                                {workflowLabel}
                              </Badge>
                            );
                          })()}
                          <div className="text-[11px] text-muted-foreground">
                            {item.manually_sampled ? "Manual sample" : item.sampling_reason.replace(/_/g, " ")}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/iqa/review/${item.id}`}>
                            <Eye className="w-3.5 h-3.5 mr-1" /> Review
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default SamplingQueue;
