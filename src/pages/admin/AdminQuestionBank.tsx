import { useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, ChevronRight, CheckCircle2, AlertCircle, Search, ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { qualificationBanks } from "@/data/questionBankData";

const AdminQuestionBank = () => {
  const [search, setSearch] = useState("");

  const filtered = qualificationBanks.map((q) => ({
    ...q,
    units: q.units.filter(
      (u) =>
        u.code.toLowerCase().includes(search.toLowerCase()) ||
        u.name.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter((q) =>
    q.title.toLowerCase().includes(search.toLowerCase()) || q.units.length > 0
  );

  return (
    <div>
      <Link to="/admin/dashboard" className="inline-flex items-center gap-1.5 text-primary hover:underline text-sm mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Question Bank Management</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Full control over question pools, quiz configurations, and written assignments across all qualifications
        </p>
      </div>

      <Card className="p-4 mb-6 bg-primary/5 border-primary/20">
        <div className="flex gap-3 items-start">
          <BookOpen className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-foreground">How the Question Bank works</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Create a large pool of questions per unit (e.g. 50+). When a learner takes a quiz, the system randomly selects
              a configured number of questions (e.g. 20–25) with shuffled order. This ensures each learner receives a unique
              quiz, reducing the risk of answer sharing and ensuring fair assessment.
            </p>
          </div>
        </div>
      </Card>

      <div className="relative mb-6">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search qualifications or units..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="space-y-6">
        {filtered.map((qual) => (
          <Card key={qual.id} className="overflow-hidden">
            <div className="p-5 border-b border-border bg-muted/30">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-foreground">{qual.title}</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">{qual.units.length} units</p>
                </div>
                <Badge variant="secondary" className="text-xs">{qual.category}</Badge>
              </div>
            </div>
            <div className="divide-y divide-border">
              {qual.units.map((unit) => (
                <Link
                  key={unit.code}
                  to={`/admin/question-bank/${qual.id}/${unit.code}`}
                  className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-foreground">{unit.code}: {unit.name}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs text-muted-foreground">{unit.questionCount} questions</span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">{unit.assignmentCount} written assignments</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {unit.published ? (
                      <Badge className="bg-green-600 text-white text-xs gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Published
                      </Badge>
                    ) : unit.questionCount > 0 ? (
                      <Badge className="bg-amber-500 text-white text-xs gap-1">
                        <AlertCircle className="w-3 h-3" /> Draft
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">Empty</Badge>
                    )}
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminQuestionBank;
