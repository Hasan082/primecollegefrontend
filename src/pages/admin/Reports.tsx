import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, FileText, Users, GraduationCap, BarChart3, Calendar, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { adminLearners, adminQualifications } from "@/data/adminMockData";
import {
  useLazyExportLearnerProgressReportQuery,
  useLazyExportEnrolmentSummaryReportQuery,
  useLazyExportAssessmentActivityReportQuery,
  useLazyExportQualificationStatisticsReportQuery,
  useLazyExportTrainerWorkloadReportQuery,
  useLazyExportEvidenceSubmissionLogReportQuery,
} from "@/redux/apis/reportsApi";

interface ReportType {
  id: string;
  title: string;
  description: string;
  icon: typeof FileText;
  category: string;
  exportFn?: string;
}

const reports: ReportType[] = [
  { id: "learner-progress", title: "Learner Progress Report", description: "Individual or cohort progress, unit completion, and assessment outcomes", icon: Users, category: "Progress", exportFn: "learnerProgress" },
  { id: "enrolment-summary", title: "Enrolment Summary", description: "All enrolments with payment status, dates, and qualification breakdown", icon: GraduationCap, category: "Enrolment", exportFn: "enrolmentSummary" },
  { id: "assessment-activity", title: "Assessment Activity Log", description: "Full audit trail of submissions, assessments, feedback, and outcomes", icon: FileText, category: "Audit", exportFn: "assessmentActivity" },
  { id: "qualification-stats", title: "Qualification Statistics", description: "Pass rates, average completion time, and enrolment numbers per qualification", icon: BarChart3, category: "Analytics", exportFn: "qualificationStats" },
  { id: "trainer-workload", title: "Trainer Workload Report", description: "Assigned learners, pending reviews, and assessment turnaround times", icon: Users, category: "Operations", exportFn: "trainerWorkload" },
  { id: "evidence-log", title: "Evidence Submission Log", description: "Timestamped record of all learner evidence uploads for Ofsted/regulatory audit", icon: Calendar, category: "Audit", exportFn: "evidenceLog" },
];

const Reports = () => {
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dateRange, setDateRange] = useState("all-time");
  const [loadingReport, setLoadingReport] = useState<string | null>(null);
  const { toast } = useToast();

  // Import lazy queries
  const [getLearnerProgress] = useLazyExportLearnerProgressReportQuery();
  const [getEnrolmentSummary] = useLazyExportEnrolmentSummaryReportQuery();
  const [getAssessmentActivity] = useLazyExportAssessmentActivityReportQuery();
  const [getQualificationStats] = useLazyExportQualificationStatisticsReportQuery();
  const [getTrainerWorkload] = useLazyExportTrainerWorkloadReportQuery();
  const [getEvidenceLog] = useLazyExportEvidenceSubmissionLogReportQuery();

  const exportMap: { [key: string]: any } = {
    learnerProgress: getLearnerProgress,
    enrolmentSummary: getEnrolmentSummary,
    assessmentActivity: getAssessmentActivity,
    qualificationStats: getQualificationStats,
    trainerWorkload: getTrainerWorkload,
    evidenceLog: getEvidenceLog,
  };

  const filtered = reports.filter(r => categoryFilter === "all" || r.category === categoryFilter);
  const categories = [...new Set(reports.map(r => r.category))];

  const handleExport = async (report: ReportType, format: "csv" | "pdf") => {
    if (!report.exportFn) {
      toast({ title: "Error", description: "Export function not configured for this report", variant: "destructive" });
      return;
    }

    setLoadingReport(`${report.id}-${format}`);
    try {
      const exportFn = exportMap[report.exportFn];
      if (!exportFn) {
        throw new Error("Export function not found");
      }

      const response = await exportFn({
        format,
        date_range: dateRange as any,
      }).unwrap();

      // Create blob URL and download
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement("a");
      link.href = url;
      
      // Determine file extension and name
      const fileExtension = format === "csv" ? "csv" : "pdf";
      const reportName = report.id.replace(/-/g, "_");
      link.setAttribute("download", `${reportName}.${fileExtension}`);
      
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: `${report.title} exported as ${format.toUpperCase()}`,
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Error",
        description: `Failed to export ${report.title}. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setLoadingReport(null);
    }
  };

  return (
    <div className="space-y-6">
      <Link to="/admin/dashboard" className="inline-flex items-center gap-1.5 text-primary hover:underline text-sm">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <div>
        <h1 className="text-2xl font-bold">Reports & Data Export</h1>
        <p className="text-sm text-muted-foreground">Generate compliance reports and export data for audit purposes</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold">{adminLearners.length}</p><p className="text-xs text-muted-foreground">Total Records</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold">{adminQualifications.length}</p><p className="text-xs text-muted-foreground">Qualifications</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold">{adminLearners.filter(l => l.status === "completed").length}</p><p className="text-xs text-muted-foreground">Completions</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold">100%</p><p className="text-xs text-muted-foreground">Audit Compliance</p></CardContent></Card>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all-time">All Time</SelectItem>
            <SelectItem value="this-month">This Month</SelectItem>
            <SelectItem value="last-3-months">Last 3 Months</SelectItem>
            <SelectItem value="last-6-months">Last 6 Months</SelectItem>
            <SelectItem value="this-year">This Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Report Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        {filtered.map((report) => (
          <Card key={report.id}>
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <report.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-sm">{report.title}</h3>
                    <Badge variant="outline" className="text-xs">{report.category}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">{report.description}</p>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-xs h-8"
                      disabled={loadingReport === `${report.id}-csv`}
                      onClick={() => handleExport(report, "csv")}
                    >
                      {loadingReport === `${report.id}-csv` ? (
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      ) : (
                        <Download className="w-3 h-3 mr-1" />
                      )}
                      CSV
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-xs h-8"
                      disabled={loadingReport === `${report.id}-pdf`}
                      onClick={() => handleExport(report, "pdf")}
                    >
                      {loadingReport === `${report.id}-pdf` ? (
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      ) : (
                        <Download className="w-3 h-3 mr-1" />
                      )}
                      PDF
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Reports;
