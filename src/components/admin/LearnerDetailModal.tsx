import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Mail, Phone, Calendar, GraduationCap, CreditCard, Clock, CheckCircle2, AlertTriangle, FileText, Pencil, Save, X, ChevronDown, ChevronUp, Timer, CalendarPlus, Check, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { AdminLearner } from "@/data/adminMockData";
import { adminTrainers, adminQualifications } from "@/data/adminMockData";
import { DEADLINE_PRESETS, createDeadline, getDeadlineStatus, getDaysRemaining, getDeadlineLabel, getDeadlineBadgeVariant, EXTENSION_PLANS, type UnitDeadline, type ExtensionRequest } from "@/lib/deadlines";
import { mockExtensionRequests } from "@/data/extensionRequestsMockData";

interface Props {
  learner: AdminLearner | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate?: (updated: AdminLearner) => void;
}

interface UnitTimeline {
  date: string;
  event: string;
  type: "submission" | "assessment" | "feedback" | "enrolment";
}

interface UnitData {
  name: string;
  status: "completed" | "in-progress" | "not-started";
  lastSubmission: string | null;
  timeline: UnitTimeline[];
}

const mockUnits = (progress: number, isCpd: boolean): UnitData[] => {
  const total = 6;
  const completed = Math.round((progress / 100) * total);
  const unitNames = ["Introduction & Fundamentals", "Core Principles", "Applied Practice", "Professional Skills", "Advanced Concepts", "Final Portfolio"];

  return Array.from({ length: total }, (_, i) => {
    const status = i < completed ? "completed" as const : i === completed ? "in-progress" as const : "not-started" as const;
    let timeline: UnitTimeline[] = [];

    if (status === "completed") {
      timeline = isCpd ? [
        { date: `${20 + i}/01/2025`, event: `All learning resources accessed`, type: "enrolment" },
        { date: `${15 + i}/01/2025`, event: `Unit study started`, type: "enrolment" },
      ] : [
        { date: `${20 + i}/01/2025`, event: `Marked as Competent by Sarah Jones`, type: "assessment" },
        { date: `${15 + i}/01/2025`, event: `Evidence submitted for assessment`, type: "submission" },
      ];
    } else if (status === "in-progress") {
      timeline = isCpd ? [
        { date: `${10 + i}/02/2025`, event: `Learning resources revisited`, type: "enrolment" },
        { date: `${28}/01/2025`, event: `Unit study started`, type: "enrolment" },
      ] : [
        { date: `${10 + i}/02/2025`, event: `Resubmission uploaded`, type: "submission" },
        { date: `${5 + i}/02/2025`, event: `Resubmission Required — feedback provided`, type: "feedback" },
        { date: `${28}/01/2025`, event: `Evidence submitted for assessment`, type: "submission" },
      ];
    }

    return {
      name: `Unit ${i + 1}: ${unitNames[i]}`,
      status,
      lastSubmission: timeline.length > 0 ? timeline[0].date : null,
      timeline,
    };
  });
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
  if (type === "submission") return <FileText className="w-3 h-3 text-primary" />;
  if (type === "assessment") return <CheckCircle2 className="w-3 h-3 text-green-600" />;
  if (type === "feedback") return <AlertTriangle className="w-3 h-3 text-amber-500" />;
  return <Calendar className="w-3 h-3 text-muted-foreground" />;
};

