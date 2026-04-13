import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Download, BarChart3, Users, ClipboardCheck, GraduationCap, FileBarChart } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useGetIqaDashboardQuery, useGetIqaReviewQueueQuery } from "@/redux/apis/iqa/iqaApi";

const reports = [
  { id: "trainer-quality", title: "Trainer Assessment Quality", description: "Live trainer approval and flagging summary", icon: Users, category: "Quality" },
  { id: "iqa-summary", title: "IQA Activity Summary", description: "Current review queue, approvals, actions, and escalations", icon: ClipboardCheck, category: "Quality" },
  { id: "resub-analysis", title: "Resubmission Rate Analysis", description: "Queue items that still need changes or rework", icon: GraduationCap, category: "Analytics" },
  { id: "sampling-plan", title: "Sampling Coverage Report", description: "Qualification-level review coverage using live queue/review data", icon: FileBarChart, category: "EQA" },
  { id: "compliance-audit", title: "Compliance Audit Snapshot", description: "Current operational view for IQA monitoring", icon: BarChart3, category: "Audit" },
] as const;

const IQAReports = () => {
  const { toast } = useToast();
  const { data: dashboardData, isLoading: isLoadingDashboard, isError: isDashboardError } = useGetIqaDashboardQuery();
  const { data: queueData, isLoading: isLoadingQueue, isError: isQueueError } = useGetIqaReviewQueueQuery();

  const handleExport = (title: string, format: string) => {
    toast({
      title: `Exporting ${title}`,
      description: `${format.toUpperCase()} export is not implemented yet for this live report.`,
    });
  };

  if (isLoadingDashboard || isLoadingQueue) {
    return <div className="py-20 text-center text-muted-foreground">Loading IQA reports...</div>;
  }

  if (isDashboardError || isQueueError || !dashboardData?.data || !queueData?.data) {
    return <div className="py-20 text-center text-muted-foreground">Failed to load IQA reports.</div>;
  }

  const { summary, trainer_overview } = dashboardData.data;
  const queue = queueData.data;

  const qualificationRows = Object.values(
    queue.reduce<Record<string, {
      qualification: string;
      total: number;
      sampled: number;
      approved: number;
      flagged: number;
      pending: number;
      trainers: Set<string>;
    }>>((acc, item) => {
      const key = item.qualification.id;
      if (!acc[key]) {
        acc[key] = {
          qualification: item.qualification.title,
          total: 0,
          sampled: 0,
          approved: 0,
          flagged: 0,
          pending: 0,
          trainers: new Set<string>(),
        };
      }
      acc[key].total += 1;
      acc[key].sampled += 1;
      if (item.iqa_status === "IQA Approved") acc[key].approved += 1;
      if (item.iqa_status === "Trainer Action Required" || item.iqa_status === "Escalated to Admin") acc[key].flagged += 1;
      if (item.iqa_status === "Pending IQA Review") acc[key].pending += 1;
      if (item.trainer?.name) acc[key].trainers.add(item.trainer.name);
      return acc;
    }, {}),
  ).map((row) => ({
    ...row,
    coveragePercent: row.total > 0 ? Math.round((row.sampled / row.total) * 100) : 0,
    trainers: Array.from(row.trainers),
  }));

  const totalAssessments = qualificationRows.reduce((sum, row) => sum + row.total, 0);
  const totalSampled = qualificationRows.reduce((sum, row) => sum + row.sampled, 0);

  return (
    <div className="space-y-6">
      <Button variant="outline" size="sm" className="gap-2" asChild>
        <Link to="/iqa/dashboard"><ArrowLeft className="w-4 h-4" /> Back to Dashboard</Link>
      </Button>

      <div>
        <h1 className="text-2xl font-bold">IQA Reports & Compliance</h1>
        <p className="text-sm text-muted-foreground">Live operational IQA reporting based on current backend data</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {reports.map((report) => (
          <Card key={report.id} className={report.id === "sampling-plan" ? "border-primary/30 md:col-span-2" : ""}>
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${report.id === "sampling-plan" ? "bg-primary/20" : "bg-primary/10"}`}>
                  <report.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-sm">{report.title}</h3>
                    <Badge variant={report.category === "EQA" ? "default" : "outline"} className="text-xs">{report.category}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">{report.description}</p>
                  <div className="flex gap-2 flex-wrap">
                    <Button size="sm" variant="outline" className="text-xs h-8" onClick={() => handleExport(report.title, "csv")}>
                      <Download className="w-3 h-3 mr-1" /> CSV
                    </Button>
                    <Button size="sm" variant="outline" className="text-xs h-8" onClick={() => handleExport(report.title, "pdf")}>
                      <Download className="w-3 h-3 mr-1" /> PDF
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileBarChart className="w-4 h-4 text-primary" /> Live Sampling Coverage Report
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-muted/50 rounded-lg p-3 text-center">
              <p className="text-xl font-bold text-foreground">{totalAssessments}</p>
              <p className="text-[11px] text-muted-foreground">Queue Items</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3 text-center">
              <p className="text-xl font-bold text-foreground">{summary.approved}</p>
              <p className="text-[11px] text-muted-foreground">Approved</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3 text-center">
              <p className="text-xl font-bold text-foreground">{summary.action_required}</p>
              <p className="text-[11px] text-muted-foreground">Action Required</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3 text-center">
              <p className="text-xl font-bold text-foreground">{summary.escalated}</p>
              <p className="text-[11px] text-muted-foreground">Escalated</p>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-foreground mb-3">Sampling Coverage by Qualification</h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Qualification</TableHead>
                  <TableHead className="text-center">Total</TableHead>
                  <TableHead className="text-center">Approved</TableHead>
                  <TableHead className="text-center">Flagged</TableHead>
                  <TableHead className="text-center">Pending</TableHead>
                  <TableHead className="text-center">Coverage</TableHead>
                  <TableHead>Trainers</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {qualificationRows.map((row) => (
                  <TableRow key={row.qualification}>
                    <TableCell className="font-medium text-sm">{row.qualification}</TableCell>
                    <TableCell className="text-center text-sm">{row.total}</TableCell>
                    <TableCell className="text-center">
                      <Badge className="bg-green-600 text-white text-[10px]">{row.approved}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={row.flagged > 0 ? "destructive" : "outline"} className="text-[10px]">{row.flagged}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="text-[10px]">{row.pending}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className="text-[10px] bg-primary text-primary-foreground">{row.coveragePercent}%</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{row.trainers.join(", ") || "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div>
            <h4 className="text-sm font-bold text-foreground mb-3">Trainer Sampling Summary</h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Trainer</TableHead>
                  <TableHead className="text-center">Total Reviewed</TableHead>
                  <TableHead className="text-center">IQA Approvals</TableHead>
                  <TableHead className="text-center">IQA Flags</TableHead>
                  <TableHead className="text-center">Approval Rate</TableHead>
                  <TableHead className="text-center">Avg Turnaround</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trainer_overview.map((item) => {
                  const approvalRate = item.total_assessments > 0 ? Math.round((item.iqa_approvals / item.total_assessments) * 100) : 0;
                  return (
                    <TableRow key={item.trainer?.id || item.trainer?.name || "unassigned"}>
                      <TableCell className="font-medium text-sm">{item.trainer?.name || "Unassigned trainer"}</TableCell>
                      <TableCell className="text-center text-sm">{item.total_assessments}</TableCell>
                      <TableCell className="text-center">
                        <Badge className="bg-green-600 text-white text-[10px]">{item.iqa_approvals}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={item.iqa_flags > 0 ? "destructive" : "outline"} className="text-[10px]">{item.iqa_flags}</Badge>
                      </TableCell>
                      <TableCell className="text-center text-sm">{approvalRate}%</TableCell>
                      <TableCell className="text-center text-sm">{item.avg_turnaround_days}d</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IQAReports;
