import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Send } from "lucide-react";

export type DisagreeAction =
  | "reassess"
  | "revise_feedback"
  | "additional_evidence"
  | "assessor_training";

export interface DisagreeDecision {
  action: DisagreeAction;
  reason: string;
  specificCriteria: string[];
  deadline?: string;
}

interface IQADisagreeFormProps {
  criteria: string[];
  onSubmit: (decision: DisagreeDecision) => void;
  onCancel: () => void;
}

const ACTIONS: { value: DisagreeAction; label: string; desc: string }[] = [
  { value: "reassess", label: "Trainer to Re-assess", desc: "Trainer must re-mark the unit and provide a new decision" },
  { value: "revise_feedback", label: "Revise Feedback", desc: "Decision may be correct but feedback needs more detail/clarity" },
  { value: "additional_evidence", label: "Request Additional Evidence", desc: "More evidence needed before a decision can be confirmed" },
  { value: "assessor_training", label: "Trainer CPD / Training", desc: "Systemic issue — trainer needs additional support or training" },
];

const IQADisagreeForm = ({ criteria, onSubmit, onCancel }: IQADisagreeFormProps) => {
  const [action, setAction] = useState<DisagreeAction | "">("");
  const [reason, setReason] = useState("");
  const [selectedCriteria, setSelectedCriteria] = useState<string[]>([]);

  const toggleCriterion = (c: string) => {
    setSelectedCriteria(prev =>
      prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]
    );
  };

  const canSubmit = action && reason.trim().length >= 10;

  return (
    <Card className="p-5 border-2 border-destructive/30 bg-destructive/5">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="w-5 h-5 text-destructive" />
        <h4 className="text-sm font-bold text-foreground">IQA Disagree — Action Required</h4>
      </div>

      {/* Action Selection */}
      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        Required Action for Trainer
      </Label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 mb-4">
        {ACTIONS.map((a) => (
          <button
            key={a.value}
            onClick={() => setAction(a.value)}
            className={`text-left p-3 rounded-xl border-2 transition-all ${
              action === a.value
                ? "border-destructive bg-destructive/10"
                : "border-border hover:border-destructive/30 bg-card"
            }`}
          >
            <p className="text-sm font-semibold text-foreground">{a.label}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{a.desc}</p>
          </button>
        ))}
      </div>

      {/* Specific Criteria */}
      {criteria.length > 0 && (
        <div className="mb-4">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">
            Which criteria are affected? (optional)
          </Label>
          <div className="flex flex-wrap gap-2">
            {criteria.map((c) => (
              <button
                key={c}
                onClick={() => toggleCriterion(c)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                  selectedCriteria.includes(c)
                    ? "border-destructive bg-destructive text-destructive-foreground"
                    : "border-border bg-muted text-muted-foreground hover:border-destructive/50"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Reason */}
      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">
        Reason for Disagreement
      </Label>
      <Textarea
        placeholder="Explain why you disagree with the assessment decision. Be specific about what needs to change..."
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        rows={4}
      />
      <p className="text-xs text-muted-foreground mt-1">
        {reason.trim().length < 10 ? "Minimum 10 characters required" : "✓ Sufficient detail"}
      </p>

      {/* Actions */}
      <div className="flex items-center gap-3 mt-4">
        <Button
          variant="destructive"
          className="gap-2"
          disabled={!canSubmit}
          onClick={() =>
            onSubmit({
              action: action as DisagreeAction,
              reason,
              specificCriteria: selectedCriteria,
            })
          }
        >
          <Send className="w-4 h-4" /> Submit Disagreement
        </Button>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </Card>
  );
};

export default IQADisagreeForm;
