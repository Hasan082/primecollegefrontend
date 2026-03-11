import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, BarChart3, Users, ClipboardCheck, GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const reports = [
  { id: "trainer-quality", title: "Trainer Assessment Quality", description: "IQA approval vs flagged assessments per trainer with trend analysis", icon: Users, category: "Quality" },
  { id: "iqa-summary", title: "IQA Activity Summary", description: "Total reviews, approvals, flags, and escalations over time", icon: ClipboardCheck, category: "Quality" },
  { id: "resub-analysis", title: "Resubmission Rate Analysis", description: "Units with high resubmission rates and root cause indicators", icon: GraduationCap, category: "Analytics" },
  { id: "compliance-audit", title: "Compliance Audit Trail", description: "Full audit log of all IQA actions for Ofsted / DfE review", icon: BarChart3, category: "Audit" },
];

const IQAReports = () => {
  const { toast } = useToast();

  const handleExport = (title: string, format: string) => {
    toast({ title: `Exporting ${title}`, description: `Generating ${format.toUpperCase()} file... (demo)` });
  };

  return (
    <div className="space-y-6">
      <Link to="/iqa/dashboard" className="inline-flex items-center gap-1.5 text-primary hover:underline text-sm">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <div>
        <h1 className="text-2xl font-bold">IQA Reports & Compliance</h1>
        <p className="text-sm text-muted-foreground">Generate quality assurance reports for regulatory audits</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {reports.map((r) => (
          <Card key={r.id}>
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <r.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-sm">{r.title}</h3>
                    <Badge variant="outline" className="text-xs">{r.category}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">{r.description}</p>
                  <div className="flex gap-2">
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
    </div>
  );
};

export default IQAReports;
