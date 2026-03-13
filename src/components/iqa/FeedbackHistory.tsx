import { Badge } from "@/components/ui/badge";
import { MessageSquare, Clock, User } from "lucide-react";

export interface FeedbackEntry {
  date: string;
  assessorName: string;
  outcome: string;
  feedback: string;
  submissionNumber: number;
}

interface FeedbackHistoryProps {
  entries: FeedbackEntry[];
}

const outcomeColor = (outcome: string) => {
  if (outcome === "Competent") return "bg-green-600 text-white";
  if (outcome === "Resubmission Required") return "bg-amber-500 text-white";
  return "bg-destructive text-destructive-foreground";
};

const FeedbackHistory = ({ entries }: FeedbackHistoryProps) => {
  if (entries.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <MessageSquare className="w-4 h-4 text-primary" />
        <span className="text-sm font-semibold text-foreground">Full Assessment Feedback History</span>
        <Badge variant="outline" className="text-[10px]">{entries.length} record{entries.length !== 1 ? "s" : ""}</Badge>
      </div>

      <div className="relative pl-4 border-l-2 border-primary/20 space-y-4">
        {entries.map((entry, i) => (
          <div key={i} className="relative">
            {/* Timeline dot */}
            <div className={`absolute -left-[calc(1rem+5px)] w-2.5 h-2.5 rounded-full ${
              i === 0 ? "bg-primary ring-2 ring-primary/20" : "bg-muted-foreground/40"
            }`} />

            <div className={`rounded-xl border p-4 ${
              i === 0 ? "bg-primary/5 border-primary/20" : "bg-muted/30 border-border"
            }`}>
              <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Badge className="text-[10px]" variant={i === 0 ? "default" : "secondary"}>
                    Submission #{entry.submissionNumber}
                  </Badge>
                  <Badge className={`text-[10px] ${outcomeColor(entry.outcome)}`}>
                    {entry.outcome}
                  </Badge>
                  {i === 0 && (
                    <Badge variant="outline" className="text-[10px] border-primary text-primary">Latest</Badge>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4 text-[11px] text-muted-foreground mb-2">
                <span className="flex items-center gap-1"><User className="w-3 h-3" /> {entry.assessorName}</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {entry.date}</span>
              </div>
              <p className="text-sm text-foreground leading-relaxed">{entry.feedback}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeedbackHistory;
