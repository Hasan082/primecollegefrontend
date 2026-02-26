import { useParams, Link } from "react-router-dom";
import { ArrowLeft, FileText, User, GraduationCap, Calendar, Clock, CheckCircle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { recentAssessments } from "@/data/trainerMockData";

const outcomeColors: Record<string, string> = {
  "Competent": "bg-green-600 text-white",
  "Resubmission Required": "bg-secondary text-secondary-foreground",
  "Not Yet Competent": "bg-destructive text-destructive-foreground",
};

const AssessmentRecord = () => {
  const { id } = useParams();
  const record = recentAssessments.find((a) => a.id === id);

  if (!record) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Assessment record not found.</p>
        <Link to="/trainer/dashboard" className="text-primary underline mt-2 inline-block">Back to Dashboard</Link>
      </div>
    );
  }

  return (
    <div>
      <Link to="/trainer/dashboard" className="inline-flex items-center gap-1.5 text-primary hover:underline text-sm mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      {/* Header Card */}
      <Card className="bg-primary text-primary-foreground p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center">
              <FileText className="w-7 h-7 text-secondary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Assessment Record</h1>
              <p className="text-primary-foreground/80">{record.unitCode}: {record.unitTitle}</p>
            </div>
          </div>
          <Badge className={`${outcomeColors[record.outcome]} text-sm px-4 py-1.5 flex items-center gap-1.5`}>
            <CheckCircle className="w-4 h-4" />
            {record.outcome}
          </Badge>
        </div>
      </Card>

      {/* Meta Info */}
      <Card className="p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
          <div className="flex items-start gap-3">
            <User className="w-4 h-4 mt-0.5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Learner</p>
              <p className="font-semibold text-primary">{record.learnerName}</p>
              <p className="text-xs text-muted-foreground">{record.learnerId}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <GraduationCap className="w-4 h-4 mt-0.5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Qualification</p>
              <p className="font-semibold text-primary">{record.qualification}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Calendar className="w-4 h-4 mt-0.5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Assessed By</p>
              <p className="font-semibold text-primary">{record.assessorName}</p>
              <p className="text-xs text-muted-foreground">{record.assessedDate}</p>
            </div>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Clock className="w-4 h-4 mt-0.5 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Submitted Date</p>
            <p className="font-semibold text-primary">{record.submittedDate}</p>
          </div>
        </div>
      </Card>

      {/* Criteria */}
      <Card className="p-6">
        <h2 className="text-lg font-bold text-primary mb-1">Assessment Criteria</h2>
        <p className="text-sm text-muted-foreground mb-6">Individual criterion outcomes and evidence</p>

        <div className="space-y-3">
          {record.criteria.map((c) => (
            <div
              key={c.code}
              className={`rounded-xl p-4 flex items-center gap-4 ${c.met ? 'bg-green-50 border border-green-200' : 'bg-destructive/5 border border-destructive/20'}`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white ${c.met ? 'bg-primary' : 'bg-destructive'}`}>
                {c.code}
              </div>
              <div className="flex-1">
                <p className={`font-semibold ${c.met ? 'text-primary' : 'text-destructive'}`}>{c.title}</p>
                <p className="text-sm text-muted-foreground">Evidence: {c.evidence}</p>
              </div>
              <Badge className={`${c.met ? 'bg-green-600' : 'bg-destructive'} text-white text-xs`}>
                {c.met ? 'Met' : 'Not Met'}
              </Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default AssessmentRecord;
