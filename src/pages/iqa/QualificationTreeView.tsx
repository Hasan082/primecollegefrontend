import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ArrowLeft, GraduationCap, Users, FolderOpen, FileText,
  CheckCircle2, Clock, AlertTriangle, ShieldCheck, MinusCircle, Eye,
} from "lucide-react";
import { Link } from "react-router-dom";
import { qualificationTreeData, type TreeUnit } from "@/data/qualificationTreeData";

const statusConfig: Record<string, { color: string; icon: React.ReactNode; badgeClass: string }> = {
  "Not Started": { color: "text-muted-foreground", icon: <Clock className="w-3.5 h-3.5" />, badgeClass: "bg-muted text-muted-foreground" },
  "In Progress": { color: "text-blue-600", icon: <Clock className="w-3.5 h-3.5 text-blue-600" />, badgeClass: "bg-blue-100 text-blue-700 border-blue-200" },
  "Assessed": { color: "text-amber-600", icon: <FileText className="w-3.5 h-3.5 text-amber-600" />, badgeClass: "bg-amber-100 text-amber-700 border-amber-200" },
  "Awaiting IQA": { color: "text-purple-600", icon: <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />, badgeClass: "bg-purple-100 text-purple-700 border-purple-200" },
  "IQA Approved": { color: "text-green-600", icon: <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />, badgeClass: "bg-green-100 text-green-700 border-green-200" },
  "Not Sampled": { color: "text-muted-foreground", icon: <MinusCircle className="w-3.5 h-3.5" />, badgeClass: "bg-secondary text-secondary-foreground" },
  "Action Required": { color: "text-destructive", icon: <AlertTriangle className="w-3.5 h-3.5 text-destructive" />, badgeClass: "bg-destructive/10 text-destructive border-destructive/20" },
};

const UnitRow = ({ unit }: { unit: TreeUnit }) => {
  const config = statusConfig[unit.status] || statusConfig["Not Started"];
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors">
      {config.icon}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">Unit {unit.unitCode}</span>
          <span className="text-sm text-muted-foreground truncate">— {unit.unitName}</span>
        </div>
        <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground">
          <span>Assessor: {unit.assessorName}</span>
          {unit.evidenceCount > 0 && (
            <span className="flex items-center gap-0.5"><FileText className="w-3 h-3" /> {unit.evidenceCount} evidence</span>
          )}
          {unit.lastActivityDate !== "-" && <span>Last: {unit.lastActivityDate}</span>}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {unit.completionPercent > 0 && unit.completionPercent < 100 && (
          <div className="flex items-center gap-1.5">
            <Progress value={unit.completionPercent} className="w-16 h-1.5" />
            <span className="text-[10px] text-muted-foreground w-8">{unit.completionPercent}%</span>
          </div>
        )}
        <Badge className={`text-[10px] ${config.badgeClass}`}>
          {unit.status}
        </Badge>
        {unit.status === "Awaiting IQA" && (
          <Button variant="default" size="sm" className="h-7 text-xs gap-1 ml-1" asChild>
            <Link to="/iqa/sampling"><Eye className="w-3 h-3" /> Review</Link>
          </Button>
        )}
      </div>
    </div>
  );
};

const QualificationTreeView = () => {
  // Summary stats
  const totalLearners = qualificationTreeData.reduce((sum, q) => sum + q.totalLearners, 0);
  const allUnits = qualificationTreeData.flatMap(q => q.learners.flatMap(l => l.units));
  const awaitingIQA = allUnits.filter(u => u.status === "Awaiting IQA").length;
  const approved = allUnits.filter(u => u.status === "IQA Approved").length;
  const actionRequired = allUnits.filter(u => u.status === "Action Required").length;

  return (
    <div className="space-y-6">
      <Button variant="outline" size="sm" className="gap-2" onClick={() => window.history.back()}>
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Button>

      <div>
        <h1 className="text-2xl font-bold">Qualification Overview</h1>
        <p className="text-sm text-muted-foreground">Drill down: Qualification → Learners → Units → Status</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center">
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-xl font-bold">{totalLearners}</p>
              <p className="text-[11px] text-muted-foreground">Total Learners</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <p className="text-xl font-bold">{awaitingIQA}</p>
              <p className="text-[11px] text-muted-foreground">Awaiting IQA</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="text-xl font-bold">{approved}</p>
              <p className="text-[11px] text-muted-foreground">IQA Approved</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-destructive" />
            </div>
            <div>
              <p className="text-xl font-bold">{actionRequired}</p>
              <p className="text-[11px] text-muted-foreground">Action Required</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tree View */}
      <Accordion type="multiple" className="space-y-4">
        {qualificationTreeData.map((qual) => {
          const qualAwaitingIQA = qual.learners.flatMap(l => l.units).filter(u => u.status === "Awaiting IQA").length;
          const qualApproved = qual.learners.flatMap(l => l.units).filter(u => u.status === "IQA Approved" || u.status === "Not Sampled").length;
          const qualTotal = qual.learners.flatMap(l => l.units).length;

          return (
            <AccordionItem key={qual.qualificationId} value={qual.qualificationId} className="border rounded-xl overflow-hidden">
              <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-muted/30">
                <div className="flex items-center gap-3 flex-1 text-left">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <GraduationCap className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-foreground">{qual.qualificationName}</span>
                      <Badge variant="outline" className="text-[10px]">{qual.awardingBody}</Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground">
                      <span>{qual.totalLearners} learner{qual.totalLearners !== 1 ? "s" : ""}</span>
                      <span>{qualTotal} units total</span>
                      {qualAwaitingIQA > 0 && (
                        <Badge className="bg-purple-100 text-purple-700 text-[10px] border-purple-200">
                          {qualAwaitingIQA} awaiting IQA
                        </Badge>
                      )}
                      <span className="text-[10px]">{qualApproved}/{qualTotal} signed off</span>
                    </div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-5 pb-4">
                <Accordion type="multiple" className="space-y-3">
                  {qual.learners.map((learner) => {
                    const learnerAwaitingIQA = learner.units.filter(u => u.status === "Awaiting IQA").length;
                    const learnerActionReq = learner.units.filter(u => u.status === "Action Required").length;

                    return (
                      <AccordionItem key={learner.learnerId} value={learner.learnerId} className="border rounded-lg overflow-hidden">
                        <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/20">
                          <div className="flex items-center gap-3 flex-1 text-left">
                            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                              <Users className="w-4 h-4 text-secondary-foreground" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-semibold text-foreground">{learner.learnerName}</span>
                                <span className="text-[11px] text-muted-foreground">({learner.learnerId})</span>
                              </div>
                              <div className="flex items-center gap-3 mt-1">
                                <Progress value={learner.overallProgress} className="w-24 h-1.5" />
                                <span className="text-[10px] text-muted-foreground">{learner.overallProgress}% overall</span>
                                {learnerAwaitingIQA > 0 && (
                                  <Badge className="bg-purple-100 text-purple-700 text-[10px] border-purple-200">
                                    {learnerAwaitingIQA} awaiting
                                  </Badge>
                                )}
                                {learnerActionReq > 0 && (
                                  <Badge className="bg-destructive/10 text-destructive text-[10px] border-destructive/20">
                                    {learnerActionReq} action req
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pb-3 space-y-2">
                          {learner.units.map((unit) => (
                            <UnitRow key={unit.unitCode} unit={unit} />
                          ))}
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
};

export default QualificationTreeView;
