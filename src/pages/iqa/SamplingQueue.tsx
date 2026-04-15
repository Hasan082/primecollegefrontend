/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { ArrowLeft, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import {
  useGetIqaAssignedEnrolmentsQuery,
  useGetIqaReviewQueueQuery,
  useSubmitIqaBulkReviewMutation,
} from "@/redux/apis/iqa/iqaApi";
import {
  getIqaWorkflowBadgeVariant,
  getIqaWorkflowLabel,
  getSubmissionOutcomeLabel,
} from "@/lib/iqaStatus";
import type { IQAReviewQueueItem } from "@/types/iqa.types";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const inboxScopes = [
  { value: "needs_attention", label: "Needs Attention" },
  { value: "escalated", label: "Escalated" },
  { value: "all", label: "All Items" },
  { value: "resolved", label: "Resolved" },
] as const;

function getDaysWaiting(submittedAt?: string | null) {
  if (!submittedAt) {
    return null;
  }

  const submitted = new Date(submittedAt);
  const now = new Date();
  const diffMs = now.getTime() - submitted.getTime();

  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

function matchesInboxScope(
  item: IQAReviewQueueItem,
  scope: (typeof inboxScopes)[number]["value"],
) {
  const label = getIqaWorkflowLabel(item.iqa_status);

  if (scope === "resolved") {
    return label === "Signed Off";
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
  const [scope, setScope] =
    useState<(typeof inboxScopes)[number]["value"]>("needs_attention");
  const [query, setQuery] = useState({
    trainer_id: "",
    qualification_id: "",
  });
  const [selectedSubmissionIds, setSelectedSubmissionIds] = useState<string[]>([]);
  const [bulkDecision, setBulkDecision] = useState<"approved" | "changes_required" | "referred_back">("approved");
  const [bulkNotes, setBulkNotes] = useState("");

  const { data, isLoading, isError } = useGetIqaReviewQueueQuery(query);
  const { data: enrolmentsResponse } = useGetIqaAssignedEnrolmentsQuery();
  const [submitBulkReview, { isLoading: isSubmittingBulk }] = useSubmitIqaBulkReviewMutation();

  const enrollmentsData = enrolmentsResponse?.data?.results || [];

  const trainers: any = useMemo(
    () =>
      Array.from(
        new Map(
          enrollmentsData
            .map((enrollment) => enrollment.trainer)
            .filter(Boolean)
            .map((trainer) => [trainer.id, trainer]),
        ).values(),
      ),
    [enrollmentsData],
  );
  const qualifications: any = useMemo(
    () =>
      Array.from(
        new Map(
          enrollmentsData
            .map((enrollment) => enrollment.qualification)
            .filter(Boolean)
            .map((qualification) => [qualification.id, qualification]),
        ).values(),
      ),
    [enrollmentsData],
  );

  const entries = useMemo(
    () =>
      [...(data?.data?.results || [])]
        .filter((item) => matchesInboxScope(item, scope))
        .sort((left, right) => {
          const leftDate = left.submitted_at ? new Date(left.submitted_at).getTime() : 0;
          const rightDate = right.submitted_at ? new Date(right.submitted_at).getTime() : 0;
          return leftDate - rightDate;
        }),
    [data?.data?.results, scope],
  );

  const scopeCounts = useMemo(() => {
    const allItems = data?.data?.results || [];
    return {
      needsAttention: allItems.filter((item) => matchesInboxScope(item, "needs_attention")).length,
      escalated: allItems.filter((item) => matchesInboxScope(item, "escalated")).length,
      resolved: allItems.filter((item) => matchesInboxScope(item, "resolved")).length,
      all: allItems.length,
    };
  }, [data?.data?.results]);

  const selectableEntries = useMemo(
    () =>
      entries.filter(
        (item) => !item.has_open_admin_concern && !item.iqa_reviewed_at && getIqaWorkflowLabel(item.iqa_status) !== "Escalated",
      ),
    [entries],
  );
  const selectedEntries = useMemo(
    () => entries.filter((item) => selectedSubmissionIds.includes(item.submission_id)),
    [entries, selectedSubmissionIds],
  );

  const canBulkReview = scope === "needs_attention" || scope === "all";

  const toggleSubmission = (submissionId: string, checked: boolean) => {
    setSelectedSubmissionIds((prev) =>
      checked
        ? prev.includes(submissionId)
          ? prev
          : [...prev, submissionId]
        : prev.filter((id) => id !== submissionId),
    );
  };

  const toggleAllCurrent = (checked: boolean) => {
    setSelectedSubmissionIds(checked ? selectableEntries.map((item) => item.submission_id) : []);
  };

  const handleBulkReview = async () => {
    if (!selectedSubmissionIds.length) {
      toast({ title: "Select at least one submission", variant: "destructive" });
      return;
    }

    try {
      const response = await submitBulkReview({
        submission_ids: selectedSubmissionIds,
        iqa_decision: bulkDecision,
        iqa_review_notes: bulkNotes.trim(),
        iqa_sampled: true,
      }).unwrap();

      if (response.data.failed.length > 0) {
        toast({
          title: "Bulk review completed with some skipped items",
          description: `${response.data.processed.length} processed, ${response.data.failed.length} skipped.`,
        });
      } else {
        toast({
          title: "Bulk IQA review completed",
          description: `${response.data.processed.length} submissions updated.`,
        });
      }
      setSelectedSubmissionIds([]);
      setBulkNotes("");
    } catch {
      toast({ title: "Bulk IQA review failed", variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 text-center text-muted-foreground">
        Loading sampling queue...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="py-20 text-center text-muted-foreground">
        Failed to load sampling queue.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={() => window.history.back()}
      >
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Button>

      <div>
        <h1 className="text-2xl font-bold">IQA Inbox</h1>
        <p className="text-sm text-muted-foreground">
          Active IQA work for review, sign-off, and follow-up
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Card className={scope === "needs_attention" ? "border-primary" : undefined}>
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Needs Attention
            </p>
            <p className="mt-1 text-2xl font-semibold">{scopeCounts.needsAttention}</p>
          </CardContent>
        </Card>
        <Card className={scope === "escalated" ? "border-primary" : undefined}>
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Escalated</p>
            <p className="mt-1 text-2xl font-semibold">{scopeCounts.escalated}</p>
          </CardContent>
        </Card>
        <Card className={scope === "resolved" ? "border-primary" : undefined}>
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Resolved</p>
            <p className="mt-1 text-2xl font-semibold">{scopeCounts.resolved}</p>
          </CardContent>
        </Card>
        <Card className={scope === "all" ? "border-primary" : undefined}>
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">All Items</p>
            <p className="mt-1 text-2xl font-semibold">{scopeCounts.all}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-3">
        <Tabs
          value={scope}
          onValueChange={(value) => setScope(value as typeof scope)}
          className="w-full lg:w-auto"
        >
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 lg:w-auto">
            <TabsTrigger value="needs_attention">
              Needs Attention ({scopeCounts.needsAttention})
            </TabsTrigger>
            <TabsTrigger value="escalated">
              Escalated ({scopeCounts.escalated})
            </TabsTrigger>
            <TabsTrigger value="resolved">
              Resolved ({scopeCounts.resolved})
            </TabsTrigger>
            <TabsTrigger value="all">
              All Items ({scopeCounts.all})
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex flex-wrap gap-3">
        <Select
          value={query.trainer_id || "all"}
          onValueChange={(value) =>
            setQuery((prev) => ({
              ...prev,
              trainer_id: value === "all" ? "" : value,
            }))
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Trainers" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Trainers</SelectItem>
            {trainers.map((trainer) => (
              <SelectItem key={trainer?.id} value={trainer?.id}>
                {trainer?.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={query.qualification_id || "all"}
          onValueChange={(value) =>
            setQuery((prev) => ({
              ...prev,
              qualification_id: value === "all" ? "" : value,
            }))
          }
        >
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="All Qualifications" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Qualifications</SelectItem>
            {qualifications?.map((qualification) => (
              <SelectItem key={qualification?.id} value={qualification?.id}>
                {qualification?.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {canBulkReview ? (
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-sm font-medium">
                Bulk Review
                {selectedSubmissionIds.length > 0 ? ` (${selectedSubmissionIds.length} selected)` : ""}
              </p>
              <Select value={bulkDecision} onValueChange={(value) => setBulkDecision(value as typeof bulkDecision)}>
                <SelectTrigger className="w-[220px]">
                  <SelectValue placeholder="Bulk Decision" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="approved">Signed Off</SelectItem>
                  <SelectItem value="changes_required">Action Required</SelectItem>
                  <SelectItem value="referred_back">Refer Back</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={handleBulkReview}
                disabled={isSubmittingBulk || selectedSubmissionIds.length === 0}
              >
                Apply to Selected
              </Button>
            </div>
            <Textarea
              value={bulkNotes}
              onChange={(event) => setBulkNotes(event.target.value)}
              rows={3}
              placeholder="Optional shared IQA note for all selected submissions..."
            />
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                {canBulkReview ? <TableHead className="w-10">
                  <input
                    type="checkbox"
                    aria-label="Select all current submissions"
                    checked={selectableEntries.length > 0 && selectedSubmissionIds.length === selectableEntries.length}
                    onChange={(event) => toggleAllCurrent(event.target.checked)}
                  />
                </TableHead> : null}
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
                  <TableCell
                    colSpan={canBulkReview ? 11 : 10}
                    className="text-center text-sm text-muted-foreground py-10"
                  >
                    {scope === "needs_attention"
                      ? "No active IQA items need attention."
                      : scope === "escalated"
                        ? "No escalated IQA items found."
                      : "No IQA items found for this view."}
                  </TableCell>
                </TableRow>
              ) : (
                entries.map((item) => {
                  const daysWaiting = getDaysWaiting(item.submitted_at);

                  return (
                  <TableRow key={item.submission_id}>
                    {canBulkReview ? (
                      <TableCell>
                        <input
                          type="checkbox"
                          aria-label={`Select ${item.learner.name}`}
                          disabled={item.has_open_admin_concern || Boolean(item.iqa_reviewed_at)}
                          checked={selectedSubmissionIds.includes(item.submission_id)}
                          onChange={(event) => toggleSubmission(item.submission_id, event.target.checked)}
                        />
                      </TableCell>
                    ) : null}
                    <TableCell className="font-medium text-sm">
                      {item.learner.name}
                    </TableCell>
                    <TableCell className="text-sm">
                      {item.unit.unit_code}: {item.unit.title}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {item.qualification.title}
                    </TableCell>
                    <TableCell className="text-sm">
                      {item.trainer?.name || "Unassigned"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          item.status === "competent" ? "default" : "secondary"
                        }
                        className="text-xs"
                      >
                        {getSubmissionOutcomeLabel(item.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {item.submitted_at
                        ? new Date(item.submitted_at).toLocaleDateString()
                        : "—"}
                    </TableCell>
                    <TableCell>
                      {daysWaiting === null ? (
                        <span className="text-sm text-muted-foreground">—</span>
                      ) : (
                        <Badge
                          variant={daysWaiting >= 5 ? "destructive" : "outline"}
                          className="text-xs"
                        >
                          {daysWaiting}d
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {item.iqa_reviewed_at
                        ? new Date(item.iqa_reviewed_at).toLocaleDateString()
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Badge
                          variant={getIqaWorkflowBadgeVariant(
                            getIqaWorkflowLabel(item.iqa_status),
                          )}
                          className="text-xs"
                        >
                          {getIqaWorkflowLabel(item.iqa_status)}
                        </Badge>
                        {item.has_open_admin_concern ? (
                          <div className="text-[11px] text-muted-foreground">
                            {item.admin_concern_status} since{" "}
                            {item.admin_concern_raised_at
                              ? new Date(item.admin_concern_raised_at).toLocaleDateString()
                              : "—"}
                          </div>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/iqa/review/${item.submission_id}`}>
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
