import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ClipboardCheck, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  useCreateChecklistCompletionMutation,
  useGetChecklistCompletionsQuery,
  useGetChecklistTemplatesForIqaQuery,
  useGetIqaAssignedEnrolmentsQuery,
} from "@/redux/apis/iqa/iqaApi";
import type { ChecklistTemplateItem } from "@/types/iqa.types";

type CheckResponse = "yes" | "no" | "na" | "met" | "not_met";

const RESPONSE_TYPE_LABELS: Record<ChecklistTemplateItem["response_type"], string> = {
  yes_no: "Yes / No",
  yes_no_na: "Yes / No / N/A",
  met_notmet_na: "Met / Not Met / N/A",
};

const getResponseOptions = (responseType: ChecklistTemplateItem["response_type"]) => {
  if (responseType === "yes_no") {
    return [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
    ];
  }
  if (responseType === "yes_no_na") {
    return [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
      { value: "na", label: "N/A" },
    ];
  }
  return [
    { value: "met", label: "Met" },
    { value: "not_met", label: "Not Met" },
    { value: "na", label: "N/A" },
  ];
};

const normalizeEnrolments = (value: unknown) => {
  if (Array.isArray(value)) return value;
  if (value && typeof value === "object") {
    const paginated = value as { results?: unknown };
    if (Array.isArray(paginated.results)) return paginated.results;
  }
  return [];
};

