import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft, Plus, ClipboardList, PenLine, Trash2, GripVertical,
  CheckCircle2, X, Save
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { trainerLearners } from "@/data/trainerMockData";

/* ── Types ── */
interface QuizQuestion {
  id: string;
  question: string;
  type: "single" | "multiple";
  options: string[];
  correctAnswers: number[];
}

interface Assignment {
  id: string;
  title: string;
  type: "quiz" | "written";
  description: string;
  status: "draft" | "published";
  questions?: QuizQuestion[];
  wordLimit?: number;
  passScore?: number;
}

/* ── Main Component ── */
const UnitManagement = () => {
  const { learnerId, unitCode } = useParams();
  const { toast } = useToast();

  const learner = trainerLearners.find((l) => l.id === learnerId);
  const unit = learner?.units.find((u) => u.code === unitCode);

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [showCreateForm, setShowCreateForm] = useState<"quiz" | "written" | null>(null);

  /* Quiz builder state */
  const [quizTitle, setQuizTitle] = useState("");
  const [quizDescription, setQuizDescription] = useState("");
  const [quizPassScore, setQuizPassScore] = useState(80);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);

  /* Written assignment state */
  const [writtenTitle, setWrittenTitle] = useState("");
  const [writtenDescription, setWrittenDescription] = useState("");
  const [writtenWordLimit, setWrittenWordLimit] = useState(1500);

  if (!learner || !unit) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Unit not found.</p>
        <Link to="/trainer/learners" className="text-primary underline mt-2 inline-block">Back to Learners</Link>
      </div>
    );
  }

  /* ── Quiz Helpers ── */
  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      { id: `q${Date.now()}`, question: "", type: "single", options: ["", ""], correctAnswers: [] },
    ]);
  };

  const updateQuestion = (idx: number, field: keyof QuizQuestion, value: any) => {
    setQuestions((prev) => prev.map((q, i) => (i === idx ? { ...q, [field]: value } : q)));
  };

  const addOption = (qIdx: number) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === qIdx ? { ...q, options: [...q.options, ""] } : q))
    );
  };

  const updateOption = (qIdx: number, oIdx: number, value: string) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIdx ? { ...q, options: q.options.map((o, j) => (j === oIdx ? value : o)) } : q
      )
    );
  };

  const removeOption = (qIdx: number, oIdx: number) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIdx
          ? {
              ...q,
              options: q.options.filter((_, j) => j !== oIdx),
              correctAnswers: q.correctAnswers.filter((a) => a !== oIdx).map((a) => (a > oIdx ? a - 1 : a)),
            }
          : q
      )
    );
  };

  const removeQuestion = (idx: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== idx));
  };

  const toggleCorrectAnswer = (qIdx: number, oIdx: number) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIdx) return q;
        if (q.type === "single") {
          return { ...q, correctAnswers: [oIdx] };
        }
        const has = q.correctAnswers.includes(oIdx);
        return { ...q, correctAnswers: has ? q.correctAnswers.filter((a) => a !== oIdx) : [...q.correctAnswers, oIdx] };
      })
    );
  };

  /* ── Save Handlers ── */
  const saveQuiz = (asDraft: boolean) => {
    if (!quizTitle.trim()) {
      toast({ title: "Please enter a quiz title", variant: "destructive" });
      return;
    }
    if (questions.length === 0) {
      toast({ title: "Please add at least one question", variant: "destructive" });
      return;
    }
    const hasEmpty = questions.some((q) => !q.question.trim() || q.options.some((o) => !o.trim()) || q.correctAnswers.length === 0);
    if (hasEmpty) {
      toast({ title: "Please complete all questions, options, and mark correct answers", variant: "destructive" });
      return;
    }

    const newAssignment: Assignment = {
      id: `a${Date.now()}`,
      title: quizTitle,
      type: "quiz",
      description: quizDescription,
      status: asDraft ? "draft" : "published",
      questions,
      passScore: quizPassScore,
    };
    setAssignments((prev) => [...prev, newAssignment]);
    resetQuizForm();
    setShowCreateForm(null);
    toast({ title: asDraft ? "Quiz saved as draft" : "Quiz published successfully" });
  };

  const saveWritten = (asDraft: boolean) => {
    if (!writtenTitle.trim()) {
      toast({ title: "Please enter an assignment title", variant: "destructive" });
      return;
    }
    if (!writtenDescription.trim()) {
      toast({ title: "Please enter a description", variant: "destructive" });
      return;
    }
    const newAssignment: Assignment = {
      id: `a${Date.now()}`,
      title: writtenTitle,
      type: "written",
      description: writtenDescription,
      status: asDraft ? "draft" : "published",
      wordLimit: writtenWordLimit,
    };
    setAssignments((prev) => [...prev, newAssignment]);
    resetWrittenForm();
    setShowCreateForm(null);
    toast({ title: asDraft ? "Assignment saved as draft" : "Assignment published successfully" });
  };

  const resetQuizForm = () => {
    setQuizTitle("");
    setQuizDescription("");
    setQuizPassScore(80);
    setQuestions([]);
  };

  const resetWrittenForm = () => {
    setWrittenTitle("");
    setWrittenDescription("");
    setWrittenWordLimit(1500);
  };

  const deleteAssignment = (id: string) => {
    setAssignments((prev) => prev.filter((a) => a.id !== id));
    toast({ title: "Assignment deleted" });
  };

  const publishAssignment = (id: string) => {
    setAssignments((prev) => prev.map((a) => (a.id === id ? { ...a, status: "published" as const } : a)));
    toast({ title: "Assignment published" });
  };

  return (
    <div>
      <Link
        to={`/trainer/learner/${learnerId}`}
        className="inline-flex items-center gap-1.5 text-primary hover:underline text-sm mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Learner Details
      </Link>

      {/* Unit Header */}
      <Card className="bg-primary text-primary-foreground p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-primary-foreground/70 text-sm mb-1">{learner.name} • {learner.learnerId}</p>
            <h1 className="text-2xl font-bold">{unit.code}: {unit.name}</h1>
            <p className="text-primary-foreground/80 text-sm mt-1">{learner.qualification}</p>
          </div>
          <Badge className={`text-xs font-bold ${
            unit.status === "Competent" ? "bg-green-600 text-white" :
            unit.status === "Pending Assessment" ? "bg-secondary text-secondary-foreground" :
            unit.status === "Resubmission Required" ? "bg-destructive text-destructive-foreground" :
            "bg-muted text-muted-foreground"
          }`}>
            {unit.status}
          </Badge>
        </div>
      </Card>

      {/* Content */}
      <Tabs defaultValue="assignments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="assignments">Assignments ({assignments.length})</TabsTrigger>
          <TabsTrigger value="create">Create New</TabsTrigger>
        </TabsList>

        {/* ── Existing Assignments ── */}
        <TabsContent value="assignments">
          {assignments.length === 0 ? (
            <Card className="p-12 text-center">
              <ClipboardList className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-bold text-foreground mb-1">No Assignments Yet</h3>
              <p className="text-sm text-muted-foreground mb-4">Create quizzes or written assignments for this unit</p>
              <Button onClick={() => setShowCreateForm("quiz")} className="mr-2">
                <Plus className="w-4 h-4 mr-1" /> Create Quiz
              </Button>
              <Button variant="outline" onClick={() => setShowCreateForm("written")}>
                <Plus className="w-4 h-4 mr-1" /> Create Written
              </Button>
            </Card>
          ) : (
            <div className="space-y-3">
              {assignments.map((a) => {
                const Icon = a.type === "quiz" ? ClipboardList : PenLine;
                return (
                  <Card key={a.id} className="p-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="font-semibold text-foreground">{a.title}</p>
                          <Badge className={a.status === "published" ? "bg-green-600 text-white" : "bg-muted text-muted-foreground"}>
                            {a.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground capitalize">
                          {a.type === "quiz"
                            ? `Quiz • ${a.questions?.length || 0} questions • Pass: ${a.passScore}%`
                            : `Written • Word limit: ${a.wordLimit}`}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        {a.status === "draft" && (
                          <Button size="sm" variant="outline" onClick={() => publishAssignment(a.id)}>
                            Publish
                          </Button>
                        )}
                        <Button size="icon" variant="ghost" className="text-destructive h-8 w-8" onClick={() => deleteAssignment(a.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
              <div className="flex gap-2 pt-2">
                <Button onClick={() => setShowCreateForm("quiz")} size="sm">
                  <Plus className="w-4 h-4 mr-1" /> Add Quiz
                </Button>
                <Button variant="outline" onClick={() => setShowCreateForm("written")} size="sm">
                  <Plus className="w-4 h-4 mr-1" /> Add Written
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        {/* ── Create New ── */}
        <TabsContent value="create">
          {!showCreateForm && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card
                className="p-8 text-center cursor-pointer hover:border-primary/50 transition-colors border-2 border-dashed"
                onClick={() => setShowCreateForm("quiz")}
              >
                <ClipboardList className="w-10 h-10 text-primary mx-auto mb-3" />
                <h3 className="font-bold text-foreground mb-1">Create Quiz</h3>
                <p className="text-sm text-muted-foreground">Multiple choice questions with single or multiple correct answers</p>
              </Card>
              <Card
                className="p-8 text-center cursor-pointer hover:border-primary/50 transition-colors border-2 border-dashed"
                onClick={() => setShowCreateForm("written")}
              >
                <PenLine className="w-10 h-10 text-primary mx-auto mb-3" />
                <h3 className="font-bold text-foreground mb-1">Create Written Assignment</h3>
                <p className="text-sm text-muted-foreground">Long-form written response with word limit</p>
              </Card>
            </div>
          )}

          {/* ── Quiz Builder ── */}
          {showCreateForm === "quiz" && (
            <div className="space-y-6">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-primary">Create Quiz Assignment</h2>
                  <Button variant="ghost" size="icon" onClick={() => { setShowCreateForm(null); resetQuizForm(); }}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Quiz Title *</Label>
                    <Input value={quizTitle} onChange={(e) => setQuizTitle(e.target.value)} placeholder="e.g. Knowledge Assessment Quiz" className="mt-1" />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <textarea
                      value={quizDescription}
                      onChange={(e) => setQuizDescription(e.target.value)}
                      placeholder="Instructions for the learner..."
                      className="w-full mt-1 border border-input rounded-md p-3 text-sm min-h-[80px] bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                    />
                  </div>
                  <div className="w-40">
                    <Label>Pass Score (%)</Label>
                    <Input type="number" min={1} max={100} value={quizPassScore} onChange={(e) => setQuizPassScore(Number(e.target.value))} className="mt-1" />
                  </div>
                </div>
              </Card>

              {/* Questions */}
              {questions.map((q, qi) => (
                <Card key={q.id} className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <GripVertical className="w-4 h-4 text-muted-foreground" />
                      <h3 className="font-semibold text-foreground">Question {qi + 1}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={q.type}
                        onChange={(e) => updateQuestion(qi, "type", e.target.value)}
                        className="text-xs border border-input rounded px-2 py-1 bg-background"
                      >
                        <option value="single">Single Answer</option>
                        <option value="multiple">Multiple Answers</option>
                      </select>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeQuestion(qi)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <Input
                    value={q.question}
                    onChange={(e) => updateQuestion(qi, "question", e.target.value)}
                    placeholder="Enter your question..."
                    className="mb-4 font-medium"
                  />

                  <Label className="text-xs text-muted-foreground mb-2 block">
                    Options — click the circle/checkbox to mark correct answer(s)
                  </Label>
                  <div className="space-y-2">
                    {q.options.map((opt, oi) => {
                      const isCorrect = q.correctAnswers.includes(oi);
                      return (
                        <div key={oi} className="flex items-center gap-2">
                          <button
                            onClick={() => toggleCorrectAnswer(qi, oi)}
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                              isCorrect ? "border-green-600 bg-green-600 text-white" : "border-muted-foreground/40 hover:border-primary"
                            }`}
                          >
                            {isCorrect && <CheckCircle2 className="w-4 h-4" />}
                          </button>
                          <Input
                            value={opt}
                            onChange={(e) => updateOption(qi, oi, e.target.value)}
                            placeholder={`Option ${oi + 1}`}
                            className="flex-1"
                          />
                          {q.options.length > 2 && (
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => removeOption(qi, oi)}>
                              <X className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  {q.options.length < 6 && (
                    <Button variant="ghost" size="sm" className="mt-2 text-primary" onClick={() => addOption(qi)}>
                      <Plus className="w-3.5 h-3.5 mr-1" /> Add Option
                    </Button>
                  )}
                </Card>
              ))}

              <Button variant="outline" onClick={addQuestion} className="w-full border-dashed border-2 h-12">
                <Plus className="w-4 h-4 mr-2" /> Add Question
              </Button>

              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={() => saveQuiz(true)}>
                  <Save className="w-4 h-4 mr-1" /> Save as Draft
                </Button>
                <Button onClick={() => saveQuiz(false)}>
                  Publish Quiz
                </Button>
              </div>
            </div>
          )}

          {/* ── Written Assignment Builder ── */}
          {showCreateForm === "written" && (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-primary">Create Written Assignment</h2>
                <Button variant="ghost" size="icon" onClick={() => { setShowCreateForm(null); resetWrittenForm(); }}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Assignment Title *</Label>
                  <Input value={writtenTitle} onChange={(e) => setWrittenTitle(e.target.value)} placeholder="e.g. Reflective Account" className="mt-1" />
                </div>
                <div>
                  <Label>Description / Instructions *</Label>
                  <textarea
                    value={writtenDescription}
                    onChange={(e) => setWrittenDescription(e.target.value)}
                    placeholder="Describe the task, what the learner should cover, and any specific requirements..."
                    className="w-full mt-1 border border-input rounded-md p-3 text-sm min-h-[150px] bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  />
                </div>
                <div className="w-40">
                  <Label>Word Limit</Label>
                  <Input type="number" min={50} value={writtenWordLimit} onChange={(e) => setWrittenWordLimit(Number(e.target.value))} className="mt-1" />
                </div>
              </div>

              <div className="flex gap-3 justify-end mt-6">
                <Button variant="outline" onClick={() => saveWritten(true)}>
                  <Save className="w-4 h-4 mr-1" /> Save as Draft
                </Button>
                <Button onClick={() => saveWritten(false)}>
                  Publish Assignment
                </Button>
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UnitManagement;
