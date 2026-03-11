import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { iqaSamples } from "@/data/iqaMockData";

const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  "Pending IQA Review": "outline",
  "IQA Approved": "default",
  "Assessor Action Required": "secondary",
  "Escalated to Admin": "destructive",
};

const outcomeColors: Record<string, "default" | "secondary" | "destructive"> = {
  "Competent": "default",
  "Resubmission Required": "secondary",
  "Not Yet Competent": "destructive",
};

const SamplingQueue = () => {
  const [trainerFilter, setTrainerFilter] = useState("all");
  const [qualFilter, setQualFilter] = useState("all");
  const [outcomeFilter, setOutcomeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const trainers = [...new Set(iqaSamples.map(s => s.trainerName))];
  const qualifications = [...new Set(iqaSamples.map(s => s.qualification))];

  const filtered = iqaSamples.filter(s => {
    if (trainerFilter !== "all" && s.trainerName !== trainerFilter) return false;
    if (qualFilter !== "all" && s.qualification !== qualFilter) return false;
    if (outcomeFilter !== "all" && s.outcome !== outcomeFilter) return false;
    if (statusFilter !== "all" && s.iqaStatus !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <Link to="/iqa/dashboard" className="inline-flex items-center gap-1.5 text-primary hover:underline text-sm">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <div>
        <h1 className="text-2xl font-bold">Assessment Sampling Queue</h1>
        <p className="text-sm text-muted-foreground">Review sampled trainer assessments for quality assurance</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Select value={trainerFilter} onValueChange={setTrainerFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="All Trainers" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Trainers</SelectItem>
            {trainers.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={qualFilter} onValueChange={setQualFilter}>
          <SelectTrigger className="w-[220px]"><SelectValue placeholder="All Qualifications" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Qualifications</SelectItem>
            {qualifications.map(q => <SelectItem key={q} value={q}>{q}</SelectItem>)}
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
            <SelectItem value="Escalated to Admin">Escalated to Admin</SelectItem>
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
                  <TableCell className="text-sm">{s.trainerName}</TableCell>
                  <TableCell>
                    <Badge variant={outcomeColors[s.outcome]} className="text-xs">{s.outcome}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{s.assessmentDate}</TableCell>
                  <TableCell>
                    <Badge variant={statusColors[s.iqaStatus]} className="text-xs">{s.iqaStatus}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">{s.samplingReason}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={`/iqa/review/${s.id}`}><Eye className="w-4 h-4" /></Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">No assessments match filters</TableCell>
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
