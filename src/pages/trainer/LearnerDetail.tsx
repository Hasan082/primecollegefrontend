import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, User, Mail, Phone, Calendar, GraduationCap, TrendingUp, CheckCircle, Clock, XCircle, Timer, CalendarPlus, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { trainerLearners } from "@/data/trainerMockData";
import { useToast } from "@/hooks/use-toast";
import TablePagination from "@/components/admin/TablePagination";
import { DEADLINE_PRESETS, createDeadline, getDeadlineStatus, getDaysRemaining, getDeadlineLabel, getDeadlineBadgeVariant, type UnitDeadline, type ExtensionRequest } from "@/lib/deadlines";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockExtensionRequests } from "@/data/extensionRequestsMockData";

const ITEMS_PER_PAGE = 10;

const statusConfig: Record<string, { className: string; icon: typeof CheckCircle }> = {
  "Competent": { className: "bg-green-600 text-white", icon: CheckCircle },
  "Pending Assessment": { className: "bg-secondary text-secondary-foreground", icon: Clock },
  "Not Started": { className: "bg-muted text-muted-foreground", icon: XCircle },
  "Resubmission Required": { className: "bg-destructive text-destructive-foreground", icon: Clock },
};

const LearnerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [unitDeadlines, setUnitDeadlines] = useState<Map<string, UnitDeadline>>(new Map());
  const [extensionRequests, setExtensionRequests] = useState<ExtensionRequest[]>(mockExtensionRequests);
  const { toast } = useToast();
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

      {/* Extension Requests */}
      {(() => {
        const learnerReqs = extensionRequests.filter(r => r.learnerId === id);
        const pendingReqs = learnerReqs.filter(r => r.status === "pending");
        if (pendingReqs.length === 0) return null;

        const handleAction = (reqId: string, action: "approved" | "rejected") => {
          setExtensionRequests(prev => prev.map(r =>
            r.id === reqId ? { ...r, status: action, reviewedBy: "Trainer", reviewedDate: new Date().toLocaleDateString("en-GB") } : r
          ));
          toast({ title: `Extension ${action}` });
        };

        return (
          <Card className="p-6 mb-6 border-amber-500/30 bg-amber-500/5">
            <h2 className="text-sm font-bold flex items-center gap-2 mb-3">
              <CalendarPlus className="w-4 h-4" /> Pending Extension Requests
              <Badge variant="secondary" className="text-[10px]">{pendingReqs.length}</Badge>
            </h2>
            <div className="space-y-2">
              {pendingReqs.map(req => (
                <div key={req.id} className="flex items-center justify-between gap-3 bg-card rounded-lg border p-3">
                  <div>
                    <p className="text-sm font-medium">{req.plan.label} — £{req.plan.price}</p>
                    <p className="text-xs text-muted-foreground">{req.qualificationTitle} • Requested {req.requestedDate}</p>
                  </div>
                  <div className="flex gap-1.5">
                    <Button size="sm" className="h-7 text-xs gap-1" onClick={() => handleAction(req.id, "approved")}>
                      <Check className="w-3 h-3" /> Approve
                    </Button>
                    <Button variant="outline" size="sm" className="h-7 text-xs gap-1 text-destructive" onClick={() => handleAction(req.id, "rejected")}>
                      <XCircle className="w-3 h-3" /> Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        );
      })()}

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
              <TableHead>Deadline</TableHead>
              <TableHead>Completed Date</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {learner.units.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE).map((unit) => {
              const config = statusConfig[unit.status];
              const Icon = config.icon;
              const deadline = unitDeadlines.get(unit.code);
              const deadlineStatus = deadline ? getDeadlineStatus(deadline.deadlineDate) : "none";
              const daysLeft = deadline ? getDaysRemaining(deadline.deadlineDate) : 0;
              const isCompleted = unit.status === "Competent";

              const handleSetDeadline = (days: string) => {
                const dl = createDeadline(parseInt(days), unit.code);
                setUnitDeadlines(prev => new Map(prev).set(unit.code, dl));
                toast({ title: "Deadline set", description: `${unit.name} — ${days} day deadline` });
              };

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
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    {isCompleted ? (
                      <span className="text-xs text-muted-foreground">—</span>
                    ) : deadline ? (
                      <Badge variant={getDeadlineBadgeVariant(deadlineStatus)} className="text-[10px] gap-1">
                        <Timer className="w-3 h-3" />
                        {getDeadlineLabel(deadlineStatus, daysLeft)}
                      </Badge>
                    ) : (
                      <Select onValueChange={handleSetDeadline}>
                        <SelectTrigger className="h-7 text-[10px] w-24">
                          <SelectValue placeholder="Set deadline" />
                        </SelectTrigger>
                        <SelectContent>
                          {DEADLINE_PRESETS.map(p => (
                            <SelectItem key={p.value} value={String(p.value)} className="text-xs">{p.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
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
        <TablePagination currentPage={currentPage} totalItems={learner.units.length} itemsPerPage={ITEMS_PER_PAGE} onPageChange={setCurrentPage} />
      </Card>
    </div>
  );
};

export default LearnerDetail;
