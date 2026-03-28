import { useState, useEffect } from "react";
import { Settings2, ClipboardList, PenLine, FileText, Loader2, Settings, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useUpdateUnitMutation } from "@/redux/apis/qualification/qualificationUnitApi";
import { useUpdateQuizConfigMutation, useUpdateWrittenAssignmentConfigMutation } from "@/redux/apis/quiz/quizApi";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import PortfolioInstructionsEditor from "./PortfolioInstructionsEditor";

export interface UnitAssessmentRequirements {
  has_quiz: boolean;
  has_written_assignment: boolean;
  requires_evidence: boolean;
}

interface Props {
  unitId: string;
  qualificationId: string;
  unitCode: string;
  unitName: string; // Added unit name
  quizCount: number;
  assignmentCount: number;
  initialConfig: UnitAssessmentRequirements;
  onChange?: (config: UnitAssessmentRequirements) => void;
}

const assessmentTypes = [
  {
    key: "has_quiz" as const,
    label: "Knowledge Quiz",
    description: "Multiple-choice quiz drawn from the question bank",
    icon: ClipboardList,
    configPath: (qualId: string, unitCode: string) => `/admin/question-bank/${qualId}/${unitCode}`,
  },
  {
    key: "has_written_assignment" as const,
    label: "Written / Reflective Assessment",
    description: "Reflective account, essay, or written task",
    icon: PenLine,
    configPath: (qualId: string, unitCode: string) => `/admin/question-bank/${qualId}/${unitCode}?tab=written`,
  },
  {
    key: "requires_evidence" as const,
    label: "Evidence / Portfolio Upload",
    description: "Documents, photos, or portfolio evidence",
    icon: FileText,
    configPath: null,
  },
];

const UnitAssessmentConfig = ({ unitId, qualificationId, unitCode, unitName, quizCount, assignmentCount, initialConfig, onChange }: Props) => {
  const { toast } = useToast();
  const [config, setConfig] = useState<UnitAssessmentRequirements>(initialConfig);
  const [isOpen, setIsOpen] = useState(false);
  const [isPortfolioModalOpen, setIsPortfolioModalOpen] = useState(false);
  
  const [updateUnit, { isLoading: isUpdatingUnit }] = useUpdateUnitMutation();
  const [updateQuizConfig, { isLoading: isUpdatingQuiz }] = useUpdateQuizConfigMutation();
  const [updateAssignmentConfig, { isLoading: isUpdatingAssignment }] = useUpdateWrittenAssignmentConfigMutation();
  
  const [localUpdatingKey, setLocalUpdatingKey] = useState<string | null>(null);

  useEffect(() => {
    setConfig(initialConfig);
  }, [initialConfig]);

  const handleToggle = async (key: keyof UnitAssessmentRequirements) => {
    const isTurningOn = !config[key];
    
    // Prerequisite Validation
    if (isTurningOn) {
      if (key === "has_quiz" && quizCount === 0) {
        toast({ title: "Please create one quiz from question bank", variant: "destructive" });
        return;
      }
      if (key === "has_written_assignment" && assignmentCount === 0) {
        toast({ title: "Create assessment from question bank", variant: "destructive" });
        return;
      }
    }

    const updated = { ...config, [key]: isTurningOn };
    setLocalUpdatingKey(key);

    try {
      if (key === "has_quiz") {
        await updateQuizConfig({
          unitId: unitId,
          data: { quiz_enabled: isTurningOn }
        }).unwrap();
      } else if (key === "has_written_assignment") {
        await updateAssignmentConfig({
          unitId: unitId,
          data: { is_active: isTurningOn }
        }).unwrap();
      } else {
        await updateUnit({
          unitId,
          payload: { [key]: isTurningOn },
        }).unwrap();
      }

      setConfig(updated);
      onChange?.(updated);
      toast({ title: isTurningOn ? "Assessment enabled" : "Assessment disabled", description: `${unitCode} updated successfully.` });
    } catch (error) {
      console.error("Update failed:", error);
      toast({
        title: "Failed to update requirements",
        description: "An error occurred while communicating with the server.",
        variant: "destructive"
      });
    } finally {
      setLocalUpdatingKey(null);
    }
  };

  const isUpdating = isUpdatingUnit || isUpdatingQuiz || isUpdatingAssignment;

  const enabledCount = [config.has_quiz, config.has_written_assignment, config.requires_evidence].filter(Boolean).length;

  return (
    <>
      <Card className="overflow-hidden border-none shadow-sm bg-background/50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors text-left border rounded-xl"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Settings2 className="w-5 h-5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-sm text-foreground truncate">Assessment Requirements</p>
              <p className="text-[10px] text-muted-foreground truncate font-medium uppercase tracking-tight opacity-70">
                Configure which assessments learners must complete
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={`text-[10px] font-bold px-2 py-0.5 border-none shadow-sm ${
              enabledCount > 0 ? "bg-amber-500 text-white" : "bg-muted text-muted-foreground"
            }`}>
              {enabledCount}/3 active
            </Badge>
            <span className="text-muted-foreground">{isOpen ? "▲" : "▼"}</span>
          </div>
        </button>

        {isOpen && (
          <div className="pt-4 space-y-3">
            {assessmentTypes.map((type) => {
              const Icon = type.icon;
              const isEnabled = config[type.key];
              const isRowUpdating = localUpdatingKey === type.key;
              
              return (
                <div
                  key={type.key}
                  className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                    isEnabled ? "border-primary/20 bg-primary/5" : "border-border bg-background"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                      isEnabled ? "bg-white text-primary border-primary/10" : "bg-muted/30 text-muted-foreground border-transparent"
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <Label className="text-sm font-bold cursor-pointer block">{type.label}</Label>
                      <p className="text-[10px] text-muted-foreground line-clamp-1">{type.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-primary hover:bg-primary/5 px-2"
                        asChild={!!type.configPath}
                        onClick={() => {
                          if (type.key === "requires_evidence") {
                            setIsPortfolioModalOpen(true);
                          }
                        }}
                      >
                        {type.configPath ? (
                          <Link to={type.configPath(qualificationId, unitCode)}>
                            <Settings className="w-3.5 h-3.5" />
                            <span>Configure</span>
                            <ChevronRight className="w-3 h-3 ml-0.5" />
                          </Link>
                        ) : (
                          <div className="flex items-center gap-1.5 cursor-pointer">
                            <Settings className="w-3.5 h-3.5" />
                            <span>Configure</span>
                            <ChevronRight className="w-3 h-3 ml-0.5" />
                          </div>
                        )}
                      </Button>
                    
                    <div className="relative">
                      {isRowUpdating && (
                        <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10 rounded-full">
                          <Loader2 className="w-3 h-3 animate-spin text-primary" />
                        </div>
                      )}
                      <Switch
                        checked={isEnabled}
                        onCheckedChange={() => handleToggle(type.key)}
                        disabled={isUpdating}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Dialog open={isPortfolioModalOpen} onOpenChange={setIsPortfolioModalOpen}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-2">
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Portfolio Configuration — {unitCode}
            </DialogTitle>
          </DialogHeader>
          <PortfolioInstructionsEditor 
            unitCode={unitCode} 
            unitName={unitName} 
            onClose={() => setIsPortfolioModalOpen(false)} 
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UnitAssessmentConfig;
