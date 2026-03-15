import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

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
  const checkedCount = Object.values(value).filter(v => v === true).length;
  const allChecked = checkedCount === 4;

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-bold text-foreground">🔍 VACS Verification</h4>
        <Badge
          className={`text-xs font-bold ${
            allChecked
              ? "bg-green-600 text-white"
              : checkedCount > 0
                ? "bg-amber-500 text-white"
                : "bg-muted text-muted-foreground"
          }`}
        >
          {allChecked ? "All Standards Met" : `${checkedCount}/4 Checked`}
        </Badge>
      </div>

      <div className="space-y-3">
        {VACS_ITEMS.map((item) => {
          const isChecked = value[item.key] === true;
          return (
            <div
              key={item.key}
              className={`rounded-xl border-2 p-4 transition-all ${
                isChecked
                  ? "border-green-300 bg-green-50 dark:bg-green-950/20 dark:border-green-800"
                  : "border-border bg-card"
              }`}
            >
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={isChecked}
                  disabled={readOnly}
                  onCheckedChange={(checked) =>
                    onChange({ ...value, [item.key]: checked === true ? true : false })
                  }
                  className="h-5 w-5"
                />
                <div className="flex-1">
                  <Label className="text-sm font-bold text-foreground cursor-pointer">{item.label}</Label>
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
