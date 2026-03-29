import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Trash2,
  CheckCircle2,
  X,
  Save,
  Settings2,
  Shield,
  Hash,
  Shuffle,
  Clock,
  Loader2,
  AlertCircle,
  RotateCcw,
  Activity
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  useGetCPDFinalAssessmentQuery,
  useCreateCPDFinalAssessmentMutation,
  useUpdateCPDFinalAssessmentMutation,
  useGetCPDFinalAssessmentQuestionsQuery,
  useCreateCPDFinalAssessmentQuestionMutation,
  useDeleteCPDFinalAssessmentQuestionMutation,
} from "@/redux/apis/quiz/quizApi";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const AdminCPDFinalAssessmentEditor = () => {
  const { qualificationId } = useParams();
  const { toast } = useToast();

  const {
    data: assessmentSummaryResponse,
    isLoading: isLoadingAssessmentDetail,
    refetch: refetchAssessmentSummary,
  } = useGetCPDFinalAssessmentQuery(qualificationId, {
    skip: !qualificationId,
  });
  const assessment = assessmentSummaryResponse?.data ?? null;
  const assessmentId = assessment?.id ?? undefined;

  const { data: questionsResponse, isLoading: isLoadingQuestions } = useGetCPDFinalAssessmentQuestionsQuery(assessmentId!, { skip: !assessmentId });
  const questions = Array.isArray(questionsResponse?.data) ? questionsResponse.data : [];

  const [updateAssessment] = useUpdateCPDFinalAssessmentMutation();
  const [createAssessment] = useCreateCPDFinalAssessmentMutation();
  const [createQuestion] = useCreateCPDFinalAssessmentQuestionMutation();
  const [deleteQuestionMutation] = useDeleteCPDFinalAssessmentQuestionMutation();

  const [showAddQ, setShowAddQ] = useState(false);
  const [newQ, setNewQ] = useState("");
  const [newQType, setNewQType] = useState<"single" | "multiple">("single");
  const [newQOptions, setNewQOptions] = useState(["", ""]);
  const [newQCorrect, setNewQCorrect] = useState<number[]>([]);
  const [localSettings, setLocalSettings] = useState<any>(null);

  const qualificationTitle = assessment?.qualification_title || "CPD Final Assessment";
  const qualificationCode = assessment?.qualification_code || "CPD";
  const activeQuestionCount = assessment?.questions_per_assessment || 0;
  const requiredQuestionCount = localSettings?.questions_per_assessment ?? assessment?.questions_per_assessment ?? 0;
  const timeLimit = localSettings?.time_limit_minutes ?? 0;
  const passMark = localSettings?.pass_mark ?? 0;
  const isAssessmentLive = assessment?.is_active ?? localSettings?.is_active ?? false;
  const isReady = activeQuestionCount >= requiredQuestionCount;

  useEffect(() => {
    if (assessment) {
      setLocalSettings({ ...assessment });
      return;
    }

    if (!assessmentId) {
      setLocalSettings((current: any) => current ?? {
        title: `Final Assessment - ${assessment?.qualification_title}`,
        description: "",
        status: "draft",
        pass_mark: 70,
        time_limit_minutes: 60,
        max_attempts: 3,
        questions_per_assessment: 25,
        shuffle_questions: true,
        shuffle_options: true,
        show_results_immediately: true,
        show_correct_answers_after: false,
        show_explanations_after: false,
        cooldown_hours_between_attempts: 24,
        is_active: true,
      });
    }
  }, [assessment, assessmentId]);

  const resetNewQ = () => {
    setNewQ("");
    setNewQType("single");
    setNewQOptions(["", ""]);
    setNewQCorrect([]);
    setShowAddQ(false);
  };

  const handleAddQuestion = async () => {
    if (!newQ.trim()) {
      toast({ title: "Enter a question", variant: "destructive" });
      return;
    }
    if (newQOptions.some((option) => !option.trim())) {
      toast({ title: "Complete all options", variant: "destructive" });
      return;
    }
    if (newQCorrect.length === 0) {
      toast({ title: "Mark at least one correct answer", variant: "destructive" });
      return;
    }

    try {
      await createQuestion({
        assessmentId: assessmentId!,
        data: {
          question_text: newQ,
          question_type: newQType,
          options: [...newQOptions],
          correct_answers: [...newQCorrect],
          is_active: true,
        },
      }).unwrap();
      resetNewQ();
      toast({ title: "Question added to pool" });
    } catch (err: any) {
      toast({
        title: "Failed to add question",
        description: err?.data?.message || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    try {
      await deleteQuestionMutation(id).unwrap();
      toast({ title: "Question removed" });
    } catch (_err: any) {
      toast({ title: "Failed to remove question", variant: "destructive" });
    }
  };

  const handleSaveSettings = async () => {
    if (!localSettings) return;

    const createPayload = {
      qualification: qualificationId!,
      title: localSettings.title,
      description: localSettings.description,
      pass_mark: localSettings.pass_mark,
      time_limit_minutes: localSettings.time_limit_minutes,
      max_attempts: localSettings.max_attempts,
      questions_per_assessment: localSettings.questions_per_assessment,
      shuffle_questions: localSettings.shuffle_questions,
      shuffle_options: localSettings.shuffle_options,
      strict_mode: localSettings.strict_mode,
      show_results_immediately: localSettings.show_results_immediately,
      show_correct_answers_after: localSettings.show_correct_answers_after,
      show_explanations_after: localSettings.show_explanations_after,
      cooldown_hours_between_attempts: localSettings.cooldown_hours_between_attempts,
      is_active: localSettings.is_active,
    };

    const updatePayload = {
      title: localSettings.title,
      description: localSettings.description,
      status: localSettings.status,
      pass_mark: localSettings.pass_mark,
      time_limit_minutes: localSettings.time_limit_minutes,
      max_attempts: localSettings.max_attempts,
      questions_per_assessment: localSettings.questions_per_assessment,
      shuffle_questions: localSettings.shuffle_questions,
      shuffle_options: localSettings.shuffle_options,
      strict_mode: localSettings.strict_mode,
      show_results_immediately: localSettings.show_results_immediately,
      show_correct_answers_after: localSettings.show_correct_answers_after,
      show_explanations_after: localSettings.show_explanations_after,
      cooldown_hours_between_attempts: localSettings.cooldown_hours_between_attempts,
      is_active: localSettings.is_active,
    };

    try {
      if (assessmentId) {
        await updateAssessment({
          id: assessmentId,
          qualificationId: qualificationId!,
          data: updatePayload,
        }).unwrap();
        toast({ title: "Settings saved" });
      } else {
        await createAssessment(createPayload).unwrap();
        toast({ title: "Assessment initialized successfully" });
      }
    } catch (err: any) {
      toast({
        title: "Failed to save settings",
        description: err?.data?.message || JSON.stringify(err?.data?.data || err?.data) || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  const toggleCorrect = (optionIndex: number) => {
    if (newQType === "single") {
      setNewQCorrect([optionIndex]);
      return;
    }

    setNewQCorrect((previous) => (
      previous.includes(optionIndex)
        ? previous.filter((index) => index !== optionIndex)
        : [...previous, optionIndex]
    ));
  };

  if ((assessmentId && isLoadingAssessmentDetail) || (assessmentId && isLoadingQuestions)) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-4 text-muted-foreground">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p>Loading assessment editor...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 text-foreground">
      <Link to="/admin/final-assessments" className="inline-flex items-center gap-1.5 text-primary hover:underline text-sm mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Final Assessments
      </Link>

      <Card className="mb-6 overflow-hidden border-0 bg-primary text-primary-foreground shadow-lg">
        <div className="p-6 md:p-8 space-y-3">
          <p className="text-sm font-medium text-primary-foreground/80">{qualificationTitle}</p>
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{localSettings?.title || "Final Assessment Editor"}</h1>
              <p className="text-sm text-primary-foreground/85 mt-2">
                {questions.length} questions in pool
                <span className="mx-2">•</span>
                {requiredQuestionCount} per assessment
                <span className="mx-2">•</span>
                {timeLimit} min
                <span className="mx-2">•</span>
                Pass: {passMark}%
              </p>
            </div>
            <div className="flex items-center gap-2 self-start">
              <Badge variant="secondary" className="bg-white/10 text-primary-foreground border-0 uppercase tracking-wider text-[10px] font-bold px-2 py-0.5">
                {qualificationCode}
              </Badge>
              <Badge variant="secondary" className="bg-white text-primary uppercase tracking-wider text-[10px] font-bold px-2 py-0.5">
                CPD Final
              </Badge>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="questions" className="space-y-4">
            <TabsList>
              <TabsTrigger value="questions" className="gap-2">
                <Hash className="w-4 h-4" /> Question Pool ({questions.length})
              </TabsTrigger>
              <TabsTrigger value="settings" className="gap-2">
                <Settings2 className="w-4 h-4" /> Quiz Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="questions" className="space-y-4">
              {assessment && !isReady && (
                <Alert className="bg-amber-500/5 text-amber-700 border-amber-500/20">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle className="font-bold">Pool Shortfall</AlertTitle>
                  <AlertDescription className="text-xs">
                    This assessment requires {assessment.questions_per_assessment} questions, but the active pool only has {activeQuestionCount}.
                    Please add at least {requiredQuestionCount - activeQuestionCount} more questions.
                  </AlertDescription>
                </Alert>
              )}

              {!assessmentId && (
                <Alert className="bg-primary/5 text-primary border-primary/20">
                  <Settings2 className="h-4 w-4" />
                  <AlertTitle className="font-bold">Assessment Not Initialized</AlertTitle>
                  <AlertDescription className="text-xs">
                    Configure the final assessment first, then return here to build the question pool.
                  </AlertDescription>
                </Alert>
              )}

              {questions.map((question, index) => (
                <Card key={question.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-xs font-bold text-muted-foreground bg-muted w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-foreground">{question.question_text}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs capitalize">
                          {question.question_type === "single" ? "Single answer" : "Multiple answers"}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{question.options?.length ?? 0} options</span>
                        {!question.is_active && <Badge variant="destructive" className="text-[10px] h-4">Inactive</Badge>}
                      </div>
                      <div className="mt-2 space-y-1">
                        {(question.options ?? []).map((option, optionIndex) => (
                          <div
                            key={optionIndex}
                            className={`text-xs px-2 py-1 rounded ${question.correct_answers?.includes(optionIndex) ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : "text-muted-foreground"}`}
                          >
                            {question.correct_answers?.includes(optionIndex) ? "✓ " : "  "}
                            {option}
                          </div>
                        ))}
                      </div>
                    </div>
                    <Button size="icon" variant="ghost" className="text-destructive h-8 w-8 flex-shrink-0" onClick={() => handleDeleteQuestion(question.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))}

              {assessmentId && questions.length === 0 && !showAddQ && (
                <div className="py-20 text-center border-2 border-dashed rounded-xl space-y-4">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto">
                    <Plus className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">No questions yet</p>
                    <p className="text-xs mt-1 text-muted-foreground">Start by adding questions to the final assessment pool.</p>
                  </div>
                  <Button onClick={() => setShowAddQ(true)}>Add First Question</Button>
                </div>
              )}

              {showAddQ ? (
                <Card className="p-6 border-2 border-primary/30">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-foreground">Add Question to Pool</h3>
                    <Button variant="ghost" size="icon" onClick={resetNewQ}><X className="w-5 h-5" /></Button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label>Question *</Label>
                      <Input value={newQ} onChange={(event) => setNewQ(event.target.value)} placeholder="Enter your question..." className="mt-1" />
                    </div>
                    <div className="w-48">
                      <Label>Answer Type</Label>
                      <select
                        value={newQType}
                        onChange={(event) => {
                          setNewQType(event.target.value as "single" | "multiple");
                          setNewQCorrect([]);
                        }}
                        className="w-full mt-1 border border-input rounded-md px-3 py-2 text-sm bg-background"
                      >
                        <option value="single">Single Answer</option>
                        <option value="multiple">Multiple Answers</option>
                      </select>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground mb-2 block">Options - click the circle to mark correct answer(s)</Label>
                      <div className="space-y-2">
                        {newQOptions.map((option, optionIndex) => (
                          <div key={optionIndex} className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => toggleCorrect(optionIndex)}
                              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${newQCorrect.includes(optionIndex) ? "border-green-600 bg-green-600 text-white" : "border-muted-foreground/40 hover:border-primary"}`}
                            >
                              {newQCorrect.includes(optionIndex) && <CheckCircle2 className="w-4 h-4" />}
                            </button>
                            <Input
                              value={option}
                              onChange={(event) => setNewQOptions((previous) => previous.map((item, index) => (index === optionIndex ? event.target.value : item)))}
                              placeholder={`Option ${optionIndex + 1}`}
                              className="flex-1"
                            />
                            {newQOptions.length > 2 && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground"
                                onClick={() => {
                                  setNewQOptions((previous) => previous.filter((_, index) => index !== optionIndex));
                                  setNewQCorrect((previous) => previous.filter((answer) => answer !== optionIndex).map((answer) => (answer > optionIndex ? answer - 1 : answer)));
                                }}
                              >
                                <X className="w-3.5 h-3.5" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                      {newQOptions.length < 8 && (
                        <Button variant="ghost" size="sm" className="mt-2 text-primary hover:bg-primary/5" onClick={() => setNewQOptions((previous) => [...previous, ""])}>
                          <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Option
                        </Button>
                      )}
                    </div>
                    <div className="flex gap-2 justify-end pt-2">
                      <Button variant="outline" onClick={resetNewQ}>Cancel</Button>
                      <Button onClick={handleAddQuestion}><Plus className="w-4 h-4 mr-1" /> Add to Pool</Button>
                    </div>
                  </div>
                </Card>
              ) : assessmentId ? (
                <Button variant="outline" onClick={() => setShowAddQ(true)} className="w-full border-dashed border-2 h-16 text-muted-foreground hover:text-primary hover:border-primary transition-all">
                  <div className="flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    <span className="font-semibold">Add Question to Pool</span>
                  </div>
                </Button>
              ) : null}
            </TabsContent>

            <TabsContent value="settings">
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-8">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Settings2 className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-lg font-bold text-foreground">Quiz Configuration</h2>
                </div>
                {localSettings && (
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2 font-bold mb-1">
                          <Hash className="w-4 h-4 text-primary" /> Questions per Quiz
                        </Label>
                        <Input
                          type="number"
                          min={1}
                          value={localSettings.questions_per_assessment}
                          onChange={(event) => setLocalSettings({ ...localSettings, questions_per_assessment: Number(event.target.value) })}
                        />
                        <p className="text-[11px] text-muted-foreground">Each learner gets this many random questions from the pool of {activeQuestionCount} active items.</p>
                      </div>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2 font-bold mb-1">
                          <Clock className="w-4 h-4 text-primary" /> Time Limit (minutes)
                        </Label>
                        <Input
                          type="number"
                          min={0}
                          value={localSettings.time_limit_minutes}
                          onChange={(event) => setLocalSettings({ ...localSettings, time_limit_minutes: Number(event.target.value) })}
                        />
                        <p className="text-[11px] text-muted-foreground">Set to 0 for no time limit.</p>
                      </div>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2 font-bold mb-1">
                          <CheckCircle2 className="w-4 h-4 text-primary" /> Pass Score (%)
                        </Label>
                        <Input
                          type="number"
                          min={1}
                          max={100}
                          value={localSettings.pass_mark}
                          onChange={(event) => setLocalSettings({ ...localSettings, pass_mark: Number(event.target.value) })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2 font-bold mb-1">
                          <RotateCcw className="w-4 h-4 text-primary" /> Maximum Attempts
                        </Label>
                        <Input
                          type="number"
                          min={0}
                          value={localSettings.max_attempts}
                          onChange={(event) => setLocalSettings({ ...localSettings, max_attempts: Number(event.target.value) })}
                        />
                        <p className="text-[11px] text-muted-foreground">Set to 0 for unlimited attempts.</p>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-border space-y-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-bold flex items-center gap-2">
                            <Shuffle className="w-4 h-4 text-primary" /> Shuffle Questions
                          </Label>
                          <p className="text-[11px] text-muted-foreground">Randomise the order of questions for each attempt.</p>
                        </div>
                        <Switch checked={localSettings.shuffle_questions} onCheckedChange={(value) => setLocalSettings({ ...localSettings, shuffle_questions: value })} />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-bold flex items-center gap-2">
                            <Shuffle className="w-4 h-4 text-primary" /> Shuffle Options
                          </Label>
                          <p className="text-[11px] text-muted-foreground">Randomise the order of answer options.</p>
                        </div>
                        <Switch checked={localSettings.shuffle_options} onCheckedChange={(value) => setLocalSettings({ ...localSettings, shuffle_options: value })} />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-bold flex items-center gap-2"><Shield className="w-4 h-4 text-muted-foreground" /> Strict Mode (Anti-Cheat)</Label>
                          <p className="text-xs text-muted-foreground mt-0.5">Fullscreen, tab-switch detection, copy/paste blocking</p>
                        </div>
                        <Switch checked={localSettings.strict_mode} onCheckedChange={(v) => setLocalSettings({ ...localSettings, strict_mode: v })} />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-bold flex items-center gap-2">
                            <Shield className="w-4 h-4 text-primary" /> Assessment Visibility
                          </Label>
                          <p className="text-[11px] text-muted-foreground">Keep this enabled to make the final assessment available to learners.</p>
                        </div>
                        <Switch checked={localSettings.is_active} onCheckedChange={(value) => setLocalSettings({ ...localSettings, is_active: value })} />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-bold flex items-center gap-2">
                            <Shield className="w-4 h-4 text-primary" /> Show results immediately
                          </Label>
                          <p className="text-[11px] text-muted-foreground">Show results immediately after the assessment.</p>
                        </div>
                        <Switch checked={localSettings.show_results_immediately} onCheckedChange={(value) => setLocalSettings({ ...localSettings, show_results_immediately: value })} />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-bold flex items-center gap-2">
                            <Shield className="w-4 h-4 text-primary" /> Show correct answers after
                          </Label>
                          <p className="text-[11px] text-muted-foreground">Show correct answers after the assessment.</p>
                        </div>
                        <Switch checked={localSettings.show_correct_answers_after} onCheckedChange={(value) => setLocalSettings({ ...localSettings, show_correct_answers_after: value })} />
                      </div>
                      <div className="flex flex-col items-start justify-between gap-2">
                        <div>
                          <Label className="font-bold flex items-center gap-2">
                            <Activity className="w-4 h-4 text-primary" />
                            Status
                          </Label>
                        </div>
                        <Select value={localSettings.status} onValueChange={(value) => setLocalSettings({ ...localSettings, status: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="published">Published</SelectItem>
                            <SelectItem value="archived">Archived</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex justify-end pt-4">
                      <Button onClick={handleSaveSettings} className="gap-2 px-6">
                        <Save className="w-4 h-4" /> {assessmentId ? "Save Settings" : "Create Quiz"}
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card className="p-6 bg-primary text-primary-foreground shadow-xl relative overflow-hidden">
            <div className="relative z-10 space-y-4">
              <h3 className="font-bold text-lg">CPD Requirements</h3>
              <div className="space-y-3 text-xs text-primary-foreground/90">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px] shrink-0 mt-0.5">1</div>
                  <p>Minimum pool size must be greater than or equal to questions per assessment.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px] shrink-0 mt-0.5">2</div>
                  <p>Questions should reflect the prerequisite reading and core CPD concepts.</p>
                </div>
              </div>
            </div>
            <Shield className="absolute -bottom-6 -right-6 w-32 h-32 text-white/10 rotate-12" />
          </Card>

          <Card className="p-6">
            <h3 className="font-bold mb-4">Quick Stats</h3>
            <div className="space-y-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total Questions</span>
                <span className="font-mono font-bold">{questions.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Questions per Assessment</span>
                <span className="font-mono font-bold text-green-600">{activeQuestionCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge className={isReady ? "bg-green-600" : "bg-amber-600"}>
                  {isReady ? "Ready" : "Underpopulated"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Visibility</span>
                <Badge variant={isAssessmentLive ? "default" : "secondary"}>
                  {isAssessmentLive ? "Live" : "Inactive"}
                </Badge>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminCPDFinalAssessmentEditor;
