import { useState, useEffect } from "react";
import { CheckCircle2, Circle } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export interface Criterion {
  code: string;
  title: string;
  met: boolean;
}

interface CriteriaChecklistProps {
  criteria: Criterion[];
  onChange: (criteria: Criterion[]) => void;
  readOnly?: boolean;
}

const CriteriaChecklist = ({ criteria, onChange, readOnly = false }: CriteriaChecklistProps) => {
  const metCount = criteria.filter(c => c.met).length;
  const total = criteria.length;
  const allMet = metCount === total;
  const progress = total > 0 ? Math.round((metCount / total) * 100) : 0;

  const toggleCriterion = (code: string) => {
    if (readOnly) return;
    const updated = criteria.map(c =>
      c.code === code ? { ...c, met: !c.met } : c
    );
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
          ✅ Assessment Criteria
          <Badge variant={allMet ? "default" : "secondary"} className="text-[10px]">
            {metCount}/{total} met
          </Badge>
        </h4>
      </div>
      <Progress value={progress} className="h-2" />
      <div className="space-y-2">
        {criteria.map((c) => (
          <div
            key={c.code}
            className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
              c.met 
                ? "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800" 
                : "bg-card border-border"
            }`}
          >
            <Checkbox
              id={`criterion-${c.code}`}
              checked={c.met}
              onCheckedChange={() => toggleCriterion(c.code)}
              disabled={readOnly}
              className="mt-0.5"
            />
            <Label
              htmlFor={`criterion-${c.code}`}
              className={`text-sm cursor-pointer flex-1 ${
                c.met ? "text-green-700 dark:text-green-400" : "text-foreground"
              }`}
            >
              <span className="font-semibold text-muted-foreground mr-1.5">{c.code}</span>
              {c.title}
            </Label>
            {c.met && <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CriteriaChecklist;
