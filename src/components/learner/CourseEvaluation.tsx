import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, CheckCircle2, ClipboardList, AlertCircle, Star, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import {
    useGetLearnerEvaluationQuery,
    useSubmitLearnerEvaluationMutation,
} from "@/redux/apis/enrolmentDeclarationApi";

interface EvaluationQuestion {
    key: string;
    label: string;
    type: "rating" | "textarea" | "single_choice";
    required: boolean;
    options?: string[];
    placeholder?: string;
}

interface EvaluationTemplate {
    id: string;
    qualification: string;
    title: string;
    description: string;
    questions: EvaluationQuestion[];
    version: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

interface EvaluationSubmission {
    id: string;
    submitted_at: string;
    template_version_snapshot: number;
    title_snapshot: string;
    description_snapshot: string;
    questions_snapshot: EvaluationQuestion[];
    answers: Record<string, string | number>;
}

const TEMPLATE_STORAGE_KEY = "admin_evaluation_templates";
const SUBMISSION_STORAGE_KEY = "learner_evaluation_submissions";

const DEMO_TEMPLATE: EvaluationTemplate = {
    id: "demo-evaluation",
    qualification: "",
    title: "Course Evaluation",
    description: "Thank you for completing this qualification. Please take a moment to provide your feedback. Your responses help us improve the quality of our programmes.",
    questions: [
        { key: "overall_rating", label: "How would you rate the course overall?", type: "rating", required: true },
        { key: "content_quality", label: "How would you rate the quality of the learning materials?", type: "rating", required: true },
        { key: "platform_experience", label: "How would you rate your experience using the platform?", type: "rating", required: true },
        { key: "would_recommend", label: "Would you recommend this course to others?", type: "single_choice", required: true, options: ["Yes", "No", "Maybe"] },
        { key: "final_comments", label: "Any additional comments or suggestions?", type: "textarea", required: false, placeholder: "Share your thoughts..." },
    ],
    version: 1,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
};

const loadTemplate = (qualificationId: string): EvaluationTemplate => {
    try {
        const saved = localStorage.getItem(TEMPLATE_STORAGE_KEY);
        if (saved) {
            const all = JSON.parse(saved);
            if (all[qualificationId]) return all[qualificationId];
        }
    } catch { }
    return { ...DEMO_TEMPLATE, qualification: qualificationId };
};

const loadSubmission = (enrolmentId: string): EvaluationSubmission | null => {
    try {
        const saved = localStorage.getItem(SUBMISSION_STORAGE_KEY);
        if (saved) {
            const all = JSON.parse(saved);
            return all[enrolmentId] || null;
        }
    } catch { }
    return null;
};

const saveSubmission = (enrolmentId: string, submission: EvaluationSubmission) => {
    try {
        const saved = localStorage.getItem(SUBMISSION_STORAGE_KEY);
        const all = saved ? JSON.parse(saved) : {};
        all[enrolmentId] = submission;
        localStorage.setItem(SUBMISSION_STORAGE_KEY, JSON.stringify(all));
    } catch { }
};

const StarRating = ({
    value,
    onChange,
    disabled = false,
}: {
    value: number;
    onChange?: (val: number) => void;
    disabled?: boolean;
}) => {
    const [hover, setHover] = useState(0);
    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    disabled={disabled}
                    className={`text-2xl transition-colors ${star <= (hover || value) ? "text-amber-400" : "text-muted-foreground/30"
                        } ${disabled ? "cursor-default" : "cursor-pointer hover:scale-110"}`}
                    onClick={() => onChange?.(star)}
                    onMouseEnter={() => !disabled && setHover(star)}
                    onMouseLeave={() => !disabled && setHover(0)}
                >
                    ★
                </button>
            ))}
        </div>
    );
};

