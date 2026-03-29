import { useState } from "react";
import { z } from "zod";
import { FileText, Save, Plus, X, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useUpdatePortfolioConfigMutation } from "@/redux/apis/quiz/quizApi";

const portfolioConfigSchema = z.object({
  instructions: z.string().trim().min(1, "Instructions for Learners is required"),
  acceptedFileTypes: z.array(z.string()).min(1, "Select at least one accepted file type"),
  maxFilesPerSubmission: z
    .number({
      required_error: "Max Files per Submission is required",
      invalid_type_error: "Max Files per Submission must be a number",
    })
    .min(1, "Max Files per Submission minimum 1"),
  maxFileSizeMB: z
    .number({
      required_error: "Max File Size (MB) is required",
      invalid_type_error: "Max File Size (MB) must be a number",
    })
    .gt(1, "Max File Size (MB) should be greater than 1"),
  requireCriteriaLinking: z.boolean(),
  requireEvidenceDescription: z.boolean(),
  exampleEvidence: z.array(z.string()),
  requiredCriteria: z.array(z.string()),
  isActive: z.boolean(),
});

type PortfolioConfigForm = z.infer<typeof portfolioConfigSchema>;

interface Props {
  unitId: string;
  unitCode: string;
  unitName: string;
  onClose?: () => void;
  initialData?: Partial<PortfolioConfigForm>;
}

const FILE_TYPE_OPTIONS = [
  { ext: "pdf", label: "PDF" },
  { ext: "doc", label: "DOC" },
  { ext: "docx", label: "DOCX" },
  { ext: "txt", label: "TXT" },
  { ext: "rtf", label: "RTF" },
  { ext: "odt", label: "ODT" },
  { ext: "xls", label: "XLS" },
  { ext: "xlsx", label: "XLSX" },
  { ext: "csv", label: "CSV" },
  { ext: "ppt", label: "PPT" },
  { ext: "pptx", label: "PPTX" },
  { ext: "odp", label: "ODP" },
  { ext: "jpg", label: "JPG" },
  { ext: "jpeg", label: "JPEG" },
  { ext: "png", label: "PNG" },
  { ext: "gif", label: "GIF" },
  { ext: "webp", label: "WEBP" },
  { ext: "mp4", label: "MP4" },
  { ext: "mov", label: "MOV" },
  { ext: "avi", label: "AVI" },
  { ext: "mp3", label: "MP3" },
  { ext: "wav", label: "WAV" },
];

const DEFAULT_CONFIG: PortfolioConfigForm = {
  instructions: "",
  acceptedFileTypes: [],
  maxFilesPerSubmission: 1,
  maxFileSizeMB: 2,
  requireCriteriaLinking: true,
  requireEvidenceDescription: true,
  exampleEvidence: [],
  requiredCriteria: [],
  isActive: true,
};

type FormErrors = Partial<Record<keyof PortfolioConfigForm, string>>;