const LearnerDetailModal = ({ learner, open, onOpenChange, onUpdate }: Props) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ name: "", email: "", phone: "", assignedTrainer: "", status: "" as AdminLearner["status"] });
  const [expandedUnits, setExpandedUnits] = useState<Set<number>>(new Set());
  const [unitDeadlines, setUnitDeadlines] = useState<Map<string, UnitDeadline>>(new Map());
  const [extensionRequests, setExtensionRequests] = useState<ExtensionRequest[]>(mockExtensionRequests);
  const { toast } = useToast();

  if (!learner) return null;

  const qualification = adminQualifications.find(q => q.id === learner.qualificationId);
  const isCpd = qualification?.is_cpd || false;
  const units = mockUnits(learner.progress, isCpd);

  const toggleUnit = (i: number) => {
    setExpandedUnits(prev => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  const startEditing = () => {
    setEditData({
      name: learner.name,
      email: learner.email,
      phone: learner.phone,
      assignedTrainer: learner.assignedTrainer,
      status: learner.status,
    });
    setIsEditing(true);
  };

  const saveChanges = () => {
    const updated: AdminLearner = {
      ...learner,
      name: editData.name.trim(),
      email: editData.email.trim(),
      phone: editData.phone.trim(),
      assignedTrainer: editData.assignedTrainer,
      status: editData.status,
    };
    onUpdate?.(updated);
    setIsEditing(false);
    toast({ title: "Learner updated", description: `${updated.name}'s details have been saved.` });
  };

  const cancelEditing = () => setIsEditing(false);

  const statusBadge = (status: string) => {
    const v = status === "active" ? "default" : status === "completed" ? "secondary" : "destructive";
    return <Badge variant={v}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
  };

  const activeTrainers = adminTrainers.filter(t => t.status === "active");

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { setIsEditing(false); setExpandedUnits(new Set()); } onOpenChange(o); }}>
      <DialogContent className="max-w-2xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <span>{isEditing ? editData.name : learner.name}</span>
              <p className="text-xs text-muted-foreground font-normal">{learner.learnerId}</p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              {statusBadge(isEditing ? editData.status : learner.status)}
            </div>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="info" className="mt-2">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="info" className="text-xs">Personal Info</TabsTrigger>
            <TabsTrigger value="progress" className="text-xs">Unit Progress</TabsTrigger>
            <TabsTrigger value="extensions" className="text-xs">
              Extensions
            </TabsTrigger>
            <TabsTrigger value="payment" className="text-xs">Payment</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[400px] mt-3">
            <TabsContent value="info" className="mt-0 space-y-4 pr-3">
              {/* Edit / Save / Cancel buttons */}
              <div className="flex justify-end gap-2">
                {isEditing ? (
                  <>
                    <Button variant="outline" size="sm" onClick={cancelEditing}>
                      <X className="w-3.5 h-3.5 mr-1" /> Cancel
                    </Button>
                    <Button size="sm" onClick={saveChanges}>
                      <Save className="w-3.5 h-3.5 mr-1" /> Save Changes
                    </Button>
                  </>
                ) : (
                  <Button variant="outline" size="sm" onClick={startEditing}>
                    <Pencil className="w-3.5 h-3.5 mr-1" /> Edit
                  </Button>
                )}
              </div>

              <Card>
                <CardContent className="p-4 space-y-3">
                  {isEditing ? (
                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Full Name</Label>
                        <Input value={editData.name} onChange={(e) => setEditData(d => ({ ...d, name: e.target.value }))} />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label className="text-xs">Email</Label>
                          <Input type="email" value={editData.email} disabled className="bg-muted/50 cursor-not-allowed" />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs">Phone</Label>
                          <Input value={editData.phone} onChange={(e) => setEditData(d => ({ ...d, phone: e.target.value }))} />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label className="text-xs">Assigned Trainer</Label>
                          <Select value={editData.assignedTrainer} onValueChange={(v) => setEditData(d => ({ ...d, assignedTrainer: v }))}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {activeTrainers.map(t => (
                                <SelectItem key={t.id} value={t.name}>{t.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs">Status</Label>
                          <Select value={editData.status} onValueChange={(v) => setEditData(d => ({ ...d, status: v as AdminLearner["status"] }))}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="suspended">Suspended</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  ) : (
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
                  )}
                </CardContent>
              </Card>

              {!isEditing && (
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
              )}
            </TabsContent>

            <TabsContent value="progress" className="mt-0 space-y-2 pr-3">
              {units.map((unit, i) => {
                const isExpanded = expandedUnits.has(i);
                const hasTimeline = unit.timeline.length > 0;
                const unitKey = `unit-${i}`;
                const deadline = unitDeadlines.get(unitKey);
                const deadlineStatus = deadline ? getDeadlineStatus(deadline.deadlineDate) : "none";
                const daysLeft = deadline ? getDaysRemaining(deadline.deadlineDate) : 0;

                const setDeadline = (days: number) => {
                  const dl = createDeadline(days, unitKey);
                  setUnitDeadlines(prev => new Map(prev).set(unitKey, dl));
                  toast({ title: "Deadline set", description: `${unit.name} — ${days} day deadline assigned` });
                };

                const removeDeadline = () => {
                  setUnitDeadlines(prev => {
                    const next = new Map(prev);
                    next.delete(unitKey);
                    return next;
                  });
                  toast({ title: "Deadline removed" });
                };

                return (
                  <Card key={i}>
                    <CardContent className="p-0">
                      <button
                        className="w-full p-3 flex items-center justify-between gap-3 text-left hover:bg-muted/30 transition-colors rounded-lg"
                        onClick={() => toggleUnit(i)}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{unit.name}</p>
                          {unit.lastSubmission && (
                            <p className="text-xs text-muted-foreground">Last activity: {unit.lastSubmission}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {deadline && unit.status !== "completed" && (
                            <Badge variant={getDeadlineBadgeVariant(deadlineStatus)} className="text-[10px] gap-1">
                              <Timer className="w-3 h-3" />
                              {getDeadlineLabel(deadlineStatus, daysLeft)}
                            </Badge>
                          )}
                          {unitStatusBadge(unit.status)}
                          {isExpanded
                            ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
                            : <ChevronDown className="w-4 h-4 text-muted-foreground" />
                          }
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="px-4 pb-3 pt-1 border-t border-border space-y-3">
                          {/* Deadline Setting — Only show if NOT CPD */}
                          {unit.status !== "completed" && !isCpd && (
                            <div>
                              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                                <Timer className="w-3 h-3 inline mr-1" />Deadline
                              </p>
                              {deadline ? (
                                <div className="flex items-center gap-2 text-xs">
                                  <Badge variant={getDeadlineBadgeVariant(deadlineStatus)} className="text-[10px]">
                                    {getDeadlineLabel(deadlineStatus, daysLeft)}
                                  </Badge>
                                  <span className="text-muted-foreground">Due: {deadline.deadlineDate}</span>
                                  <Button variant="ghost" size="sm" className="h-5 px-1.5 text-[10px] text-destructive" onClick={removeDeadline}>
                                    Remove
                                  </Button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  {DEADLINE_PRESETS.map(p => (
                                    <Button key={p.value} variant="outline" size="sm" className="h-6 text-[10px] px-2" onClick={() => setDeadline(p.value)}>
                                      {p.label}
                                    </Button>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Activity Timeline */}
                          {hasTimeline && (
                            <div>
                              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Activity Timeline</p>
                              <div className="relative pl-5 space-y-3">
                                <div className="absolute left-[7px] top-1 bottom-1 w-px bg-border" />
                                {unit.timeline.map((item, j) => (
                                  <div key={j} className="relative flex items-start gap-2.5">
                                    <div className="absolute -left-5 top-0.5 w-4 h-4 rounded-full bg-background border border-border flex items-center justify-center">
                                      {timelineIcon(item.type)}
                                    </div>
                                    <div>
                                      <p className="text-xs">{item.event}</p>
                                      <p className="text-[10px] text-muted-foreground">{item.date}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </TabsContent>

            <TabsContent value="extensions" className="mt-0 space-y-3 pr-3">
              {/* Admin Manual Extension */}
              <Card className="border-dashed">
                <CardContent className="p-4 space-y-3">
                  <p className="text-sm font-semibold flex items-center gap-1.5">
                    <CalendarPlus className="w-4 h-4" /> Grant Manual Extension
                  </p>
                  <p className="text-xs text-muted-foreground">Extend this learner's access without requiring payment (e.g. employer-funded, goodwill).</p>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {EXTENSION_PLANS.map(plan => (
                      <Button
                        key={plan.id}
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs gap-1"
                        onClick={() => {
                          const newReq: ExtensionRequest = {
                            id: `er-manual-${Date.now()}`,
                            learnerId: learner.id,
                            learnerName: learner.name,
                            qualificationId: "q1",
                            qualificationTitle: learner.qualification,
                            plan,
                            requestedDate: new Date().toLocaleDateString("en-GB"),
                            status: "approved",
                            reviewedBy: "Admin (Manual)",
                            reviewedDate: new Date().toLocaleDateString("en-GB"),
                            note: "Manually extended by admin — no payment required",
                          };
                          setExtensionRequests(prev => [newReq, ...prev]);
                          toast({ title: "Extension granted", description: `${plan.label} extension activated for ${learner.name} — no payment required.` });
                        }}
                      >
                        <CalendarPlus className="w-3 h-3" /> {plan.label}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Extension History */}
              {(() => {
                const learnerRequests = extensionRequests.filter(r => r.learnerId === learner.id);
                if (learnerRequests.length === 0) {
                  return (
                    <div className="text-center py-6 text-muted-foreground">
                      <p className="text-sm">No extensions yet</p>
                    </div>
                  );
                }

                return learnerRequests.map(req => (
                  <Card key={req.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <p className="text-sm font-medium">{req.plan.label} Extension</p>
                          <p className="text-xs text-muted-foreground">{req.qualificationTitle}</p>
                        </div>
                        <Badge
                          variant={req.status === "approved" ? "default" : "secondary"}
                          className="text-[10px]"
                        >
                          {req.note?.includes("no payment") ? "Manual" : "Paid"} — Active
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground mb-2">
                        <div>
                          <p className="font-medium text-foreground">{req.note?.includes("no payment") ? "£0 (waived)" : `£${req.plan.price}`}</p>
                          <p>Fee</p>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{req.plan.months} month{req.plan.months > 1 ? "s" : ""}</p>
                          <p>Duration</p>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{req.requestedDate}</p>
                          <p>Date</p>
                        </div>
                      </div>
                      {req.note && (
                        <p className="text-[10px] text-muted-foreground italic">{req.note}</p>
                      )}
                      {req.reviewedBy && (
                        <p className="text-[10px] text-muted-foreground mt-1">
                          By {req.reviewedBy} on {req.reviewedDate}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ));
              })()}
            </TabsContent>
            <TabsContent value="payment" className="mt-0 space-y-4 pr-3">
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
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default LearnerDetailModal;
