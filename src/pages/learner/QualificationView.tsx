import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2, Clock, AlertTriangle, Circle, ShieldCheck, Loader2, FileCheck, ClipboardList } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import CPDFinalAssessmentModal from "@/components/learner/CPDFinalAssessmentModal";
import LearnerDeclarationModal from "@/components/learner/LearnerDeclarationModal";
import CourseEvaluationModal from "@/components/learner/CourseEvaluationModal";
import { useGetEnrolmentContentQuery } from "@/redux/apis/enrolmentApi";
import type { UnitData } from "@/data/learnerMockData";

const statusConfig: Record<UnitData["status"], { label: string; color: string; icon: typeof CheckCircle2 }> = {
  competent: { label: "Competent", color: "bg-green-600 text-white", icon: CheckCircle2 },
  awaiting_assessment: { label: "Awaiting Assessment", color: "bg-amber-500 text-white", icon: Clock },
  awaiting_iqa: { label: "Awaiting IQA Verification", color: "bg-blue-600 text-white", icon: ShieldCheck },
  resubmission: { label: "Resubmission Required", color: "bg-orange-500 text-white", icon: AlertTriangle },
  not_started: { label: "Not Started", color: "bg-muted text-muted-foreground", icon: Circle },
};

const QualificationView = () => {
  const { id } = useParams<{ id: string }>();
  const [showAssessment, setShowAssessment] = useState(false);
  const [showDeclaration, setShowDeclaration] = useState(false);
  const [showEvaluation, setShowEvaluation] = useState(false);
  
  const { data: enrolmentResponse, isLoading, error } = useGetEnrolmentContentQuery(id || "");
  const enrolment = enrolmentResponse?.data;
  const qualification = enrolment?.qualification;
  const units = enrolment?.units || [];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
        <Loader2 className="w-8 h-8 animate-spin" />
        <p className="text-sm">Loading course content...</p>
      </div>
    );
  }

  if (error || !enrolment || !qualification) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Qualification not found.</p>
        <Link to="/learner/dashboard" className="text-primary hover:underline mt-2 inline-block">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const completed = units.filter((u) => u.progress?.status === "completed" || u.progress?.status === "competent").length;
  const total = units.length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const allUnitsDone = total > 0 && completed === total;
  const isCpd = qualification.is_cpd;

  return (
    <div>
      <Link to="/learner/dashboard" className="inline-flex items-center gap-2 text-primary hover:underline mb-6 text-sm font-medium">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      {/* Qualification header */}
      <div className="bg-card border border-border rounded-xl p-6 mb-8 shadow-sm">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <h1 className="text-2xl font-bold text-foreground">{qualification.title}</h1>
          {isCpd && (
            <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] font-bold uppercase tracking-wider">
              CPD Enabled
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground mb-4">Qualification Code: {qualification.code}</p>

        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Overall Progress</span>
          <span className="text-sm font-semibold text-primary">
            {completed} of {total} Units Complete ({pct}%)
          </span>
        </div>
        <Progress value={pct} className="h-3" />
      </div>

      <h2 className="text-xl font-bold text-primary mb-1">Qualification Units</h2>
      <p className="text-sm text-muted-foreground mb-6">Select a unit to access learning resources {!qualification.is_cpd && "and submit assessment evidence"}</p>

      {/* Requirements Section */}
      {allUnitsDone && (
        <div className="space-y-4 mb-8">
          {/* CPD Final Assessment (Only for CPD) */}
          {qualification.is_cpd && (
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold text-primary mb-1">Final Assessment</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    This CPD qualification requires a single final assessment.
                  </p>
                  <Button 
                    size="sm" 
                    className="gap-2" 
                    onClick={() => setShowAssessment(true)}
                  >
                    <ShieldCheck className="w-4 h-4" /> 
                    Start Final Assessment
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Learner Declaration (For all when units are done, or after CPD assessment) */}
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <FileCheck className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-primary mb-1">Learner Declaration</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Please complete the learner declaration to finalize your qualification.
                </p>
                <Button 
                  size="sm" 
                  className="gap-2" 
                  onClick={() => setShowDeclaration(true)}
                >
                  <FileCheck className="w-4 h-4" /> 
                  Complete Declaration
                </Button>
              </div>
            </div>
          </div>

          {/* Course Evaluation */}
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <ClipboardList className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-primary mb-1">Course Evaluation</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  We value your feedback! Please complete the course evaluation.
                </p>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="gap-2" 
                  onClick={() => setShowEvaluation(true)}
                >
                  <ClipboardList className="w-4 h-4" /> 
                  Complete Evaluation
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAssessment && (
        <CPDFinalAssessmentModal
          qualificationId={qualification.id}
          qualificationTitle={qualification.title}
          onClose={() => setShowAssessment(false)}
          onSubmitted={(result) => {
            if (result.passed) {
              setShowAssessment(false);
              setShowDeclaration(true);
            }
          }}
        />
      )}

      {showDeclaration && (
        <LearnerDeclarationModal
          enrolmentId={id || ""}
          isOpen={showDeclaration}
          onClose={() => setShowDeclaration(false)}
          onSuccess={() => {
            setShowDeclaration(false);
            setShowEvaluation(true);
          }}
        />
      )}

      {showEvaluation && (
        <CourseEvaluationModal
          enrolmentId={id || ""}
          isOpen={showEvaluation}
          onClose={() => setShowEvaluation(false)}
          onSuccess={() => {
            setShowEvaluation(false);
          }}
        />
      )}

      <div className="space-y-4">
        {units.map((unit) => {
          const status = unit.progress?.status || "not_started";
          const cfg = statusConfig[status as UnitData["status"]] || statusConfig.not_started;
          const Icon = cfg.icon;

          return (
            <div key={unit.id} className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${status === "competent" ? "text-green-600" : status === "awaiting_assessment" ? "text-amber-500" : status === "awaiting_iqa" ? "text-blue-600" : status === "resubmission" ? "text-orange-500" : "text-muted-foreground"}`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-semibold text-foreground">
                        {unit.unit_code}: {unit.title}
                      </span>
                      {!qualification.is_cpd && (
                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded ${cfg.color}`}>
                          {cfg.label}
                        </span>
                      )}
                    </div>
                    {unit.progress?.submitted_at && (
                      <p className="text-xs text-muted-foreground">Submitted: {new Date(unit.progress.submitted_at).toLocaleDateString()}</p>
                    )}
                    {unit.progress?.completed_at && (
                      <p className="text-xs text-muted-foreground">Assessed: {new Date(unit.progress.completed_at).toLocaleDateString()}</p>
                    )}
                    {!qualification.is_cpd && unit.progress?.feedback && (
                      <div className="mt-3 bg-muted/50 rounded-lg p-4">
                        <p className="text-sm font-semibold text-foreground mb-1">Assessor Feedback:</p>
                        <p className="text-sm text-muted-foreground">{unit.progress.feedback}</p>
                      </div>
                    )}
                  </div>
                </div>
                <Button
                  asChild
                  size="sm"
                  className="flex-shrink-0"
                >
                  <Link to={`/learner/qualification/${id}/unit/${unit.id}`}>
                    View Unit
                  </Link>
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default QualificationView;
