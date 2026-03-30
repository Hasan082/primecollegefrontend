/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Search,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useGetQualificationsAdminQuery } from "@/redux/apis/qualification/qualificationApi";
import { useGetQuestionBankUnitsQuery } from "@/redux/apis/quiz/quizApi";

const QualificationBankSection = ({
  qualification,
  search,
}: {
  qualification: any;
  search: string;
}) => {
  const { data: unitsResponse, isLoading } = useGetQuestionBankUnitsQuery(
    qualification.id,
  );

  const units = unitsResponse || [];

  const filteredUnits = units.filter(
    (u: any) =>
      u.unit_code.toLowerCase().includes(search.toLowerCase()) ||
      u.title.toLowerCase().includes(search.toLowerCase()),
  );

  const showQual =
    qualification.title.toLowerCase().includes(search.toLowerCase()) ||
    filteredUnits.length > 0;

  if (!showQual) return null;

  return (
    <Card className="overflow-hidden">
      <div className="p-5 border-b border-border bg-muted/30">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-foreground">{qualification.title}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {qualification.total_units} units total
            </p>
          </div>
          <Badge variant="secondary" className="text-xs">
            {qualification.category}
          </Badge>
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
              to={`/admin/question-bank/${qualification.id}/${unit.unit_code}`}
              className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors group"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-foreground">
                  {unit.unit_code}: {unit.title}
                </p>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-xs text-muted-foreground">
                    {unit.question_count} questions
                  </span>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground">
                    {unit.assignment_enabled
                      ? "Written assignment enabled"
                      : "No written assignment"}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {unit.is_active ? (
                  <Badge className="bg-primary text-white text-xs gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Live
                  </Badge>
                ) : (
                  <Badge className="bg-amber-500 text-white text-xs gap-1">
                    <AlertCircle className="w-3 h-3" /> Draft
                  </Badge>
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

const AdminQuestionBank = () => {
  const [search, setSearch] = useState("");
  const {
    data: qualificationsResponse,
    isLoading,
    error,
  } = useGetQualificationsAdminQuery({
    is_cpd: false,
  });

  const regulatedQualifications = qualificationsResponse?.data?.results;

  return (
    <div>
      <Link
        to="/admin/dashboard"
        className="inline-flex items-center gap-1.5 text-primary hover:underline text-sm mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">
          Question Bank Management
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Full control over question pools, quiz configurations, and written
          assignments across all qualifications gffghf
        </p>
      </div>

      <Card className="p-4 mb-6 bg-primary/5 border-primary/20">
        <div className="flex gap-3 items-start">
          <BookOpen className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-foreground">
              How the Question Bank works
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Create a large pool of questions per unit (e.g. 50+). When a
              learner takes a quiz, the system randomly selects a configured
              number of questions (e.g. 20–25) with shuffled order. This ensures
              each learner receives a unique quiz, reducing the risk of answer
              sharing and ensuring fair assessment.
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
        ) : regulatedQualifications.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground border-2 border-dashed rounded-xl">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="font-medium text-foreground">
              No qualifications found in the system.
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Please create a qualification first to manage its question bank.
            </p>
          </div>
        ) : regulatedQualifications.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground border-2 border-dashed rounded-xl">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
              <BookOpen className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="font-medium text-foreground">
              No regulated qualifications to manage here.
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              All active qualifications are CPD-enabled. Manage them via the{" "}
              <strong>Final Assessment</strong> editor.
            </p>
          </div>
        ) : (
          regulatedQualifications.map((qual: any) => (
            <QualificationBankSection
              key={qual.id}
              qualification={qual}
              search={search}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default AdminQuestionBank;