const VerificationChecklists = () => {
  const { toast } = useToast();
  const [qualFilter, setQualFilter] = useState("all");

  // Active checklist filling
  const [activeTemplateId, setActiveTemplateId] = useState<string | null>(null);
  const [responses, setResponses] = useState<Record<string, CheckResponse>>({});
  const [selectedEnrolmentId, setSelectedEnrolmentId] = useState("");
  const [summaryComment, setSummaryComment] = useState("");

  const { data: templatesResponse, isLoading: isLoadingTemplates } =
    useGetChecklistTemplatesForIqaQuery();
  const { data: completionsResponse, isLoading: isLoadingCompletions } =
    useGetChecklistCompletionsQuery();
  const { data: enrolmentsResponse, isLoading: isLoadingEnrolments } =
    useGetIqaAssignedEnrolmentsQuery();
  const [createChecklistCompletion, { isLoading: isSavingCompletion }] =
    useCreateChecklistCompletionMutation();

  const templates = templatesResponse?.results || [];
  const completions = completionsResponse?.results || [];
  const enrolments = normalizeEnrolments(enrolmentsResponse?.data);
  const qualificationOptions = Array.from(
    new Map(
      templates.map((template) => [
        template.qualification_id,
        { id: template.qualification_id, title: template.qualification_title },
      ]),
    ).values(),
  );

  const filtered = templates.filter(
    (t) => qualFilter === "all" || t.qualification_id === qualFilter
  );

  const activeTemplate =
    templates.find((template) => template.id === activeTemplateId) || null;

  const eligibleEnrolments = useMemo(() => {
    if (!activeTemplate) return [];
    return enrolments.filter(
      (enrolment) => enrolment.qualification.id === activeTemplate.qualification_id,
    );
  }, [activeTemplate, enrolments]);

  const enrolmentById = useMemo(
    () => new Map(enrolments.map((enrolment) => [enrolment.id, enrolment])),
    [enrolments],
  );

  const startChecklist = (templateId: string) => {
    setActiveTemplateId(templateId);
    setResponses({});
    setSelectedEnrolmentId("");
    setSummaryComment("");
  };

  const setResponse = (itemId: string, value: CheckResponse) => {
    setResponses((prev) => ({ ...prev, [itemId]: value }));
  };

  const handleSubmit = async () => {
    if (!activeTemplate) return;
    if (!selectedEnrolmentId) {
      toast({ title: "Please select the learner enrolment", variant: "destructive" });
      return;
    }
    const unanswered = activeTemplate.items.filter((i) => !responses[i.id]);
    if (unanswered.length > 0) {
      toast({ title: `${unanswered.length} item(s) not answered`, variant: "destructive" });
      return;
    }

    try {
      const submission = await createChecklistCompletion({
        template_id: activeTemplate.id,
        enrolment_id: selectedEnrolmentId,
        responses,
        summary_comment: summaryComment.trim(),
      }).unwrap();
      const learnerName =
        enrolmentById.get(selectedEnrolmentId)?.learner.name || "the learner";
      setActiveTemplateId(null);
      toast({
        title: "Verification checklist submitted",
        description: `${submission.template.title} completed for ${learnerName}.`,
      });
    } catch {
      toast({
        title: "Failed to submit verification checklist",
        variant: "destructive",
      });
    }
  };

  // ── Filling a checklist ──
  if (activeTemplate) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" onClick={() => setActiveTemplateId(null)} className="gap-1">
          <ArrowLeft className="w-4 h-4" /> Back to Checklists
        </Button>

        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ClipboardCheck className="w-6 h-6" /> {activeTemplate.title}
          </h1>
          <p className="text-sm text-muted-foreground">
            {activeTemplate.qualification_title}
            {activeTemplate.unit_title && ` · Unit: ${activeTemplate.unit_title}`}
          </p>
        </div>

        <Card>
          <CardContent className="p-4 space-y-2">
            <Label className="text-xs">Assigned Learner *</Label>
            <Select value={selectedEnrolmentId} onValueChange={setSelectedEnrolmentId}>
              <SelectTrigger className="max-w-xl">
                <SelectValue placeholder="Select learner enrolment" />
              </SelectTrigger>
              <SelectContent>
                {eligibleEnrolments.map((enrolment) => (
                  <SelectItem key={enrolment.id} value={enrolment.id}>
                    {enrolment.learner.name} · {enrolment.enrolment_number}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <div className="space-y-3">
          {activeTemplate.items.map((item, i) => {
            const options = getResponseOptions(item.response_type);
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
                      {RESPONSE_TYPE_LABELS[item.response_type]}
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

        <Button className="w-full" onClick={handleSubmit} disabled={isSavingCompletion}>
          <ClipboardCheck className="w-4 h-4 mr-1" />
          {isSavingCompletion ? "Submitting..." : "Submit Verification"}
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
          {qualificationOptions.map((qualification) => (
            <SelectItem key={qualification.id} value={qualification.id}>
              {qualification.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {isLoadingTemplates || isLoadingEnrolments ? (
        <Card className="p-8 text-center">
          <p className="text-sm text-muted-foreground">Loading checklist templates...</p>
        </Card>
      ) : filtered.length === 0 ? (
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
                    <Badge variant={tpl.unit_id ? "secondary" : "outline"} className="text-[10px]">
                      {tpl.unit_title ? `Unit: ${tpl.unit_title}` : "Qualification-level"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{tpl.qualification_title} · {tpl.items.length} checks</p>
                </div>
                <Button size="sm" className="gap-1" onClick={() => startChecklist(tpl.id)}>
                  <ClipboardCheck className="w-3.5 h-3.5" /> Start Check
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Completed History */}
      {!isLoadingCompletions && completions.length > 0 && (
        <div className="pt-4">
          <h2 className="text-lg font-bold mb-3">Completed Verifications</h2>
          <div className="space-y-2">
            {completions.map((completion) => {
              const learnerName =
                enrolmentById.get(completion.enrolment_id)?.learner.name ||
                completion.enrolment_id;
              const totalYes = Object.values(completion.responses).filter((v) => v === "yes" || v === "met").length;
              const totalNo = Object.values(completion.responses).filter((v) => v === "no" || v === "not_met").length;
              const total = Object.keys(completion.responses).length;

              return (
                <Card key={completion.id}>
                  <CardContent className="p-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium">{completion.template.title}</p>
                      <p className="text-xs text-muted-foreground">
                        Learner: {learnerName} · {new Date(completion.completed_at).toLocaleDateString("en-GB")} · by {completion.iqa_reviewer.name}
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
