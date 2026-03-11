import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft, Plus, Trash2, CheckCircle2, X, Save, Settings2,
  BookOpen, PenLine, Shuffle, Clock, Shield, Hash, RotateCcw
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  qualificationBanks, sampleBankQuestions, defaultQuizConfig,
  type BankQuestion, type QuizConfig, type WrittenAssignmentConfig,
} from "@/data/questionBankData";

const AdminQuestionBankEditor = () => {
  const { qualificationId, unitCode } = useParams();
  const { toast } = useToast();

  const qual = qualificationBanks.find((q) => q.id === qualificationId);
  const unitInfo = qual?.units.find((u) => u.code === unitCode);

  const [questions, setQuestions] = useState<BankQuestion[]>(
    unitCode === "VTCT301" ? [...sampleBankQuestions] : []
  );
  const [config, setConfig] = useState<QuizConfig>({ ...defaultQuizConfig });
  const [writtenAssignments, setWrittenAssignments] = useState<WrittenAssignmentConfig[]>(
    unitCode === "VTCT301"
      ? [
          { id: "wa1", title: "Reflective Account — Duty of Care", description: "Write a reflective account describing a situation where you had to balance duty of care with individual rights.", wordLimit: 1500, status: "published" },
          { id: "wa2", title: "Case Study Analysis", description: "Analyse the provided case study and discuss how duty of care principles were applied.", wordLimit: 2000, status: "published" },
        ]
      : []
  );

  const [showAddQ, setShowAddQ] = useState(false);
  const [newQ, setNewQ] = useState("");
  const [newQType, setNewQType] = useState<"single" | "multiple">("single");
  const [newQOptions, setNewQOptions] = useState(["", ""]);
  const [newQCorrect, setNewQCorrect] = useState<number[]>([]);

  const [showAddWA, setShowAddWA] = useState(false);
  const [waTitle, setWaTitle] = useState("");
  const [waDesc, setWaDesc] = useState("");
  const [waWordLimit, setWaWordLimit] = useState(1500);

  if (!qual || !unitInfo) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Unit not found.</p>
        <Link to="/admin/question-bank" className="text-primary underline mt-2 inline-block">Back to Question Bank</Link>
      </div>
    );
  }

  const addQuestion = () => {
    if (!newQ.trim()) { toast({ title: "Enter a question", variant: "destructive" }); return; }
    if (newQOptions.some((o) => !o.trim())) { toast({ title: "Complete all options", variant: "destructive" }); return; }
    if (newQCorrect.length === 0) { toast({ title: "Mark at least one correct answer", variant: "destructive" }); return; }
    setQuestions((prev) => [
      ...prev,
      { id: `bq${Date.now()}`, question: newQ, type: newQType, options: [...newQOptions], correctAnswers: [...newQCorrect] },
    ]);
    resetNewQ();
    toast({ title: "Question added to pool" });
  };

  const resetNewQ = () => {
    setNewQ(""); setNewQType("single"); setNewQOptions(["", ""]); setNewQCorrect([]); setShowAddQ(false);
  };

  const deleteQuestion = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
    toast({ title: "Question removed" });
  };

  const toggleCorrect = (oIdx: number) => {
    if (newQType === "single") {
      setNewQCorrect([oIdx]);
    } else {
      setNewQCorrect((prev) => prev.includes(oIdx) ? prev.filter((i) => i !== oIdx) : [...prev, oIdx]);
    }
  };

  const addWrittenAssignment = () => {
    if (!waTitle.trim() || !waDesc.trim()) { toast({ title: "Fill in all fields", variant: "destructive" }); return; }
    setWrittenAssignments((prev) => [
      ...prev,
      { id: `wa${Date.now()}`, title: waTitle, description: waDesc, wordLimit: waWordLimit, status: "draft" },
    ]);
    setWaTitle(""); setWaDesc(""); setWaWordLimit(1500); setShowAddWA(false);
    toast({ title: "Written assignment added" });
  };

  const deleteWA = (id: string) => {
    setWrittenAssignments((prev) => prev.filter((a) => a.id !== id));
    toast({ title: "Written assignment removed" });
  };

  const publishAll = () => {
    if (questions.length < config.questionsPerQuiz) {
      toast({ title: "Not enough questions", description: `Need at least ${config.questionsPerQuiz}. Currently: ${questions.length}.`, variant: "destructive" });
      return;
    }
    toast({ title: "Question bank published!", description: "Learners will now receive randomised quizzes from this pool." });
  };

  return (
    <div>
      <Link to="/admin/question-bank" className="inline-flex items-center gap-1.5 text-primary hover:underline text-sm mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Question Bank
      </Link>

      <Card className="bg-primary text-primary-foreground p-6 mb-6">
        <p className="text-primary-foreground/70 text-sm mb-1">{qual.title}</p>
        <h1 className="text-2xl font-bold">{unitInfo.code}: {unitInfo.name}</h1>
        <div className="flex gap-4 mt-3 text-sm text-primary-foreground/80">
          <span className="flex items-center gap-1"><Hash className="w-3.5 h-3.5" /> {questions.length} questions in pool</span>
          <span className="flex items-center gap-1"><Shuffle className="w-3.5 h-3.5" /> {config.questionsPerQuiz} per quiz</span>
          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {config.timeLimit > 0 ? `${config.timeLimit} min` : "No limit"}</span>
          <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Pass: {config.passScore}%</span>
        </div>
      </Card>

      <Tabs defaultValue="questions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="questions">Question Pool ({questions.length})</TabsTrigger>
          <TabsTrigger value="config">Quiz Settings</TabsTrigger>
          <TabsTrigger value="written">Written Assignments ({writtenAssignments.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="questions" className="space-y-4">
          <Card className={`p-4 ${questions.length >= config.questionsPerQuiz ? "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800" : "bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800"}`}>
            <div className="flex items-center gap-3">
              {questions.length >= config.questionsPerQuiz ? (
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              ) : (
                <Shield className="w-5 h-5 text-amber-600" />
              )}
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {questions.length >= config.questionsPerQuiz
                    ? `Pool ready — ${questions.length} questions available, ${config.questionsPerQuiz} per learner`
                    : `Need at least ${config.questionsPerQuiz} questions (currently ${questions.length})`}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">Each learner receives a unique randomised selection.</p>
              </div>
            </div>
          </Card>

          {questions.map((q, idx) => (
            <Card key={q.id} className="p-4">
              <div className="flex items-start gap-3">
                <span className="text-xs font-bold text-muted-foreground bg-muted w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">{idx + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-foreground">{q.question}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs capitalize">{q.type === "single" ? "Single answer" : "Multiple answers"}</Badge>
                    <span className="text-xs text-muted-foreground">{q.options.length} options</span>
                  </div>
                  <div className="mt-2 space-y-1">
                    {q.options.map((opt, oi) => (
                      <div key={oi} className={`text-xs px-2 py-1 rounded ${q.correctAnswers.includes(oi) ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : "text-muted-foreground"}`}>
                        {q.correctAnswers.includes(oi) ? "✓ " : "  "}{opt}
                      </div>
                    ))}
                  </div>
                </div>
                <Button size="icon" variant="ghost" className="text-destructive h-8 w-8 flex-shrink-0" onClick={() => deleteQuestion(q.id)}>
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
                  <Button onClick={addQuestion}><Plus className="w-4 h-4 mr-1" /> Add to Pool</Button>
                </div>
              </div>
            </Card>
          ) : (
            <Button variant="outline" onClick={() => setShowAddQ(true)} className="w-full border-dashed border-2 h-12">
              <Plus className="w-4 h-4 mr-2" /> Add Question to Pool
            </Button>
          )}

          <div className="flex justify-end pt-2">
            <Button onClick={publishAll} className="gap-2" disabled={questions.length < config.questionsPerQuiz}>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="flex items-center gap-2"><Hash className="w-4 h-4 text-muted-foreground" /> Questions per Quiz</Label>
                <Input type="number" min={5} max={questions.length || 100} value={config.questionsPerQuiz} onChange={(e) => setConfig((c) => ({ ...c, questionsPerQuiz: Number(e.target.value) }))} className="mt-1" />
                <p className="text-xs text-muted-foreground mt-1">Each learner gets this many random questions from the pool of {questions.length}</p>
              </div>
              <div>
                <Label className="flex items-center gap-2"><Clock className="w-4 h-4 text-muted-foreground" /> Time Limit (minutes)</Label>
                <Input type="number" min={0} value={config.timeLimit} onChange={(e) => setConfig((c) => ({ ...c, timeLimit: Number(e.target.value) }))} className="mt-1" />
                <p className="text-xs text-muted-foreground mt-1">Set to 0 for no time limit</p>
              </div>
              <div>
                <Label className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-muted-foreground" /> Pass Score (%)</Label>
                <Input type="number" min={1} max={100} value={config.passScore} onChange={(e) => setConfig((c) => ({ ...c, passScore: Number(e.target.value) }))} className="mt-1" />
              </div>
              <div>
                <Label className="flex items-center gap-2"><RotateCcw className="w-4 h-4 text-muted-foreground" /> Maximum Attempts</Label>
                <Input type="number" min={0} value={config.maxAttempts} onChange={(e) => setConfig((c) => ({ ...c, maxAttempts: Number(e.target.value) }))} className="mt-1" />
                <p className="text-xs text-muted-foreground mt-1">Set to 0 for unlimited attempts</p>
              </div>
            </div>
            <div className="border-t border-border mt-6 pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="flex items-center gap-2"><Shuffle className="w-4 h-4 text-muted-foreground" /> Shuffle Questions</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">Randomise the order of questions for each attempt</p>
                </div>
                <Switch checked={config.shuffleQuestions} onCheckedChange={(v) => setConfig((c) => ({ ...c, shuffleQuestions: v }))} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="flex items-center gap-2"><Shuffle className="w-4 h-4 text-muted-foreground" /> Shuffle Options</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">Randomise the order of answer options</p>
                </div>
                <Switch checked={config.shuffleOptions} onCheckedChange={(v) => setConfig((c) => ({ ...c, shuffleOptions: v }))} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="flex items-center gap-2"><Shield className="w-4 h-4 text-muted-foreground" /> Strict Mode (Anti-Cheat)</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">Fullscreen, tab-switch detection, copy/paste blocking</p>
                </div>
                <Switch checked={config.strictMode} onCheckedChange={(v) => setConfig((c) => ({ ...c, strictMode: v }))} />
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <Button onClick={() => toast({ title: "Settings saved" })}><Save className="w-4 h-4 mr-1" /> Save Settings</Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="written" className="space-y-4">
          {writtenAssignments.map((wa) => (
            <Card key={wa.id} className="p-5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <PenLine className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-semibold text-foreground">{wa.title}</p>
                    <Badge className={wa.status === "published" ? "bg-green-600 text-white" : "bg-muted text-muted-foreground"}>{wa.status}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1">{wa.description}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Word limit: {wa.wordLimit}</p>
                </div>
                <Button size="icon" variant="ghost" className="text-destructive h-8 w-8" onClick={() => deleteWA(wa.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}

          {showAddWA ? (
            <Card className="p-6 border-2 border-primary/30">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-foreground">Add Written Assignment</h3>
                <Button variant="ghost" size="icon" onClick={() => setShowAddWA(false)}><X className="w-5 h-5" /></Button>
              </div>
              <div className="space-y-4">
                <div>
                  <Label>Title *</Label>
                  <Input value={waTitle} onChange={(e) => setWaTitle(e.target.value)} placeholder="e.g. Reflective Account" className="mt-1" />
                </div>
                <div>
                  <Label>Description / Instructions *</Label>
                  <textarea value={waDesc} onChange={(e) => setWaDesc(e.target.value)} placeholder="Describe the task and requirements..." className="w-full mt-1 border border-input rounded-md p-3 text-sm min-h-[120px] bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
                </div>
                <div className="w-40">
                  <Label>Word Limit</Label>
                  <Input type="number" min={50} value={waWordLimit} onChange={(e) => setWaWordLimit(Number(e.target.value))} className="mt-1" />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setShowAddWA(false)}>Cancel</Button>
                  <Button onClick={addWrittenAssignment}><Plus className="w-4 h-4 mr-1" /> Add Assignment</Button>
                </div>
              </div>
            </Card>
          ) : (
            <Button variant="outline" onClick={() => setShowAddWA(true)} className="w-full border-dashed border-2 h-12">
              <Plus className="w-4 h-4 mr-2" /> Add Written Assignment
            </Button>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminQuestionBankEditor;
