import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, FileText, Users, GraduationCap, BarChart3, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { adminLearners, adminQualifications } from "@/data/adminMockData";

interface ReportType {
  id: string;
  title: string;
  description: string;
  icon: typeof FileText;
  category: string;
}

const reports: ReportType[] = [
  { id: "learner-progress", title: "Learner Progress Report", description: "Individual or cohort progress, unit completion, and assessment outcomes", icon: Users, category: "Progress" },
  { id: "enrolment-summary", title: "Enrolment Summary", description: "All enrolments with payment status, dates, and qualification breakdown", icon: GraduationCap, category: "Enrolment" },
  { id: "assessment-activity", title: "Assessment Activity Log", description: "Full audit trail of submissions, assessments, feedback, and outcomes", icon: FileText, category: "Audit" },
  { id: "qualification-stats", title: "Qualification Statistics", description: "Pass rates, average completion time, and enrolment numbers per qualification", icon: BarChart3, category: "Analytics" },
  { id: "trainer-workload", title: "Trainer Workload Report", description: "Assigned learners, pending reviews, and assessment turnaround times", icon: Users, category: "Operations" },
  { id: "evidence-log", title: "Evidence Submission Log", description: "Timestamped record of all learner evidence uploads for Ofsted/regulatory audit", icon: Calendar, category: "Audit" },
];

const Reports = () => {
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dateRange, setDateRange] = useState("all-time");
  const { toast } = useToast();

  const filtered = reports.filter(r => categoryFilter === "all" || r.category === categoryFilter);
  const categories = [...new Set(reports.map(r => r.category))];

  const handleExport = (report: ReportType, format: string) => {
    toast({ title: `Exporting ${report.title}`, description: `Generating ${format.toUpperCase()} file... (demo)` });
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
                    <Button size="sm" variant="outline" className="text-xs h-8" onClick={() => handleExport(report, "csv")}>
                      <Download className="w-3 h-3 mr-1" /> CSV
                    </Button>
                    <Button size="sm" variant="outline" className="text-xs h-8" onClick={() => handleExport(report, "pdf")}>
                      <Download className="w-3 h-3 mr-1" /> PDF
                    </Button>
                    <Button size="sm" variant="outline" className="text-xs h-8" onClick={() => handleExport(report, "xlsx")}>
                      <Download className="w-3 h-3 mr-1" /> Excel
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
