import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ArrowLeft, ChevronDown, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { useGetAuditLogsQuery } from "@/redux/apis/iqa/iqaApi";
import TablePagination from "@/components/admin/TablePagination";

const ITEMS_PER_PAGE = 25;

const EVENT_TYPES = [
  { value: "all_events", label: "All Events" },
  { value: "unit_signoff_created", label: "Unit Sign-Off Created" },
  { value: "iqa_sampling_decision", label: "Sampling Decision" },
  { value: "iqa_review_started", label: "IQA Review Started" },
  { value: "iqa_decision_submitted", label: "IQA Decision Submitted" },
  { value: "iqa_manual_sample_pulled", label: "Manual Sample Pulled" },
  { value: "sampling_config_updated", label: "Sampling Config Updated" },
  { value: "course_sampling_plan_updated", label: "Course Plan Updated" },
];

const eventBadgeVariant = (
  eventType: string,
): "default" | "secondary" | "destructive" | "outline" => {
  if (eventType.includes("decision")) return "default";
  if (eventType.includes("manual")) return "secondary";
  if (eventType.includes("config") || eventType.includes("plan")) return "outline";
  return "secondary";
};

const IQAAuditLog = () => {
  const [page, setPage] = useState(1);
  const [eventTypeFilter, setEventTypeFilter] = useState("all_events");
  const [enrolmentFilter, setEnrolmentFilter] = useState("");
  const [entityTypeFilter, setEntityTypeFilter] = useState("");
  const [entityIdFilter, setEntityIdFilter] = useState("");
  const [appliedFilters, setAppliedFilters] = useState<{
    event_type: string;
    enrolment: string;
    entity_type: string;
    entity_id: string;
  }>({ event_type: "", enrolment: "", entity_type: "", entity_id: "" });

  const { data, isLoading, isError, isFetching } = useGetAuditLogsQuery({
    ...appliedFilters,
    page,
    page_size: ITEMS_PER_PAGE,
  });

  const results = data?.results ?? [];
  const totalItems = data?.count ?? 0;

  const handleApply = () => {
    setPage(1);
    setAppliedFilters({
      event_type: eventTypeFilter === "all_events" ? "" : eventTypeFilter,
      enrolment: enrolmentFilter.trim(),
      entity_type: entityTypeFilter.trim(),
      entity_id: entityIdFilter.trim(),
    });
  };

  const handleClear = () => {
    setEventTypeFilter("all_events");
    setEnrolmentFilter("");
    setEntityTypeFilter("");
    setEntityIdFilter("");
    setPage(1);
    setAppliedFilters({ event_type: "", enrolment: "", entity_type: "", entity_id: "" });
  };

  return (
    <div className="space-y-6">
      <Link
        to="/admin/iqa"
        className="inline-flex items-center gap-1.5 text-primary hover:underline text-sm"
      >
        <ArrowLeft className="w-4 h-4" /> Back to IQA Management
      </Link>

      <div>
        <h1 className="text-2xl font-bold">IQA Audit Log</h1>
        <p className="text-sm text-muted-foreground">
          Full chronological audit trail of all IQA sampling and review events
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <Label>Event Type</Label>
            <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Events" />
              </SelectTrigger>
              <SelectContent>
                {EVENT_TYPES.map((et) => (
                  <SelectItem key={et.value} value={et.value}>
                    {et.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Enrolment ID</Label>
            <Input
              placeholder="Paste enrolment UUID…"
              value={enrolmentFilter}
              onChange={(e) => setEnrolmentFilter(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Entity Type</Label>
            <Input
              placeholder="e.g. unit_iqa_sample"
              value={entityTypeFilter}
              onChange={(e) => setEntityTypeFilter(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Entity ID</Label>
            <Input
              placeholder="Paste entity UUID…"
              value={entityIdFilter}
              onChange={(e) => setEntityIdFilter(e.target.value)}
            />
          </div>
          <div className="md:col-span-2 lg:col-span-4 flex gap-2">
            <Button onClick={handleApply} size="sm" className="gap-1.5">
              <Search className="w-3.5 h-3.5" /> Apply
            </Button>
            <Button onClick={handleClear} size="sm" variant="outline">
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">
              Events {totalItems > 0 && `(${totalItems})`}
            </CardTitle>
            {isFetching && (
              <span className="text-xs text-muted-foreground">Refreshing…</span>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-16 text-center text-muted-foreground">
              Loading audit log…
            </div>
          ) : isError ? (
            <div className="py-16 text-center text-muted-foreground">
              Failed to load audit log.
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event</TableHead>
                    <TableHead>Actor</TableHead>
                    <TableHead>Entity</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Metadata</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="py-12 text-center text-sm text-muted-foreground"
                      >
                        No audit events found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    results.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Badge
                            variant={eventBadgeVariant(item.event_type)}
                            className="text-xs font-mono"
                          >
                            {item.event_type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {item.actor?.name ?? (
                            <span className="text-muted-foreground">System</span>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {item.entity_type ? (
                            <>
                              <span className="font-medium text-foreground">
                                {item.entity_type}
                              </span>
                              <br />
                              <span className="font-mono">
                                {item.entity_id.slice(0, 8)}…
                              </span>
                            </>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                          {new Date(item.created_at).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {Object.keys(item.metadata).length > 0 ? (
                            <Collapsible>
                              <CollapsibleTrigger className="flex items-center gap-1 text-xs text-primary hover:underline">
                                Details <ChevronDown className="w-3 h-3" />
                              </CollapsibleTrigger>
                              <CollapsibleContent>
                                <pre className="mt-2 rounded bg-muted p-2 text-xs overflow-x-auto max-w-xs">
                                  {JSON.stringify(item.metadata, null, 2)}
                                </pre>
                              </CollapsibleContent>
                            </Collapsible>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              <TablePagination
                currentPage={page}
                totalItems={totalItems}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={setPage}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default IQAAuditLog;
