import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Eye, Save, ClipboardList, Loader2, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import {
  useGetAdminEvaluationTemplateQuery,
  useCreateAdminEvaluationTemplateMutation,
  useUpdateAdminEvaluationTemplateMutation,
  EvaluationTemplate,
  EvaluationQuestion,
} from "@/redux/apis/enrolmentDeclarationApi";

interface CourseEvaluationEditorProps {
  qualificationId: string;
}

const QUESTION_TYPES = [
  { value: "rating", label: "Rating (1-5 stars)" },
  { value: "textarea", label: "Free text" },
  { value: "single_choice", label: "Single choice" },
] as const;

const CourseEvaluationEditor = ({
  qualificationId,
}: CourseEvaluationEditorProps) => {
  const {
    data: apiResponse,
    isLoading,
    error,
    refetch,
  } = useGetAdminEvaluationTemplateQuery(qualificationId);
  const [createTemplate] = useCreateAdminEvaluationTemplateMutation();
  const [updateTemplate] = useUpdateAdminEvaluationTemplateMutation();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const [template, setTemplate] = useState<Partial<EvaluationTemplate>>({
    title: "Course Evaluation",
    description: "",
    questions: [],
    is_active: false,
  });

  useEffect(() => {
    if (apiResponse?.data) {
      setTemplate(apiResponse.data);
    }
  }, [apiResponse]);

  const [hasChanges, setHasChanges] = useState(false);

  const updateField = <K extends keyof EvaluationTemplate>(
    key: K,
    value: EvaluationTemplate[K],
  ) => {
    setTemplate((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const addQuestion = () => {
    const newQ: EvaluationQuestion = {
      key: `q_${Date.now()}`,
      label: "",
      type: "rating",
      required: true,
    };
    updateField("questions", [...(template.questions || []), newQ]);
  };

  const updateQuestion = (
    index: number,
    updates: Partial<EvaluationQuestion>,
  ) => {
    const updated = [...(template.questions || [])];
    updated[index] = { ...updated[index], ...updates };
    // Add default options when switching to single_choice
    if (updates.type === "single_choice" && !updated[index].options?.length) {
      updated[index].options = ["Yes", "No"];
    }
    // Clear options when switching away from single_choice
    if (updates.type && updates.type !== "single_choice") {
      delete updated[index].options;
    }
    updateField("questions", updated);
  };

  const removeQuestion = (index: number) => {
    updateField(
      "questions",
      (template.questions || []).filter((_, i) => i !== index),
    );
  };

  const updateOption = (qIndex: number, optIndex: number, value: string) => {
    const questions = template.questions || [];
    const q = questions[qIndex];
    const opts = [...(q.options || [])];
    opts[optIndex] = value;
    updateQuestion(qIndex, { options: opts });
  };

  const addOption = (qIndex: number) => {
    const questions = template.questions || [];
    const q = questions[qIndex];
    updateQuestion(qIndex, { options: [...(q.options || []), ""] });
  };

  const removeOption = (qIndex: number, optIndex: number) => {
    const questions = template.questions || [];
    const q = questions[qIndex];
    updateQuestion(qIndex, {
      options: (q.options || []).filter((_, i) => i !== optIndex),
    });
  };

  const handleSave = async () => {
    if (!template.title?.trim()) {
      toast({ title: "Title is required", variant: "destructive" });
      return;
    }
    if (!template.description?.trim()) {
      toast({ title: "Description is required", variant: "destructive" });
      return;
    }
    if (!template.questions || template.questions.length === 0) {
      toast({
        title: "At least one question is required",
        variant: "destructive",
      });
      return;
    }
    const emptyLabels = template.questions.some((q) => !q.label.trim());
    if (emptyLabels) {
      toast({
        title: "All questions must have a label",
        variant: "destructive",
      });
      return;
    }
    const keys = template.questions.map((q) => q.key);
    if (new Set(keys).size !== keys.length) {
      toast({ title: "Question keys must be unique", variant: "destructive" });
      return;
    }
    const choiceWithoutOptions = template.questions.some(
      (q) =>
        q.type === "single_choice" &&
        (!q.options || q.options.filter((o) => o.trim()).length < 2),
    );
    if (choiceWithoutOptions) {
      toast({
        title: "Single choice questions need at least 2 options",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      if (apiResponse?.data) {
        // Update existing
        await updateTemplate({
          qualificationId,
          payload: {
            qualification: qualificationId,
            title: template.title,
            description: template.description,
            questions: template.questions,
            is_active: template.is_active,
          },
        }).unwrap();
        toast({ title: "Evaluation template updated" });
      } else {
        // Create new
        await createTemplate({
          qualificationId,
          payload: {
            qualification: qualificationId,
            title: template.title,
            description: template.description,
            questions: template.questions,
            is_active: template.is_active,
          },
        }).unwrap();
        toast({ title: "Evaluation template created" });
      }
      setHasChanges(false);
    } catch (err) {
      toast({
        title: "Failed to save template",
        description: "An error occurred while communicating with the server.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">
          Loading evaluation configuration...
        </p>
      </div>
    );
  }

  const isNotFoundError = (error as any)?.status === 404;

  if (error && !isNotFoundError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-destructive">
        <AlertTriangle className="w-8 h-8" />
        <p className="text-sm font-medium">Failed to load evaluation configuration.</p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ClipboardList className="w-5 h-5 text-primary" />
          <div>
            <h2 className="text-lg font-bold text-foreground">
              Course Evaluation
            </h2>
            <p className="text-sm text-muted-foreground">
              Configure the evaluation form learners complete after finishing
              the qualification.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {template.version && (
            <Badge variant="outline" className="text-xs">
              v{template.version}
            </Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPreviewOpen(true)}
            disabled={!template.questions || template.questions.length === 0}
          >
            <Eye className="w-4 h-4 mr-1" /> Preview
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-1" />
            )}
            Save
          </Button>
        </div>
      </div>

      <Separator />

      {/* Active Toggle */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">
              Enable Evaluation
            </p>
            <p className="text-xs text-muted-foreground">
              When enabled, learners must complete this evaluation before
              qualification completion.
            </p>
          </div>
          <Switch
            checked={template.is_active}
            onCheckedChange={(checked) => updateField("is_active", checked)}
          />
        </div>
      </Card>

      {/* Title & Description */}
      <Card className="p-4 space-y-4">
        <div className="space-y-1.5">
          <Label>Evaluation Title *</Label>
          <Input
            value={template.title}
            onChange={(e) => updateField("title", e.target.value)}
            placeholder="e.g. Course Evaluation"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Description *</Label>
          <Textarea
            value={template.description}
            onChange={(e) => updateField("description", e.target.value)}
            placeholder="Please complete the evaluation below."
            rows={3}
          />
          <p className="text-xs text-muted-foreground">
            Displayed at the top of the evaluation form.
          </p>
        </div>
      </Card>

      {/* Questions */}
      <Card className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">Questions</p>
            <p className="text-xs text-muted-foreground">
              Add rating, free text, or single choice questions. Keys are used
              internally for answer tracking.
            </p>
          </div>
          <Button size="sm" variant="outline" onClick={addQuestion}>
            <Plus className="w-4 h-4 mr-1" /> Add Question
          </Button>
        </div>

        {(!template.questions || template.questions.length === 0) ? (
          <p className="text-sm text-muted-foreground italic text-center py-4">
            No questions yet. Click "Add Question" to create one.
          </p>
        ) : (
          <div className="space-y-4">
            {template.questions.map((q, index) => (
              <div
                key={index}
                className="p-3 bg-muted/30 rounded-lg border space-y-3"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 space-y-3">
                    <div className="grid grid-cols-4 gap-2">
                      <div className="col-span-1 space-y-1">
                        <Label className="text-xs">Key</Label>
                        <Input
                          value={q.key}
                          onChange={(e) => {
                            const sanitized = e.target.value
                              .replace(/[^a-z0-9_]/gi, "_")
                              .toLowerCase();
                            updateQuestion(index, { key: sanitized });
                          }}
                          placeholder="e.g. overall_rating"
                          className="text-xs font-mono"
                        />
                      </div>
                      <div className="col-span-2 space-y-1">
                        <Label className="text-xs">
                          Label (learner-facing) *
                        </Label>
                        <Input
                          value={q.label}
                          onChange={(e) =>
                            updateQuestion(index, { label: e.target.value })
                          }
                          placeholder="e.g. How would you rate the course overall?"
                        />
                      </div>
                      <div className="col-span-1 space-y-1">
                        <Label className="text-xs">Type</Label>
                        <Select
                          value={q.type}
                          onValueChange={(val) =>
                            updateQuestion(index, {
                              type: val as EvaluationQuestion["type"],
                            })
                          }
                        >
                          <SelectTrigger className="text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {QUESTION_TYPES.map((t) => (
                              <SelectItem key={t.value} value={t.value}>
                                {t.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Options for single_choice */}
                    {q.type === "single_choice" && (
                      <div className="space-y-2">
                        <Label className="text-xs">Options</Label>
                        {(q.options || []).map((opt, optIdx) => (
                          <div key={optIdx} className="flex items-center gap-2">
                            <Input
                              value={opt}
                              onChange={(e) =>
                                updateOption(index, optIdx, e.target.value)
                              }
                              placeholder={`Option ${optIdx + 1}`}
                              className="text-xs"
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-destructive"
                              onClick={() => removeOption(index, optIdx)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs"
                          onClick={() => addOption(index)}
                        >
                          <Plus className="w-3 h-3 mr-1" /> Add Option
                        </Button>
                      </div>
                    )}

                    {/* Placeholder for textarea */}
                    {q.type === "textarea" && (
                      <div className="space-y-1">
                        <Label className="text-xs">
                          Placeholder (optional)
                        </Label>
                        <Input
                          value={q.placeholder || ""}
                          onChange={(e) =>
                            updateQuestion(index, {
                              placeholder: e.target.value,
                            })
                          }
                          placeholder="e.g. Write your feedback here"
                          className="text-xs"
                        />
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <Switch
                        checked={q.required}
                        onCheckedChange={(checked) =>
                          updateQuestion(index, { required: checked })
                        }
                      />
                      <span className="text-xs text-muted-foreground">
                        Required
                      </span>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive mt-5"
                    onClick={() => removeQuestion(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Evaluation Preview (Learner View)</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 pt-2">
            <h3 className="text-lg font-bold text-foreground">
              {template.title}
            </h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {template.description}
            </p>
            <Separator />
            <div className="space-y-5">
              {template.questions?.map((q) => (
                <div key={q.key} className="space-y-2">
                  <p className="text-sm font-medium text-foreground">
                    {q.label}{" "}
                    {q.required && <span className="text-destructive">*</span>}
                  </p>
                  {q.type === "rating" && (
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className="text-2xl text-muted-foreground/40 cursor-default"
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  )}
                  {q.type === "textarea" && (
                    <Textarea
                      disabled
                      placeholder={q.placeholder || "Type your answer..."}
                      rows={3}
                    />
                  )}
                  {q.type === "single_choice" && (
                    <RadioGroup disabled>
                      {(q.options || []).map((opt, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <RadioGroupItem
                            value={opt}
                            id={`prev-${q.key}-${i}`}
                            disabled
                          />
                          <Label
                            htmlFor={`prev-${q.key}-${i}`}
                            className="text-sm font-normal"
                          >
                            {opt}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}
                </div>
              ))}
            </div>
            <Separator />
            <Button disabled className="w-full">
              Submit Evaluation
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CourseEvaluationEditor;
