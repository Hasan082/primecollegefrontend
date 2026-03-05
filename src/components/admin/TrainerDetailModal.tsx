import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserCheck, Mail, Users, Clock, CheckCircle2, GraduationCap, Pencil, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { AdminTrainer } from "@/data/adminMockData";
import { adminLearners } from "@/data/adminMockData";
import { Progress } from "@/components/ui/progress";

interface Props {
  trainer: AdminTrainer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate?: (updated: AdminTrainer) => void;
}

const ALL_SPECIALISMS = ["Business", "Care", "Management", "First Aid"];

const TrainerDetailModal = ({ trainer, open, onOpenChange, onUpdate }: Props) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ name: "", email: "", specialisms: [] as string[], status: "" as AdminTrainer["status"] });
  const { toast } = useToast();

  if (!trainer) return null;

  const assignedLearners = adminLearners.filter((l) => l.assignedTrainer === trainer.name);
  const completedAssessments = assignedLearners.filter(l => l.status === "completed").length;
  const avgProgress = assignedLearners.length > 0
    ? Math.round(assignedLearners.reduce((sum, l) => sum + l.progress, 0) / assignedLearners.length)
    : 0;

  const startEditing = () => {
    setEditData({
      name: trainer.name,
      email: trainer.email,
      specialisms: [...trainer.specialisms],
      status: trainer.status,
    });
    setIsEditing(true);
  };

  const saveChanges = () => {
    if (editData.specialisms.length === 0) {
      toast({ title: "At least one specialism required", variant: "destructive" });
      return;
    }
    const updated: AdminTrainer = {
      ...trainer,
      name: editData.name.trim(),
      email: editData.email.trim(),
      specialisms: editData.specialisms,
      status: editData.status,
    };
    onUpdate?.(updated);
    setIsEditing(false);
    toast({ title: "Trainer updated", description: `${updated.name}'s details have been saved.` });
  };

  const cancelEditing = () => setIsEditing(false);

  const toggleSpecialism = (s: string) => {
    setEditData(d => ({
      ...d,
      specialisms: d.specialisms.includes(s) ? d.specialisms.filter(x => x !== s) : [...d.specialisms, s],
    }));
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) setIsEditing(false); onOpenChange(o); }}>
      <DialogContent className="max-w-lg max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-primary" />
            </div>
            <div>
              <span>{isEditing ? editData.name : trainer.name}</span>
              <p className="text-xs text-muted-foreground font-normal">{isEditing ? editData.email : trainer.email}</p>
            </div>
            <div className="ml-auto">
              <Badge variant={(isEditing ? editData.status : trainer.status) === "active" ? "default" : "secondary"}>
                {(isEditing ? editData.status : trainer.status).charAt(0).toUpperCase() + (isEditing ? editData.status : trainer.status).slice(1)}
              </Badge>
            </div>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[420px] pr-3 mt-2">
          <div className="space-y-4">
            {/* Edit / Save / Cancel */}
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

            {isEditing ? (
              <Card>
                <CardContent className="p-4 space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Full Name</Label>
                    <Input value={editData.name} onChange={(e) => setEditData(d => ({ ...d, name: e.target.value }))} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Email</Label>
                    <Input type="email" value={editData.email} onChange={(e) => setEditData(d => ({ ...d, email: e.target.value }))} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Status</Label>
                    <Select value={editData.status} onValueChange={(v) => setEditData(d => ({ ...d, status: v as AdminTrainer["status"] }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Specialisms</Label>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      {ALL_SPECIALISMS.map(s => (
                        <label key={s} className="flex items-center gap-2 text-sm cursor-pointer">
                          <Checkbox
                            checked={editData.specialisms.includes(s)}
                            onCheckedChange={() => toggleSpecialism(s)}
                          />
                          {s}
                        </label>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
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
              </>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default TrainerDetailModal;
