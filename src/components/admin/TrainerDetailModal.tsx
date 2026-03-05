import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserCheck, Mail, Users, Clock, CheckCircle2, GraduationCap } from "lucide-react";
import type { AdminTrainer, AdminLearner } from "@/data/adminMockData";
import { adminLearners } from "@/data/adminMockData";
import { Progress } from "@/components/ui/progress";

interface Props {
  trainer: AdminTrainer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TrainerDetailModal = ({ trainer, open, onOpenChange }: Props) => {
  if (!trainer) return null;

  const assignedLearners = adminLearners.filter((l) => l.assignedTrainer === trainer.name);

  const completedAssessments = assignedLearners.filter(l => l.status === "completed").length;
  const avgProgress = assignedLearners.length > 0
    ? Math.round(assignedLearners.reduce((sum, l) => sum + l.progress, 0) / assignedLearners.length)
    : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-primary" />
            </div>
            <div>
              <span>{trainer.name}</span>
              <p className="text-xs text-muted-foreground font-normal">{trainer.email}</p>
            </div>
            <div className="ml-auto">
              <Badge variant={trainer.status === "active" ? "default" : "secondary"}>
                {trainer.status.charAt(0).toUpperCase() + trainer.status.slice(1)}
              </Badge>
            </div>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[420px] pr-3 mt-2">
          <div className="space-y-4">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              <Card>
                <CardContent className="p-3 text-center">
                  <Users className="w-4 h-4 text-primary mx-auto mb-1" />
                  <p className="text-xl font-bold">{assignedLearners.length}</p>
                  <p className="text-[10px] text-muted-foreground">Assigned</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 text-center">
                  <Clock className="w-4 h-4 text-amber-500 mx-auto mb-1" />
                  <p className="text-xl font-bold">{trainer.pendingReviews}</p>
                  <p className="text-[10px] text-muted-foreground">Pending</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 text-center">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mx-auto mb-1" />
                  <p className="text-xl font-bold">{completedAssessments}</p>
                  <p className="text-[10px] text-muted-foreground">Completed</p>
                </CardContent>
              </Card>
            </div>

            {/* Specialisms */}
            <Card>
              <CardContent className="p-4">
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-muted-foreground" /> Specialisms
                </h4>
                <div className="flex gap-2 flex-wrap">
                  {trainer.specialisms.map(s => (
                    <Badge key={s} variant="outline">{s}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Average Progress */}
            {assignedLearners.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <h4 className="text-sm font-semibold mb-2">Average Learner Progress</h4>
                  <div className="flex items-center gap-3">
                    <Progress value={avgProgress} className="flex-1 h-2" />
                    <span className="text-sm font-bold">{avgProgress}%</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Assigned Learners */}
            <Card>
              <CardContent className="p-4">
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" /> Assigned Learners
                </h4>
                {assignedLearners.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No learners currently assigned.</p>
                ) : (
                  <div className="space-y-2">
                    {assignedLearners.map((l) => (
                      <div key={l.id} className="flex items-center justify-between bg-muted/30 rounded-md px-3 py-2">
                        <div>
                          <p className="text-sm font-medium">{l.name}</p>
                          <p className="text-xs text-muted-foreground">{l.qualification}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress value={l.progress} className="w-14 h-1.5" />
                          <span className="text-xs text-muted-foreground">{l.progress}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default TrainerDetailModal;
