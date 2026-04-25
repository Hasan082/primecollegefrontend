import { useMemo, useState } from "react";
import { FilePenLine, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useSubmitWrittenAssignmentMutation } from "@/redux/apis/enrolmentApi";
import RichTextEditor from "@/components/admin/page-builder/RichTextEditor";
import { sanitizeRichHtml } from "@/utils/sanitizeRichHtml";

interface WrittenAssignmentFormProps {
  enrolmentId: string;
  unitId: string;
  title?: string;
  minWords?: number;
  maxWords?: number;
  onSuccess?: () => void;
  isLocked?: boolean;
  mode?: "initial" | "resubmission";
}

const stripHtml = (value: string) =>
  value
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const WrittenAssignmentForm = ({
  enrolmentId,
  unitId,
  title,
  minWords,
  maxWords,
  onSuccess,
  isLocked,
  mode = "initial",
}: WrittenAssignmentFormProps) => {
  const [responseHtml, setResponseHtml] = useState("");
  const [declarationChecked, setDeclarationChecked] = useState(false);
  const { toast } = useToast();
  const [submitWrittenAssignment, { isLoading: isSubmitting }] = useSubmitWrittenAssignmentMutation();

  const sanitizedResponseHtml = useMemo(() => sanitizeRichHtml(responseHtml), [responseHtml]);
  const wordCount = stripHtml(sanitizedResponseHtml).split(/\s+/).filter(Boolean).length;

  if (isLocked) {
    return (
      <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
        Written assignment submission is locked until access is extended.
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!stripHtml(sanitizedResponseHtml)) {
      toast({ title: "Please enter your assignment response", variant: "destructive" });
      return;
    }
    if (!declarationChecked) {
      toast({ title: "Please confirm the Learner Declaration", variant: "destructive" });
      return;
    }

    try {
      await submitWrittenAssignment({
        enrolmentId,
        unitId,
        body: {
          response_html: sanitizedResponseHtml,
          declaration_signed: true,
        },
      }).unwrap();

      setResponseHtml("");
      setDeclarationChecked(false);
      toast({
        title: mode === "resubmission" ? "Revised Assignment Submitted" : "Written Assignment Submitted",
        description:
          mode === "resubmission"
            ? `${title || "Assignment"} has been resubmitted for assessment.`
            : `${title || "Assignment"} has been submitted for assessment.`,
      });
      onSuccess?.();
    } catch (err: any) {
      const description =
        err?.data?.response_html?.[0] ||
        err?.data?.detail ||
        err?.data?.message ||
        "Failed to submit written assignment";
      toast({
        title: "Submission failed",
        description,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4 pt-4">
      <div>
        <Label className="text-sm font-semibold mb-2 block">
          Your Response <span className="text-destructive">*</span>
        </Label>
        <div className="rounded-xl border border-border bg-background overflow-hidden">
          <RichTextEditor
            value={responseHtml}
            onChange={setResponseHtml}
            placeholder="Write your assignment response here..."
          />
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span>Current word count: {wordCount}</span>
          {typeof minWords === "number" && minWords > 0 && <span>Minimum: {minWords}</span>}
          {typeof maxWords === "number" && maxWords > 0 && <span>Maximum: {maxWords}</span>}
        </div>
      </div>

      <div className="border border-primary/20 bg-primary/5 rounded-xl p-4">
        <div className="flex items-start gap-3">

          <div className="flex-1">

            <label className="flex items-start gap-3 cursor-pointer">
              <Checkbox
                checked={declarationChecked}
                onCheckedChange={(checked) => setDeclarationChecked(checked === true)}
                className="mt-0.5"
                aria-label="I confirm this is my own work"
              />
              <p className="text-sm text-muted-foreground">
                I declare that this assignment is my own original work and has been completed without any unauthorised assistance. I acknowledge that submitting work that is not my own may lead to disciplinary action.
              </p>
            </label>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSubmit} disabled={isSubmitting || !declarationChecked} className="gap-2">
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FilePenLine className="w-4 h-4" />}
          {isSubmitting
            ? "Submitting..."
            : mode === "resubmission"
              ? "Submit Revised Assignment"
              : "Submit Written Assignment"}
        </Button>
      </div>
    </div>
  );
};

export default WrittenAssignmentForm;
