import { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import {
  ArrowLeft, Plus, Trash2, CheckCircle2, X, Save, Settings2,
  BookOpen, PenLine, Shuffle, Clock, Shield, Hash, RotateCcw, Loader2, AlertCircle,
  Activity
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  useGetQuestionBankQualificationGuardQuery,
  useGetQuestionsQuery,
  useGetQuizConfigQuery,
  useCreateQuestionMutation,
  useDeleteQuestionMutation,
  useUpdateQuizConfigMutation,
  useGetWrittenAssignmentConfigQuery,
  useGetQuestionBankUnitsQuery,
} from "@/redux/apis/quiz/quizApi";

const AdminQuestionBankEditor = () => {
  const { qualificationId, unitCode } = useParams();
  const location = useLocation();
  const basePath = location.pathname.startsWith("/trainer") ? "/trainer" : "/admin";
  const { toast } = useToast();

  const { data: qualGuard, isLoading: isLoadingGuard } = useGetQuestionBankQualificationGuardQuery(qualificationId!);
  const { data: units, isLoading: isLoadingUnits } = useGetQuestionBankUnitsQuery(qualificationId!, { skip: !qualificationId });

  const unitId = units?.find(u =>
    u.unit_code.trim().toLowerCase() === unitCode?.trim().toLowerCase()
  )?.id;

  const { data: questions = [], isLoading: isLoadingQuestions } = useGetQuestionsQuery(unitId!, { skip: !unitId });
  const { data: config, isLoading: isLoadingConfig } = useGetQuizConfigQuery(unitId!, { skip: !unitId });
  const { data: writtenAssignment } = useGetWrittenAssignmentConfigQuery(unitId!, { skip: !unitId });

  const [createQuestion] = useCreateQuestionMutation();
  const [deleteQuestionMutation] = useDeleteQuestionMutation();
  const [updateQuizConfig] = useUpdateQuizConfigMutation();

  // Local state for the "Add Question" form
  const [showAddQ, setShowAddQ] = useState(false);
  const [newQ, setNewQ] = useState("");
  const [newQType, setNewQType] = useState<"single" | "multiple">("single");
  const [newQOptions, setNewQOptions] = useState(["", ""]);
  const [newQCorrect, setNewQCorrect] = useState<number[]>([]);

  // Local state for Quiz Config editing
  const [localConfig, setLocalConfig] = useState<any>(null);

  useEffect(() => {
    if (config) {
      setLocalConfig({ ...config });
    }
  }, [config]);

  const resetNewQ = () => {
    setNewQ(""); setNewQType("single"); setNewQOptions(["", ""]); setNewQCorrect([]); setShowAddQ(false);
  };

  const handleAddQuestion = async () => {
    if (!newQ.trim()) { toast({ title: "Enter a question", variant: "destructive" }); return; }
    if (newQOptions.some((o) => !o.trim())) { toast({ title: "Complete all options", variant: "destructive" }); return; }
    if (newQCorrect.length === 0) { toast({ title: "Mark at least one correct answer", variant: "destructive" }); return; }

    try {
      await createQuestion({
        unitId: unitId!,
        data: {
          question_text: newQ,
          question_type: newQType,
          options: [...newQOptions],
          correct_answers: [...newQCorrect],
          is_active: true
        }
      }).unwrap();
      resetNewQ();
      toast({ title: "Question added to pool" });
    } catch (err: any) {
      toast({ title: "Failed to add question", description: err?.data?.message || "Something went wrong", variant: "destructive" });
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    try {
      await deleteQuestionMutation(id).unwrap();
      toast({ title: "Question removed" });
    } catch (err: any) {
      toast({ title: "Failed to remove question", variant: "destructive" });
    }
  };

  const handleSaveConfig = async () => {
    if (!localConfig) return;
    try {
      await updateQuizConfig({
        unitId: unitId!,
        data: localConfig
      }).unwrap();
      toast({ title: "Settings saved" });
    } catch (err: any) {
      toast({ title: "Failed to save settings", variant: "destructive" });
    }
  };

  const toggleCorrect = (oIdx: number) => {
    if (newQType === "single") {
      setNewQCorrect([oIdx]);
    } else {
      setNewQCorrect((prev) => prev.includes(oIdx) ? prev.filter((i) => i !== oIdx) : [...prev, oIdx]);
    }
  };

  const currentUnit = units?.find(u =>
    u.unit_code.trim().toLowerCase() === unitCode?.trim().toLowerCase()
  );

  if (isLoadingGuard || isLoadingUnits || (unitId && (isLoadingConfig || isLoadingQuestions))) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-4 text-muted-foreground">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p>Loading question bank editor...</p>
      </div>
    );
  }

  if (!qualGuard || !unitId) {
    return (
      <div className="text-center py-20 text-muted-foreground flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
          <Hash className="w-8 h-8 opacity-20" />
        </div>
        <div>
          <p className="font-bold text-foreground">Qualification or Unit not found.</p>
          <p className="text-xs mt-1">We couldn't locate unit "{unitCode}" in this qualification.</p>
        </div>
        <Link to={`${basePath}/question-bank`} className="text-primary font-bold text-xs ring-offset-background hover:underline mt-2">
          Back to Question Bank
        </Link>
      </div>
    );
  }

  const qual = qualGuard;

  if (qual.is_cpd) {
    return (
      <div className="max-w-md mx-auto py-24 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
          <Shield className="w-8 h-8 text-primary" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-foreground">CPD Qualification</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Unit-level assessments (quizzes and written assignments) are disabled for CPD qualifications.
            Only a single final assessment is required at the qualification level.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link to={`${basePath}/question-bank`} className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Question Bank
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 text-foreground">
      <Link to={`${basePath}/question-bank`} className="inline-flex items-center gap-1.5 text-primary hover:underline text-sm mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Question Bank
      </Link>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Question Bank Editor</h1>
            <p className="text-sm text-muted-foreground">{qual.title} — {unitCode}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-primary/5 uppercase tracking-wider text-[10px] font-bold px-2 py-0.5 border-primary/20">{qual.qualification_code}</Badge>
          <Badge variant="secondary" className="uppercase tracking-wider text-[10px] font-bold px-2 py-0.5">Unit {unitCode}</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="questions" className="space-y-4">
            <TabsList>
              <TabsTrigger value="questions" className="gap-2">
                <Hash className="w-4 h-4" /> Question Pool ({questions.length})
              </TabsTrigger>
              <TabsTrigger value="config" className="gap-2">
                <Settings2 className="w-4 h-4" /> Quiz Settings
              </TabsTrigger>
              <TabsTrigger value="written" className="gap-2">
                <PenLine className="w-4 h-4" /> Written Assignments
              </TabsTrigger>
            </TabsList>

            <TabsContent value="questions" className="space-y-4">
              {config && questions.length < config.questions_per_quiz && (
                <Alert className="bg-amber-500/5 text-amber-700 border-amber-500/20">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle className="font-bold">Pool Shortfall</AlertTitle>
                  <AlertDescription className="text-xs">
                    This unit requires {config.questions_per_quiz} questions per quiz, but your pool only has {questions.length}.
                    Please add at least {config.questions_per_quiz - questions.length} more questions.
                  </AlertDescription>
                </Alert>
              )}

              {questions.map((q, idx) => (
                <Card key={q.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-xs font-bold text-muted-foreground bg-muted w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">{idx + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-foreground">{q.question_text}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs capitalize">{q.question_type === "single" ? "Single answer" : "Multiple answers"}</Badge>
                        <span className="text-xs text-muted-foreground">{q.options.length} options</span>
                        {!q.is_active && <Badge variant="destructive" className="text-[10px] h-4">Inactive</Badge>}
                      </div>
                      <div className="mt-2 space-y-1">
                        {q.options.map((opt, oi) => (
                          <div key={oi} className={`text-xs px-2 py-1 rounded ${q.correct_answers.includes(oi) ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : "text-muted-foreground"}`}>
                            {q.correct_answers.includes(oi) ? "✓ " : "  "}{opt}
                          </div>
                        ))}
                      </div>
                    </div>
                    <Button size="icon" variant="ghost" className="text-destructive h-8 w-8 flex-shrink-0" onClick={() => handleDeleteQuestion(q.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))}

              {showAddQ ? (
                <Card className="p-6 border-2 border-primary/30">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-foreground">Add Question to Pool</h3>
                    <Button variant="ghost" size="icon" onClick={resetNewQ}><X className="w-5 h-5" /></Button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label>Question *</Label>
                      <Input value={newQ} onChange={(e) => setNewQ(e.target.value)} placeholder="Enter your question..." className="mt-1" />
                    </div>
                    <div className="w-48">
                      <Label>Answer Type</Label>
                      <select value={newQType} onChange={(e) => { setNewQType(e.target.value as "single" | "multiple"); setNewQCorrect([]); }} className="w-full mt-1 border border-input rounded-md px-3 py-2 text-sm bg-background">
                        <option value="single">Single Answer</option>
                        <option value="multiple">Multiple Answers</option>
                      </select>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground mb-2 block">Options — click the circle to mark correct answer(s)</Label>
                      <div className="space-y-2">
                        {newQOptions.map((opt, oi) => (
                          <div key={oi} className="flex items-center gap-2">
                            <button onClick={() => toggleCorrect(oi)} className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${newQCorrect.includes(oi) ? "border-green-600 bg-green-600 text-white" : "border-muted-foreground/40 hover:border-primary"}`}>
                              {newQCorrect.includes(oi) && <CheckCircle2 className="w-4 h-4" />}
                            </button>
                            <Input value={opt} onChange={(e) => setNewQOptions((prev) => prev.map((o, j) => (j === oi ? e.target.value : o)))} placeholder={`Option ${oi + 1}`} className="flex-1" />
                            {newQOptions.length > 2 && (
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => { setNewQOptions((prev) => prev.filter((_, j) => j !== oi)); setNewQCorrect((prev) => prev.filter((a) => a !== oi).map((a) => (a > oi ? a - 1 : a))); }}>
                                <X className="w-3.5 h-3.5" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                      {newQOptions.length < 6 && (
                        <Button variant="ghost" size="sm" className="mt-2 text-primary" onClick={() => setNewQOptions((prev) => [...prev, ""])}>
                          <Plus className="w-3.5 h-3.5 mr-1" /> Add Option
                        </Button>
                      )}
                    </div>
                    <div className="flex gap-2 justify-end pt-2">
                      <Button variant="outline" onClick={resetNewQ}>Cancel</Button>
                      <Button onClick={handleAddQuestion}><Plus className="w-4 h-4 mr-1" /> Add to Pool</Button>
                    </div>
                  </div>
                </Card>
              ) : (
                <Button variant="outline" onClick={() => setShowAddQ(true)} className="w-full border-dashed border-2 h-12">
                  <Plus className="w-4 h-4 mr-2" /> Add Question to Pool
                </Button>
              )}

              <div className="flex justify-end pt-2">
                <Button onClick={() => toast({ title: "Question bank published!" })} className="gap-2" disabled={questions.length < (config?.questions_per_quiz || 1)}>
                  <CheckCircle2 className="w-4 h-4" /> Publish Question Bank
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="config">
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Settings2 className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-bold text-foreground">Quiz Configuration</h2>
                </div>

                {isLoadingConfig ? (
                  <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>
                ) : localConfig ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label className="font-bold flex items-center gap-2"><Hash className="w-4 h-4 text-muted-foreground" /> Questions per Quiz</Label>
                        <Input type="number" min={1} max={questions.length || 100} value={localConfig.questions_per_quiz} onChange={(e) => setLocalConfig({ ...localConfig, questions_per_quiz: Number(e.target.value) })} className="mt-1" />
                        <p className="text-xs text-muted-foreground mt-1">Each learner gets this many random questions from the pool of {questions.length}</p>
                      </div>
                      <div>
                        <Label className="font-bold flex items-center gap-2"><Clock className="w-4 h-4 text-muted-foreground" /> Time Limit (minutes)</Label>
                        <Input type="number" min={0} value={localConfig.time_limit_minutes} onChange={(e) => setLocalConfig({ ...localConfig, time_limit_minutes: Number(e.target.value) })} className="mt-1" />
                        <p className="text-xs text-muted-foreground mt-1">Set to 0 for no time limit</p>
                      </div>
                      <div>
                        <Label className="font-bold flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-muted-foreground" /> Pass Score (%)</Label>
                        <Input type="number" min={1} max={100} value={localConfig.pass_score} onChange={(e) => setLocalConfig({ ...localConfig, pass_score: Number(e.target.value) })} className="mt-1" />
                      </div>
                      <div>
                        <Label className="font-bold flex items-center gap-2"><RotateCcw className="w-4 h-4 text-muted-foreground" /> Maximum Attempts</Label>
                        <Input type="number" min={0} value={localConfig.max_attempts} onChange={(e) => setLocalConfig({ ...localConfig, max_attempts: Number(e.target.value) })} className="mt-1" />
                        <p className="text-xs text-muted-foreground mt-1">Set to 0 for unlimited attempts</p>
                      </div>
                    </div>
                    <div className="border-t border-border mt-6 pt-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-bold flex items-center gap-2"><Shuffle className="w-4 h-4 text-muted-foreground" /> Shuffle Questions</Label>
                          <p className="text-xs text-muted-foreground mt-0.5">Randomise the order of questions for each attempt</p>
                        </div>
                        <Switch checked={localConfig.shuffle_questions} onCheckedChange={(v) => setLocalConfig({ ...localConfig, shuffle_questions: v })} />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-bold flex items-center gap-2"><Shuffle className="w-4 h-4 text-muted-foreground" /> Shuffle Options</Label>
                          <p className="text-xs text-muted-foreground mt-0.5">Randomise the order of answer options</p>
                        </div>
                        <Switch checked={localConfig.shuffle_options} onCheckedChange={(v) => setLocalConfig({ ...localConfig, shuffle_options: v })} />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-bold flex items-center gap-2"><Shield className="w-4 h-4 text-muted-foreground" /> Strict Mode (Anti-Cheat)</Label>
                          <p className="text-xs text-muted-foreground mt-0.5">Fullscreen, tab-switch detection, copy/paste blocking</p>
                        </div>
                        <Switch checked={localConfig.strict_mode} onCheckedChange={(v) => setLocalConfig({ ...localConfig, strict_mode: v })} />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-bold flex items-center gap-2">
                            <Shield className="w-4 h-4 text-primary" /> Assessment Visibility
                          </Label>
                          <p className="text-[11px] text-muted-foreground">Keep this enabled to make the final assessment available to learners.</p>
                        </div>
                        <Switch checked={localConfig.is_active} onCheckedChange={(value) => setLocalConfig({ ...localConfig, is_active: value })} />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-bold flex items-center gap-2">
                            <Shield className="w-4 h-4 text-primary" /> Show results immediately
                          </Label>
                          <p className="text-[11px] text-muted-foreground">Show results immediately after the assessment.</p>
                        </div>
                        <Switch checked={localConfig.show_results} onCheckedChange={(value) => setLocalConfig({ ...localConfig, show_results: value })} />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-bold flex items-center gap-2">
                            <Shield className="w-4 h-4 text-primary" /> Show correct answers after
                          </Label>
                          <p className="text-[11px] text-muted-foreground">Show correct answers after the assessment.</p>
                        </div>
                        <Switch checked={localConfig.show_correct_answers} onCheckedChange={(value) => setLocalConfig({ ...localConfig, show_correct_answers: value })} />
                      </div>
                      <div className="flex flex-col items-start justify-between gap-2">
                        <div>
                          <Label className="font-bold flex items-center gap-2">
                            <Activity className="w-4 h-4 text-primary" />
                            Status
                          </Label>
                        </div>
                        <Select value={localConfig.status} onValueChange={(value) => setLocalConfig({ ...localConfig, status: value })}>
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
                    <div className="flex justify-end mt-6">
                      <Button onClick={handleSaveConfig}><Save className="w-4 h-4 mr-1" /> Save Settings</Button>
                    </div>
                  </>
                ) : (
                  <div className="py-20 text-center">
                    <p className="text-muted-foreground">Unable to load quiz configuration. Please try again.</p>
                  </div>
                )}
              </Card>
            </TabsContent>

            <TabsContent value="written" className="space-y-4">
              {writtenAssignment ? (
                <Card className="p-5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <PenLine className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="font-semibold text-foreground">{writtenAssignment.title}</p>
                        <Badge className={writtenAssignment.is_active ? "bg-green-600 text-white" : "bg-muted text-muted-foreground"}>
                          {writtenAssignment.is_active ? "Published" : "Draft"}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{writtenAssignment.instructions}</p>
                      <p className="text-xs text-muted-foreground mt-1">Word limit: {writtenAssignment.min_words} — {writtenAssignment.max_words}</p>
                    </div>
                    <Button size="icon" variant="ghost" className="text-primary h-8 w-8 hover:bg-primary/10">
                      <Settings2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ) : (
                <div className="py-20 text-center border-2 border-dashed rounded-xl border-muted/20">
                  <p className="text-muted-foreground text-sm">No written assignment configured for this unit.</p>
                  <Button variant="outline" className="mt-4 gap-2">
                    <Plus className="w-4 h-4" /> Configure Written Assignment
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card className="p-6 bg-primary text-primary-foreground shadow-xl relative overflow-hidden">
            <div className="relative z-10 space-y-4">
              <h3 className="font-bold text-lg">Question Bank Pool</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px] shrink-0 mt-0.5">1</div>
                  <p className="text-xs text-primary-foreground/90 leading-relaxed italic">Pool size must be enough to support random selection per quiz.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px] shrink-0 mt-0.5">2</div>
                  <p className="text-xs text-primary-foreground/90 leading-relaxed italic">Changes to published pool questions affect future learners immediately.</p>
                </div>
              </div>
            </div>
            <Shield className="absolute -bottom-6 -right-6 w-32 h-32 text-white/10 rotate-12" />
          </Card>

          <Card className="p-6">
            <h3 className="font-bold mb-4">Quick Stats</h3>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Questions</span>
                <span className="font-mono font-bold">{questions.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Questions per Assessment</span>
                <span className="font-mono font-bold text-primary">{config?.questions_per_quiz ?? 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge className={questions.length >= (config?.questions_per_quiz ?? 1) ? "bg-green-600" : "bg-amber-600"}>
                  {questions.length >= (config?.questions_per_quiz ?? 1) ? "Ready" : "Underpopulated"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Visibility</span>
                <Badge variant={config?.is_active ? "default" : "secondary"}>
                  {config?.is_active ? "Live" : "Inactive"}
                </Badge>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminQuestionBankEditor;
