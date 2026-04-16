import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import TablePagination from "@/components/admin/TablePagination";
import { useGetTrainerPerformanceQuery } from "@/redux/apis/iqa/iqaApi";

const ITEMS_PER_PAGE = 10;

const TrainerPerformance = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const { data, isLoading, isError, isFetching } = useGetTrainerPerformanceQuery(
    {
      page: currentPage,
      page_size: ITEMS_PER_PAGE,
    },
  );

  const summary = data?.data?.summary;
  const items = data?.data?.results ?? [];
  const totalItems = data?.data?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  if (isLoading) {
    return (
      <div className="py-20 text-center text-muted-foreground">
        Loading trainer performance...
      </div>
    );
  }

  if (isError || !data?.data) {
    return (
      <div className="py-20 text-center text-muted-foreground">
        Failed to load trainer performance.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        to="/iqa/dashboard"
        className="inline-flex items-center gap-1.5 text-primary hover:underline text-sm"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <div>
        <h1 className="text-2xl font-bold">Trainer Quality Monitoring</h1>
        <p className="text-sm text-muted-foreground">
          Track assessment quality and consistency across trainers using live
          IQA review data
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Trainers Reviewed",
            value: summary?.trainer_count ?? 0,
            icon: Users,
            classes: "bg-blue-100 text-blue-600",
          },
          {
            label: "Total Reviews",
            value: summary?.total_reviews ?? 0,
            icon: CheckCircle2,
            classes: "bg-green-100 text-green-600",
          },
          {
            label: "Total Flags",
            value: summary?.total_flags ?? 0,
            icon: AlertTriangle,
            classes: "bg-red-100 text-red-600",
          },
          {
            label: "Avg Turnaround",
            value: `${summary?.avg_turnaround_days ?? 0} days`,
            icon: Clock3,
            classes: "bg-amber-100 text-amber-600",
          },
        ].map((item) => (
          <Card key={item.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${item.classes}`}
              >
                <item.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{item.value}</p>
                <p className="text-xs text-muted-foreground">{item.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Overall Approval Rate</p>
            <p className="text-2xl font-bold mt-1">
              {summary?.overall_approval_rate_percent ?? 0}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Overall Flag Rate</p>
            <p className="text-2xl font-bold mt-1">
              {summary?.overall_flag_rate_percent ?? 0}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Approvals</p>
            <p className="text-2xl font-bold mt-1">
              {summary?.total_approvals ?? 0}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="text-base">Detailed Comparison</CardTitle>
            {isFetching ? (
              <span className="text-xs text-muted-foreground">
                Refreshing page {currentPage}...
              </span>
            ) : null}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Trainer</TableHead>
                <TableHead className="text-center">Assessments</TableHead>
                <TableHead className="text-center">IQA Approvals</TableHead>
                <TableHead className="text-center">Flags</TableHead>
                <TableHead className="text-center">Avg Turnaround</TableHead>
                <TableHead className="text-center">Approval Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-muted-foreground py-10"
                  >
                    No trainer performance data found.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => {
                  const metrics = item.metrics;
                  const approvalRate = metrics.approval_rate_percent ?? 0;

                  return (
                    <TableRow
                      key={
                        item.trainer?.id || item.trainer?.name || "unassigned"
                      }
                    >
                      <TableCell className="font-medium">
                        {item.trainer?.name || "Unassigned trainer"}
                      </TableCell>
                      <TableCell className="text-center">
                        {metrics.assessments}
                      </TableCell>
                      <TableCell className="text-center">
                        {metrics.iqa_approvals}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={metrics.flags > 0 ? "destructive" : "outline"}
                          className="text-xs"
                        >
                          {metrics.flags}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {metrics.avg_turnaround_days} days
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="space-y-2">
                          <div className="flex justify-end text-xs">
                            <span className="font-medium">{approvalRate}%</span>
                          </div>
                          <Progress value={approvalRate} className="h-2" />
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
          <TablePagination
            currentPage={currentPage}
            totalItems={totalItems}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default TrainerPerformance;
