import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, Eye, Settings2, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { iqaSamples } from "@/data/iqaMockData";
import {
  loadIQAQueue,
  loadCourseSamplingPlans,
  upsertCourseSamplingPlan,
  type IQAQueueEntry,
  type CourseSamplingPlan,
} from "@/lib/iqaQueue";

type MergedEntry = {
  id: string;
  learnerName: string;
  unit: string;
  trainerName: string;
  outcome: string;
  date: string;
  iqaStatus: string;
  samplingReason: string;
  qualification: string;
  source: "static" | "auto";
};

const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  "Pending IQA Review": "outline",
  "IQA Approved": "default",
  "Assessor Action Required": "secondary",
  "Escalated to Admin": "destructive",
  "Not Sampled": "secondary",
};

const outcomeColors: Record<string, "default" | "secondary" | "destructive"> = {
  Competent: "default",
  "Resubmission Required": "secondary",
  "Not Yet Competent": "destructive",
};

const SamplingQueue = () => {
  const [trainerFilter, setTrainerFilter] = useState("all");
  const [qualFilter, setQualFilter] = useState("all");
  const [outcomeFilter, setOutcomeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showConfig, setShowConfig] = useState(false);
  const [plans, setPlans] = useState<CourseSamplingPlan[]>(() => loadCourseSamplingPlans());

  // Merge static mock data + auto-flipped entries
  const allEntries: MergedEntry[] = useMemo(() => {
    const fromStatic: MergedEntry[] = iqaSamples.map((s) => ({
      id: s.id,
      learnerName: s.learnerName,
      unit: s.unit,
      trainerName: s.trainerName,
      outcome: s.outcome,
      date: s.assessmentDate,
      iqaStatus: s.iqaStatus,
      samplingReason: s.samplingReason,
      qualification: s.qualification,
      source: "static" as const,
    }));

    const autoQueue = loadIQAQueue();
    const fromAuto: MergedEntry[] = autoQueue.map((e: IQAQueueEntry) => ({
      id: e.id,
      learnerName: e.learnerName,
      unit: `${e.unitCode}: ${e.unitName}`,
      trainerName: e.trainerName,
      outcome: e.outcome,
      date: e.signOffDate,
      iqaStatus: e.iqaStatus,
      samplingReason: e.samplingReason,
      qualification: e.qualification,
      source: "auto" as const,
    }));

    return [...fromAuto, ...fromStatic];
  }, []);

  const trainers = [...new Set(allEntries.map((s) => s.trainerName))];
  const qualifications = [...new Set(allEntries.map((s) => s.qualification))];

  const filtered = allEntries.filter((s) => {
    if (trainerFilter !== "all" && s.trainerName !== trainerFilter) return false;
    if (qualFilter !== "all" && s.qualification !== qualFilter) return false;
    if (outcomeFilter !== "all" && s.outcome !== outcomeFilter) return false;
    if (statusFilter !== "all" && s.iqaStatus !== statusFilter) return false;
    return true;
  });

  const handlePlanChange = (qualName: string, field: "sampleAll" | "samplingRate", value: boolean | number) => {
    const existing = plans.find((p) => p.qualificationName === qualName);
    const plan: CourseSamplingPlan = existing || {
      qualificationId: qualName.replace(/\s/g, "-").toLowerCase(),
      qualificationName: qualName,
      samplingRate: 25,
      sampleAll: false,
    };
    if (field === "sampleAll") plan.sampleAll = value as boolean;
    if (field === "samplingRate") plan.samplingRate = value as number;
    upsertCourseSamplingPlan(plan);
    setPlans(loadCourseSamplingPlans());
  };

  const getPlanForQual = (qualName: string) => plans.find((p) => p.qualificationName === qualName);

  return (
    <div className="space-y-6">
      <Button variant="outline" size="sm" className="gap-2" onClick={() => window.history.back()}>
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Button>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Assessment Sampling Queue</h1>
          <p className="text-sm text-muted-foreground">
            Review sampled trainer assessments — units auto-flip here when assessors sign off at 100%
          </p>
        </div>
        <Button
          variant={showConfig ? "default" : "outline"}
          size="sm"
          className="gap-2"
          onClick={() => setShowConfig(!showConfig)}
        >
          <Settings2 className="w-4 h-4" /> Course Sampling Plans
        </Button>
      </div>

      {/* Course-level Sampling Configuration */}
      {showConfig && (
        <Card>
          <CardContent className="p-5">
            <h3 className="text-sm font-bold text-foreground mb-1">IQA Auto-Select by Course</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Set sampling rates per qualification. Toggle "100% IQA" for new or high-risk courses.
            </p>
            <div className="space-y-4">
              {qualifications.map((qualName) => {
                const plan = getPlanForQual(qualName);
                const rate = plan?.samplingRate ?? 25;
                const sampleAll = plan?.sampleAll ?? false;
                return (
                  <div key={qualName} className="border border-border rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{qualName}</p>
                        <p className="text-xs text-muted-foreground">
                          {sampleAll ? "100% of units sent to IQA" : `${rate}% random sampling`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`sample-all-${qualName}`} className="text-xs text-muted-foreground">
                          100% IQA
                        </Label>
                        <Switch
                          id={`sample-all-${qualName}`}
                          checked={sampleAll}
                          onCheckedChange={(v) => handlePlanChange(qualName, "sampleAll", v)}
                        />
                      </div>
                    </div>
                    {!sampleAll && (
                      <div className="flex items-center gap-4">
                        <Label className="text-xs text-muted-foreground whitespace-nowrap">Sampling Rate</Label>
                        <Slider
                          value={[rate]}
                          onValueChange={([v]) => handlePlanChange(qualName, "samplingRate", v)}
                          min={5}
                          max={100}
                          step={5}
                          className="flex-1"
                        />
                        <span className="text-sm font-bold text-foreground w-12 text-right">{rate}%</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select value={trainerFilter} onValueChange={setTrainerFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="All Trainers" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Trainers</SelectItem>
            {trainers.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={qualFilter} onValueChange={setQualFilter}>
          <SelectTrigger className="w-[220px]"><SelectValue placeholder="All Qualifications" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Qualifications</SelectItem>
            {qualifications.map((q) => <SelectItem key={q} value={q}>{q}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={outcomeFilter} onValueChange={setOutcomeFilter}>
          <SelectTrigger className="w-[200px]"><SelectValue placeholder="All Outcomes" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Outcomes</SelectItem>
            <SelectItem value="Competent">Competent</SelectItem>
            <SelectItem value="Resubmission Required">Resubmission Required</SelectItem>
            <SelectItem value="Not Yet Competent">Not Yet Competent</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[200px]"><SelectValue placeholder="All Statuses" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Pending IQA Review">Pending IQA Review</SelectItem>
            <SelectItem value="IQA Approved">IQA Approved</SelectItem>
            <SelectItem value="Assessor Action Required">Assessor Action Required</SelectItem>
            <SelectItem value="Not Sampled">Not Sampled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Learner</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Qualification</TableHead>
                <TableHead>Trainer</TableHead>
                <TableHead>Outcome</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>IQA Status</TableHead>
                <TableHead>Sample Reason</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium text-sm">{s.learnerName}</TableCell>
                  <TableCell className="text-sm max-w-[200px] truncate">{s.unit}</TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-[180px] truncate">{s.qualification}</TableCell>
                  <TableCell className="text-sm">{s.trainerName}</TableCell>
                  <TableCell>
                    <Badge variant={outcomeColors[s.outcome] || "default"} className="text-xs">{s.outcome}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{s.date}</TableCell>
                  <TableCell>
                    <Badge variant={statusColors[s.iqaStatus] || "outline"} className="text-xs">
                      {s.iqaStatus === "Not Sampled" && <CheckCircle2 className="w-3 h-3 mr-1" />}
                      {s.iqaStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">{s.samplingReason}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {s.iqaStatus === "Pending IQA Review" ? (
                      <Button variant="default" size="sm" className="gap-1.5" asChild>
                        <Link to={`/iqa/review/${s.id}`}><Eye className="w-3.5 h-3.5" /> Review</Link>
                      </Button>
                    ) : s.iqaStatus !== "Not Sampled" ? (
                      <Button variant="outline" size="sm" className="gap-1.5" asChild>
                        <Link to={`/iqa/review/${s.id}`}><Eye className="w-3.5 h-3.5" /> View</Link>
                      </Button>
                    ) : (
                      <Badge variant="secondary" className="text-xs gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Signed Off
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                    No assessments match filters
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default SamplingQueue;
