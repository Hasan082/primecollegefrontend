import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, ClipboardCheck, Plus, Settings2, UserPlus, Search, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { adminQualifications } from "@/data/adminMockData";
import { adminLearners } from "@/data/adminMockData";

interface FinalAssessment {
  id: string;
  qualificationId: string;
  qualificationTitle: string;
  questionsPerQuiz: number;
  timeLimit: number;
  passScore: number;
  strictMode: boolean;
  totalQuestions: number;
  status: "configured" | "not_configured";
}

interface AssignedFinal {
  id: string;
  learnerName: string;
  learnerId: string;
  qualification: string;
  assignedDate: string;
  assignedBy: string;
  status: "Assigned" | "In Progress" | "Completed" | "Failed";
  score?: number;
}

const mockFinals: FinalAssessment[] = [
  { id: "fa1", qualificationId: "q1", qualificationTitle: "Level 3 Diploma in Business Administration", questionsPerQuiz: 40, timeLimit: 90, passScore: 70, strictMode: true, totalQuestions: 80, status: "configured" },
  { id: "fa2", qualificationId: "q2", qualificationTitle: "Level 4 Diploma in Adult Care", questionsPerQuiz: 50, timeLimit: 120, passScore: 75, strictMode: true, totalQuestions: 100, status: "configured" },
  { id: "fa3", qualificationId: "q3", qualificationTitle: "Level 4 Diploma in Management and Leadership", questionsPerQuiz: 0, timeLimit: 0, passScore: 0, strictMode: false, totalQuestions: 0, status: "not_configured" },
];

const mockAssigned: AssignedFinal[] = [
  { id: "af1", learnerName: "Sarah Wilson", learnerId: "LRN-2024-004", qualification: "Level 4 Diploma in Management and Leadership", assignedDate: "05/03/2026", assignedBy: "Admin User", status: "Assigned" },
  { id: "af2", learnerName: "Lisa Anderson", learnerId: "LRN-2024-006", qualification: "Level 2 Certificate in Customer Service", assignedDate: "01/03/2026", assignedBy: "Sarah Jones", status: "Completed", score: 88 },
];

const FinalAssessments = () => {
  const { toast } = useToast();
  const [finals, setFinals] = useState(mockFinals);
  const [assigned, setAssigned] = useState(mockAssigned);
  const [assignOpen, setAssignOpen] = useState(false);
  const [selectedQual, setSelectedQual] = useState("");
  const [selectedLearner, setSelectedLearner] = useState("");
  const [search, setSearch] = useState("");

  const handleAssign = () => {
    if (!selectedQual || !selectedLearner) {
      toast({ title: "Select both qualification and learner", variant: "destructive" });
      return;
    }
    const learner = adminLearners.find(l => l.id === selectedLearner);
    const qual = adminQualifications.find(q => q.id === selectedQual);
    if (!learner || !qual) return;

    setAssigned(prev => [...prev, {
      id: `af${Date.now()}`,
      learnerName: learner.name,
      learnerId: learner.learnerId,
      qualification: qual.title,
      assignedDate: new Date().toLocaleDateString("en-GB"),
      assignedBy: "Admin User",
      status: "Assigned",
    }]);
    setAssignOpen(false);
    setSelectedQual("");
    setSelectedLearner("");
    toast({ title: "Final assessment assigned", description: `${learner.name} has been assigned the final assessment for ${qual.title}` });
  };

  const statusBadge = (status: AssignedFinal["status"]) => {
    const map: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      Assigned: "secondary", "In Progress": "default", Completed: "default", Failed: "destructive"
    };
    return <Badge variant={map[status]}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <Link to="/admin/dashboard" className="inline-flex items-center gap-1.5 text-primary hover:underline text-sm">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Final Assessments</h1>
          <p className="text-sm text-muted-foreground">Qualification-wide final assessments — manually assigned by Admin or Trainer</p>
        </div>
        <Button onClick={() => setAssignOpen(true)}>
          <UserPlus className="w-4 h-4 mr-1" /> Assign Final Assessment
        </Button>
      </div>

      {/* Info */}
      <Card className="p-4 bg-primary/5 border-primary/20">
        <div className="flex gap-3 items-start">
          <ClipboardCheck className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-foreground">How Final Assessments work</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Final assessments are qualification-wide exams that cover content across all units. They are separate from per-unit quizzes.
              Admin or Trainer manually assigns a final assessment to a learner when they are ready. The assessment draws from a dedicated
              final assessment question pool configured per qualification.
            </p>
          </div>
        </div>
      </Card>

      {/* Qualification Finals Config */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Settings2 className="w-4 h-4" /> Final Assessment Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {finals.map((fa) => (
              <div key={fa.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                <div className="flex-1">
                  <p className="text-sm font-medium">{fa.qualificationTitle}</p>
                  {fa.status === "configured" ? (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {fa.totalQuestions} questions in pool • {fa.questionsPerQuiz} per exam • {fa.timeLimit} min • Pass: {fa.passScore}%
                      {fa.strictMode && " • Strict Mode"}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground mt-0.5">Not yet configured</p>
                  )}
                </div>
                <Badge variant={fa.status === "configured" ? "default" : "secondary"} className="text-xs">
                  {fa.status === "configured" ? "Configured" : "Not Configured"}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Assigned Finals */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <UserPlus className="w-4 h-4" /> Assigned Final Assessments
            </CardTitle>
            <div className="relative w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search learners..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-8 text-sm" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Learner</TableHead>
                <TableHead className="hidden md:table-cell">Qualification</TableHead>
                <TableHead>Assigned</TableHead>
                <TableHead>By</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assigned.filter(a => a.learnerName.toLowerCase().includes(search.toLowerCase())).map((a) => (
                <TableRow key={a.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-sm">{a.learnerName}</p>
                      <p className="text-xs text-muted-foreground">{a.learnerId}</p>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm">{a.qualification}</TableCell>
                  <TableCell className="text-sm">{a.assignedDate}</TableCell>
                  <TableCell className="text-sm">{a.assignedBy}</TableCell>
                  <TableCell>{statusBadge(a.status)}</TableCell>
                  <TableCell className="hidden md:table-cell text-sm">{a.score ? `${a.score}%` : "—"}</TableCell>
                </TableRow>
              ))}
              {assigned.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No final assessments assigned yet</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Assign Dialog */}
      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Final Assessment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label>Qualification</Label>
              <Select value={selectedQual} onValueChange={setSelectedQual}>
                <SelectTrigger><SelectValue placeholder="Select qualification" /></SelectTrigger>
                <SelectContent>
                  {adminQualifications.filter(q => q.status === "active").map(q => (
                    <SelectItem key={q.id} value={q.id}>{q.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Learner</Label>
              <Select value={selectedLearner} onValueChange={setSelectedLearner}>
                <SelectTrigger><SelectValue placeholder="Select learner" /></SelectTrigger>
                <SelectContent>
                  {adminLearners.filter(l => l.status === "active" && (!selectedQual || l.qualificationId === selectedQual)).map(l => (
                    <SelectItem key={l.id} value={l.id}>{l.name} ({l.learnerId})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-muted-foreground">
              The learner will be notified and the final assessment will appear in their qualification dashboard.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignOpen(false)}>Cancel</Button>
            <Button onClick={handleAssign}>Assign</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FinalAssessments;
