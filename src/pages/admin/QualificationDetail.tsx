import { useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, GraduationCap, Users, Calendar, Banknote, Plus, Trash2, GripVertical, FileUp, X, ChevronDown, ChevronUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { adminQualifications, QualificationUnit } from "@/data/adminMockData";
import UnitAssessmentConfig from "@/components/trainer/UnitAssessmentConfig";
import { useToast } from "@/hooks/use-toast";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const UNITS_STORAGE_KEY = "admin_qualification_units";
const RESOURCES_STORAGE_KEY = "admin_unit_resources";

interface UnitResource {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadedAt: string;
}

const loadUnits = (qualificationId: string, fallback: QualificationUnit[]): QualificationUnit[] => {
  try {
    const saved = localStorage.getItem(UNITS_STORAGE_KEY);
    if (saved) {
      const all = JSON.parse(saved);
      if (all[qualificationId]) return all[qualificationId];
    }
  } catch {}
  return fallback;
};

const saveUnits = (qualificationId: string, units: QualificationUnit[]) => {
  try {
    const saved = localStorage.getItem(UNITS_STORAGE_KEY);
    const all = saved ? JSON.parse(saved) : {};
    all[qualificationId] = units;
    localStorage.setItem(UNITS_STORAGE_KEY, JSON.stringify(all));
  } catch {}
};

const loadResources = (unitCode: string): UnitResource[] => {
  try {
    const saved = localStorage.getItem(RESOURCES_STORAGE_KEY);
    if (saved) {
      const all = JSON.parse(saved);
      return all[unitCode] || [];
    }
  } catch {}
  return [];
};

const saveResources = (unitCode: string, resources: UnitResource[]) => {
  try {
    const saved = localStorage.getItem(RESOURCES_STORAGE_KEY);
    const all = saved ? JSON.parse(saved) : {};
    all[unitCode] = resources;
    localStorage.setItem(RESOURCES_STORAGE_KEY, JSON.stringify(all));
  } catch {}
};

// Sortable unit row component
const SortableUnitRow = ({
  unit,
  onDelete,
  onToggleExpand,
  isExpanded,
  resources,
  onAddResource,
  onRemoveResource,
}: {
  unit: QualificationUnit;
  onDelete: (code: string) => void;
  onToggleExpand: (code: string) => void;
  isExpanded: boolean;
  resources: UnitResource[];
  onAddResource: (unitCode: string, file: File) => void;
  onRemoveResource: (unitCode: string, resourceId: string) => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: unit.code });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card className="p-0 overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3">
          <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground">
            <GripVertical className="w-4 h-4" />
          </button>
          <Badge variant="outline" className="font-mono text-xs shrink-0">{unit.code}</Badge>
          <span className="text-sm font-medium flex-1">{unit.name}</span>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => onToggleExpand(unit.code)}>
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive hover:text-destructive" onClick={() => onDelete(unit.code)}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>

        {isExpanded && (
          <div className="border-t bg-muted/20 px-4 py-3 space-y-3">
            {/* Assessment Config */}
            <UnitAssessmentConfig unitCode={unit.code} unitName={unit.name} />

            {/* Resources */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Resources</p>
                <label className="cursor-pointer">
                  <Input
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.png,.mp4"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) onAddResource(unit.code, file);
                      e.target.value = "";
                    }}
                  />
                  <span className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                    <FileUp className="w-3 h-3" /> Upload
                  </span>
                </label>
              </div>
              {resources.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">No resources uploaded yet.</p>
              ) : (
                <div className="space-y-1">
                  {resources.map((r) => (
                    <div key={r.id} className="flex items-center justify-between text-xs bg-background rounded px-2 py-1.5 border">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">{r.type}</Badge>
                        <span className="font-medium">{r.name}</span>
                        <span className="text-muted-foreground">{r.size}</span>
                      </div>
                      <Button variant="ghost" size="sm" className="h-5 w-5 p-0 text-destructive" onClick={() => onRemoveResource(unit.code, r.id)}>
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

const QualificationDetail = () => {
  const { qualificationId } = useParams();
  const qualification = adminQualifications.find((q) => q.id === qualificationId);
  const { toast } = useToast();

  const [units, setUnits] = useState<QualificationUnit[]>(() =>
    loadUnits(qualificationId || "", qualification?.units || [])
  );
  const [expandedUnits, setExpandedUnits] = useState<Set<string>>(new Set());
  const [resourcesMap, setResourcesMap] = useState<Record<string, UnitResource[]>>(() => {
    const map: Record<string, UnitResource[]> = {};
    (qualification?.units || []).forEach((u) => { map[u.code] = loadResources(u.code); });
    return map;
  });

  // Add unit dialog
  const [addOpen, setAddOpen] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [newName, setNewName] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setUnits((prev) => {
        const oldIdx = prev.findIndex((u) => u.code === active.id);
        const newIdx = prev.findIndex((u) => u.code === over.id);
        const reordered = arrayMove(prev, oldIdx, newIdx);
        saveUnits(qualificationId || "", reordered);
        return reordered;
      });
    }
  }, [qualificationId]);

  const handleAddUnit = () => {
    if (!newCode.trim() || !newName.trim()) {
      toast({ title: "Code and Name are required", variant: "destructive" });
      return;
    }
    if (units.some((u) => u.code === newCode.trim())) {
      toast({ title: "Unit code already exists", variant: "destructive" });
      return;
    }
    const updated = [...units, { code: newCode.trim(), name: newName.trim() }];
    setUnits(updated);
    saveUnits(qualificationId || "", updated);
    setNewCode("");
    setNewName("");
    setAddOpen(false);
    toast({ title: "Unit added" });
  };

  const handleDeleteUnit = (code: string) => {
    const updated = units.filter((u) => u.code !== code);
    setUnits(updated);
    saveUnits(qualificationId || "", updated);
    toast({ title: "Unit removed" });
  };

  const toggleExpand = (code: string) => {
    setExpandedUnits((prev) => {
      const next = new Set(prev);
      next.has(code) ? next.delete(code) : next.add(code);
      return next;
    });
  };

  const handleAddResource = (unitCode: string, file: File) => {
    const ext = file.name.split(".").pop()?.toUpperCase() || "FILE";
    const sizeKB = Math.round(file.size / 1024);
    const sizeStr = sizeKB > 1024 ? `${(sizeKB / 1024).toFixed(1)} MB` : `${sizeKB} KB`;
    const resource: UnitResource = {
      id: `r-${Date.now()}`,
      name: file.name,
      type: ext,
      size: sizeStr,
      uploadedAt: new Date().toLocaleDateString("en-GB"),
    };
    const updated = [...(resourcesMap[unitCode] || []), resource];
    setResourcesMap((prev) => ({ ...prev, [unitCode]: updated }));
    saveResources(unitCode, updated);
    toast({ title: `"${file.name}" uploaded` });
  };

  const handleRemoveResource = (unitCode: string, resourceId: string) => {
    const updated = (resourcesMap[unitCode] || []).filter((r) => r.id !== resourceId);
    setResourcesMap((prev) => ({ ...prev, [unitCode]: updated }));
    saveResources(unitCode, updated);
  };

  if (!qualification) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Qualification not found.</p>
        <Link to="/admin/qualifications" className="text-primary underline mt-2 inline-block">Back to Qualifications</Link>
      </div>
    );
  }

  const statusMap = { active: "default", draft: "secondary", archived: "outline" } as const;

  return (
    <div className="space-y-6">
      <Link to="/admin/qualifications" className="inline-flex items-center gap-1.5 text-primary hover:underline text-sm">
        <ArrowLeft className="w-4 h-4" /> Back to Qualifications
      </Link>

      {/* Header */}
      <Card className="bg-primary text-primary-foreground p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-primary-foreground/70 text-sm mb-1">{qualification.code} • {qualification.awardingBody}</p>
            <h1 className="text-2xl font-bold">{qualification.title}</h1>
            <div className="flex items-center gap-4 mt-3 text-sm text-primary-foreground/80">
              <span className="flex items-center gap-1"><GraduationCap className="w-4 h-4" /> {qualification.level}</span>
              <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {qualification.enrolledLearners} learners</span>
              <span className="flex items-center gap-1"><Banknote className="w-4 h-4" /> £{qualification.price.toLocaleString()}</span>
              <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {qualification.accessDuration}</span>
            </div>
          </div>
          <Badge variant={statusMap[qualification.status]} className="text-xs">
            {qualification.status.charAt(0).toUpperCase() + qualification.status.slice(1)}
          </Badge>
        </div>
      </Card>

      {/* Units Section */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-lg font-bold text-foreground">Units ({units.length})</h2>
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <Plus className="w-4 h-4 mr-1" /> Add Unit
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Drag to reorder. Expand a unit to configure assessments and upload resources.
        </p>
        <Separator className="mb-4" />

        {units.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground text-sm">No units defined yet. Click "Add Unit" to get started.</p>
          </Card>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={units.map((u) => u.code)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {units.map((unit) => (
                  <SortableUnitRow
                    key={unit.code}
                    unit={unit}
                    onDelete={handleDeleteUnit}
                    onToggleExpand={toggleExpand}
                    isExpanded={expandedUnits.has(unit.code)}
                    resources={resourcesMap[unit.code] || []}
                    onAddResource={handleAddResource}
                    onRemoveResource={handleRemoveResource}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Add Unit Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add New Unit</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label>Unit Code *</Label>
              <Input value={newCode} onChange={(e) => setNewCode(e.target.value)} placeholder="e.g. BUS313" />
            </div>
            <div className="space-y-1.5">
              <Label>Unit Name *</Label>
              <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Digital Marketing" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={handleAddUnit}>Add Unit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default QualificationDetail;
