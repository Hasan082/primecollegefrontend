import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { User, Mail, Phone, Calendar, GraduationCap, CreditCard, Clock, CheckCircle2, AlertTriangle, FileText } from "lucide-react";
import type { AdminLearner } from "@/data/adminMockData";

interface Props {
  learner: AdminLearner | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const mockUnits = (progress: number) => {
  const total = 6;
  const completed = Math.round((progress / 100) * total);
  return Array.from({ length: total }, (_, i) => ({
    name: `Unit ${i + 1}: ${["Introduction & Fundamentals", "Core Principles", "Applied Practice", "Professional Skills", "Advanced Concepts", "Final Portfolio"][i]}`,
    status: i < completed ? "completed" as const : i === completed ? "in-progress" as const : "not-started" as const,
    submissions: i < completed ? 1 : i === completed ? 1 : 0,
    lastSubmission: i <= completed ? `${15 + i}/01/2025` : null,
  }));
};

const mockTimeline = (name: string) => [
  { date: "15/02/2025", event: "Unit 3 submitted for assessment", type: "submission" },
  { date: "12/02/2025", event: "Unit 2 marked as Competent by Sarah Jones", type: "assessment" },
  { date: "08/02/2025", event: "Unit 2 resubmission uploaded", type: "submission" },
  { date: "01/02/2025", event: "Unit 2 — Resubmission Required", type: "feedback" },
  { date: "25/01/2025", event: "Unit 2 submitted for assessment", type: "submission" },
  { date: "20/01/2025", event: "Unit 1 marked as Competent by Sarah Jones", type: "assessment" },
  { date: "15/01/2025", event: "Unit 1 submitted for assessment", type: "submission" },
  { date: "10/01/2025", event: `${name} enrolled on qualification`, type: "enrolment" },
];

const statusBadge = (status: string) => {
  const v = status === "active" ? "default" : status === "completed" ? "secondary" : "destructive";
  return <Badge variant={v}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
};

const paymentBadge = (status: string) => {
  const map: Record<string, "default" | "secondary" | "destructive"> = { paid: "default", pending: "secondary", overdue: "destructive" };
  return <Badge variant={map[status] || "outline"}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
};

const unitStatusBadge = (status: string) => {
  if (status === "completed") return <Badge variant="default" className="text-[10px]"><CheckCircle2 className="w-3 h-3 mr-1" />Completed</Badge>;
  if (status === "in-progress") return <Badge variant="secondary" className="text-[10px]"><Clock className="w-3 h-3 mr-1" />In Progress</Badge>;
  return <Badge variant="outline" className="text-[10px]">Not Started</Badge>;
};

const timelineIcon = (type: string) => {
  if (type === "submission") return <FileText className="w-3.5 h-3.5 text-primary" />;
  if (type === "assessment") return <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />;
  if (type === "feedback") return <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />;
  return <Calendar className="w-3.5 h-3.5 text-muted-foreground" />;
};

const LearnerDetailModal = ({ learner, open, onOpenChange }: Props) => {
  if (!learner) return null;

  const units = mockUnits(learner.progress);
  const timeline = mockTimeline(learner.name);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <span>{learner.name}</span>
              <p className="text-xs text-muted-foreground font-normal">{learner.learnerId}</p>
            </div>
            <div className="ml-auto">{statusBadge(learner.status)}</div>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="info" className="mt-2">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="info" className="text-xs">Personal Info</TabsTrigger>
            <TabsTrigger value="progress" className="text-xs">Unit Progress</TabsTrigger>
            <TabsTrigger value="payment" className="text-xs">Payment</TabsTrigger>
            <TabsTrigger value="timeline" className="text-xs">Timeline</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[400px] mt-3 pr-3">
            <TabsContent value="info" className="mt-0 space-y-4">
              <Card>
                <CardContent className="p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Email</p>
                        <p className="font-medium">{learner.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Phone</p>
                        <p className="font-medium">{learner.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Enrolled Date</p>
                        <p className="font-medium">{learner.enrolledDate}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Access Expiry</p>
                        <p className="font-medium">{learner.accessExpiry}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-sm mb-2">
                    <GraduationCap className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Qualification</p>
                      <p className="font-medium">{learner.qualification}</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Assigned Trainer: <span className="font-medium text-foreground">{learner.assignedTrainer}</span></p>
                  <div className="mt-3 flex items-center gap-3">
                    <Progress value={learner.progress} className="flex-1 h-2" />
                    <span className="text-sm font-bold">{learner.progress}%</span>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="progress" className="mt-0 space-y-2">
              {units.map((unit, i) => (
                <Card key={i}>
                  <CardContent className="p-3 flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{unit.name}</p>
                      {unit.lastSubmission && (
                        <p className="text-xs text-muted-foreground">Last submission: {unit.lastSubmission}</p>
                      )}
                    </div>
                    {unitStatusBadge(unit.status)}
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="payment" className="mt-0 space-y-4">
              <Card>
                <CardContent className="p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-sm">
                      <p className="text-xs text-muted-foreground">Payment Method</p>
                      <p className="font-medium capitalize">{learner.paymentMethod}</p>
                    </div>
                    <div className="text-sm">
                      <p className="text-xs text-muted-foreground">Payment Status</p>
                      <div className="mt-0.5">{paymentBadge(learner.paymentStatus)}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-muted-foreground" /> Payment History
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center bg-muted/30 rounded-md px-3 py-2">
                      <span>Initial enrolment payment</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">£1,200.00</span>
                        <Badge variant="default" className="text-[10px]">Paid</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="timeline" className="mt-0">
              <div className="relative pl-6 space-y-4">
                <div className="absolute left-[11px] top-1 bottom-1 w-px bg-border" />
                {timeline.map((item, i) => (
                  <div key={i} className="relative flex items-start gap-3">
                    <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-background border border-border flex items-center justify-center">
                      {timelineIcon(item.type)}
                    </div>
                    <div>
                      <p className="text-sm">{item.event}</p>
                      <p className="text-xs text-muted-foreground">{item.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default LearnerDetailModal;
