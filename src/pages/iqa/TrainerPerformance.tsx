import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { trainerPerformances } from "@/data/iqaMockData";

const TrainerPerformance = () => {
  return (
    <div className="space-y-6">
      <Link to="/iqa/dashboard" className="inline-flex items-center gap-1.5 text-primary hover:underline text-sm">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <div>
        <h1 className="text-2xl font-bold">Trainer Quality Monitoring</h1>
        <p className="text-sm text-muted-foreground">Track assessment quality and consistency across all trainers</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {trainerPerformances.map((t) => {
          const approvalRate = t.totalAssessments > 0 ? Math.round((t.iqaApprovals / t.totalAssessments) * 100) : 0;
          return (
            <Card key={t.id}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-sm">{t.name}</h3>
                  <Badge variant={t.status === "Active" ? "default" : "secondary"} className="text-xs">{t.status}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-3">{t.email}</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">IQA Approval Rate</span>
                    <span className="font-medium">{approvalRate}%</span>
                  </div>
                  <Progress value={approvalRate} className="h-2" />
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4 text-center">
                  <div className="bg-muted/50 rounded-lg p-2">
                    <p className="text-lg font-bold">{t.totalAssessments}</p>
                    <p className="text-xs text-muted-foreground">Assessments</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-2">
                    <p className="text-lg font-bold">{t.iqaFlags}</p>
                    <p className="text-xs text-muted-foreground">Flagged</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-2">
                    <p className="text-lg font-bold">{t.resubmissionRate}%</p>
                    <p className="text-xs text-muted-foreground">Resub Rate</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-2">
                    <p className="text-lg font-bold">{t.avgTurnaroundDays}d</p>
                    <p className="text-xs text-muted-foreground">Avg Turnaround</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
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
                <TableHead className="text-center">Resub Rate</TableHead>
                <TableHead className="text-center">Avg Turnaround</TableHead>
                <TableHead className="text-center">Approval Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trainerPerformances.map((t) => {
                const approvalRate = t.totalAssessments > 0 ? Math.round((t.iqaApprovals / t.totalAssessments) * 100) : 0;
                return (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">{t.name}</TableCell>
                    <TableCell className="text-center">{t.totalAssessments}</TableCell>
                    <TableCell className="text-center">{t.iqaApprovals}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={t.iqaFlags > 4 ? "destructive" : "outline"} className="text-xs">{t.iqaFlags}</Badge>
                    </TableCell>
                    <TableCell className="text-center">{t.resubmissionRate}%</TableCell>
                    <TableCell className="text-center">{t.avgTurnaroundDays} days</TableCell>
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
