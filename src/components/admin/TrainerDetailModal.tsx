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
import { UserCheck, Users, Clock, CheckCircle2, GraduationCap, Pencil, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { useUpdateStaffMutation, type TrainerManagementItem } from "@/redux/apis/staffApi";
import { Loader2 } from "lucide-react";

const ALL_SPECIALISMS = ["Business", "Care", "Management", "First Aid"];

interface Props {
  trainer: TrainerManagementItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TrainerDetailModal = ({ trainer, open, onOpenChange }: Props) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    email: "",
    specialisms: [] as string[],
    status: "" as TrainerManagementItem["status"],
  });
  const { toast } = useToast();
  const [updateStaff, { isLoading: isUpdating }] = useUpdateStaffMutation();

  if (!trainer) return null;

  const assignedLearners = Array.isArray(trainer.assigned_learners) ? trainer.assigned_learners : [];
  const completedAssessments = assignedLearners.filter(
    (e) => e.progress.progress_percent === 100
  ).length;
  const avgProgress = trainer.average_progress_percent;

  const startEditing = () => {
    setEditData({
      first_name: trainer.first_name,
      middle_name: trainer.middle_name || "",
      last_name: trainer.last_name,
      email: trainer.email,
      specialisms: [...(trainer.specialisms || [])],
      status: trainer.status,
    });
    setIsEditing(true);
  };

  const saveChanges = async () => {
    if (editData.specialisms.length === 0) {
      toast({ title: "At least one specialism required", variant: "destructive" });
      return;
    }

    try {
      await updateStaff({
        id: trainer.id,
        body: {
          first_name: editData.first_name,
          middle_name: editData.middle_name,
          last_name: editData.last_name,
          is_active: editData.status === "active",
          specialisms: editData.specialisms,
        },
      }).unwrap();

      toast({ title: "Trainer updated", description: `${editData.first_name} ${editData.last_name}'s details have been saved.` });
      setIsEditing(false);
    } catch (err: any) {
      toast({
        title: "Update failed",
        description: err?.data?.detail || err?.data?.message || "Failed to update trainer.",
        variant: "destructive",
      });
    }
  };

  const cancelEditing = () => setIsEditing(false);

  const toggleSpecialism = (s: string) => {
    setEditData((d) => ({
      ...d,
      specialisms: d.specialisms.includes(s)
        ? d.specialisms.filter((x) => x !== s)
        : [...d.specialisms, s],
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
              <span>{isEditing ? `${editData.first_name} ${editData.middle_name ? editData.middle_name + " " : ""}${editData.last_name}` : trainer.full_name}</span>
              <p className="text-xs text-muted-foreground font-normal">
                {isEditing ? editData.email : trainer.email}
              </p>
            </div>
            <div className="ml-auto">
              <Badge
                variant={
                  (isEditing ? editData.status : trainer.status) === "active"
                    ? "default"
                    : "secondary"
                }
              >
                {(isEditing ? editData.status : trainer.status).charAt(0).toUpperCase() +
                  (isEditing ? editData.status : trainer.status).slice(1)}
              </Badge>
            </div>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[420px] mt-2">
          <div className="space-y-4 pr-3">
            {/* Edit / Save / Cancel */}
            <div className="flex justify-end gap-2">
              {isEditing ? (
                <>
                  <Button variant="outline" size="sm" onClick={cancelEditing} disabled={isUpdating}>
                    <X className="w-3.5 h-3.5 mr-1" /> Cancel
                  </Button>
                  <Button size="sm" onClick={saveChanges} disabled={isUpdating}>
                    {isUpdating ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Save className="w-3.5 h-3.5 mr-1" />} Save Changes
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
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label className="text-xs">First Name</Label>
                      <Input
                        value={editData.first_name}
                        onChange={(e) => setEditData((d) => ({ ...d, first_name: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Middle Name</Label>
                      <Input
                        value={editData.middle_name}
                        onChange={(e) => setEditData((d) => ({ ...d, middle_name: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Last Name</Label>
                    <Input
                      value={editData.last_name}
                      onChange={(e) => setEditData((d) => ({ ...d, last_name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Email</Label>
                    <Input
                      type="email"
                      value={editData.email}
                      disabled
                      className="bg-muted/50 cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Status</Label>
                    <Select
                      value={editData.status}
                      onValueChange={(v) =>
                        setEditData((d) => ({
                          ...d,
                          status: v as TrainerManagementItem["status"],
                        }))
                      }
                    >
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
                      {ALL_SPECIALISMS.map((s) => (
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
                      <p className="text-xl font-bold">{trainer.assigned_learners_count}</p>
                      <p className="text-[10px] text-muted-foreground">Assigned</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-3 text-center">
                      <Clock className="w-4 h-4 text-amber-500 mx-auto mb-1" />
                      <p className="text-xl font-bold">{trainer.pending_reviews_count}</p>
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
                      {Array.isArray(trainer.specialisms) && trainer.specialisms.length > 0 ? (
                        trainer.specialisms.map((s) => (
                          <Badge key={s} variant="outline">{s}</Badge>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">No specialisms listed.</p>
                      )}
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
                        {assignedLearners.map((entry) => (
                          <div
                            key={entry.id}
                            className="flex items-center justify-between bg-muted/30 rounded-md px-3 py-2"
                          >
                            <div>
                              <p className="text-sm font-medium">{entry.learner.name}</p>
                              <p className="text-xs text-muted-foreground">{entry.qualification.title}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Progress value={entry.progress.progress_percent} className="w-14 h-1.5" />
                              <span className="text-xs text-muted-foreground">
                                {entry.progress.progress_percent}%
                              </span>
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
