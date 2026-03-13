import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Download, BarChart3, Users, ClipboardCheck, GraduationCap, FileBarChart, Printer } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { iqaSamples, trainerPerformances } from "@/data/iqaMockData";

const reports = [
  { id: "trainer-quality", title: "Trainer Assessment Quality", description: "IQA approval vs flagged assessments per trainer with trend analysis", icon: Users, category: "Quality" },
  { id: "iqa-summary", title: "IQA Activity Summary", description: "Total reviews, approvals, flags, and escalations over time", icon: ClipboardCheck, category: "Quality" },
  { id: "resub-analysis", title: "Resubmission Rate Analysis", description: "Units with high resubmission rates and root cause indicators", icon: GraduationCap, category: "Analytics" },
  { id: "compliance-audit", title: "Compliance Audit Trail", description: "Full audit log of all IQA actions for Ofsted / DfE review", icon: BarChart3, category: "Audit" },
  { id: "sampling-plan", title: "Sampling Plan Report", description: "EQA-ready report showing sampling strategy, coverage, and compliance per qualification and trainer", icon: FileBarChart, category: "EQA" },
];

// Sampling plan data generation
const generateSamplingPlanData = () => {
  const qualGroups: Record<string, typeof iqaSamples> = {};
  iqaSamples.forEach(s => {
    if (!qualGroups[s.qualification]) qualGroups[s.qualification] = [];
    qualGroups[s.qualification].push(s);
  });

  return Object.entries(qualGroups).map(([qual, samples]) => {
    const total = samples.length;
    const sampled = samples.filter(s => s.iqaStatus !== "Pending IQA Review").length;
    const approved = samples.filter(s => s.iqaStatus === "IQA Approved").length;
    const flagged = samples.filter(s => s.iqaStatus === "Assessor Action Required" || s.iqaStatus === "Escalated to Admin").length;
    const trainers = [...new Set(samples.map(s => s.trainerName))];
    return { qualification: qual, total, sampled, approved, flagged, pending: total - sampled, trainers, coveragePercent: Math.round((sampled / total) * 100) };
  });
};

