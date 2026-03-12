import { Clock, CheckCircle2, XCircle, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface SubmissionVersion {
  version: number;
  submittedDate: string;
  outcome: "Competent" | "Resubmission Required" | "Not Yet Competent" | "Awaiting Review";
  feedback?: string;
  assessedDate?: string;
  assessorName?: string;
}

interface ResubmissionHistoryProps {
  versions: SubmissionVersion[];
}

const outcomeConfig: Record<string, { icon: typeof CheckCircle2; className: string }> = {
  "Competent": { icon: CheckCircle2, className: "bg-green-600 text-white" },
  "Resubmission Required": { icon: RotateCcw, className: "bg-orange-500 text-white" },
  "Not Yet Competent": { icon: XCircle, className: "bg-destructive text-destructive-foreground" },
  "Awaiting Review": { icon: Clock, className: "bg-amber-500 text-white" },
};

const ResubmissionHistory = ({ versions }: ResubmissionHistoryProps) => {
  if (versions.length <= 1) return null;

  const resubCount = versions.length - 1;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
          🔄 Submission History
        </h4>
        <Badge variant="secondary" className="text-[10px]">
          {resubCount} resubmission{resubCount !== 1 ? "s" : ""}
        </Badge>
      </div>
      <div className="relative pl-4 border-l-2 border-border space-y-3">
        {versions.map((v, i) => {
          const config = outcomeConfig[v.outcome];
          const Icon = config.icon;
          const isCurrent = i === 0;
          return (
            <div
              key={v.version}
              className={`relative pl-4 ${isCurrent ? "" : "opacity-70"}`}
            >
              <div className="absolute -left-[13px] top-1 w-5 h-5 rounded-full bg-background border-2 border-border flex items-center justify-center">
                <Icon className="w-3 h-3 text-muted-foreground" />
              </div>
              <div className={`rounded-lg border p-3 ${isCurrent ? "bg-card" : "bg-muted/30"}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-foreground">
                    {isCurrent ? "Current Submission" : `Version ${v.version}`}
                  </span>
                  <Badge className={`text-[10px] ${config.className}`}>
                    {v.outcome}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Submitted: {v.submittedDate}
                  {v.assessedDate && ` • Assessed: ${v.assessedDate}`}
                </p>
                {v.feedback && (
                  <p className="text-xs text-muted-foreground mt-1.5 italic border-t border-border pt-1.5">
                    "{v.feedback}"
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ResubmissionHistory;
