import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Shield, Mail, Calendar, Pencil, Save, X, BookOpen, Power } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { adminQualifications } from "@/data/adminMockData";

interface IQAUser {
  id: string;
  name: string;
  email: string;
  status: "active" | "inactive";
  assignedQualifications: string[];
  createdDate: string;
}

interface Props {
  iqa: IQAUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate?: (updated: IQAUser) => void;
}

const IQADetailModal = ({ iqa, open, onOpenChange, onUpdate }: Props) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const { toast } = useToast();

  if (!iqa) return null;

  const getQualTitle = (id: string) => adminQualifications.find((q) => q.id === id)?.title || id;
  const getQualLevel = (id: string) => adminQualifications.find((q) => q.id === id)?.level || "";
  const getQualLearners = (id: string) => adminQualifications.find((q) => q.id === id)?.enrolledLearners || 0;

  const startEdit = () => {
    setEditName(iqa.name);
    setEditEmail(iqa.email);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
  };

  const saveEdit = () => {
    if (!editName.trim() || !editEmail.trim()) {
      toast({ title: "Name and email are required", variant: "destructive" });
      return;
    }
    onUpdate?.({ ...iqa, name: editName.trim(), email: editEmail.trim() });
    setIsEditing(false);
    toast({ title: "IQA details updated" });
  };

  const handleToggleStatus = () => {
    const newStatus = iqa.status === "active" ? "inactive" : "active";
    onUpdate?.({ ...iqa, status: newStatus });
    toast({ title: `${iqa.name} ${newStatus === "active" ? "activated" : "deactivated"}` });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            IQA Detail
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh]">
          <div className="space-y-5 pr-2">
            {/* Profile Card */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                      <Shield className="w-7 h-7 text-primary" />
                    </div>
                    <div>
                      {isEditing ? (
                        <div className="space-y-2">
                          <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="h-8 text-sm font-semibold" />
                          <Input value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className="h-8 text-sm" />
                        </div>
                      ) : (
                        <>
                          <h3 className="font-semibold text-lg">{iqa.name}</h3>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Mail className="w-3.5 h-3.5" /> {iqa.email}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {isEditing ? (
                      <>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={cancelEdit}><X className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={saveEdit}><Save className="w-4 h-4" /></Button>
                      </>
                    ) : (
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={startEdit}><Pencil className="w-4 h-4" /></Button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Created</p>
                      <p className="font-medium">{iqa.createdDate}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Qualifications</p>
                      <p className="font-medium">{iqa.assignedQualifications.length}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-3 border-t">
                  <div className="flex items-center gap-2">
                    <Label className="text-sm">Status</Label>
                    <Badge variant={iqa.status === "active" ? "default" : "secondary"}>
                      {iqa.status.charAt(0).toUpperCase() + iqa.status.slice(1)}
                    </Badge>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={handleToggleStatus}
                  >
                    <Power className={`w-3.5 h-3.5 mr-1 ${iqa.status === "active" ? "text-destructive" : "text-green-600"}`} />
                    {iqa.status === "active" ? "Deactivate" : "Activate"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Assigned Qualifications */}
            <Card>
              <CardContent className="p-4">
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-primary" />
                  Assigned Qualifications ({iqa.assignedQualifications.length})
                </h4>
                {iqa.assignedQualifications.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">No qualifications assigned yet.</p>
                ) : (
                  <div className="space-y-2">
                    {iqa.assignedQualifications.map((qId) => (
                      <div key={qId} className="p-3 rounded-lg border bg-muted/30">
                        <p className="text-sm font-medium">{getQualTitle(qId)}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-muted-foreground">{getQualLevel(qId)}</span>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground">{getQualLearners(qId)} learners enrolled</span>
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

export default IQADetailModal;
