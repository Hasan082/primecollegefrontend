import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { CheckCircle2, XCircle } from "lucide-react";

export interface VACSState {
  valid: boolean | null;
  authentic: boolean | null;
  current: boolean | null;
  sufficient: boolean | null;
}

interface VACSVerificationProps {
  value: VACSState;
  onChange: (state: VACSState) => void;
  readOnly?: boolean;
}

const VACS_ITEMS: { key: keyof VACSState; label: string; description: string }[] = [
  { key: "valid", label: "Valid", description: "The assessment method is appropriate for the criteria being assessed" },
  { key: "authentic", label: "Authentic", description: "The work is the learner's own and has not been plagiarised" },
  { key: "current", label: "Current", description: "The evidence is recent and reflects current standards and practice" },
  { key: "sufficient", label: "Sufficient", description: "There is enough evidence to demonstrate competence across all criteria" },
];

const VACSVerification = ({ value, onChange, readOnly = false }: VACSVerificationProps) => {
  const allChecked = Object.values(value).every(v => v === true);
  const anyFailed = Object.values(value).some(v => v === false);
  const checkedCount = Object.values(value).filter(v => v === true).length;

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-bold text-foreground">🔍 VACS Verification</h4>
        <Badge
          className={`text-xs font-bold ${
            allChecked
              ? "bg-green-600 text-white"
              : anyFailed
                ? "bg-destructive text-destructive-foreground"
                : "bg-muted text-muted-foreground"
          }`}
        >
          {allChecked ? "All Standards Met" : anyFailed ? "Issues Found" : `${checkedCount}/4 Checked`}
        </Badge>
      </div>

      <div className="space-y-3">
        {VACS_ITEMS.map((item) => {
          const val = value[item.key];
          return (
            <div
              key={item.key}
              className={`rounded-xl border-2 p-4 transition-all ${
                val === true
                  ? "border-green-300 bg-green-50 dark:bg-green-950/20 dark:border-green-800"
                  : val === false
                    ? "border-destructive/30 bg-destructive/5"
                    : "border-border bg-card"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex flex-col gap-2 mt-1">
                  <button
                    type="button"
                    disabled={readOnly}
                    onClick={() => onChange({ ...value, [item.key]: true })}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                      val === true
                        ? "bg-green-600 text-white"
                        : "bg-muted text-muted-foreground hover:bg-green-100 hover:text-green-700"
                    } ${readOnly ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
                  >
                    <CheckCircle2 className="w-3 h-3" /> Yes
                  </button>
                  <button
                    type="button"
                    disabled={readOnly}
                    onClick={() => onChange({ ...value, [item.key]: false })}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                      val === false
                        ? "bg-destructive text-destructive-foreground"
                        : "bg-muted text-muted-foreground hover:bg-red-100 hover:text-red-700"
                    } ${readOnly ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
                  >
                    <XCircle className="w-3 h-3" /> No
                  </button>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export const initialVACSState: VACSState = {
  valid: null,
  authentic: null,
  current: null,
  sufficient: null,
};

export default VACSVerification;
