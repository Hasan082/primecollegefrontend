import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Download, Lock, CheckCircle2, Circle, Loader2 } from "lucide-react";
import { useGetCertificateProgressQuery } from "@/redux/apis/enrolmentApi";
import { appConfig } from "@/app.config";

interface Props {
  enrolmentId: string;
}

export function CertificateDownloadButton({ enrolmentId }: Props) {
  const [downloading, setDownloading] = useState(false);

  const { data: progress, isLoading } = useGetCertificateProgressQuery(enrolmentId, {
    skip: !enrolmentId,
  });

  if (isLoading) return null;
  if (!progress || !progress.issues_certificate) return null;

  const canDownload = progress.can_download;
  const firstBlocker = progress.blockers?.[0]?.message ?? "Complete all requirements first.";

  const handleDownload = async () => {
    if (!canDownload || downloading) return;
    setDownloading(true);
    try {
      const res = await fetch(
        `${appConfig.API_BASE_URL}/api/enrolments/me/${enrolmentId}/certificate/download/`,
        { credentials: "include" }
      );
      if (!res.ok) return;
      const data = await res.json();
      window.open(data.download_url, "_blank", "noopener");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="rounded-xl border border-border p-5 bg-card shadow-sm space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Download className="w-4 h-4 text-primary" />
        </div>
        <div>
          <p className="text-sm font-bold text-foreground leading-none">CPD Certificate</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {canDownload ? "Your certificate is ready to download." : "Complete all steps below to unlock."}
          </p>
        </div>
      </div>

      {!canDownload && (
        <div className="space-y-2">
          {[
            { done: progress.all_units_completed ?? false, label: `All ${progress.total_units ?? 0} modules completed` },
            { done: progress.final_assessment_passed ?? false, label: "Final assessment passed" },
            { done: progress.learner_declaration_signed ?? false, label: "Learner declaration signed" },
            { done: progress.course_evaluation_submitted ?? false, label: "Course evaluation submitted" },
          ].map((step) => (
            <div key={step.label} className="flex items-center gap-2 text-sm">
              {step.done ? (
                <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
              ) : (
                <Circle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              )}
              <span className={step.done ? "line-through text-muted-foreground" : "text-foreground"}>
                {step.label}
              </span>
            </div>
          ))}
        </div>
      )}

      {canDownload ? (
        <Button
          onClick={handleDownload}
          disabled={downloading}
          className="w-full gap-2 bg-green-600 hover:bg-green-700 text-white"
        >
          {downloading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          {downloading ? "Preparing…" : "Download Certificate"}
        </Button>
      ) : (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="block">
                <Button
                  disabled
                  variant="outline"
                  className="w-full gap-2 opacity-50 cursor-not-allowed"
                >
                  <Lock className="w-4 h-4" />
                  Download Certificate
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>{firstBlocker}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}
