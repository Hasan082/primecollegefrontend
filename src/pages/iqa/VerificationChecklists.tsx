import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ClipboardCheck, CheckCircle2, XCircle, MinusCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { adminQualifications } from "@/data/adminMockData";
import {
  type ChecklistTemplate,
  type CompletedChecklist,
  type CheckResponse,
  loadTemplates,
  loadCompletedChecklists,
  saveCompletedChecklists,
  getResponseOptions,
  RESPONSE_TYPE_LABELS,
} from "@/lib/checklists";

const VerificationChecklists = () => {
  const { toast } = useToast();
  const [templates] = useState<ChecklistTemplate[]>(loadTemplates);
  const [completedList, setCompletedList] = useState<CompletedChecklist[]>(loadCompletedChecklists);
  const [qualFilter, setQualFilter] = useState("all");

  // Active checklist filling
  const [activeTemplate, setActiveTemplate] = useState<ChecklistTemplate | null>(null);
  const [responses, setResponses] = useState<Record<string, CheckResponse>>({});
  const [learnerName, setLearnerName] = useState("");
  const [summaryComment, setSummaryComment] = useState("");

  const filtered = templates.filter(
    (t) => qualFilter === "all" || t.qualificationId === qualFilter
  );

  const getQualTitle = (id: string) =>
    adminQualifications.find((q) => q.id === id)?.title || id;

  const startChecklist = (tpl: ChecklistTemplate) => {
    setActiveTemplate(tpl);
    setResponses({});
    setLearnerName("");
    setSummaryComment("");
  };

  const setResponse = (itemId: string, value: CheckResponse) => {
    setResponses((prev) => ({ ...prev, [itemId]: value }));
  };

  const handleSubmit = () => {
    if (!activeTemplate) return;
    if (!learnerName.trim()) {
      toast({ title: "Please enter the learner name", variant: "destructive" });
      return;
    }
    const unanswered = activeTemplate.items.filter((i) => !responses[i.id]);
    if (unanswered.length > 0) {
      toast({ title: `${unanswered.length} item(s) not answered`, variant: "destructive" });
      return;
    }

    const completed: CompletedChecklist = {
      id: `cc-${Date.now()}`,
      templateId: activeTemplate.id,
      qualificationId: activeTemplate.qualificationId,
      unitCode: activeTemplate.unitCode,
      iqaName: "Catherine (IQA)",
      learnerName: learnerName.trim(),
      responses,
      summaryComment: summaryComment.trim(),
      completedDate: new Date().toLocaleDateString("en-GB"),
    };
    const updated = [completed, ...completedList];
    setCompletedList(updated);
    saveCompletedChecklists(updated);
    setActiveTemplate(null);
    toast({ title: "Verification checklist submitted", description: `${activeTemplate.title} completed for ${learnerName}.` });
  };

  const responseIcon = (val: CheckResponse) => {
    if (val === "yes" || val === "met") return <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />;
    if (val === "no" || val === "not-met") return <XCircle className="w-3.5 h-3.5 text-destructive" />;
    if (val === "na") return <MinusCircle className="w-3.5 h-3.5 text-muted-foreground" />;
    return null;
  };

  // ── Filling a checklist ──
  if (activeTemplate) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" onClick={() => setActiveTemplate(null)} className="gap-1">
          <ArrowLeft className="w-4 h-4" /> Back to Checklists
        </Button>

        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ClipboardCheck className="w-6 h-6" /> {activeTemplate.title}
          </h1>
          <p className="text-sm text-muted-foreground">
            {getQualTitle(activeTemplate.qualificationId)}
            {activeTemplate.unitCode && ` · Unit: ${activeTemplate.unitCode}`}
          </p>
        </div>

        <Card>
          <CardContent className="p-4 space-y-2">
            <Label className="text-xs">Learner Name *</Label>
            <input
              className="flex h-10 w-full max-w-sm rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Enter learner name"
              value={learnerName}
              onChange={(e) => setLearnerName(e.target.value)}
            />
          </CardContent>
        </Card>

        <div className="space-y-3">
          {activeTemplate.items.map((item, i) => {
            const options = getResponseOptions(item.responseType);
            return (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-xs font-bold text-muted-foreground mt-1 w-6">{i + 1}.</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium mb-3">{item.label}</p>
                      <RadioGroup
                        value={responses[item.id] || ""}
                        onValueChange={(v) => setResponse(item.id, v as CheckResponse)}
                        className="flex gap-4"
                      >
                        {options.map((opt) => (
                          <div key={opt.value} className="flex items-center gap-1.5">
                            <RadioGroupItem value={opt.value} id={`${item.id}-${opt.value}`} />
                            <label htmlFor={`${item.id}-${opt.value}`} className="text-sm cursor-pointer">
                              {opt.label}
                            </label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                    <Badge variant="outline" className="text-[10px] shrink-0">
                      {RESPONSE_TYPE_LABELS[item.responseType]}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardContent className="p-4 space-y-2">
            <Label className="text-xs">Summary Comment</Label>
            <Textarea
              value={summaryComment}
              onChange={(e) => setSummaryComment(e.target.value)}
              placeholder="Add any additional notes or observations..."
              rows={4}
            />
          </CardContent>
        </Card>

        <Button className="w-full" onClick={handleSubmit}>
          <ClipboardCheck className="w-4 h-4 mr-1" /> Submit Verification
        </Button>
      </div>
    );
  }

  // ── Main list ──
  return (
    <div className="space-y-6">
      <Link to="/iqa/dashboard" className="inline-flex items-center gap-1.5 text-primary hover:underline text-sm">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ClipboardCheck className="w-6 h-6" /> Verification Checklists
        </h1>
        <p className="text-sm text-muted-foreground">
          Complete admin-defined verification checks for qualifications and units
        </p>
      </div>

      <Select value={qualFilter} onValueChange={setQualFilter}>
        <SelectTrigger className="w-[280px]">
          <SelectValue placeholder="All Qualifications" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Qualifications</SelectItem>
          {adminQualifications.map((q) => (
            <SelectItem key={q.id} value={q.id}>{q.title}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {filtered.length === 0 ? (
        <Card className="p-8 text-center">
          <ClipboardCheck className="w-10 h-10 mx-auto mb-2 text-muted-foreground opacity-50" />
          <p className="text-sm text-muted-foreground">No checklists available. Admin needs to create checklist templates first.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((tpl) => (
            <Card key={tpl.id}>
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <p className="text-sm font-semibold">{tpl.title}</p>
                    <Badge variant={tpl.unitCode ? "secondary" : "outline"} className="text-[10px]">
                      {tpl.unitCode ? `Unit: ${tpl.unitCode}` : "Qualification-level"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{getQualTitle(tpl.qualificationId)} · {tpl.items.length} checks</p>
                </div>
                <Button size="sm" className="gap-1" onClick={() => startChecklist(tpl)}>
                  <ClipboardCheck className="w-3.5 h-3.5" /> Start Check
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Completed History */}
      {completedList.length > 0 && (
        <div className="pt-4">
          <h2 className="text-lg font-bold mb-3">Completed Verifications</h2>
          <div className="space-y-2">
            {completedList.map((cc) => {
              const tpl = templates.find((t) => t.id === cc.templateId);
              const totalYes = Object.values(cc.responses).filter((v) => v === "yes" || v === "met").length;
              const totalNo = Object.values(cc.responses).filter((v) => v === "no" || v === "not-met").length;
              const total = Object.keys(cc.responses).length;

              return (
                <Card key={cc.id}>
                  <CardContent className="p-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium">{tpl?.title || cc.templateId}</p>
                      <p className="text-xs text-muted-foreground">
                        Learner: {cc.learnerName} · {cc.completedDate} · by {cc.iqaName}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="default" className="text-[10px] gap-1">
                        <CheckCircle2 className="w-3 h-3" /> {totalYes}/{total}
                      </Badge>
                      {totalNo > 0 && (
                        <Badge variant="destructive" className="text-[10px] gap-1">
                          <XCircle className="w-3 h-3" /> {totalNo}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default VerificationChecklists;
