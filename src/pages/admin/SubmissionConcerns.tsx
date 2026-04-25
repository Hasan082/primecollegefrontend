import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Eye,
  Loader2,
  Search,
  ShieldAlert,
  XCircle,
} from "lucide-react";

import TablePagination from "@/components/admin/TablePagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  SubmissionConcern,
  SubmissionConcernStatus,
  useGetAdminSubmissionConcernsQuery,
  useUpdateAdminSubmissionConcernMutation,
} from "@/redux/apis/admin/submissionConcernsApi";
import { useDebounce } from "@/hooks/use-debounce";

const ITEMS_PER_PAGE = 8;

const STATUS_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "all", label: "All Statuses" },
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
  { value: "dismissed", label: "Dismissed" },
];

const TYPE_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "all", label: "All Types" },
  { value: "written", label: "Written" },
  { value: "evidence", label: "Evidence" },
];

const formatLabel = (value?: string | null) => {
  if (!value) return "N/A";
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const formatDate = (value?: string | null, includeTime = false) => {
  if (!value) return "N/A";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    ...(includeTime ? { timeStyle: "short" } : {}),
  }).format(parsed);
};

const getStatusBadge = (status: string) => {
  if (status === "open") {
    return (
      <Badge variant="destructive" className="text-xs">
        Open
      </Badge>
    );
  }

  if (status === "in_progress") {
    return (
      <Badge variant="secondary" className="text-xs">
        In Progress
      </Badge>
    );
  }

  if (status === "resolved") {
    return (
      <Badge className="text-xs">
        Resolved
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="text-xs">
      Dismissed
    </Badge>
  );
};

const getSubmissionTypeBadge = (type: string) => (
  <Badge variant="outline" className="text-xs">
    {type === "written" ? "Written" : "Evidence"}
  </Badge>
);

const SubmissionConcerns = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedConcern, setSelectedConcern] = useState<SubmissionConcern | null>(null);
  const [responseNote, setResponseNote] = useState("");

  const initialStatus = searchParams.get("status");
  const initialType = searchParams.get("submission_type");

  const [statusFilter, setStatusFilter] = useState(
    initialStatus && STATUS_OPTIONS.some((option) => option.value === initialStatus)
      ? initialStatus
      : "all",
  );
  const [typeFilter, setTypeFilter] = useState(
    initialType && TYPE_OPTIONS.some((option) => option.value === initialType)
      ? initialType
      : "all",
  );

  const debouncedSearch = useDebounce(search, 300);
  const { toast } = useToast();

  const {
    data: concernResponse,
    isLoading,
    isFetching,
    refetch,
  } = useGetAdminSubmissionConcernsQuery({
    status: statusFilter === "all" ? undefined : (statusFilter as SubmissionConcernStatus),
    submission_type: typeFilter === "all" ? undefined : (typeFilter as "written" | "evidence"),
  });

  const [updateConcern, { isLoading: isUpdating }] = useUpdateAdminSubmissionConcernMutation();

  useEffect(() => {
    const nextParams: Record<string, string> = {};
    if (statusFilter !== "all") nextParams.status = statusFilter;
    if (typeFilter !== "all") nextParams.submission_type = typeFilter;
    setSearchParams(nextParams, { replace: true });
  }, [setSearchParams, statusFilter, typeFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, statusFilter, typeFilter]);

  useEffect(() => {
    if (selectedConcern) {
      setResponseNote(selectedConcern.admin_response_note || "");
    }
  }, [selectedConcern]);

  const concerns = concernResponse?.data || [];

  const filteredConcerns = useMemo(() => {
    const searchTerm = debouncedSearch.trim().toLowerCase();
    if (!searchTerm) return concerns;

    return concerns.filter((concern) => {
      const haystack = [
        concern.submission.learner.name,
        concern.submission.learner.email,
        concern.submission.trainer?.name,
        concern.submission.trainer?.email,
        concern.submission.title,
        concern.concern_note,
        concern.raised_by?.name,
        concern.submission.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(searchTerm);
    });
  }, [concerns, debouncedSearch]);

  const paginatedConcerns = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredConcerns.slice(start, start + ITEMS_PER_PAGE);
  }, [currentPage, filteredConcerns]);

  const summary = useMemo(() => {
    return concerns.reduce(
      (acc, concern) => {
        acc.total += 1;
        acc[concern.status] += 1;
        return acc;
      },
      {
        total: 0,
        open: 0,
        in_progress: 0,
        resolved: 0,
        dismissed: 0,
      },
    );
  }, [concerns]);

  const handleStatusUpdate = async (status: SubmissionConcernStatus) => {
    if (!selectedConcern) return;

    try {
      const response = await updateConcern({
        concernId: selectedConcern.id,
        status,
        admin_response_note: responseNote.trim(),
      }).unwrap();

      const updatedConcern = response.data;

      toast({
        title: "Concern updated",
        description: `Concern marked as ${formatLabel(status)}.`,
      });

      await refetch();

      if (status === "resolved" || status === "dismissed") {
        setSelectedConcern(null);
        setResponseNote("");
      } else {
        setSelectedConcern(updatedConcern);
      }
    } catch (error: any) {
      toast({
        title: "Failed to update concern",
        description: error?.data?.message || "Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Link
        to="/admin/dashboard"
        className="inline-flex items-center gap-1.5 text-primary hover:underline text-sm"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <div>
        <h1 className="text-2xl font-bold">Submission Concerns</h1>
        <p className="text-sm text-muted-foreground">
          Review IQA escalations and manage the admin concern workflow
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-destructive" />
            <div>
              <p className="text-xl font-bold">{summary.open}</p>
              <p className="text-xs text-muted-foreground">Open</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Clock3 className="w-5 h-5 text-amber-600" />
            <div>
              <p className="text-xl font-bold">{summary.in_progress}</p>
              <p className="text-xs text-muted-foreground">In Progress</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-primary" />
            <div>
              <p className="text-xl font-bold">{summary.resolved}</p>
              <p className="text-xs text-muted-foreground">Resolved</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <XCircle className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-xl font-bold">{summary.dismissed}</p>
              <p className="text-xs text-muted-foreground">Dismissed</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search learner, trainer, note or submission..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TYPE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Learner</TableHead>
                <TableHead className="hidden lg:table-cell">Trainer</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="hidden md:table-cell">Submission</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden xl:table-cell">Raised</TableHead>
                <TableHead className="hidden xl:table-cell">Concern Note</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading || isFetching ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-sm text-muted-foreground">
                    Loading concerns...
                  </TableCell>
                </TableRow>
              ) : paginatedConcerns.length > 0 ? (
                paginatedConcerns.map((concern) => (
                  <TableRow key={concern.id}>
                    <TableCell>
                      <p className="font-medium text-sm">{concern.submission.learner.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {concern.submission.learner.email}
                      </p>
                    </TableCell>

                    <TableCell className="hidden lg:table-cell">
                      <p className="text-sm">{concern.submission.trainer?.name || "Unassigned"}</p>
                      <p className="text-xs text-muted-foreground">
                        {concern.submission.trainer?.email || "No trainer assigned"}
                      </p>
                    </TableCell>

                    <TableCell>{getSubmissionTypeBadge(concern.submission.submission_type)}</TableCell>

                    <TableCell className="hidden md:table-cell">
                      <p className="text-sm font-medium">{concern.submission.title}</p>
                      <p className="text-xs text-muted-foreground">
                        Submission #{concern.submission.submission_number} • {formatLabel(concern.submission.status)}
                      </p>
                    </TableCell>

                    <TableCell>{getStatusBadge(concern.status)}</TableCell>

                    <TableCell className="hidden xl:table-cell text-sm text-muted-foreground">
                      <p>{formatDate(concern.created_at, true)}</p>
                      <p className="text-xs">{concern.raised_by?.name || "IQA"}</p>
                    </TableCell>

                    <TableCell className="hidden xl:table-cell max-w-[280px]">
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {concern.concern_note}
                      </p>
                    </TableCell>

                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8"
                        onClick={() => setSelectedConcern(concern)}
                      >
                        <Eye className="w-3.5 h-3.5 mr-1.5" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="py-10 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <AlertCircle className="w-5 h-5" />
                      <p className="text-sm font-medium text-foreground">No submission concerns found</p>
                      <p className="text-xs">
                        Adjust the filters or wait for a new IQA escalation.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <TablePagination
            currentPage={currentPage}
            totalItems={filteredConcerns.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
          />
        </CardContent>
      </Card>

      <Dialog open={!!selectedConcern} onOpenChange={(open) => !open && setSelectedConcern(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          {selectedConcern && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <span>Submission Concern</span>
                  {getStatusBadge(selectedConcern.status)}
                </DialogTitle>
                <DialogDescription>
                  Review the escalation details and update the concern status.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardContent className="p-4 space-y-2">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Learner
                    </p>
                    <p className="font-medium text-sm">{selectedConcern.submission.learner.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedConcern.submission.learner.email}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 space-y-2">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Trainer
                    </p>
                    <p className="font-medium text-sm">
                      {selectedConcern.submission.trainer?.name || "Unassigned"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {selectedConcern.submission.trainer?.email || "No trainer assigned"}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardContent className="p-4 space-y-3">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        Submission
                      </p>
                      <p className="font-medium text-sm">{selectedConcern.submission.title}</p>
                      <p className="text-sm text-muted-foreground">
                        Submission #{selectedConcern.submission.submission_number}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Submission Status: {formatLabel(selectedConcern.submission.status)}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {getSubmissionTypeBadge(selectedConcern.submission.submission_type)}
                      <Badge variant="secondary" className="text-xs">
                        Raised By: {selectedConcern.raised_by?.name || "IQA"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 space-y-2">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Timeline
                    </p>
                    <p className="text-sm">
                      Raised: <span className="text-muted-foreground">{formatDate(selectedConcern.created_at, true)}</span>
                    </p>
                    <p className="text-sm">
                      Last Updated: <span className="text-muted-foreground">{formatDate(selectedConcern.updated_at, true)}</span>
                    </p>
                    <p className="text-sm">
                      Resolved: <span className="text-muted-foreground">{formatDate(selectedConcern.resolved_at, true)}</span>
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardContent className="p-4 space-y-2">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Concern Note
                  </p>
                  <p className="text-sm whitespace-pre-wrap leading-6">
                    {selectedConcern.concern_note}
                  </p>
                </CardContent>
              </Card>

              <div className="space-y-2">
                <Label htmlFor="admin-response-note">Admin Response Note</Label>
                <Textarea
                  id="admin-response-note"
                  value={responseNote}
                  onChange={(event) => setResponseNote(event.target.value)}
                  placeholder="Add notes for the admin resolution trail..."
                  className="min-h-[120px]"
                />
              </div>

              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button
                  variant="outline"
                  onClick={() => setSelectedConcern(null)}
                  disabled={isUpdating}
                >
                  Close
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleStatusUpdate("dismissed")}
                  disabled={isUpdating}
                >
                  {isUpdating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Dismiss
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => handleStatusUpdate("in_progress")}
                  disabled={isUpdating}
                >
                  {isUpdating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Mark In Progress
                </Button>
                <Button onClick={() => handleStatusUpdate("resolved")} disabled={isUpdating}>
                  {isUpdating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Resolve Concern
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubmissionConcerns;