const IQAReports = () => {
  const { toast } = useToast();
  const [showSamplingPlan, setShowSamplingPlan] = useState(false);

  const handleExport = (title: string, format: string) => {
    toast({ title: `Exporting ${title}`, description: `Generating ${format.toUpperCase()} file... (demo)` });
  };

  const samplingData = generateSamplingPlanData();
  const totalSampled = samplingData.reduce((s, d) => s + d.sampled, 0);
  const totalAssessments = samplingData.reduce((s, d) => s + d.total, 0);

  return (
    <div className="space-y-6">
      <Button variant="outline" size="sm" className="gap-2" asChild>
        <Link to="/iqa/dashboard"><ArrowLeft className="w-4 h-4" /> Back to Dashboard</Link>
      </Button>

      <div>
        <h1 className="text-2xl font-bold">IQA Reports & Compliance</h1>
        <p className="text-sm text-muted-foreground">Generate quality assurance reports for regulatory audits</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {reports.map((r) => (
          <Card key={r.id} className={r.id === "sampling-plan" ? "border-primary/30 md:col-span-2" : ""}>
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  r.id === "sampling-plan" ? "bg-primary/20" : "bg-primary/10"
                }`}>
                  <r.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-sm">{r.title}</h3>
                    <Badge variant={r.category === "EQA" ? "default" : "outline"} className="text-xs">{r.category}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">{r.description}</p>
                  <div className="flex gap-2 flex-wrap">
                    {r.id === "sampling-plan" && (
                      <Button size="sm" variant={showSamplingPlan ? "secondary" : "default"} className="text-xs h-8 gap-1.5"
                        onClick={() => setShowSamplingPlan(!showSamplingPlan)}>
                        <FileBarChart className="w-3 h-3" /> {showSamplingPlan ? "Hide Report" : "View Report"}
                      </Button>
                    )}
                    <Button size="sm" variant="outline" className="text-xs h-8" onClick={() => handleExport(r.title, "csv")}>
                      <Download className="w-3 h-3 mr-1" /> CSV
                    </Button>
                    <Button size="sm" variant="outline" className="text-xs h-8" onClick={() => handleExport(r.title, "pdf")}>
                      <Download className="w-3 h-3 mr-1" /> PDF
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Sampling Plan Report */}
      {showSamplingPlan && (
        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileBarChart className="w-4 h-4 text-primary" /> Sampling Plan Report
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  Generated: {new Date().toLocaleDateString("en-GB")} — Period: 2025/26 Academic Year
                </p>
              </div>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => handleExport("Sampling Plan", "pdf")}>
                <Printer className="w-3 h-3" /> Print / Export
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Summary */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-foreground">{totalAssessments}</p>
                <p className="text-[11px] text-muted-foreground">Total Assessments</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-foreground">{totalSampled}</p>
                <p className="text-[11px] text-muted-foreground">Sampled (IQA Reviewed)</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-foreground">{Math.round((totalSampled / totalAssessments) * 100)}%</p>
                <p className="text-[11px] text-muted-foreground">Overall Coverage</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-foreground">{trainerPerformances.length}</p>
                <p className="text-[11px] text-muted-foreground">Active Assessors</p>
              </div>
            </div>

            {/* By Qualification */}
            <div>
              <h4 className="text-sm font-bold text-foreground mb-3">Sampling Coverage by Qualification</h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Qualification</TableHead>
                    <TableHead className="text-center">Total</TableHead>
                    <TableHead className="text-center">Sampled</TableHead>
                    <TableHead className="text-center">Approved</TableHead>
                    <TableHead className="text-center">Flagged</TableHead>
                    <TableHead className="text-center">Pending</TableHead>
                    <TableHead className="text-center">Coverage</TableHead>
                    <TableHead>Assessors</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {samplingData.map((d) => (
                    <TableRow key={d.qualification}>
                      <TableCell className="font-medium text-sm">{d.qualification}</TableCell>
                      <TableCell className="text-center text-sm">{d.total}</TableCell>
                      <TableCell className="text-center text-sm">{d.sampled}</TableCell>
                      <TableCell className="text-center">
                        <Badge className="bg-green-600 text-white text-[10px]">{d.approved}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {d.flagged > 0 ? (
                          <Badge variant="destructive" className="text-[10px]">{d.flagged}</Badge>
                        ) : <span className="text-xs text-muted-foreground">0</span>}
                      </TableCell>
                      <TableCell className="text-center">
                        {d.pending > 0 ? (
                          <Badge variant="outline" className="text-[10px]">{d.pending}</Badge>
                        ) : <span className="text-xs text-muted-foreground">0</span>}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className={`text-[10px] ${
                          d.coveragePercent >= 75 ? "bg-green-600 text-white" :
                          d.coveragePercent >= 50 ? "bg-amber-500 text-white" :
                          "bg-destructive text-destructive-foreground"
                        }`}>{d.coveragePercent}%</Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{d.trainers.join(", ")}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* By Trainer */}
            <div>
              <h4 className="text-sm font-bold text-foreground mb-3">Assessor Sampling Summary</h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Assessor</TableHead>
                    <TableHead className="text-center">Total Assessed</TableHead>
                    <TableHead className="text-center">IQA Approvals</TableHead>
                    <TableHead className="text-center">IQA Flags</TableHead>
                    <TableHead className="text-center">Approval Rate</TableHead>
                    <TableHead className="text-center">Avg Turnaround</TableHead>
                    <TableHead className="text-center">Risk Level</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trainerPerformances.map((t) => {
                    const approvalRate = t.totalAssessments > 0 ? Math.round((t.iqaApprovals / t.totalAssessments) * 100) : 0;
                    const risk = approvalRate >= 80 ? "Low" : approvalRate >= 60 ? "Medium" : "High";
                    return (
                      <TableRow key={t.id}>
                        <TableCell className="font-medium text-sm">{t.name}</TableCell>
                        <TableCell className="text-center text-sm">{t.totalAssessments}</TableCell>
                        <TableCell className="text-center">
                          <Badge className="bg-green-600 text-white text-[10px]">{t.iqaApprovals}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          {t.iqaFlags > 0 ? (
                            <Badge variant="destructive" className="text-[10px]">{t.iqaFlags}</Badge>
                          ) : <span className="text-xs text-muted-foreground">0</span>}
                        </TableCell>
                        <TableCell className="text-center text-sm">{approvalRate}%</TableCell>
                        <TableCell className="text-center text-sm">{t.avgTurnaroundDays}d</TableCell>
                        <TableCell className="text-center">
                          <Badge className={`text-[10px] ${
                            risk === "Low" ? "bg-green-600 text-white" :
                            risk === "Medium" ? "bg-amber-500 text-white" :
                            "bg-destructive text-destructive-foreground"
                          }`}>{risk}</Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Sampling Strategy Statement */}
            <div className="bg-muted/50 rounded-xl p-4 border">
              <h4 className="text-sm font-bold text-foreground mb-2">Sampling Strategy Statement</h4>
              <div className="text-xs text-muted-foreground space-y-2 leading-relaxed">
                <p>The IQA sampling strategy for Prime College follows a risk-based approach aligned with awarding organisation requirements and Ofsted Education Inspection Framework (EIF) standards.</p>
                <p><strong>New Assessors:</strong> 100% of assessments are sampled during the first 3 months of appointment or probation period.</p>
                <p><strong>Established Assessors:</strong> A minimum of 25% of assessments are randomly sampled, with increased sampling where quality concerns are identified.</p>
                <p><strong>Triggered Sampling:</strong> All resubmissions and assessments where previous IQA flags exist are automatically included in the sampling plan.</p>
                <p><strong>Compliance:</strong> Sampling covers all qualifications, all assessors, and a representative cross-section of learners and units to ensure standardisation.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default IQAReports;
