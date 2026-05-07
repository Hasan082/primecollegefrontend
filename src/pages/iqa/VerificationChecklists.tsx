import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  Calendar,
  Filter,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useGetChecklistCompletionsQuery,
  useGetChecklistTemplatesForIqaQuery,
} from "@/redux/apis/iqa/iqaApi";

type ImpliedDecision = "approved" | "action_required";

const impliedDecision = (
  responses: Record<string, string>,
): ImpliedDecision => {
  const hasFailure = Object.values(responses).some(
    (value) => value === "no" || value === "not_met",
  );
  return hasFailure ? "action_required" : "approved";
};

const VerificationChecklists = () => {
  const [qualFilter, setQualFilter] = useState("all");
  const [decisionFilter, setDecisionFilter] = useState<"all" | ImpliedDecision>(
    "all",
  );
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const { data: completionsResponse, isLoading: isLoadingCompletions } =
    useGetChecklistCompletionsQuery();
  const { data: templatesResponse, isLoading: isLoadingTemplates } =
    useGetChecklistTemplatesForIqaQuery();

  const completions = completionsResponse?.results || [];
  const templates = templatesResponse?.results || [];

  const templateById = useMemo(
    () => new Map(templates.map((t) => [t.id, t])),
    [templates],
  );

  const qualificationOptions = useMemo(() => {
    const map = new Map<string, string>();
    templates.forEach((t) => {
      if (t.qualification_id && !map.has(t.qualification_id)) {
        map.set(t.qualification_id, t.qualification_title || t.qualification_id);
      }
    });
    return Array.from(map.entries()).map(([id, title]) => ({ id, title }));
  }, [templates]);

  const filteredCompletions = useMemo(() => {
    const fromTs = fromDate ? new Date(fromDate).getTime() : null;
    const toTs = toDate ? new Date(toDate).getTime() + 86_400_000 - 1 : null;
    return completions.filter((completion) => {
      const template = templateById.get(completion.template.id);
      if (qualFilter !== "all") {
        if (!template || template.qualification_id !== qualFilter) {
          return false;
        }
      }
      if (decisionFilter !== "all") {
        if (impliedDecision(completion.responses) !== decisionFilter) {
          return false;
        }
      }
      const completedTs = new Date(completion.completed_at).getTime();
      if (fromTs !== null && completedTs < fromTs) return false;
      if (toTs !== null && completedTs > toTs) return false;
      return true;
    });
  }, [completions, templateById, qualFilter, decisionFilter, fromDate, toDate]);

  const totals = useMemo(() => {
    const approved = filteredCompletions.filter(
      (c) => impliedDecision(c.responses) === "approved",
    ).length;
    return {
      total: filteredCompletions.length,
      approved,
      actionRequired: filteredCompletions.length - approved,
    };
  }, [filteredCompletions]);

  const isLoading = isLoadingCompletions || isLoadingTemplates;

  const resetFilters = () => {
    setQualFilter("all");
    setDecisionFilter("all");
    setFromDate("");
    setToDate("");
  };

  return (
    <div className="space-y-6">
      <Link
        to="/iqa/dashboard"
        className="inline-flex items-center gap-1.5 text-primary hover:underline text-sm"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ClipboardCheck className="w-6 h-6" /> My Verifications
        </h1>
        <p className="text-sm text-muted-foreground">
          Read-only audit log of every checklist you have completed across qualifications and units.
        </p>
      </div>

      <Card>
        <CardContent className="p-4 grid gap-3 md:grid-cols-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Qualification
            </label>
            <Select value={qualFilter} onValueChange={setQualFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Qualifications" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Qualifications</SelectItem>
                {qualificationOptions.map((q) => (
                  <SelectItem key={q.id} value={q.id}>
                    {q.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Decision
            </label>
            <Select
              value={decisionFilter}
              onValueChange={(v) => setDecisionFilter(v as typeof decisionFilter)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Outcomes</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="action_required">Action Required</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              From
            </label>
            <div className="relative">
              <Calendar className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              To
            </label>
            <div className="relative">
              <Calendar className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <Input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
          <Badge variant="outline">Total: {totals.total}</Badge>
          <Badge variant="outline" className="border-emerald-300 text-emerald-700 bg-emerald-50">
            Approved: {totals.approved}
          </Badge>
          <Badge variant="outline" className="border-amber-300 text-amber-700 bg-amber-50">
            Action Required: {totals.actionRequired}
          </Badge>
        </div>
        {(qualFilter !== "all" ||
          decisionFilter !== "all" ||
          fromDate ||
          toDate) && (
          <Button size="sm" variant="ghost" onClick={resetFilters} className="gap-1">
            <Filter className="w-3.5 h-3.5" /> Clear filters
          </Button>
        )}
      </div>

      {isLoading ? (
        <Card className="p-8 text-center">
          <p className="text-sm text-muted-foreground">Loading verifications...</p>
        </Card>
      ) : filteredCompletions.length === 0 ? (
        <Card className="p-8 text-center">
          <ClipboardCheck className="w-10 h-10 mx-auto mb-2 text-muted-foreground opacity-50" />
          <p className="text-sm text-muted-foreground">
            {completions.length === 0
              ? "You have not completed any verification checklists yet."
              : "No verifications match the current filters."}
          </p>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredCompletions.map((completion) => {
            const template = templateById.get(completion.template.id);
            const decision = impliedDecision(completion.responses);
            const total = Object.keys(completion.responses).length;
            const failed = Object.values(completion.responses).filter(
              (v) => v === "no" || v === "not_met",
            ).length;
            const passed = total - failed - Object.values(completion.responses).filter((v) => v === "na").length;

            return (
              <Card key={completion.id}>
                <CardContent className="p-4 flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold">
                        {completion.template.title}
                      </p>
                      {template ? (
                        <Badge
                          variant={template.unit_id ? "secondary" : "outline"}
                          className="text-[10px]"
                        >
                          {template.unit_title
                            ? `Unit: ${template.unit_title}`
                            : "Qualification-level"}
                        </Badge>
                      ) : null}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {template?.qualification_title || "—"} ·{" "}
                      {new Date(completion.completed_at).toLocaleString("en-GB")} ·{" "}
                      by {completion.iqa_reviewer.name}
                    </p>
                    {completion.summary_comment ? (
                      <p className="mt-2 text-xs text-muted-foreground italic line-clamp-2">
                        "{completion.summary_comment}"
                      </p>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge
                      variant="outline"
                      className={
                        decision === "approved"
                          ? "border-emerald-300 text-emerald-700 bg-emerald-50 gap-1"
                          : "border-amber-300 text-amber-700 bg-amber-50 gap-1"
                      }
                    >
                      {decision === "approved" ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : (
                        <XCircle className="w-3 h-3" />
                      )}
                      {decision === "approved" ? "Approved" : "Action Required"}
                    </Badge>
                    <Badge variant="outline" className="text-[10px]">
                      {passed}/{total} passed
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default VerificationChecklists;
