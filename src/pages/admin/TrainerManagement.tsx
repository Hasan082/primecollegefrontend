import { useState } from "react";
import { AdminTrainer } from "@/data/adminMockData";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { adminTrainers, adminLearners } from "@/data/adminMockData";
import { Search, Plus, ArrowLeft, UserCheck, Users, ChevronDown, ChevronUp, Power, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import TablePagination from "@/components/admin/TablePagination";
import TrainerDetailModal from "@/components/admin/TrainerDetailModal";

const ITEMS_PER_PAGE = 10;

const TrainerManagement = () => {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [reassignDialog, setReassignDialog] = useState<string | null>(null);
  const [expandedTrainers, setExpandedTrainers] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [trainers, setTrainers] = useState<AdminTrainer[]>(adminTrainers);
  const [selectedTrainer, setSelectedTrainer] = useState<AdminTrainer | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const { toast } = useToast();

  const filtered = trainers.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()) || t.email.toLowerCase().includes(search.toLowerCase())
  );

  const paginatedTrainers = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const getTrainerLearners = (name: string) => adminLearners.filter((l) => l.assignedTrainer === name);

  const toggleExpand = (id: string) => {
    setExpandedTrainers(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleTrainerStatus = (id: string) => {
    const trainer = trainers.find(t => t.id === id);
    if (!trainer) return;
    const newStatus = trainer.status === "active" ? "inactive" as const : "active" as const;
    setTrainers(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
    toast({ title: `${trainer.name} ${newStatus === "active" ? "activated" : "deactivated"}` });
  };

  return (
    <div className="space-y-6">
      <Link to="/admin/dashboard" className="inline-flex items-center gap-1.5 text-primary hover:underline text-sm">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Trainer Management</h1>
          <p className="text-sm text-muted-foreground">Manage trainers/assessors and learner assignments</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-1" /> Add Trainer</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add New Trainer</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-1.5"><Label>Full Name</Label><Input placeholder="e.g. Dr. Helen Clark" /></div>
              <div className="space-y-1.5"><Label>Email</Label><Input type="email" placeholder="trainer@primecollege.edu" /></div>
              <div className="space-y-1.5">
                <Label>Specialisms</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Primary specialism" /></SelectTrigger>
                  <SelectContent>
                    {["Business","Care","Management","First Aid"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full" onClick={() => { setDialogOpen(false); toast({ title: "Trainer added (demo)" }); }}>
                Add Trainer
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search trainers..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="grid gap-4">
        {paginatedTrainers.map((t) => {
          const learners = getTrainerLearners(t.name);
          const isExpanded = expandedTrainers.has(t.id);
          return (
            <Card key={t.id}>
              <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <UserCheck className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{t.name}</h3>
                      <p className="text-sm text-muted-foreground">{t.email}</p>
                      <div className="flex gap-1.5 mt-1">
                        {t.specialisms.map(s => <Badge key={s} variant="outline" className="text-xs">{s}</Badge>)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-center">
                      <p className="text-lg font-bold">{t.assignedLearners}</p>
                      <p className="text-xs text-muted-foreground">Learners</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold">{t.pendingReviews}</p>
                      <p className="text-xs text-muted-foreground">Pending</p>
                    </div>
                    <Badge variant={t.status === "active" ? "default" : "secondary"}>
                      {t.status.charAt(0).toUpperCase() + t.status.slice(1)}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => { setSelectedTrainer(t); setDetailOpen(true); }}
                      title="View details"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => toggleTrainerStatus(t.id)}
                      title={t.status === "active" ? "Deactivate trainer" : "Activate trainer"}
                    >
                      <Power className={`w-4 h-4 ${t.status === "active" ? "text-destructive" : "text-green-600"}`} />
                    </Button>
                  </div>
                </div>

                {learners.length > 0 && (
                  <div className="mt-4 border-t pt-3">
                    <button
                      onClick={() => toggleExpand(t.id)}
                      className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors w-full"
                    >
                      <Users className="w-3 h-3" />
                      Assigned Learners ({learners.length})
                      {isExpanded ? <ChevronUp className="w-3 h-3 ml-auto" /> : <ChevronDown className="w-3 h-3 ml-auto" />}
                    </button>
                    {isExpanded && (
                      <div className="space-y-1.5 mt-2 max-h-[220px] overflow-y-auto pr-1">
                        {learners.map((l) => (
                          <div key={l.id} className="flex items-center justify-between text-sm bg-muted/30 rounded-md px-3 py-1.5">
                            <span>{l.name} — <span className="text-muted-foreground">{l.qualification}</span></span>
                            <Dialog open={reassignDialog === l.id} onOpenChange={(o) => setReassignDialog(o ? l.id : null)}>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-xs h-7">Reassign</Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader><DialogTitle>Reassign {l.name}</DialogTitle></DialogHeader>
                                <div className="space-y-4 pt-2">
                                  <p className="text-sm text-muted-foreground">Currently assigned to <strong>{t.name}</strong></p>
                                  <div className="space-y-1.5">
                                    <Label>New Trainer</Label>
                                    <Select>
                                      <SelectTrigger><SelectValue placeholder="Select trainer" /></SelectTrigger>
                                      <SelectContent>
                                        {trainers.filter(tr => tr.id !== t.id && tr.status === "active").map(tr => (
                                          <SelectItem key={tr.id} value={tr.id}>{tr.name}</SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <Button className="w-full" onClick={() => { setReassignDialog(null); toast({ title: "Learner reassigned (demo)" }); }}>
                                    Confirm Reassignment
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <TablePagination
        currentPage={currentPage}
        totalItems={filtered.length}
        itemsPerPage={ITEMS_PER_PAGE}
        onPageChange={setCurrentPage}
      />

      <TrainerDetailModal trainer={selectedTrainer} open={detailOpen} onOpenChange={setDetailOpen} />
    </div>
  );
};

export default TrainerManagement;
