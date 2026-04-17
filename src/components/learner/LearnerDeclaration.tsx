import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, CheckCircle2, FileCheck, AlertCircle, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import {
    useGetLearnerDeclarationQuery,
    useSubmitLearnerDeclarationMutation,
} from "@/redux/apis/enrolmentDeclarationApi";

interface CheckboxItem {
    key: string;
    label: string;
}

interface DeclarationTemplate {
    id: string;
    qualification: string;
    title: string;
    body_text: string;
    checkbox_items: CheckboxItem[];
    version: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

interface DeclarationSubmission {
    id: string;
    submitted_at: string;
    template_version_snapshot: number;
    title_snapshot: string;
    body_text_snapshot: string;
    checkbox_items_snapshot: CheckboxItem[];
    accepted_items: string[];
    typed_full_name: string;
}

const TEMPLATE_STORAGE_KEY = "admin_declaration_templates";
const SUBMISSION_STORAGE_KEY = "learner_declaration_submissions";

const DEMO_TEMPLATE: DeclarationTemplate = {
    id: "demo-declaration",
    qualification: "",
    title: "Learner Declaration",
    body_text: "By completing this declaration, you confirm that all work submitted as part of this qualification is your own and has been completed in accordance with the assessment guidelines provided.",
    checkbox_items: [
        { key: "own_work", label: "I confirm that all evidence submitted is my own work and has not been plagiarised." },
        { key: "understand_criteria", label: "I understand the assessment criteria and have met all requirements." },
        { key: "accurate_info", label: "All information provided is accurate and truthful to the best of my knowledge." },
        { key: "terms", label: "I agree to the terms and conditions of this qualification programme." },
    ],
    version: 1,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
};

const loadTemplate = (qualificationId: string): DeclarationTemplate => {
    try {
        const saved = localStorage.getItem(TEMPLATE_STORAGE_KEY);
        if (saved) {
            const all = JSON.parse(saved);
            if (all[qualificationId]) return all[qualificationId];
        }
    } catch { }
    return { ...DEMO_TEMPLATE, qualification: qualificationId };
};

const loadSubmission = (enrolmentId: string): DeclarationSubmission | null => {
    try {
        const saved = localStorage.getItem(SUBMISSION_STORAGE_KEY);
        if (saved) {
            const all = JSON.parse(saved);
            return all[enrolmentId] || null;
        }
    } catch { }
    return null;
};

const saveSubmission = (enrolmentId: string, submission: DeclarationSubmission) => {
    try {
        const saved = localStorage.getItem(SUBMISSION_STORAGE_KEY);
        const all = saved ? JSON.parse(saved) : {};
        all[enrolmentId] = submission;
        localStorage.setItem(SUBMISSION_STORAGE_KEY, JSON.stringify(all));
    } catch { }
};

const LearnerDeclaration = () => {
    const { id: enrolmentId } = useParams();
    const { toast } = useToast();

    // Changed: Using real API hooks
    const { data: apiResponse, isLoading, refetch } = useGetLearnerDeclarationQuery(enrolmentId || "");
    const [submitDeclaration, { isLoading: isSubmitting }] = useSubmitLearnerDeclarationMutation();

    const [acceptedItems, setAcceptedItems] = useState<string[]>([]);
    const [typedFullName, setTypedFullName] = useState("");

    const template = apiResponse?.data?.template;
    const submission = apiResponse?.data?.submission;

    useEffect(() => {
        if (submission) {
            setAcceptedItems(submission.accepted_items);
            setTypedFullName(submission.typed_full_name);
        }
    }, [submission]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
                <Loader2 className="w-8 h-8 animate-spin" />
                <p className="text-sm">Loading declaration...</p>
            </div>
        );
    }

    if (!template) {
        return (
            <div className="text-center py-20">
                <p className="text-muted-foreground">No declaration template found.</p>
                <Link to={`/learner/qualification/${enrolmentId}`} className="text-primary hover:underline mt-2 inline-block">
                    Back to Qualification
                </Link>
            </div>
        );
    }

    const toggleItem = (key: string) => {
        if (submission) return;
        setAcceptedItems((prev) =>
            prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
        );
    };

    const allChecked = template.checkbox_items.every((item) => acceptedItems.includes(item.key));
    const canSubmit = allChecked && typedFullName.trim().length >= 2;

    const handleSubmit = async () => {
        if (!canSubmit || !enrolmentId) return;

        try {
            await submitDeclaration({
                enrolmentId,
                payload: {
                    accepted_items: acceptedItems,
                    typed_full_name: typedFullName.trim(),
                },
            }).unwrap();
            
            toast({ title: "Declaration submitted successfully" });
            refetch();
        } catch (err: any) {
            toast({
                title: "Submission Failed",
                description: err.data?.message || "An error occurred",
                variant: "destructive",
            });
        }
    };

    // Already submitted — show completed state
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
                            <h1 className="text-xl font-bold text-foreground">Declaration Completed</h1>
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
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{submission.body_text_snapshot}</p>
                    </div>

                    <div className="space-y-3">
                        {submission.checkbox_items_snapshot.map((item) => {
                            const accepted = submission.accepted_items.includes(item.key);
                            return (
                                <div key={item.key} className="flex items-start gap-3">
                                    <Checkbox checked={accepted} disabled />
                                    <span className="text-sm text-muted-foreground">{item.label}</span>
                                </div>
                            );
                        })}
                    </div>

                    <Separator />

                    <div>
                        <p className="text-xs text-muted-foreground mb-1">Signed by</p>
                        <p className="text-sm font-semibold text-foreground">{submission.typed_full_name}</p>
                    </div>
                </Card>
            </div>
        );
    }

    // Submission form
    return (
        <div>
            <Link to={`/learner/qualification/${enrolmentId}`} className="inline-flex items-center gap-2 text-primary hover:underline mb-6 text-sm font-medium">
                <ArrowLeft className="w-4 h-4" /> Back to Qualification
            </Link>

            <Card className="max-w-2xl mx-auto p-6 space-y-5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <FileCheck className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-foreground">{template.title}</h1>
                        <p className="text-sm text-muted-foreground">Learner Declaration</p>
                    </div>
                </div>

                <Separator />

                <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{template.body_text}</p>

                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                        You must confirm all statements below and type your full name to submit this declaration.
                    </AlertDescription>
                </Alert>

                <div className="space-y-4">
                    {template.checkbox_items.map((item) => (
                        <div key={item.key} className="flex items-start gap-3">
                            <Checkbox
                                id={`decl-${item.key}`}
                                checked={acceptedItems.includes(item.key)}
                                onCheckedChange={() => toggleItem(item.key)}
                            />
                            <label htmlFor={`decl-${item.key}`} className="text-sm text-foreground leading-tight cursor-pointer">
                                {item.label}
                            </label>
                        </div>
                    ))}
                </div>

                <Separator />

                <div className="space-y-1.5">
                    <Label>Full Name (typed signature) *</Label>
                    <Input
                        value={typedFullName}
                        onChange={(e) => setTypedFullName(e.target.value)}
                        placeholder="Type your full legal name"
                    />
                    <p className="text-xs text-muted-foreground italic">
                        By typing your name above, you confirm you have read and agree to all statements.
                    </p>
                </div>

                <Button
                    className="w-full h-11"
                    onClick={handleSubmit}
                    disabled={!canSubmit || isSubmitting}
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Submitting...
                        </>
                    ) : (
                        "Submit Declaration"
                    )}
                </Button>
            </Card>
        </div>
    );
};


export default LearnerDeclaration;
