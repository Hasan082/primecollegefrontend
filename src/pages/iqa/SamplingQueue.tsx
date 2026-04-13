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
} from "@/redux/apis/iqa/iqaApi";

const statusColors: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  "Pending IQA Review": "outline",
  "IQA Approved": "default",
  "Trainer Action Required": "secondary",
  "Escalated to Admin": "destructive",
};

const SamplingQueue = () => {
  const [query, setQuery] = useState({
    trainer_id: "",
    qualification_id: "",
    status: "",
  });

  const { data, isLoading, isError } = useGetIqaReviewQueueQuery(query);
  const { data: enrolmentsResponse } = useGetIqaAssignedEnrolmentsQuery();

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

  const entries = data?.data?.results || [];

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
        <h1 className="text-2xl font-bold">Assessment Sampling Queue</h1>
        <p className="text-sm text-muted-foreground">
          Review learner submissions assigned to your IQA queue
        </p>
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
        <Select
          value={query.status || "all"}
          onValueChange={(value) =>
            setQuery((prev) => ({
              ...prev,
              status: value === "all" ? "" : value,
            }))
          }
        >
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {Object.keys(statusColors).map((status) => (
              <SelectItem key={status} value={status}>
                {status}
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
              {entries.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center text-sm text-muted-foreground py-10"
                  >
                    No IQA queue items found.
                  </TableCell>
                </TableRow>
              ) : (
                entries.map((item) => (
                  <TableRow key={item.submission_id}>
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
                        {item.status.replace(/_/g, " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {item.submitted_at
                        ? new Date(item.submitted_at).toLocaleDateString()
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={statusColors[item.iqa_status] || "outline"}
                        className="text-xs"
                      >
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
