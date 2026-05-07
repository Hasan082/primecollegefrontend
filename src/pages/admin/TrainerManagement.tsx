import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  useGetTrainerManagementQuery,
  useGetTrainerOptionsQuery,
  useReassignTrainerMutation,
  TrainerManagementItem,
  TrainerManagementParams,
  useUpdateStaffMutation,
} from "@/redux/apis/staffApi";
import { Search, Plus, ArrowLeft, UserCheck, Users, ChevronDown, ChevronUp, Power, Eye, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import TablePagination from "@/components/admin/TablePagination";
import TrainerDetailModal from "@/components/admin/TrainerDetailModal";
import { StaffCreateForm } from "@/components/admin/StaffCreateForm";

const ITEMS_PER_PAGE = 10;

const TrainerManagement = () => {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [reassignDialog, setReassignDialog] = useState<{ enrollmentId: string; learnerName: string; trainerName: string } | null>(null);
  const [reassignTrainerId, setReassignTrainerId] = useState("");
  const [expandedTrainers, setExpandedTrainers] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTrainer, setSelectedTrainer] = useState<TrainerManagementItem | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const { toast } = useToast();

  const [reassignTrainer, { isLoading: isReassigning }] = useReassignTrainerMutation();
  const { data: trainerOptionsData } = useGetTrainerOptionsQuery();
  const [updateStaff] = useUpdateStaffMutation();

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await updateStaff({ id, body: { is_active: !currentStatus } }).unwrap();
      toast({ title: "Status updated successfully" });
      refetch();
    } catch (error) {
      toast({ title: "Failed to update status", variant: "destructive" });
    }
  };

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const queryParams: TrainerManagementParams = {
    page: currentPage,
    page_size: ITEMS_PER_PAGE,
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
  };

  const { data, isLoading, isFetching, refetch } = useGetTrainerManagementQuery(queryParams);

  const trainers = data?.data?.results ?? [];
  const totalCount = data?.data?.count ?? 0;

  const toggleExpand = (id: string) => {
    setExpandedTrainers((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleReassignConfirm = async () => {
    if (!reassignDialog || !reassignTrainerId) return;
    try {
      await reassignTrainer({
        enrolment_id: reassignDialog.enrollmentId,
        assessor_id: reassignTrainerId,
      }).unwrap();
      toast({ title: "Learner reassigned successfully" });
      setReassignDialog(null);
      setReassignTrainerId("");
      refetch();
    } catch (err: any) {
      toast({
        title: "Reassignment failed",
        description: err?.data?.detail || err?.data?.message || "Something went wrong.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Link to="/admin/dashboard" className="inline-flex items-center gap-1.5 text-primary hover:underline text-sm">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Trainer Management</h1>
          <p className="text-sm text-muted-foreground">Manage trainers and learner assignments</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-1" /> Add Trainer</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Trainer</DialogTitle>
            </DialogHeader>
            <StaffCreateForm
              role="trainer"
              onSuccess={() => { setDialogOpen(false); refetch(); }}
              onCancel={() => setDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search trainers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : trainers.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <UserCheck className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No trainers found.</p>
        </div>
      ) : (
        <div className={`grid gap-4 transition-opacity ${isFetching ? "opacity-60" : ""}`}>
          {trainers.map((t) => {
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
                        <h3 className="font-semibold">{t.full_name}</h3>
                        <p className="text-sm text-muted-foreground">{t.email}</p>
                        <div className="flex gap-1.5 mt-1">
                          {Array.isArray(t.specialisms) &&
                            t.specialisms.map((s) => (
                              <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
                            ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-center">
                        <p className="text-lg font-bold">{t.assigned_learners_count}</p>
                        <p className="text-xs text-muted-foreground">Learners</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold">{t.pending_reviews_count}</p>
                        <p className="text-xs text-muted-foreground">Pending</p>
                      </div>
                      <Badge variant={t.status === "active" ? "default" : "secondary"}>
                        {t.status.charAt(0).toUpperCase() + t.status.slice(1)}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`h-8 w-8 p-0 ${t.is_active ? 'text-destructive hover:text-destructive hover:bg-destructive/10' : 'text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50'}`}
                        onClick={() => handleToggleActive(t.id, t.is_active)}
                        title={t.is_active ? "Deactivate" : "Activate"}
                      >
                        <Power className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => { setSelectedTrainer(t); setDetailOpen(true); }}
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {t.assigned_learners.length > 0 && (
                    <div className="mt-4 border-t pt-3">
                      <button
                        onClick={() => toggleExpand(t.id)}
                        className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors w-full"
                      >
                        <Users className="w-3 h-3" />
                        Assigned Learners ({t.assigned_learners.length})
                        {isExpanded ? <ChevronUp className="w-3 h-3 ml-auto" /> : <ChevronDown className="w-3 h-3 ml-auto" />}
                      </button>
                      {isExpanded && (
                        <div className="space-y-1.5 mt-2 max-h-[220px] overflow-y-auto pr-1">
                          {t.assigned_learners.map((entry) => (
                            <div key={entry.id} className="flex items-center justify-between text-sm bg-muted/30 rounded-md px-3 py-1.5">
                              <span>
                                {entry.learner.name} — <span className="text-muted-foreground">{entry.qualification.title}</span>
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs h-7"
                                onClick={() => {
                                  setReassignTrainerId("");
                                  setReassignDialog({
                                    enrollmentId: entry.id,
                                    learnerName: entry.learner.name,
                                    trainerName: t.full_name,
                                  });
                                }}
                              >
                                Reassign
                              </Button>
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
      )}

      {/* Reassign Dialog */}
      <Dialog
        open={!!reassignDialog}
        onOpenChange={(o) => { if (!o) { setReassignDialog(null); setReassignTrainerId(""); } }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reassign {reassignDialog?.learnerName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <p className="text-sm text-muted-foreground">
              Currently assigned to <strong>{reassignDialog?.trainerName}</strong>
            </p>
            <div className="space-y-1.5">
              <Label>New Trainer</Label>
              <Select
                value={reassignTrainerId}
                onValueChange={setReassignTrainerId}
              >
                <SelectTrigger><SelectValue placeholder="Select trainer" /></SelectTrigger>
                <SelectContent>
                  {(trainerOptionsData?.data ?? [])
                    .map((o) => (
                      <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              className="w-full"
              disabled={!reassignTrainerId || isReassigning}
              onClick={handleReassignConfirm}
            >
              {isReassigning && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Confirm Reassignment
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <TablePagination
        currentPage={currentPage}
        totalItems={totalCount}
        itemsPerPage={ITEMS_PER_PAGE}
        onPageChange={setCurrentPage}
      />

      <TrainerDetailModal
        trainer={trainers.find(t => t.id === selectedTrainer?.id) || selectedTrainer}
        open={detailOpen}
        onOpenChange={(o) => { setDetailOpen(o); if (!o) setSelectedTrainer(null); }}
      />
    </div>
  );
};

export default TrainerManagement;
