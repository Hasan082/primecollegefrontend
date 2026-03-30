import { useState } from "react";
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
import { Plus, Trash2, Eye, Save, ClipboardList } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";

interface EvaluationQuestion {
  key: string;
  label: string;
  type: "rating" | "textarea" | "single_choice";
  required: boolean;
  options?: string[];
  placeholder?: string;
}

interface EvaluationTemplate {
  id: string;
  qualification: string;
  title: string;
  description: string;
  questions: EvaluationQuestion[];
  version: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const STORAGE_KEY = "admin_evaluation_templates";

const loadTemplate = (qualificationId: string): EvaluationTemplate | null => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const all = JSON.parse(saved);
      return all[qualificationId] || null;
    }
  } catch {}
  return null;
};

const saveTemplate = (
  qualificationId: string,
  template: EvaluationTemplate,
) => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const all = saved ? JSON.parse(saved) : {};
    all[qualificationId] = template;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {}
};

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
  const { toast } = useToast();
  const [previewOpen, setPreviewOpen] = useState(false);

  const [template, setTemplate] = useState<EvaluationTemplate>(() => {
    const saved = loadTemplate(qualificationId);
    return (
      saved || {
        id: crypto.randomUUID(),
        qualification: qualificationId,
        title: "Course Evaluation",
        description: "",
        questions: [],
        version: 1,
        is_active: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    );
  });

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
    updateField("questions", [...template.questions, newQ]);
  };

  const updateQuestion = (
    index: number,
    updates: Partial<EvaluationQuestion>,
  ) => {
    const updated = [...template.questions];
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
      template.questions.filter((_, i) => i !== index),
    );
  };

  const updateOption = (qIndex: number, optIndex: number, value: string) => {
    const q = template.questions[qIndex];
    const opts = [...(q.options || [])];
    opts[optIndex] = value;
    updateQuestion(qIndex, { options: opts });
  };

  const addOption = (qIndex: number) => {
    const q = template.questions[qIndex];
    updateQuestion(qIndex, { options: [...(q.options || []), ""] });
  };

  const removeOption = (qIndex: number, optIndex: number) => {
    const q = template.questions[qIndex];
    updateQuestion(qIndex, {
      options: (q.options || []).filter((_, i) => i !== optIndex),
    });
  };

  const handleSave = () => {
    if (!template.title.trim()) {
      toast({ title: "Title is required", variant: "destructive" });
      return;
    }
    if (!template.description.trim()) {
      toast({ title: "Description is required", variant: "destructive" });
      return;
    }
    if (template.questions.length === 0) {
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

    const updated: EvaluationTemplate = {
      ...template,
      version: template.version + (hasChanges ? 1 : 0),
      updated_at: new Date().toISOString(),
    };
    setTemplate(updated);
    saveTemplate(qualificationId, updated);
    setHasChanges(false);
    toast({ title: "Evaluation template saved" });
  };

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
          <Badge variant="outline" className="text-xs">
            v{template.version}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPreviewOpen(true)}
            disabled={template.questions.length === 0}
          >
            <Eye className="w-4 h-4 mr-1" /> Preview
          </Button>
          <Button size="sm" onClick={handleSave} disabled={!hasChanges}>
            <Save className="w-4 h-4 mr-1" /> Save
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

        {template.questions.length === 0 ? (
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
              {template.questions.map((q) => (
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
