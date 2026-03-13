import { useState } from "react";
import { Link } from "react-router-dom";
import { Users, Clock, CheckCircle, AlertCircle, Eye, FileText, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { pendingSubmissions, trainerLearners, recentAssessments } from "@/data/trainerMockData";
import TablePagination from "@/components/admin/TablePagination";
import IQANotificationsPanel from "@/components/trainer/IQANotificationsPanel";
import { getActionRequiredCount } from "@/lib/iqaNotifications";

const findLearnerId = (lrnCode: string) => {
  const learner = trainerLearners.find((l) => l.learnerId === lrnCode);
  return learner?.id || "";
};

const iqaActionCount = getActionRequiredCount();

const stats = [
  { label: "Assigned Learners", value: trainerLearners.length, icon: Users, color: "bg-primary text-primary-foreground" },
  { label: "Pending Assessments", value: pendingSubmissions.length, icon: Clock, color: "bg-secondary text-secondary-foreground" },
  { label: "Assessed This Week", value: 12, icon: CheckCircle, color: "bg-green-600 text-white" },
  { label: "IQA Actions", value: iqaActionCount, icon: ShieldAlert, color: iqaActionCount > 0 ? "bg-destructive text-destructive-foreground" : "bg-muted text-muted-foreground" },
];

const outcomeColors: Record<string, string> = {
  "Competent": "bg-green-600 text-white",
  "Resubmission Required": "bg-secondary text-secondary-foreground",
  "Not Yet Competent": "bg-destructive text-destructive-foreground",
};

const ITEMS_PER_PAGE = 10;

const TrainerDashboard = () => {
  const [pendingPage, setPendingPage] = useState(1);
  const [learnersPage, setLearnersPage] = useState(1);
  const [recentPage, setRecentPage] = useState(1);

  return (
    <div>
      <h1 className="text-3xl font-bold text-foreground mb-1">Assessment Dashboard</h1>
      <p className="text-muted-foreground mb-8">Review submissions and provide assessment outcomes</p>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <Card key={s.label} className="p-5 flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${s.color}`}>
              <s.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* IQA Notifications */}
      <IQANotificationsPanel />

      {/* Tabs */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">Pending Submissions</TabsTrigger>
          <TabsTrigger value="learners">Assigned Learners</TabsTrigger>
          <TabsTrigger value="recent">Recent Assessments</TabsTrigger>
        </TabsList>

        {/* Pending Submissions */}
        <TabsContent value="pending">
          <Card className="p-6">
            <h2 className="text-lg font-bold text-primary mb-1">Submissions Awaiting Assessment</h2>
            <p className="text-sm text-muted-foreground mb-4">Review and assess submitted evidence</p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Learner</TableHead>
                  <TableHead>Qualification</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Wait</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingSubmissions.slice((pendingPage - 1) * ITEMS_PER_PAGE, pendingPage * ITEMS_PER_PAGE).map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell className="font-medium text-primary">{sub.learnerName}</TableCell>
                    <TableCell>
                      <div>{sub.qualification}</div>
                      <Badge className="bg-primary text-primary-foreground text-[10px] mt-0.5">{sub.qualificationCategory}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">{sub.unitCode}: {sub.unitTitle.length > 30 ? sub.unitTitle.slice(0, 30) + '...' : sub.unitTitle}</TableCell>
                    <TableCell className="text-sm">{sub.submittedDate}</TableCell>
                    <TableCell>
                      <Badge className={`${sub.daysWaiting >= 4 ? 'bg-destructive' : sub.daysWaiting >= 3 ? 'bg-secondary' : 'bg-green-600'} text-white text-xs`}>
                        {sub.daysWaiting}d
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Link
                        to={`/trainer/learner/${findLearnerId(sub.learnerId)}/unit/${sub.unitCode}`}
                        className="inline-flex items-center px-3 py-1.5 bg-secondary text-secondary-foreground text-xs font-semibold rounded-md hover:opacity-90 transition-opacity"
                      >
                        Review
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <TablePagination currentPage={pendingPage} totalItems={pendingSubmissions.length} itemsPerPage={ITEMS_PER_PAGE} onPageChange={setPendingPage} />
          </Card>
        </TabsContent>

        {/* Assigned Learners */}
        <TabsContent value="learners">
          <Card className="p-6">
            <h2 className="text-lg font-bold text-primary mb-1">Assigned Learners</h2>
            <p className="text-sm text-muted-foreground mb-4">Monitor progress of learners in your cohort</p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Learner Name</TableHead>
                  <TableHead>Qualification</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Pending</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trainerLearners.slice((learnersPage - 1) * ITEMS_PER_PAGE, learnersPage * ITEMS_PER_PAGE).map((l) => (
                  <TableRow key={l.id}>
                    <TableCell className="font-medium text-primary">{l.name}</TableCell>
                    <TableCell>
                      <div className="text-sm">{l.qualification}</div>
                      <Badge className="bg-primary text-primary-foreground text-[10px] mt-0.5">{l.qualificationCategory}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {l.unitsCompleted}/{l.totalUnits} ({l.progress}%)
                    </TableCell>
                    <TableCell>
                      {l.pendingSubmissions > 0 ? (
                        <Badge className="bg-secondary text-secondary-foreground text-xs">{l.pendingSubmissions}</Badge>
                      ) : (
                        <span className="text-sm text-muted-foreground">None</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="icon" className="h-8 w-8" asChild>
                        <Link to={`/trainer/learner/${l.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <TablePagination currentPage={learnersPage} totalItems={trainerLearners.length} itemsPerPage={ITEMS_PER_PAGE} onPageChange={setLearnersPage} />
          </Card>
        </TabsContent>

        {/* Recent Assessments */}
        <TabsContent value="recent">
          <Card className="p-6">
            <h2 className="text-lg font-bold text-primary mb-1">Recent Assessments</h2>
            <p className="text-sm text-muted-foreground mb-4">Your recently completed assessments</p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Learner</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Outcome</TableHead>
                  <TableHead>Assessed Date</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentAssessments.slice((recentPage - 1) * ITEMS_PER_PAGE, recentPage * ITEMS_PER_PAGE).map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium text-primary">{a.learnerName}</TableCell>
                    <TableCell className="text-sm">{a.unitCode}: {a.unitTitle}</TableCell>
                    <TableCell>
                      <Badge className={outcomeColors[a.outcome]}>{a.outcome}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">{a.assessedDate}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="icon" className="h-8 w-8" asChild>
                        <Link to={`/trainer/record/${a.id}`}>
                          <FileText className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <TablePagination currentPage={recentPage} totalItems={recentAssessments.length} itemsPerPage={ITEMS_PER_PAGE} onPageChange={setRecentPage} />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TrainerDashboard;
