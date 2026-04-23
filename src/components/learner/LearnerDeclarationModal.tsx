import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Loader2, FileCheck, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  useGetLearnerDeclarationQuery,
  useSubmitLearnerDeclarationMutation,
} from "@/redux/apis/enrolmentDeclarationApi";

interface LearnerDeclarationModalProps {
  enrolmentId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const LearnerDeclarationModal = ({
  enrolmentId,
  isOpen,
  onClose,
  onSuccess,
}: LearnerDeclarationModalProps) => {
  const { toast } = useToast();
  const { data: apiResponse, isLoading, error } = useGetLearnerDeclarationQuery(enrolmentId, { skip: !isOpen });
  const [submitDeclaration, { isLoading: isSubmitting }] = useSubmitLearnerDeclarationMutation();

  const [acceptedItems, setAcceptedItems] = useState<string[]>([]);
  const [typedName, setTypedName] = useState("");

  const template = apiResponse?.data?.template;
  const submission = apiResponse?.data?.submission;
  const isNotFoundError =
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    error.status === 404;

  useEffect(() => {
    if (submission) {
      setAcceptedItems(submission.accepted_items);
      setTypedName(submission.typed_full_name);
    }
  }, [submission]);

  const handleSubmit = async () => {
    if (!template) return;

    if (acceptedItems.length !== template.checkbox_items.length) {
      toast({
        title: "Incomplete Declaration",
        description: "Please accept all mandatory declaration items.",
        variant: "destructive",
      });
      return;
    }

    if (!typedName.trim()) {
      toast({
        title: "Signature Required",
        description: "Please type your full name to sign the declaration.",
        variant: "destructive",
      });
      return;
    }

    try {
      await submitDeclaration({
        enrolmentId,
        payload: {
          accepted_items: acceptedItems,
          typed_full_name: typedName.trim(),
        },
      }).unwrap();
      toast({ title: "Declaration Submitted Successfully" });
      onSuccess?.();
    } catch (err: unknown) {
      const message =
        typeof err === "object" &&
        err !== null &&
        "data" in err &&
        typeof err.data === "object" &&
        err.data !== null &&
        "message" in err.data &&
        typeof err.data.message === "string"
          ? err.data.message
          : "An error occurred during submission.";
      toast({
        title: "Submission Failed",
        description: message,
        variant: "destructive",
      });
    }
  };

  const toggleItem = (key: string) => {
    if (submission) return; // Prevent toggling if already submitted
    setAcceptedItems((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  if (isLoading && isOpen) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="sr-only">
            <DialogTitle>Loading Declaration</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading declaration...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!isLoading && error && !isNotFoundError) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Unable to Load Declaration</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <p className="text-sm text-muted-foreground">
              The declaration could not be loaded right now.
            </p>
            <Button variant="outline" className="w-full" onClick={onClose}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!template && isOpen && !isLoading) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-primary" />
            {template?.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {submission && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4 rounded-lg flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
              <div>
                <p className="text-sm font-bold text-green-800 dark:text-green-300">Declaration Completed</p>
                <p className="text-xs text-green-700 dark:text-green-400">Submitted on {new Date(submission.submitted_at).toLocaleDateString()}</p>
              </div>
            </div>
          )}

          <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
            {submission ? submission.body_text_snapshot : template?.body_text}
          </p>

          <Separator />

          <div className="space-y-4">
            {(submission ? submission.checkbox_items_snapshot : template?.checkbox_items || []).map((item) => (
              <div key={item.key} className="flex items-start gap-3 group">
                <Checkbox
                  id={item.key}
                  checked={acceptedItems.includes(item.key)}
                  onCheckedChange={() => toggleItem(item.key)}
                  disabled={!!submission}
                  className="mt-1"
                />
                <label
                  htmlFor={item.key}
                  className={`text-sm leading-tight cursor-pointer ${
                    submission ? "text-muted-foreground" : "text-foreground hover:text-primary transition-colors"
                  }`}
                >
                  {item.label}
                </label>
              </div>
            ))}
          </div>

          <Separator />

          <div className="space-y-2">
            <Label className="text-sm font-bold">Full Name (Typed Signature) *</Label>
            <Input
              value={typedName}
              onChange={(e) => setTypedName(e.target.value)}
              placeholder="Enter your full name"
              disabled={!!submission}
              className="h-11"
            />
            {!submission && (
              <p className="text-[10px] text-muted-foreground italic">
                By typing your name, you agree that this electronic signature is as legally binding as a physical signature.
              </p>
            )}
          </div>

          {!submission && (
            <div className="pt-2">
              <Button
                className="w-full h-12 font-bold text-base shadow-lg"
                onClick={handleSubmit}
                disabled={isSubmitting || acceptedItems.length === 0}
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <FileCheck className="w-5 h-5 mr-2" />}
                Confirm & Submit Declaration
              </Button>
            </div>
          )}

          {submission && (
            <Button variant="outline" className="w-full h-11" onClick={onClose}>
              Close
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LearnerDeclarationModal;
