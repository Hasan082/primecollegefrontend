import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, CalendarPlus, AlertTriangle, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ExtensionRequestModal from "@/components/learner/ExtensionRequestModal";
import { useGetEnrolmentsQuery } from "@/redux/apis/enrolmentApi";

// Mock qualification-level expiry data (DD/MM/YYYY)
const qualificationExpiry: Record<string, string> = {
  "adult-care-l4": "01/02/2026", // expired
  "business-admin-l3": "15/09/2026", // still active
};

const isExpired = (dateStr: string) => {
  const [d, m, y] = dateStr.split("/").map(Number);
  return new Date(y, m - 1, d) < new Date();
};

const daysOverdue = (dateStr: string) => {
  const [d, m, y] = dateStr.split("/").map(Number);
  const diff = new Date().getTime() - new Date(y, m - 1, d).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
};

const MyQualifications = () => {
  const [extensionOpen, setExtensionOpen] = useState(false);
  const [extensionQual, setExtensionQual] = useState<{ title: string; expiry: string } | null>(null);

  const { data: enrolmentsResponse, isLoading, error } = useGetEnrolmentsQuery();

  const enrolments = enrolmentsResponse?.data || [];

  const openExtension = (title: string, expiry: string) => {
    setExtensionQual({ title, expiry });
    setExtensionOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
        <Loader2 className="w-8 h-8 animate-spin" />
        <p className="text-sm">Loading your qualifications...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 bg-destructive/5 rounded-xl border border-destructive/20 max-w-2xl mx-auto">
        <AlertTriangle className="w-10 h-10 text-destructive mx-auto mb-4" />
        <h2 className="text-lg font-bold text-destructive mb-2">Failed to load qualifications</h2>
        <p className="text-sm text-muted-foreground mb-6">There was an error connecting to the server. Please check your connection and try again.</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-foreground mb-1">My Qualifications</h1>
      <p className="text-muted-foreground mb-8">View and manage your enrolled qualifications</p>

      <div className="space-y-6">
        {enrolments.length === 0 ? (
          <div className="text-center py-16 bg-muted/30 rounded-xl border-2 border-dashed border-border">
            <p className="text-muted-foreground mb-4">You are not currently enrolled in any qualifications.</p>
            <Button asChild variant="secondary">
              <Link to="/courses">Browse Qualifications</Link>
            </Button>
          </div>
        ) : (
          enrolments.map((enrolment) => {
            const q = enrolment.qualification;
            const progress = enrolment.overall_progress;
            const pct = progress.progress_percent;
            const expired = enrolment.access_expired;
            const expiry = enrolment.access_expires_at 
              ? new Date(enrolment.access_expires_at).toLocaleDateString("en-GB")
              : null;

            return (
              <div key={enrolment.id} className={`bg-card border rounded-xl p-6 ${expired ? "border-destructive/40" : "border-border shadow-sm hover:shadow-md transition-shadow"}`}>
                <div className="flex items-start justify-between mb-1">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="text-xl font-bold text-foreground">{q.title}</h3>
                      <span className="bg-primary/10 text-primary text-xs font-bold px-2.5 py-0.5 rounded border border-primary/20">
                        {q.category}
                      </span>
                      {expired ? (
                        <Badge variant="destructive" className="text-xs">Expired</Badge>
                      ) : enrolment.status === "completed" ? (
                        <Badge className="bg-green-600 text-white text-xs">Completed</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">In Progress</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">Qualification Code: {q.qualification_code}</p>
                    <p className="text-sm text-muted-foreground">Enrolled: {new Date(enrolment.enrolled_at).toLocaleDateString("en-GB")}</p>
                    {expiry && (
                      <p className={`text-sm ${expired ? "text-destructive font-medium" : "text-muted-foreground"}`}>
                        Access {expired ? "expired" : "expires"}: {expiry}
                      </p>
                    )}
                  </div>
                  <Link
                    to={`/learner/qualification/${enrolment.id}`}
                    className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors flex-shrink-0"
                  >
                    <Eye className="w-5 h-5 text-primary" />
                  </Link>
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Overall Progress</span>
                    <span className="text-sm font-semibold text-primary">
                      {progress.completed_units} of {progress.total_units} Units Complete ({pct}%)
                    </span>
                  </div>
                  <Progress value={pct} className="h-3" />
                </div>

                {expired && (
                  <div className="mt-4 border border-destructive/30 bg-destructive/5 rounded-lg p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-destructive">Qualification access expired</p>
                        <p className="text-xs text-muted-foreground">
                          Please extend your access to continue your studies
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className="gap-1.5 flex-shrink-0"
                      onClick={() => openExtension(q.title, expiry || "")}
                    >
                      <CalendarPlus className="w-3.5 h-3.5" /> Extend Access
                    </Button>
                  </div>
                )}
              </div>
            );
          })
        )}
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
