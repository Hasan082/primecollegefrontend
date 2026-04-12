import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { useGetIqaDashboardQuery } from "@/redux/apis/iqa/iqaApi";

const TrainerPerformance = () => {
  const { data, isLoading, isError } = useGetIqaDashboardQuery();

  if (isLoading) {
    return <div className="py-20 text-center text-muted-foreground">Loading trainer performance...</div>;
  }

  if (isError || !data?.data) {
    return <div className="py-20 text-center text-muted-foreground">Failed to load trainer performance.</div>;
  }

  const items = data.data.trainer_overview;

  return (
    <div className="space-y-6">
      <Link to="/iqa/dashboard" className="inline-flex items-center gap-1.5 text-primary hover:underline text-sm">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <div>
        <h1 className="text-2xl font-bold">Trainer Quality Monitoring</h1>
        <p className="text-sm text-muted-foreground">Track assessment quality and consistency across trainers using live IQA review data</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {items.length === 0 ? (
          <Card className="md:col-span-3">
            <CardContent className="p-6 text-sm text-muted-foreground">
              No reviewed trainer activity available yet.
            </CardContent>
          </Card>
        ) : (
          items.map((item) => {
            const approvalRate = item.total_assessments > 0 ? Math.round((item.iqa_approvals / item.total_assessments) * 100) : 0;
            return (
              <Card key={item.trainer?.id || item.trainer?.name || "unassigned"}>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-sm">{item.trainer?.name || "Unassigned trainer"}</h3>
                    <Badge variant={approvalRate >= 80 ? "default" : approvalRate >= 60 ? "secondary" : "destructive"} className="text-xs">
                      {approvalRate}% approved
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">IQA Approval Rate</span>
                      <span className="font-medium">{approvalRate}%</span>
                    </div>
                    <Progress value={approvalRate} className="h-2" />
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-4 text-center">
                    <div className="bg-muted/50 rounded-lg p-2">
                      <p className="text-lg font-bold">{item.total_assessments}</p>
                      <p className="text-xs text-muted-foreground">Assessments</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-2">
                      <p className="text-lg font-bold">{item.iqa_flags}</p>
                      <p className="text-xs text-muted-foreground">Flagged</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-2">
                      <p className="text-lg font-bold">{approvalRate}%</p>
                      <p className="text-xs text-muted-foreground">Approval Rate</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-2">
                      <p className="text-lg font-bold">{item.avg_turnaround_days}d</p>
                      <p className="text-xs text-muted-foreground">Avg Turnaround</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Detailed Comparison</CardTitle>
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
              {items.map((item) => {
                const approvalRate = item.total_assessments > 0 ? Math.round((item.iqa_approvals / item.total_assessments) * 100) : 0;
                return (
                  <TableRow key={item.trainer?.id || item.trainer?.name || "unassigned"}>
                    <TableCell className="font-medium">{item.trainer?.name || "Unassigned trainer"}</TableCell>
                    <TableCell className="text-center">{item.total_assessments}</TableCell>
                    <TableCell className="text-center">{item.iqa_approvals}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={item.iqa_flags > 0 ? "destructive" : "outline"} className="text-xs">{item.iqa_flags}</Badge>
                    </TableCell>
                    <TableCell className="text-center">{item.avg_turnaround_days} days</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={approvalRate >= 80 ? "default" : approvalRate >= 60 ? "secondary" : "destructive"} className="text-xs">
                        {approvalRate}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrainerPerformance;
