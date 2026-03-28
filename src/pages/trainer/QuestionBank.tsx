import { useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, ChevronRight, CheckCircle2, AlertCircle, Search, ArrowLeft, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useGetQualificationsQuery } from "@/redux/apis/qualificationApi";
import { useGetQuestionBankUnitsQuery } from "@/redux/apis/quiz/quizApi";

const QualificationBankSection = ({ qualification, search }: { qualification: any; search: string }) => {
  const { data: unitsResponse, isLoading } = useGetQuestionBankUnitsQuery(qualification.id);

  const units = unitsResponse?.data || [];
  
  const filteredUnits = units.filter(
    (u: any) =>
      u.unit_code.toLowerCase().includes(search.toLowerCase()) ||
      u.title.toLowerCase().includes(search.toLowerCase())
  );

  const showQual = qualification.title.toLowerCase().includes(search.toLowerCase()) || filteredUnits.length > 0;

  if (!showQual) return null;

  return (
    <Card className="overflow-hidden">
      <div className="p-5 border-b border-border bg-muted/30">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-foreground">{qualification.title}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Unit-level assessment management</p>
          </div>
          <Badge variant="secondary" className="text-xs">{qualification.category?.name || "Uncategorized"}</Badge>
        </div>
      </div>
      <div className="divide-y divide-border">
        {isLoading ? (
          <div className="p-10 flex flex-col items-center justify-center text-muted-foreground gap-2">
            <Loader2 className="w-6 h-6 animate-spin" />
            <p className="text-sm">Loading units...</p>
          </div>
        ) : filteredUnits.length === 0 ? (
          <div className="p-10 text-center text-muted-foreground">
            <p className="text-sm">No units found matching "{search}"</p>
          </div>
        ) : (
          filteredUnits.map((unit: any) => (
            <Link
              key={unit.id}
              to={`/trainer/question-bank/${qualification.id}/${unit.unit_code}`}
              className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors group"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-foreground">{unit.unit_code}: {unit.title}</p>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-xs text-muted-foreground">{unit.question_count} questions</span>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground">
                    {unit.assignment_enabled ? "Written assignment enabled" : "No written assignment"}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {unit.quiz_enabled ? (
                  <Badge className="bg-green-600 text-white text-xs gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Published
                  </Badge>
                ) : unit.question_count > 0 ? (
                  <Badge className="bg-amber-500 text-white text-xs gap-1">
                    <AlertCircle className="w-3 h-3" /> Draft
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-xs">Empty</Badge>
                )}
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </Link>
          ))
        )}
      </div>
    </Card>
  );
};

const QuestionBank = () => {
  const [search, setSearch] = useState("");
  const { data: qualificationsResponse, isLoading, error } = useGetQualificationsQuery({});

  const qualifications = (qualificationsResponse?.data?.results || []).filter((q: any) => !q.is_cpd);

  return (
    <div>
      <Link to="/trainer/dashboard" className="inline-flex items-center gap-1.5 text-primary hover:underline text-sm mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Question Bank</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage question pools, quiz configurations, and written assignments for each unit
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
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-muted-foreground gap-3">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p>Loading qualifications...</p>
          </div>
        ) : error ? (
          <div className="py-20 text-center text-destructive">
            <p>Error loading qualifications. Please try again later.</p>
          </div>
        ) : qualifications.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground">
            <p>No qualifications found.</p>
          </div>
        ) : (
          qualifications.map((qual) => (
            <QualificationBankSection key={qual.id} qualification={qual} search={search} />
          ))
        )}
      </div>
    </div>
  );
};

export default QuestionBank;
