import CourseEvaluationEditor from "@/components/admin/CourseEvaluationEditor";
import LearnerDeclarationEditor from "@/components/admin/LearnerDeclarationEditor";
import { SortableUnitRow } from "@/components/shared/qualificationManagement/sections/SortableUnitRow";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { formatPrice } from "@/lib/utils";
import {
  useCreateUnitMutation,
  useDeleteUnitMutation,
  useGetUnitConfigSummaryQuery,
  useGetUnitsQuery,
  useUpdateUnitMutation,
} from "@/redux/apis/qualification/qualificationUnitApi";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import {
  AlertCircle,
  ArrowLeft,
  Banknote,
  Calendar,
  FileText,
  GraduationCap,
  Loader2,
  Plus,
  Settings,
  Shield,
  Users
} from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";

// ─── Main Page Component ─────────────────────────────────────────────
const QualificationDetail = () => {
  const { qualificationId } = useParams();
  const { toast } = useToast();

  const { data: summaryData, isLoading: isLoadingSummary } = useGetUnitConfigSummaryQuery(qualificationId!, { skip: !qualificationId || qualificationId === "0" });
  const { data: unitsData, isLoading: isLoadingUnits } = useGetUnitsQuery(qualificationId!, { skip: !qualificationId || qualificationId === "0" });
  const summary = summaryData;
  const units = Array.isArray(unitsData) ? unitsData : [];

  console.log("units", units);

  const [createUnit] = useCreateUnitMutation();
  const [deleteUnit] = useDeleteUnitMutation();
  const [updateUnit] = useUpdateUnitMutation();

  const [expandedUnits, setExpandedUnits] = useState<Set<string>>(new Set());

  // Add unit dialog
  const [addOpen, setAddOpen] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [newName, setNewName] = useState("");
  const [newIsMandatory, setNewIsMandatory] = useState(true);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIdx = units.findIndex((u) => u.id === active.id);
      const newIdx = units.findIndex((u) => u.id === over.id);

      const movedItem = units[oldIdx];
      try {
        await updateUnit({ unitId: movedItem.id, payload: { order: newIdx + 1 } }).unwrap();
      } catch (err) {
        toast({ title: "Failed to reorder", variant: "destructive" });
      }
    }
  };

  const handleAddUnit = async () => {
    if (!newCode.trim() || !newName.trim()) {
      toast({ title: "Code and Name are required", variant: "destructive" });
      return;
    }
    try {
      await createUnit({
        qualificationId: qualificationId!,
        payload: {
          unit_code: newCode.trim(),
          title: newName.trim(),
          order: units.length + 1,
          is_mandatory: newIsMandatory,
        }
      }).unwrap();
      setNewCode("");
      setNewName("");
      setNewIsMandatory(true);
      setAddOpen(false);
      toast({ title: "Unit added successfully" });
    } catch (err) {
      toast({ title: "Failed to add unit", variant: "destructive" });
    }
  };

  const handleDeleteUnit = async (unitId: string, code: string) => {
    if (!confirm(`Are you sure you want to delete unit ${code}?`)) return;
    try {
      await deleteUnit({ unitId, qualificationId: qualificationId! }).unwrap();
      toast({ title: "Unit removed" });
    } catch (err) {
      toast({ title: "Failed to remove unit", variant: "destructive" });
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedUnits((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  if (isLoadingSummary || isLoadingUnits) {
    return <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
      <Loader2 className="w-10 h-10 animate-spin text-primary" />
      <p className="text-muted-foreground animate-pulse">Loading unit configuration...</p>
    </div>;
  }

  if (!summary || qualificationId === "0") {
    return (
      <div className="text-center py-20 bg-muted/20 rounded-3xl border border-dashed">
        <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-foreground font-semibold">Qualification not found or invalid ID.</p>
        <Link to="/admin/qualifications" className="text-primary hover:underline mt-2 inline-block">Back to Qualifications Management</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild className="gap-2 -ml-2 text-muted-foreground hover:text-primary">
          <Link to="/admin/qualifications">
            <ArrowLeft className="w-4 h-4" /> Back to Qualifications
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Qualification Management</h1>
        <p className="text-muted-foreground text-xs">Create, edit, and manage qualifications and units</p>
      </div>

      {/* Header Card */}
      <Card className="bg-primary text-primary-foreground overflow-hidden border-none shadow-xl relative group">
        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="space-y-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge className="bg-white/20 hover:bg-white/30 text-white border-none font-mono tracking-wider text-[10px] py-0.5 uppercase">
                    {summary.qualification_code}
                  </Badge>
                  <span className="text-white/40 font-bold">•</span>
                  <span className="text-primary-foreground/90 font-bold tracking-wide uppercase text-[10px]">
                    {summary.awarding_body_name || summary.awarding_body || "Not set"}
                  </span>
                </div>
                <h2 className="text-2xl font-extrabold tracking-tight leading-tight max-w-2xl">{summary.title}</h2>
              </div>

              <div className="flex flex-wrap items-center gap-6 pt-2">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] text-white/50 uppercase font-bold tracking-wider leading-none">Level</p>
                    <p className="text-sm font-bold">{summary.level}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 border-l border-white/10 pl-6">
                  <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] text-white/50 uppercase font-bold tracking-wider leading-none">Learners</p>
                    <p className="text-sm font-bold">{summary.active_enrolments_count}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 border-l border-white/10 pl-6">
                  <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
                    <Banknote className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] text-white/50 uppercase font-bold tracking-wider leading-none mb-1">Price</p>
                    <p className="text-sm font-bold text-white">{formatPrice(summary.current_price, summary.currency)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 border-l border-white/10 pl-6">
                  <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] text-white/50 uppercase font-bold tracking-wider leading-none">Duration</p>
                    <p className="text-sm font-bold">{summary.duration}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-3">
              <Badge variant="secondary" className={`px-4 py-1.5 font-bold tracking-wide border-none uppercase text-[10px] ${summary.status === "active" ? "bg-white text-primary" : "bg-emerald-500 text-white"
                }`}>
                {summary.status}
              </Badge>
              {summary.is_cpd && (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full border border-white/10">
                  <Settings className="w-3 h-3" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/80">CPD Enabled</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CPD Final Assessment Card */}
      {summary.is_cpd && (
        <Card className="border-2 border-primary/20 shadow-lg overflow-hidden group">
          <div className="flex flex-col md:flex-row md:items-center justify-between p-6 gap-6">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                <Shield className="w-7 h-7 text-primary" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-foreground">Final Assessment</h3>
                  <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[10px] uppercase font-bold tracking-widest px-2 py-0">Qualification Level</Badge>
                </div>
                <p className="text-sm text-muted-foreground max-w-xl">
                  Configure the mandatory final exam that learners must pass to achieve this CPD qualification.
                  Manage the question pool, pass marks, and anti-cheat settings.
                </p>
              </div>
            </div>
            <Button asChild className="shrink-0 gap-2 font-bold shadow-md h-12 px-6">
              <Link to={`/admin/qualifications/${qualificationId}/final-assessment`}>
                <Settings className="w-4 h-4" /> Manage Assessment
              </Link>
            </Button>
          </div>
        </Card>
      )}

      {/* Tabs: Units, Declaration, Evaluation */}
      <Tabs defaultValue="units" className="space-y-4">
        <TabsList>
          <TabsTrigger value="units">Units ({units.length})</TabsTrigger>
          <TabsTrigger value="declaration">Learner Declaration</TabsTrigger>
          <TabsTrigger value="evaluation">Course Evaluation</TabsTrigger>
        </TabsList>

        <TabsContent value="units">
          {/* Units Section */}
          <div className="pt-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-baseline gap-2">
                <h2 className="text-xl font-extrabold text-foreground">Units</h2>
                <span className="text-muted-foreground font-semibold text-sm">({units.length})</span>
              </div>
              <Button onClick={() => setAddOpen(true)} className="gap-2 shadow-sm font-bold">
                <Plus className="w-4 h-4" /> Add Unit
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Systematically configure assessment requirements and study resources for every unit.
            </p>

            <Separator className="mb-6" />

            {units.length === 0 ? (
              <div className="p-16 text-center bg-muted/10 rounded-3xl border-2 border-dashed flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-2">
                  <FileText className="w-8 h-8 text-muted-foreground/50" />
                </div>
                <h3 className="font-bold text-lg">No units defined yet</h3>
                <p className="text-muted-foreground text-sm max-w-xs">Click the button above to add the first unit to this qualification.</p>
              </div>
            ) : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={units.map((u) => u.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-3">
                    {units.map((unit) => (
                      <SortableUnitRow
                        key={unit.id}
                        unit={unit}
                        onDelete={handleDeleteUnit}
                        onToggleExpand={toggleExpand}
                        isExpanded={expandedUnits.has(unit.id)}
                        isCpd={summary.is_cpd}
                        qualificationId={qualificationId || ""}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>
        </TabsContent>

        <TabsContent value="declaration">
          <LearnerDeclarationEditor qualificationId={qualificationId || ""} />
        </TabsContent>

        <TabsContent value="evaluation">
          <CourseEvaluationEditor qualificationId={qualificationId || ""} />
        </TabsContent>
      </Tabs>

      {/* Add Unit Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" />
              Add New Unit
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-6">
            <div className="space-y-2">
              <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Unit Code *</Label>
              <Input
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                placeholder="e.g. BUS301"
                className="h-11 font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Unit Name *</Label>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Principles of Business"
                className="h-11 font-semibold"
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div className="space-y-0.5">
                <Label className="font-bold text-sm">Mandatory Unit</Label>
               
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded ${
                  newIsMandatory ? "bg-red-600 text-white" : "bg-muted text-muted-foreground"
                }`}>
                  {newIsMandatory ? "Mandatory" : "Optional"}
                </span>
                <Switch
                  checked={newIsMandatory}
                  onCheckedChange={setNewIsMandatory}
                />
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setAddOpen(false)} className="font-semibold">Cancel</Button>
            <Button onClick={handleAddUnit} className="font-bold px-6">Create Unit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default QualificationDetail;
