import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Award,
  CheckCircle2,
  Circle,
  Download,
  Loader2,
  Lock,
} from "lucide-react";
import { toast } from "sonner";
import {
  useGetCertificateProgressQuery,
  useDownloadCertificateMutation,
} from "@/redux/apis/enrolmentApi";

interface Props {
  enrolmentId: string;
}

/**
 * Returns true if the given blocker code is present in the blockers array.
 */
const hasBlocker = (
  blockers: { code: string; message: string }[],
  code: string
) => blockers.some((b) => b.code === code);

/**
 * A gate step should appear in the checklist if:
 *  - It is already completed (value === true), meaning it WAS a required gate; OR
 *  - Its corresponding blocker code is present, meaning it is an active blocker.
 * If neither, the gate is not required by this qualification — hide it.
 */
const isGateRelevant = (
  done: boolean,
  blockerCode: string,
  blockers: { code: string; message: string }[]
) => done || hasBlocker(blockers, blockerCode);

export function CertificateDownloadButton({ enrolmentId }: Props) {
  const [isOpening, setIsOpening] = useState(false);

  const { data: progress, isLoading } = useGetCertificateProgressQuery(
    enrolmentId,
    { skip: !enrolmentId }
  );

  const [downloadCertificate] = useDownloadCertificateMutation();

  // Hide the entire card while loading or when certificate is not enabled
  if (isLoading) return null;
  if (!progress || !progress.issues_certificate) return null;

  const canDownload = progress.can_download;
  const isIssued = progress.certificate_issued === true;
  const blockers = progress.blockers ?? [];
  const firstBlocker =
    blockers[0]?.message ?? "Complete all requirements to unlock your certificate.";

  // ── Build the smart checklist — only show gates relevant to this qualification ──
  const steps = [
    // Units and final assessment are always required for CPD qualifications
    {
      done: progress.all_units_completed ?? false,
      label: `All ${progress.total_units ?? 0} modules completed`,
      relevant: true,
    },
    {
      done: progress.final_assessment_passed ?? false,
      label: "Final assessment passed",
      relevant: true,
    },
    // Declaration and evaluation are only shown if the qualification requires them
    {
      done: progress.learner_declaration_signed ?? false,
      label: "Learner declaration signed",
      relevant: isGateRelevant(
        progress.learner_declaration_signed ?? false,
        "learner_declaration_required",
        blockers
      ),
    },
    {
      done: progress.course_evaluation_submitted ?? false,
      label: "Course evaluation submitted",
      relevant: isGateRelevant(
        progress.course_evaluation_submitted ?? false,
        "course_evaluation_required",
        blockers
      ),
    },
  ].filter((s) => s.relevant);

  const handleDownload = async () => {
    if (!canDownload || isOpening) return;
    setIsOpening(true);
    try {
      const result = await downloadCertificate(enrolmentId).unwrap();
      window.open(result.download_url, "_blank", "noopener,noreferrer");
    } catch (err: unknown) {
      // Extract the blocker message from the 400 response body if available
      let message = "Failed to download certificate. Please try again.";
      if (
        err &&
        typeof err === "object" &&
        "data" in err &&
        err.data &&
        typeof err.data === "object" &&
        "message" in err.data &&
        typeof (err.data as { message: unknown }).message === "string"
      ) {
        message = (err.data as { message: string }).message;
      }
      toast.error("Certificate unavailable", { description: message });
    } finally {
      setIsOpening(false);
    }
  };

  return (
    <div
      className={`rounded-xl border p-5 shadow-sm space-y-4 transition-colors ${
        isIssued
          ? "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800/40"
          : "bg-card border-border"
      }`}
    >
      {/* ── Header ── */}
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
            isIssued
              ? "bg-green-600/15 dark:bg-green-500/20"
              : "bg-primary/10"
          }`}
        >
          {isIssued ? (
            <Award className="w-5 h-5 text-green-600 dark:text-green-400" />
          ) : (
            <Award className="w-5 h-5 text-primary" />
          )}
        </div>
        <div>
          <p
            className={`text-sm font-bold leading-none ${
              isIssued ? "text-green-700 dark:text-green-300" : "text-foreground"
            }`}
          >
            {isIssued ? "Certificate Issued ✓" : "CPD Certificate"}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {canDownload
              ? "Your certificate is ready to download."
              : "Complete all steps below to unlock."}
          </p>
        </div>
      </div>

      {/* ── Gate checklist (only shown while not yet downloadable) ── */}
      {!canDownload && (
        <div className="space-y-2 pl-1">
          {steps.map((step) => (
            <div key={step.label} className="flex items-center gap-2.5 text-sm">
              {step.done ? (
                <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
              ) : (
                <Circle className="w-4 h-4 text-muted-foreground/60 flex-shrink-0" />
              )}
              <span
                className={
                  step.done
                    ? "line-through text-muted-foreground"
                    : "text-foreground"
                }
              >
                {step.label}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* ── Download / locked button ── */}
      {canDownload ? (
        <Button
          onClick={handleDownload}
          disabled={isOpening}
          className="w-full gap-2 bg-green-600 hover:bg-green-700 text-white shadow-sm"
        >
          {isOpening ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Preparing…
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Download Certificate
            </>
          )}
        </Button>
      ) : (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              {/* Wrapper span needed so Tooltip works on a disabled button */}
              <span className="block w-full">
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
            <TooltipContent side="top">
              <p>{firstBlocker}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}