// TODO: need to work here if data is already created
const PortfolioInstructionsEditor = ({
  unitId,
  unitCode,
  unitName,
  onClose,
  initialData,
}: Props) => {
  const { toast } = useToast();
  const [updatePortfolioConfig, { isLoading }] = useUpdatePortfolioConfigMutation();

  const [config, setConfig] = useState<PortfolioConfigForm>({
    ...DEFAULT_CONFIG,
    ...initialData,
    acceptedFileTypes: initialData?.acceptedFileTypes ?? DEFAULT_CONFIG.acceptedFileTypes,
    exampleEvidence: initialData?.exampleEvidence ?? DEFAULT_CONFIG.exampleEvidence,
    requiredCriteria: initialData?.requiredCriteria ?? DEFAULT_CONFIG.requiredCriteria,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [newExample, setNewExample] = useState("");
  const [newCriteria, setNewCriteria] = useState("");

  const update = (partial: Partial<PortfolioConfigForm>) => {
    setConfig((prev) => ({ ...prev, ...partial }));
    setHasChanges(true);
  };

  const clearError = (field: keyof PortfolioConfigForm) => {
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const toggleFileType = (ext: string) => {
    const updatedTypes = config.acceptedFileTypes.includes(ext)
      ? config.acceptedFileTypes.filter((t) => t !== ext)
      : [...config.acceptedFileTypes, ext];

    update({ acceptedFileTypes: updatedTypes });

    if (updatedTypes.length > 0) {
      clearError("acceptedFileTypes");
    }
  };

  const addExample = () => {
    const value = newExample.trim();
    if (!value) return;

    update({
      exampleEvidence: [...config.exampleEvidence, value],
    });
    setNewExample("");
  };

  const removeExample = (idx: number) => {
    update({
      exampleEvidence: config.exampleEvidence.filter((_, i) => i !== idx),
    });
  };

  const addCriteria = () => {
    const value = newCriteria.trim();
    if (!value) return;

    if (config.requiredCriteria.includes(value)) {
      toast({
        title: "Criteria already added",
        variant: "destructive",
      });
      return;
    }

    update({
      requiredCriteria: [...config.requiredCriteria, value],
    });
    setNewCriteria("");
  };

  const removeCriteria = (idx: number) => {
    update({
      requiredCriteria: config.requiredCriteria.filter((_, i) => i !== idx),
    });
  };

  const validateForm = () => {
    const result = portfolioConfigSchema.safeParse(config);

    if (result.success) {
      setErrors({});
      return true;
    }

    const fieldErrors: FormErrors = {};
    const flattened = result.error.flatten().fieldErrors;

    for (const key in flattened) {
      const typedKey = key as keyof PortfolioConfigForm;
      const messages = flattened[typedKey];
      if (messages?.length) {
        fieldErrors[typedKey] = messages[0];
      }
    }

    setErrors(fieldErrors);
    return false;
  };

  const buildPayload = () => {
    return {
      instructions: config.instructions.trim(),
      accepted_file_types: config.acceptedFileTypes.join(","),
      max_files_per_submission: config.maxFilesPerSubmission,
      max_file_size_mb: config.maxFileSizeMB,
      require_criteria_linking: config.requireCriteriaLinking,
      require_evidence_description: config.requireEvidenceDescription,
      example_evidence: config.exampleEvidence.join(", "),
      required_criteria: config.requiredCriteria.join(", "),
      is_active: config.isActive,
    };
  };

  const handleSave = async () => {
    const isValid = validateForm();
    if (!isValid) return;

    try {
      const payload = buildPayload();

      await updatePortfolioConfig({
        unitId,
        payload,
      }).unwrap();

      setHasChanges(false);

      toast({
        title: "Portfolio configuration saved",
        description: `Updated for ${unitCode} - ${unitName}`,
      });

      onClose?.();
    } catch (error: any) {
      toast({
        title: "Failed to save portfolio configuration",
        description:
          error?.data?.message ||
          error?.data?.detail ||
          "Something went wrong while saving.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col">
      <ScrollArea className="max-h-[70vh]">
        <div className="space-y-6 px-6 py-6">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Instructions for Learners <span className="text-destructive">*</span>
            </Label>
            <Textarea
              value={config.instructions}
              onChange={(e) => {
                update({ instructions: e.target.value });
                if (e.target.value.trim()) clearError("instructions");
              }}
              placeholder="Explain what evidence learners should upload for this unit. E.g. 'Upload a reflective account demonstrating your understanding of duty of care, supported by witness testimony from your supervisor...'"
              className="min-h-[120px] text-sm focus-visible:ring-1 focus-visible:ring-primary/30"
            />
            {errors.instructions && (
              <p className="text-xs text-destructive">{errors.instructions}</p>
            )}
            <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Info className="h-3 w-3" />
              This guidance is shown to learners when they upload evidence for this unit
            </p>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Example Evidence (Guidance)
            </Label>
            <p className="text-[11px] text-muted-foreground">
              Suggest types of evidence learners could submit
            </p>

            <div className="flex flex-wrap gap-1.5">
              {config.exampleEvidence.map((item, i) => (
                <Badge key={i} variant="outline" className="gap-1 pr-1 text-xs">
                  <FileText className="h-3 w-3" />
                  {item}
                  <button
                    type="button"
                    onClick={() => removeExample(i)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>

            <div className="flex gap-2">
              <Input
                value={newExample}
                onChange={(e) => setNewExample(e.target.value)}
                placeholder="e.g. Witness testimony from supervisor"
                className="text-sm focus-visible:ring-1 focus-visible:ring-primary/30"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addExample();
                  }
                }}
              />
              <Button type="button" size="sm" variant="outline" onClick={addExample} className="shrink-0">
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Required Assessment Criteria
            </Label>
            <p className="text-[11px] text-muted-foreground">
              Criteria that MUST have portfolio evidence submitted
            </p>

            <div className="flex flex-wrap gap-1.5">
              {config.requiredCriteria.map((ac, i) => (
                <Badge key={i} variant="secondary" className="gap-1 pr-1 text-xs font-mono">
                  {ac}
                  <button
                    type="button"
                    onClick={() => removeCriteria(i)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>

            <div className="flex gap-2">
              <Input
                value={newCriteria}
                onChange={(e) => setNewCriteria(e.target.value)}
                placeholder="e.g. AC 1.1"
                className="w-32 text-sm focus-visible:ring-1 focus-visible:ring-primary/30"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCriteria();
                  }
                }}
              />
              <Button type="button" size="sm" variant="outline" onClick={addCriteria} className="shrink-0">
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Max Files per Submission <span className="text-destructive">*</span>
              </Label>
              <Input
                type="number"
                min={1}
                value={config.maxFilesPerSubmission}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  update({ maxFilesPerSubmission: Number.isNaN(value) ? 0 : value });
                  if (!Number.isNaN(value) && value >= 1) clearError("maxFilesPerSubmission");
                }}
                className="text-sm focus-visible:ring-1 focus-visible:ring-primary/30"
              />
              {errors.maxFilesPerSubmission && (
                <p className="text-xs text-destructive">{errors.maxFilesPerSubmission}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Max File Size (MB) <span className="text-destructive">*</span>
              </Label>
              <Input
                type="number"
                min={2}
                value={config.maxFileSizeMB}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  update({ maxFileSizeMB: Number.isNaN(value) ? 0 : value });
                  if (!Number.isNaN(value) && value > 1) clearError("maxFileSizeMB");
                }}
                className="text-sm focus-visible:ring-1 focus-visible:ring-primary/30"
              />
              {errors.maxFileSizeMB && (
                <p className="text-xs text-destructive">{errors.maxFileSizeMB}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Accepted File Types
            </Label>
            <div className="flex flex-wrap gap-1.5">
              {FILE_TYPE_OPTIONS.map((ft) => {
                const active = config.acceptedFileTypes.includes(ft.ext);

                return (
                  <Badge
                    key={ft.ext}
                    variant={active ? "default" : "outline"}
                    className="cursor-pointer select-none text-xs"
                    onClick={() => toggleFileType(ft.ext)}
                  >
                    {ft.label}
                  </Badge>
                );
              })}
            </div>
            {errors.acceptedFileTypes && (
              <p className="text-xs text-destructive">{errors.acceptedFileTypes}</p>
            )}
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-semibold">Require criteria linking</Label>
                <p className="text-[11px] text-muted-foreground">
                  Learners must link evidence to specific assessment criteria
                </p>
              </div>
              <Switch
                checked={config.requireCriteriaLinking}
                onCheckedChange={(v) => update({ requireCriteriaLinking: v })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-semibold">Require evidence description</Label>
                <p className="text-[11px] text-muted-foreground">
                  Learners must explain how their evidence meets the criteria
                </p>
              </div>
              <Switch
                checked={config.requireEvidenceDescription}
                onCheckedChange={(v) => update({ requireEvidenceDescription: v })}
              />
            </div>
          </div>
        </div>
      </ScrollArea>

      <div className="flex justify-end gap-3 border-t bg-muted/20 px-6 py-4">
        <Button type="button" variant="ghost" onClick={onClose} className="font-semibold text-xs">
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleSave}
          className="gap-1.5 font-bold text-xs"
          disabled={isLoading}
        >
          <Save className="h-3.5 w-3.5" />
          {isLoading ? "Saving..." : "Save Configuration"}
        </Button>
      </div>
    </div>
  );
};

export default PortfolioInstructionsEditor;