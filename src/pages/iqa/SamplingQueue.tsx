import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { useGetIqaReviewQueueQuery } from "@/redux/apis/iqa/iqaApi";

const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  "Pending IQA Review": "outline",
  "IQA Approved": "default",
  "Assessor Action Required": "secondary",
  "Escalated to Admin": "destructive",
};

const SamplingQueue = () => {
  const [trainerFilter, setTrainerFilter] = useState("all");
  const [qualFilter, setQualFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const { data, isLoading, isError } = useGetIqaReviewQueueQuery();

  const entries = data?.data || [];
  const trainers = useMemo(
    () => [...new Set(entries.map((item) => item.trainer?.name).filter(Boolean) as string[])],
    [entries],
  );
  const qualifications = useMemo(
    () => [...new Set(entries.map((item) => item.qualification.title))],
    [entries],
  );

  const filtered = entries.filter((item) => {
    if (trainerFilter !== "all" && item.trainer?.name !== trainerFilter) return false;
    if (qualFilter !== "all" && item.qualification.title !== qualFilter) return false;
    if (statusFilter !== "all" && item.iqa_status !== statusFilter) return false;
    return true;
  });

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
        <h1 className="text-2xl font-bold">Assessment Sampling Queue</h1>
        <p className="text-sm text-muted-foreground">
          Review learner submissions assigned to your IQA queue
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Select value={trainerFilter} onValueChange={setTrainerFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="All Trainers" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Trainers</SelectItem>
            {trainers.map((trainer) => <SelectItem key={trainer} value={trainer}>{trainer}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={qualFilter} onValueChange={setQualFilter}>
          <SelectTrigger className="w-[220px]"><SelectValue placeholder="All Qualifications" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Qualifications</SelectItem>
            {qualifications.map((qualification) => (
              <SelectItem key={qualification} value={qualification}>{qualification}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[220px]"><SelectValue placeholder="All Statuses" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {Object.keys(statusColors).map((status) => (
              <SelectItem key={status} value={status}>{status}</SelectItem>
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
                <TableHead>Unit</TableHead>
                <TableHead>Qualification</TableHead>
                <TableHead>Trainer</TableHead>
                <TableHead>Outcome</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>IQA Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-sm text-muted-foreground py-10">
                    No IQA queue items found.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((item) => (
                  <TableRow key={item.submission_id}>
                    <TableCell className="font-medium text-sm">{item.learner.name}</TableCell>
                    <TableCell className="text-sm">{item.unit.unit_code}: {item.unit.title}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{item.qualification.title}</TableCell>
                    <TableCell className="text-sm">{item.trainer?.name || "Unassigned"}</TableCell>
                    <TableCell>
                      <Badge variant={item.status === "competent" ? "default" : "secondary"} className="text-xs">
                        {item.status.replace(/_/g, " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {item.submitted_at ? new Date(item.submitted_at).toLocaleDateString() : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusColors[item.iqa_status] || "outline"} className="text-xs">
                        {item.iqa_status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/iqa/review/${item.submission_id}`}>
                          <Eye className="w-3.5 h-3.5 mr-1" /> Review
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default SamplingQueue;
