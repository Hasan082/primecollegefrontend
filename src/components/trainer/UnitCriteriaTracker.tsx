import { CheckCircle2, Circle, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { Criterion } from "@/components/trainer/CriteriaChecklist";

interface UnitCriteriaTrackerProps {
  unitCode: string;
  unitName: string;
  criteriaState: Record<string, Criterion[]>;
  submissions: { id: string; title: string }[];
}

const UnitCriteriaTracker = ({ unitCode, unitName, criteriaState, submissions }: UnitCriteriaTrackerProps) => {
  // Aggregate all criteria across submissions
  const allCriteria = Object.entries(criteriaState);
  const totalCriteria = allCriteria.reduce((sum, [, c]) => sum + c.length, 0);
  const metCriteria = allCriteria.reduce((sum, [, c]) => sum + c.filter(cr => cr.met).length, 0);
  const progress = totalCriteria > 0 ? Math.round((metCriteria / totalCriteria) * 100) : 0;
  const isComplete = progress === 100 && totalCriteria > 0;

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            📊 Unit Criteria Progress
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">{unitCode}: {unitName}</p>
        </div>
        <Badge
          className={`text-xs font-bold ${
            isComplete
              ? "bg-green-600 text-white"
              : progress > 0
                ? "bg-amber-500 text-white"
                : "bg-muted text-muted-foreground"
          }`}
        >
          {isComplete ? "100% — Ready for Sign-Off" : `${progress}% Complete`}
        </Badge>
      </div>

      <Progress value={progress} className="h-3 mb-4" />

      <div className="grid gap-2 text-sm">
        <div className="flex items-center justify-between px-3 py-2 bg-muted/50 rounded-lg">
          <span className="text-muted-foreground font-medium">Total ACs</span>
          <span className="font-bold text-foreground">{totalCriteria}</span>
        </div>
        <div className="flex items-center justify-between px-3 py-2 bg-green-50 dark:bg-green-950/20 rounded-lg">
          <span className="text-green-700 dark:text-green-400 font-medium flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> Met
          </span>
          <span className="font-bold text-green-700 dark:text-green-400">{metCriteria}</span>
        </div>
        <div className="flex items-center justify-between px-3 py-2 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
          <span className="text-orange-700 dark:text-orange-400 font-medium flex items-center gap-1.5">
            <Circle className="w-3.5 h-3.5" /> Not Yet Met
          </span>
          <span className="font-bold text-orange-700 dark:text-orange-400">{totalCriteria - metCriteria}</span>
        </div>
      </div>

      {/* Per-submission breakdown */}
      {submissions.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Per Submission</p>
          <div className="space-y-1.5">
            {submissions.map((sub) => {
              const criteria = criteriaState[sub.id] || [];
              const met = criteria.filter(c => c.met).length;
              const total = criteria.length;
              const pct = total > 0 ? Math.round((met / total) * 100) : 0;
              return (
                <div key={sub.id} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground truncate max-w-[200px]">{sub.title}</span>
                  <div className="flex items-center gap-2">
                    <Progress value={pct} className="h-1.5 w-16" />
                    <span className={`font-semibold ${pct === 100 ? "text-green-600" : "text-muted-foreground"}`}>
                      {met}/{total}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!isComplete && totalCriteria > 0 && (
        <div className="mt-3 flex items-start gap-2 p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
          <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-amber-700 dark:text-amber-400">
            All assessment criteria must be ticked as met before this unit can be signed off and sent to IQA.
          </p>
        </div>
      )}
    </Card>
  );
};

export default UnitCriteriaTracker;
