import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, Timer, CalendarPlus, AlertTriangle } from "lucide-react";
import { learnerQualifications } from "@/data/learnerMockData";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ExtensionRequestModal from "@/components/learner/ExtensionRequestModal";

// Mock expired/overdue units per qualification for demo
const qualificationDeadlines: Record<string, { unit: string; daysLeft: number }[]> = {
  "adult-care-l4": [
    { unit: "Unit 4: Safeguarding and Protection", daysLeft: -5 },
    { unit: "Unit 6: Communication in Care Settings", daysLeft: -3 },
  ],
};

const MyQualifications = () => {
  const [extensionOpen, setExtensionOpen] = useState(false);
  const [extensionQual, setExtensionQual] = useState<{ title: string; expiry: string } | null>(null);

  const openExtension = (title: string, expiry: string) => {
    setExtensionQual({ title, expiry });
    setExtensionOpen(true);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-foreground mb-1">My Qualifications</h1>
      <p className="text-muted-foreground mb-8">View and manage your enrolled qualifications</p>

      <div className="space-y-6">
        {learnerQualifications.map((q) => {
          const completed = q.units.filter((u) => u.status === "competent").length;
          const total = q.units.length;
          const pct = Math.round((completed / total) * 100);
          const overdueUnits = (qualificationDeadlines[q.id] || []).filter(u => u.daysLeft < 0);
          const hasExpired = overdueUnits.length > 0;

          return (
            <div key={q.id} className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-start justify-between mb-1">
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="text-xl font-bold text-foreground">{q.title}</h3>
                    <span className={`${q.categoryColor} text-white text-xs font-bold px-2.5 py-0.5 rounded`}>
                      {q.category}
                    </span>
                    <span className="bg-secondary text-secondary-foreground text-xs font-bold px-2.5 py-0.5 rounded">
                      In Progress
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">Qualification Code: {q.code}</p>
                  <p className="text-sm text-muted-foreground">Enrolled: {q.enrolledDate}</p>
                </div>
                <Link
                  to={`/learner/qualification/${q.id}`}
                  className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:opacity-80 transition-opacity flex-shrink-0"
                >
                  <Eye className="w-5 h-5 text-secondary-foreground" />
                </Link>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Overall Progress</span>
                  <span className="text-sm font-semibold text-primary">
                    {completed} of {total} Units Complete ({pct}%)
                  </span>
                </div>
                <Progress value={pct} className="h-3" />
              </div>

              {/* Expired Units & Extension Button */}
              {hasExpired && (
                <div className="mt-4 border border-destructive/30 bg-destructive/5 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-destructive" />
                    <p className="text-sm font-semibold text-destructive">Expired Units</p>
                  </div>
                  <div className="space-y-1.5 mb-3">
                    {overdueUnits.map((u, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Timer className="w-3.5 h-3.5 text-destructive flex-shrink-0" />
                        <span className="text-sm text-foreground">{u.unit}</span>
                        <Badge variant="destructive" className="text-[10px] ml-auto">
                          Overdue by {Math.abs(u.daysLeft)} days
                        </Badge>
                      </div>
                    ))}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 border-destructive/30 text-destructive hover:bg-destructive/10"
                    onClick={() => openExtension(q.title, "20/02/2026")}
                  >
                    <CalendarPlus className="w-3.5 h-3.5" /> Extend Deadline
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {extensionQual && (
        <ExtensionRequestModal
          open={extensionOpen}
          onOpenChange={setExtensionOpen}
          qualificationTitle={extensionQual.title}
          currentExpiry={extensionQual.expiry}
        />
      )}
    </div>
  );
};

export default MyQualifications;
