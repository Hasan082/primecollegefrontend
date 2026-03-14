import { CheckCircle2, Clock, AlertTriangle, Upload, MessageSquare, Shield, FileText, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

export interface SubmissionVersion {
  id: string;
  version: number;
  evidenceRef: string; // e.g. EV-2026-001
  files: { name: string; size: string }[];
  description: string;
  linkedCriteria: string[];
  submittedDate: string;
  status: "submitted" | "under_review" | "competent" | "resubmission_required" | "not_yet_competent";
  feedback?: string;
  assessedDate?: string;
  assessorName?: string;
  iqaVerified?: boolean;
  iqaDate?: string;
}

const statusConfig: Record<SubmissionVersion["status"], { label: string; color: string; icon: typeof CheckCircle2 }> = {
  submitted: { label: "Submitted", color: "bg-amber-500 text-white", icon: Upload },
  under_review: { label: "Under Review", color: "bg-blue-500 text-white", icon: Clock },
  competent: { label: "Competent", color: "bg-green-600 text-white", icon: CheckCircle2 },
  resubmission_required: { label: "Resubmission Required", color: "bg-orange-500 text-white", icon: AlertTriangle },
  not_yet_competent: { label: "Not Yet Competent", color: "bg-destructive text-white", icon: AlertTriangle },
};

interface SubmissionHistoryProps {
  submissions: SubmissionVersion[];
  unitTitle: string;
}

const SubmissionHistory = ({ submissions, unitTitle }: SubmissionHistoryProps) => {
  const [expandedId, setExpandedId] = useState<string | null>(submissions[0]?.id || null);

  if (!submissions.length) return null;

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h3 className="text-base font-bold text-primary mb-1">Submission History</h3>
      <p className="text-sm text-muted-foreground mb-5">
        {submissions.length} submission{submissions.length > 1 ? "s" : ""} for this unit
      </p>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-[18px] top-6 bottom-6 w-0.5 bg-border" />

        <div className="space-y-4">
          {submissions.map((sub, idx) => {
            const cfg = statusConfig[sub.status];
            const Icon = cfg.icon;
            const isExpanded = expandedId === sub.id;
            const isLatest = idx === 0;

            return (
              <div key={sub.id} className="relative pl-12">
                {/* Timeline dot */}
                <div className={`absolute left-2 top-4 w-5 h-5 rounded-full flex items-center justify-center ${
                  isLatest ? "bg-primary" : "bg-muted"
                }`}>
                  <Icon className={`w-3 h-3 ${isLatest ? "text-primary-foreground" : "text-muted-foreground"}`} />
                </div>

                <div className={`border rounded-xl overflow-hidden ${isLatest ? "border-primary/30" : "border-border"}`}>
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : sub.id)}
                    className="w-full flex items-center gap-3 p-4 text-left hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-foreground">
                          Version {sub.version}
                        </span>
                        <Badge variant="outline" className="text-[10px] font-mono">
                          {sub.evidenceRef}
                        </Badge>
                        {isLatest && (
                          <Badge className="text-[10px] bg-primary text-primary-foreground">Latest</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Submitted: {sub.submittedDate}
                        {sub.assessedDate && ` • Assessed: ${sub.assessedDate}`}
                      </p>
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded flex-shrink-0 ${cfg.color}`}>
                      {cfg.label}
                    </span>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                  </button>

                  {isExpanded && (
                    <div className="p-4 pt-0 border-t border-border space-y-4">
                      {/* Description */}
                      {sub.description && (
                        <div className="pt-3">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Evidence Description</p>
                          <p className="text-sm text-foreground">{sub.description}</p>
                        </div>
                      )}

                      {/* Linked Criteria */}
                      {sub.linkedCriteria.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Linked Criteria</p>
                          <div className="flex flex-wrap gap-1.5">
                            {sub.linkedCriteria.map((c) => (
                              <Badge key={c} variant="secondary" className="text-[10px]">{c}</Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Files */}
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Files</p>
                        <div className="space-y-1.5">
                          {sub.files.map((f, fi) => (
                            <div key={fi} className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
                              <FileText className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                              <span className="text-sm text-foreground flex-1">{f.name}</span>
                              <span className="text-xs text-muted-foreground">{f.size}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Feedback */}
                      {sub.feedback && (
                        <div className="bg-muted/50 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <MessageSquare className="w-4 h-4 text-primary" />
                            <p className="text-xs font-semibold text-foreground">Assessor Feedback</p>
                            {sub.assessorName && (
                              <span className="text-xs text-muted-foreground">— {sub.assessorName}</span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{sub.feedback}</p>
                        </div>
                      )}

                      {/* IQA Verification */}
                      {sub.iqaVerified && (
                        <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                          <Shield className="w-4 h-4 text-green-600" />
                          <span className="text-xs font-semibold text-green-700 dark:text-green-400">
                            IQA Verified {sub.iqaDate && `on ${sub.iqaDate}`}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SubmissionHistory;