const CourseEvaluation = () => {
    const { id: enrolmentId } = useParams();
    const { toast } = useToast();

    // Changed: Using real API hooks
    const { data: apiResponse, isLoading, refetch } = useGetLearnerEvaluationQuery(enrolmentId || "");
    const [submitEvaluation, { isLoading: isSubmitting }] = useSubmitLearnerEvaluationMutation();

    const [answers, setAnswers] = useState<Record<string, any>>({});

    const template = apiResponse?.data?.template;
    const submission = apiResponse?.data?.submission;

    useEffect(() => {
        if (submission) {
            setAnswers(submission.answers);
        }
    }, [submission]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
                <Loader2 className="w-8 h-8 animate-spin" />
                <p className="text-sm">Loading evaluation...</p>
            </div>
        );
    }

    if (!template) {
        return (
            <div className="text-center py-20">
                <p className="text-muted-foreground">No course evaluation template found.</p>
                <Link to={`/learner/qualification/${enrolmentId}`} className="text-primary hover:underline mt-2 inline-block">
                    Back to Qualification
                </Link>
            </div>
        );
    }

    const setAnswer = (key: string, value: any) => {
        if (submission) return;
        setAnswers((prev) => ({ ...prev, [key]: value }));
    };

    const requiredKeys = template.questions.filter((q) => q.required).map((q) => q.key);
    const allRequiredAnswered = requiredKeys.every((key) => {
        const val = answers[key];
        return val !== undefined && val !== "" && val !== null;
    });

    const handleSubmit = async () => {
        if (!allRequiredAnswered || !enrolmentId) return;

        try {
            await submitEvaluation({
                enrolmentId,
                payload: { answers },
            }).unwrap();
            
            toast({ title: "Course evaluation submitted successfully" });
            refetch();
        } catch (err: any) {
            toast({
                title: "Submission Failed",
                description: err.data?.message || "An error occurred",
                variant: "destructive",
            });
        }
    };

    // Submitted state
    if (submission) {
        return (
            <div>
                <Link to={`/learner/qualification/${enrolmentId}`} className="inline-flex items-center gap-2 text-primary hover:underline mb-6 text-sm font-medium">
                    <ArrowLeft className="w-4 h-4" /> Back to Qualification
                </Link>

                <Card className="max-w-2xl mx-auto p-6 space-y-5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-foreground">Evaluation Completed</h1>
                            <p className="text-sm text-muted-foreground">
                                Submitted on {new Date(submission.submitted_at).toLocaleDateString("en-GB", {
                                    day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
                                })}
                            </p>
                        </div>
                        <Badge variant="outline" className="ml-auto text-xs">v{submission.template_version_snapshot}</Badge>
                    </div>

                    <Separator />

                    <div>
                        <h2 className="text-lg font-semibold text-foreground mb-2">{submission.title_snapshot}</h2>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{submission.description_snapshot}</p>
                    </div>

                    <div className="space-y-6">
                        {submission.questions_snapshot.map((q) => {
                            const answer = submission.answers[q.key];
                            return (
                                <div key={q.key} className="space-y-1.5">
                                    <p className="text-sm font-semibold text-foreground">{q.label}</p>
                                    {q.type === "rating" && (
                                        <StarRating value={Number(answer) || 0} disabled />
                                    )}
                                    {q.type === "textarea" && (
                                        <div className="text-sm text-muted-foreground bg-muted/30 rounded-lg p-4 border border-border/50 italic leading-relaxed">
                                            {String(answer || "No comments provided.")}
                                        </div>
                                    )}
                                    {(q.type === "single_choice" || q.type === "text") && (
                                        <Badge variant="secondary" className="px-3 py-1">{String(answer || "—")}</Badge>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </Card>
            </div>
        );
    }

    // Evaluation form
    return (
        <div>
            <Link to={`/learner/qualification/${enrolmentId}`} className="inline-flex items-center gap-2 text-primary hover:underline mb-6 text-sm font-medium">
                <ArrowLeft className="w-4 h-4" /> Back to Qualification
            </Link>

            <Card className="max-w-2xl mx-auto p-6 space-y-5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <ClipboardList className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-foreground">{template.title}</h1>
                        <p className="text-sm text-muted-foreground">Course Feedback</p>
                    </div>
                </div>

                <Separator />

                <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{template.description}</p>

                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                        Please answer all required questions before submitting your evaluation.
                    </AlertDescription>
                </Alert>

                <div className="space-y-8">
                    {template.questions.map((q) => (
                        <div key={q.key} className="space-y-3">
                            <Label className="text-sm font-bold block leading-relaxed">
                                {q.label} {q.required && <span className="text-destructive ml-0.5">*</span>}
                            </Label>

                            {q.type === "rating" && (
                                <StarRating
                                    value={Number(answers[q.key]) || 0}
                                    onChange={(val) => setAnswer(q.key, val)}
                                />
                            )}

                            {q.type === "textarea" && (
                                <Textarea
                                    value={String(answers[q.key] || "")}
                                    onChange={(e) => setAnswer(q.key, e.target.value)}
                                    placeholder={q.placeholder || "Share your thoughts here..."}
                                    rows={4}
                                    className="bg-muted/20"
                                />
                            )}

                            {q.type === "single_choice" && (
                                <RadioGroup
                                    value={String(answers[q.key] || "")}
                                    onValueChange={(val) => setAnswer(q.key, val)}
                                    className="grid grid-cols-1 sm:grid-cols-2 gap-2"
                                >
                                    {(q.options || []).map((opt, i) => (
                                        <div key={i} className="flex items-center gap-3 p-3 bg-muted/10 rounded-lg border border-transparent hover:border-primary/20 transition-all">
                                            <RadioGroupItem value={opt} id={`${q.key}-${i}`} />
                                            <Label htmlFor={`${q.key}-${i}`} className="text-sm font-normal cursor-pointer flex-1">{opt}</Label>
                                        </div>
                                    ))}
                                </RadioGroup>
                            )}
                        </div>
                    ))}
                </div>

                <Separator />

                <Button
                    className="w-full h-11"
                    onClick={handleSubmit}
                    disabled={!allRequiredAnswered || isSubmitting}
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Submitting...
                        </>
                    ) : (
                        "Submit Evaluation"
                    )}
                </Button>
            </Card>
        </div>
    );
};


export default CourseEvaluation;
