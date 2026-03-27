import { useState, useEffect } from "react";
import { FileText, Save, Plus, X, Info, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface PortfolioConfig {
  instructions: string;
  acceptedFileTypes: string[];
  maxFilesPerSubmission: number;
  maxFileSizeMB: number;
  requireCriteriaLinking: boolean;
  requireEvidenceDescription: boolean;
  exampleEvidence: string[];
  requiredCriteria: string[];
}

const DEFAULT_CONFIG: PortfolioConfig = {
  instructions: "",
  acceptedFileTypes: [".pdf", ".doc", ".docx", ".jpg", ".png"],
  maxFilesPerSubmission: 5,
  maxFileSizeMB: 20,
  requireCriteriaLinking: true,
  requireEvidenceDescription: true,
  exampleEvidence: [],
  requiredCriteria: [],
};

const STORAGE_KEY = "portfolio_config";

function loadPortfolioConfig(unitCode: string): PortfolioConfig {
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return all[unitCode] || { ...DEFAULT_CONFIG };
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

function savePortfolioConfig(unitCode: string, config: PortfolioConfig) {
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    all[unitCode] = config;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {}
}

interface Props {
  unitCode: string;
  unitName: string;
  onClose?: () => void;
}

const FILE_TYPE_OPTIONS = [
  { ext: ".pdf", label: "PDF" },
  { ext: ".doc", label: "DOC" },
  { ext: ".docx", label: "DOCX" },
  { ext: ".jpg", label: "JPG" },
  { ext: ".png", label: "PNG" },
  { ext: ".mp4", label: "MP4" },
  { ext: ".ppt", label: "PPT" },
  { ext: ".pptx", label: "PPTX" },
  { ext: ".xls", label: "XLS" },
  { ext: ".xlsx", label: "XLSX" },
];

const PortfolioInstructionsEditor = ({ unitCode, unitName, onClose }: Props) => {
  const { toast } = useToast();
  const [config, setConfig] = useState<PortfolioConfig>(() => loadPortfolioConfig(unitCode));
  const [hasChanges, setHasChanges] = useState(false);
  const [newExample, setNewExample] = useState("");
  const [newCriteria, setNewCriteria] = useState("");

  useEffect(() => {
    setConfig(loadPortfolioConfig(unitCode));
    setHasChanges(false);
  }, [unitCode]);

  const update = (partial: Partial<PortfolioConfig>) => {
    setConfig((prev) => ({ ...prev, ...partial }));
    setHasChanges(true);
  };

  const toggleFileType = (ext: string) => {
    const types = config.acceptedFileTypes.includes(ext)
      ? config.acceptedFileTypes.filter((t) => t !== ext)
      : [...config.acceptedFileTypes, ext];
    if (types.length === 0) {
      toast({ title: "At least one file type must be accepted", variant: "destructive" });
      return;
    }
    update({ acceptedFileTypes: types });
  };

  const addExample = () => {
    if (!newExample.trim()) return;
    update({ exampleEvidence: [...config.exampleEvidence, newExample.trim()] });
    setNewExample("");
  };

  const removeExample = (idx: number) => {
    update({ exampleEvidence: config.exampleEvidence.filter((_, i) => i !== idx) });
  };

  const addCriteria = () => {
    if (!newCriteria.trim()) return;
    if (config.requiredCriteria.includes(newCriteria.trim())) {
      toast({ title: "Criteria already added", variant: "destructive" });
      return;
    }
    update({ requiredCriteria: [...config.requiredCriteria, newCriteria.trim()] });
    setNewCriteria("");
  };

  const removeCriteria = (idx: number) => {
    update({ requiredCriteria: config.requiredCriteria.filter((_, i) => i !== idx) });
  };

  const handleSave = () => {
    savePortfolioConfig(unitCode, config);
    setHasChanges(false);
    toast({ title: "Portfolio instructions saved", description: `Updated for ${unitCode}` });
    onClose?.();
  };

  return (
    <div className="flex flex-col">
      <ScrollArea className="max-h-[70vh]">
        <div className="space-y-6 py-6 px-6">
          {/* Instructions text */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Instructions for Learners
            </Label>
            <Textarea
              value={config.instructions}
              onChange={(e) => update({ instructions: e.target.value })}
              placeholder="Explain what evidence learners should upload for this unit. E.g. 'Upload a reflective account demonstrating your understanding of duty of care, supported by witness testimony from your supervisor...'"
              className="min-h-[120px] text-sm focus-visible:ring-1 focus-visible:ring-primary/30"
            />
            <p className="text-[11px] text-muted-foreground flex items-center gap-1">
              <Info className="w-3 h-3" />
              This guidance is shown to learners when they upload evidence for this unit
            </p>
          </div>

          <Separator />

          {/* Example evidence items */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Example Evidence (Guidance)
            </Label>
            <p className="text-[11px] text-muted-foreground">
              Suggest types of evidence learners could submit
            </p>
            <div className="flex flex-wrap gap-1.5">
              {config.exampleEvidence.map((item, i) => (
                <Badge key={i} variant="outline" className="gap-1 pr-1 text-xs">
                  <FileText className="w-3 h-3" />
                  {item}
                  <button onClick={() => removeExample(i)} className="ml-1 hover:text-destructive">
                    <X className="w-3 h-3" />
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
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addExample())}
              />
              <Button size="sm" variant="outline" onClick={addExample} className="shrink-0">
                <Plus className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          <Separator />

          {/* Required criteria */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Required Assessment Criteria
            </Label>
            <p className="text-[11px] text-muted-foreground">
              Criteria that MUST have portfolio evidence submitted
            </p>
            <div className="flex flex-wrap gap-1.5">
              {config.requiredCriteria.map((ac, i) => (
                <Badge key={i} variant="secondary" className="gap-1 pr-1 text-xs font-mono">
                  {ac}
                  <button onClick={() => removeCriteria(i)} className="ml-1 hover:text-destructive">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newCriteria}
                onChange={(e) => setNewCriteria(e.target.value)}
                placeholder="e.g. AC 1.1"
                className="text-sm w-32 focus-visible:ring-1 focus-visible:ring-primary/30"
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCriteria())}
              />
              <Button size="sm" variant="outline" onClick={addCriteria} className="shrink-0">
                <Plus className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          <Separator />

          {/* File rules */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Max Files per Submission
              </Label>
              <Input
                type="number"
                min={1}
                max={20}
                value={config.maxFilesPerSubmission}
                onChange={(e) => update({ maxFilesPerSubmission: parseInt(e.target.value) || 5 })}
                className="text-sm focus-visible:ring-1 focus-visible:ring-primary/30"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Max File Size (MB)
              </Label>
              <Input
                type="number"
                min={1}
                max={100}
                value={config.maxFileSizeMB}
                onChange={(e) => update({ maxFileSizeMB: parseInt(e.target.value) || 20 })}
                className="text-sm focus-visible:ring-1 focus-visible:ring-primary/30"
              />
            </div>
          </div>

          {/* Accepted file types */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Accepted File Types
            </Label>
            <div className="flex flex-wrap gap-1.5">
              {FILE_TYPE_OPTIONS.map((ft) => {
                const active = config.acceptedFileTypes.includes(ft.ext);
                return (
                  <Badge
                    key={ft.ext}
                    variant={active ? "default" : "outline"}
                    className="cursor-pointer text-xs select-none"
                    onClick={() => toggleFileType(ft.ext)}
                  >
                    {ft.label}
                  </Badge>
                );
              })}
            </div>
          </div>

          <Separator />

          {/* Toggle switches */}
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

      <div className="flex justify-end gap-3 px-6 py-4 border-t bg-muted/20">
        <Button variant="ghost" onClick={onClose} className="font-semibold text-xs">Cancel</Button>
        <Button onClick={handleSave} className="gap-1.5 font-bold text-xs" disabled={!hasChanges}>
          <Save className="w-3.5 h-3.5" /> Save Configuration
        </Button>
      </div>
    </div>
  );
};

export default PortfolioInstructionsEditor;
