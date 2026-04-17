import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, ClipboardList, CheckCircle2, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  useGetLearnerEvaluationQuery,
  useSubmitLearnerEvaluationMutation,
  EvaluationQuestion,
} from "@/redux/apis/enrolmentDeclarationApi";

interface CourseEvaluationModalProps {
  enrolmentId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const CourseEvaluationModal = ({
  enrolmentId,
  isOpen,
  onClose,
  onSuccess,
}: CourseEvaluationModalProps) => {
  const { toast } = useToast();
  const { data: apiResponse, isLoading, refetch } = useGetLearnerEvaluationQuery(enrolmentId, { skip: !isOpen });
  const [submitEvaluation, { isLoading: isSubmitting }] = useSubmitLearnerEvaluationMutation();

  const [answers, setAnswers] = useState<Record<string, any>>({});
  
  const template = apiResponse?.data?.template;
  const submission = apiResponse?.data?.submission;

  useEffect(() => {
    if (submission) {
      setAnswers(submission.answers);
    } else {
      setAnswers({});
    }
  }, [submission, isOpen]);

  const handleRatingChange = (key: string, rating: number) => {
    if (submission) return;
    setAnswers((prev) => ({ ...prev, [key]: rating }));
  };

  const handleTextChange = (key: string, value: string) => {
    if (submission) return;
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!template) return;

    // Validation
    const questions = template.questions || [];
    for (const q of questions) {
      if (q.required && !answers[q.key]) {
        toast({
          title: "Missing Answer",
          description: `Please answer the required question: "${q.label}"`,
          variant: "destructive",
        });
        return;
      }
    }

    try {
      await submitEvaluation({
        enrolmentId,
        payload: { answers },
      }).unwrap();
      toast({ title: "Evaluation Submitted Successfully" });
      onSuccess?.();
      refetch();
    } catch (err: any) {
      toast({
        title: "Submission Failed",
        description: err.data?.message || "An error occurred during submission.",
        variant: "destructive",
      });
    }
  };

  if (isLoading && isOpen) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="sr-only">
            <DialogTitle>Loading Evaluation</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading evaluation...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!template && isOpen && !isLoading) return null;

  const questions = submission ? submission.questions_snapshot : template?.questions || [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-primary" />
            {submission ? submission.title_snapshot : template?.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {submission && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4 rounded-lg flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
              <div>
                <p className="text-sm font-bold text-green-800 dark:text-green-300">Evaluation Completed</p>
                <p className="text-xs text-green-700 dark:text-green-400">
                  Submitted on {new Date(submission.submitted_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}

          <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
            {submission ? submission.description_snapshot : template?.description}
          </p>

          <Separator />

          <div className="space-y-8">
            {questions.map((q: EvaluationQuestion) => (
              <div key={q.key} className="space-y-3">
                <Label className="text-sm font-bold block leading-relaxed">
                  {q.label} {q.required && <span className="text-destructive ml-1">*</span>}
                </Label>

                {q.type === "rating" && (
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const isActive = (answers[q.key] || 0) >= star;
                      return (
                        <button
                          key={star}
                          type="button"
                          disabled={!!submission}
                          onClick={() => handleRatingChange(q.key, star)}
                          className="focus:outline-none transition-transform hover:scale-110 disabled:scale-100 disabled:cursor-default"
                        >
                          <Star
                            className={`w-8 h-8 ${
                              isActive
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-muted-foreground/30"
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>
                )}

                {q.type === "textarea" && (
                  <Textarea
                    value={answers[q.key] || ""}
                    onChange={(e) => handleTextChange(q.key, e.target.value)}
                    placeholder={q.placeholder || "Type your answer here..."}
                    disabled={!!submission}
                    className="min-h-[100px] bg-muted/20"
                  />
                )}

                {q.type === "single_choice" && (
                  <RadioGroup
                    value={answers[q.key]}
                    onValueChange={(val) => handleTextChange(q.key, val)}
                    disabled={!!submission}
                    className="flex flex-col gap-2"
                  >
                    {(q.options || []).map((opt, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg border border-transparent hover:border-primary/20 transition-all">
                        <RadioGroupItem value={opt} id={`${q.key}-${i}`} />
                        <Label
                          htmlFor={`${q.key}-${i}`}
                          className="text-sm font-normal cursor-pointer flex-1"
                        >
                          {opt}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}
              </div>
            ))}
          </div>

          {!submission && (
            <div className="pt-4 sticky bottom-0 bg-background/80 backdrop-blur-sm -mx-6 px-6 pb-2 mt-4 border-t pt-4">
              <Button
                className="w-full h-12 font-bold text-base shadow-lg"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <CheckCircle2 className="w-5 h-5 mr-2" />}
                Submit Evaluation
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

export default CourseEvaluationModal;
