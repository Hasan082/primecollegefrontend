import { useState, useEffect } from "react";
import { Settings2, ClipboardList, PenLine, FileText, Save } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

export interface UnitAssessmentRequirements {
  quizRequired: boolean;
  writtenRequired: boolean;
  evidenceRequired: boolean;
}

const STORAGE_KEY = "unit_assessment_config";

export function loadUnitConfig(unitCode: string): UnitAssessmentRequirements {
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return all[unitCode] || { quizRequired: true, writtenRequired: true, evidenceRequired: true };
  } catch {
    return { quizRequired: true, writtenRequired: true, evidenceRequired: true };
  }
}

function saveUnitConfig(unitCode: string, config: UnitAssessmentRequirements) {
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    all[unitCode] = config;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {}
}

interface Props {
  unitCode: string;
  unitName: string;
  onChange?: (config: UnitAssessmentRequirements) => void;
}

const assessmentTypes = [
  {
    key: "quizRequired" as const,
    label: "Knowledge Quiz",
    description: "Multiple-choice quiz drawn from the question bank",
    icon: ClipboardList,
  },
  {
    key: "writtenRequired" as const,
    label: "Written / Reflective Assessment",
    description: "Reflective account, essay, or written task",
    icon: PenLine,
  },
  {
    key: "evidenceRequired" as const,
    label: "Evidence / Portfolio Upload",
    description: "Documents, photos, or portfolio evidence",
    icon: FileText,
  },
];

const UnitAssessmentConfig = ({ unitCode, unitName, onChange }: Props) => {
  const { toast } = useToast();
  const [config, setConfig] = useState<UnitAssessmentRequirements>(() => loadUnitConfig(unitCode));
  const [hasChanges, setHasChanges] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setConfig(loadUnitConfig(unitCode));
    setHasChanges(false);
  }, [unitCode]);

  const handleToggle = (key: keyof UnitAssessmentRequirements) => {
    const updated = { ...config, [key]: !config[key] };
    // Prevent disabling all
    if (!updated.quizRequired && !updated.writtenRequired && !updated.evidenceRequired) {
      toast({ title: "At least one assessment type must be required", variant: "destructive" });
      return;
    }
    setConfig(updated);
    setHasChanges(true);
  };

  const handleSave = () => {
    saveUnitConfig(unitCode, config);
    setHasChanges(false);
    onChange?.(config);
    toast({ title: "Assessment requirements saved", description: `Updated for ${unitCode}` });
  };

  const enabledCount = [config.quizRequired, config.writtenRequired, config.evidenceRequired].filter(Boolean).length;

  return (
    <Card className="overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <Settings2 className="w-4.5 h-4.5 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-sm text-foreground">Assessment Requirements</p>
            <p className="text-xs text-muted-foreground">Configure which assessments learners must complete</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {enabledCount}/3 active
          </Badge>
          <span className="text-muted-foreground text-xs">{isOpen ? "▲" : "▼"}</span>
        </div>
      </button>

      {isOpen && (
        <div className="border-t border-border p-4 space-y-3 bg-muted/10">
          {assessmentTypes.map((type) => {
            const Icon = type.icon;
            const isEnabled = config[type.key];
            return (
              <div
                key={type.key}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                  isEnabled ? "border-primary/30 bg-primary/5" : "border-border bg-background"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${isEnabled ? "text-primary" : "text-muted-foreground"}`} />
                  <div>
                    <Label className="text-sm font-medium cursor-pointer">{type.label}</Label>
                    <p className="text-xs text-muted-foreground">{type.description}</p>
                  </div>
                </div>
                <Switch
                  checked={isEnabled}
                  onCheckedChange={() => handleToggle(type.key)}
                />
              </div>
            );
          })}

          {hasChanges && (
            <div className="flex justify-end pt-2">
              <Button size="sm" onClick={handleSave} className="gap-1.5">
                <Save className="w-3.5 h-3.5" /> Save Requirements
              </Button>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default UnitAssessmentConfig;
