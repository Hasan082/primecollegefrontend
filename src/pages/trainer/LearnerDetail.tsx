import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, User, Mail, Phone, Calendar, GraduationCap, TrendingUp, CheckCircle, Clock, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { trainerLearners } from "@/data/trainerMockData";

const statusConfig: Record<string, { className: string; icon: typeof CheckCircle }> = {
  "Competent": { className: "bg-green-600 text-white", icon: CheckCircle },
  "Pending Assessment": { className: "bg-secondary text-secondary-foreground", icon: Clock },
  "Not Started": { className: "bg-muted text-muted-foreground", icon: XCircle },
  "Resubmission Required": { className: "bg-destructive text-destructive-foreground", icon: Clock },
};

const LearnerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const learner = trainerLearners.find((l) => l.id === id);

  if (!learner) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Learner not found.</p>
        <Link to="/trainer/learners" className="text-primary underline mt-2 inline-block">Back to Learners</Link>
      </div>
    );
  }

  return (
    <div>
      <Link to="/trainer/learners" className="inline-flex items-center gap-1.5 text-primary hover:underline text-sm mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Assigned Learners
      </Link>

      {/* Header */}
      <Card className="bg-primary text-primary-foreground p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
            <User className="w-8 h-8 text-secondary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{learner.name}</h1>
            <p className="text-primary-foreground/80">Learner ID: {learner.learnerId}</p>
          </div>
        </div>
      </Card>

      {/* Contact & Meta Info */}
      <Card className="p-6 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-start gap-3">
            <Mail className="w-4 h-4 mt-0.5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="text-sm font-medium text-primary">{learner.email}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Phone className="w-4 h-4 mt-0.5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Phone</p>
              <p className="text-sm font-medium text-primary">{learner.phone}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Calendar className="w-4 h-4 mt-0.5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Enrolled</p>
              <p className="text-sm font-medium text-primary">{learner.enrolledDate}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <GraduationCap className="w-4 h-4 mt-0.5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Pending Assessments</p>
              <p className="text-sm font-medium text-primary">{learner.pendingSubmissions}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Qualification Progress */}
      <Card className="p-6 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <GraduationCap className="w-5 h-5 text-muted-foreground" />
          <h2 className="font-semibold text-foreground">{learner.qualification}</h2>
        </div>
        <div className="flex items-center gap-4">
          <Progress value={learner.progress} className="flex-1 h-3" />
          <div className="flex items-center gap-1.5 text-sm font-semibold text-primary">
            <TrendingUp className="w-4 h-4" />
            {learner.progress}%
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-2">{learner.unitsCompleted} of {learner.totalUnits} units completed</p>
      </Card>

      {/* Unit Progress Table */}
      <Card className="p-6">
        <h2 className="text-lg font-bold text-primary mb-1">Unit Progress</h2>
        <p className="text-sm text-muted-foreground mb-4">Detailed breakdown of qualification units</p>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Unit Code</TableHead>
              <TableHead>Unit Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Completed Date</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {learner.units.map((unit) => {
              const config = statusConfig[unit.status];
              const Icon = config.icon;
              return (
                <TableRow key={unit.code} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/trainer/learner/${id}/unit/${unit.code}`)}>
                  <TableCell className="font-medium text-primary">{unit.code}</TableCell>
                  <TableCell className="text-sm">{unit.name}</TableCell>
                  <TableCell>
                    <Badge className={`${config.className} text-xs gap-1`}>
                      <Icon className="w-3 h-3" />
                      {unit.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{unit.completedDate || "—"}</TableCell>
                  <TableCell>
                    <Link to={`/trainer/learner/${id}/unit/${unit.code}`} className="text-primary hover:underline text-xs font-medium" onClick={(e) => e.stopPropagation()}>
                      Manage
                    </Link>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default LearnerDetail;
