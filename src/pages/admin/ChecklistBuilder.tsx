import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Trash2,
  GripVertical,
  ClipboardList,
  ChevronDown,
  ChevronUp,
  Pencil,
  Save,
  X,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { adminQualifications } from "@/data/adminMockData";
import {
  useCreateChecklistTemplateMutation,
  useGetChecklistTemplatesQuery,
  useGetQualificationOptionsQuery,
  useGetUnitOptionsByQualificationQuery,
} from "@/redux/apis/qualification/qualificationApi";
import {
  type ChecklistTemplate,
  type ChecklistItem,
  type CheckResponseType,
  loadTemplates,
  saveTemplates,
  RESPONSE_TYPE_LABELS,
} from "@/lib/checklists";

const normalizeResponseType = (responseType: string): CheckResponseType => {
  switch (responseType) {
    case "yes_no":
      return "yes-no";
    case "yes_no_na":
      return "yes-no-na";
    case "met_notmet_na":
      return "met-notmet-na";
    default:
      return "yes-no";
  }
};

const formatChecklistDate = (date: string) =>
  new Date(date).toLocaleDateString("en-GB");

const serializeResponseType = (responseType: CheckResponseType) => {
  switch (responseType) {
    case "yes-no":
      return "yes_no";
    case "yes-no-na":
      return "yes_no_na";
    case "met-notmet-na":
      return "met_notmet_na";
    default:
      return "yes_no";
  }
};

const ChecklistBuilder = () => {
  const { toast } = useToast();
  const [templates, setTemplates] =
    useState<ChecklistTemplate[]>(loadTemplates);
  const [qualFilter, setQualFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Create dialog
  const [createOpen, setCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newQualId, setNewQualId] = useState("");
  const [newUnitId, setNewUnitId] = useState("__qual__");
  const [newStatus, setNewStatus] = useState("active");
  const [newItems, setNewItems] = useState<ChecklistItem[]>([]);
  const [newItemLabel, setNewItemLabel] = useState("");
  const [newItemType, setNewItemType] = useState<CheckResponseType>("yes-no");

  // Edit mode
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editItems, setEditItems] = useState<ChecklistItem[]>([]);
  const [editItemLabel, setEditItemLabel] = useState("");
  const [editItemType, setEditItemType] = useState<CheckResponseType>("yes-no");
  const [createChecklistTemplate, { isLoading: isCreatingChecklist }] =
    useCreateChecklistTemplateMutation();

  const { data: qualificationOptionsResponse } =
    useGetQualificationOptionsQuery(undefined);
  const { data: checklistTemplatesResponse } =
    useGetChecklistTemplatesQuery(undefined);
  const { data: unitOptionsResponse } = useGetUnitOptionsByQualificationQuery(
    newQualId,
    {
      skip: !newQualId,
    },
  );

  const persist = (updated: ChecklistTemplate[]) => {
    setTemplates(updated);
    saveTemplates(updated);
  };

  const qualificationOptions = qualificationOptionsResponse?.data?.length
    ? qualificationOptionsResponse.data
    : adminQualifications;

  const getQualUnits = (qualId: string) =>
    adminQualifications.find((q) => q.id === qualId)?.units || [];

  const createUnitOptions = unitOptionsResponse?.data?.length
    ? unitOptionsResponse.data
    : getQualUnits(newQualId);

  useEffect(() => {
    const apiTemplates = checklistTemplatesResponse?.data?.results?.map(
      (template: {
        id: string;
        qualification_id: string;
        unit_id: string | null;
        title: string;
        items: Array<{
          id: string;
          label: string;
          response_type: string;
        }>;
        created_at: string;
        updated_at: string;
      }) => ({
        id: template.id,
        qualificationId: template.qualification_id,
        unitCode: template.unit_id,
        title: template.title,
        items: template.items.map((item) => ({
          id: item.id,
          label: item.label,
          responseType: normalizeResponseType(item.response_type),
        })),
        createdDate: formatChecklistDate(template.created_at),
        updatedDate: formatChecklistDate(template.updated_at),
      }),
    );

    if (apiTemplates?.length) {
      setTemplates(apiTemplates);
    }
  }, [checklistTemplatesResponse]);

  const filtered = templates.filter(
    (t) => qualFilter === "all" || t.qualificationId === qualFilter,
  );

  const getQualTitle = (id: string) =>
    qualificationOptions.find((q) => q.id === id)?.title || id;

  // ── Create ──
  const addItemToNew = () => {
    if (!newItemLabel.trim()) return;
    setNewItems((prev) => [
      ...prev,
      {
        id: `ci-${Date.now()}`,
        label: newItemLabel.trim(),
        responseType: newItemType,
      },
    ]);
    setNewItemLabel("");
  };

  const removeNewItem = (id: string) =>
    setNewItems((prev) => prev.filter((i) => i.id !== id));

  const handleCreate = async () => {
    if (!newTitle.trim() || !newQualId || newItems.length === 0) {
      toast({
        title: "Title, qualification and at least one check item required",
        variant: "destructive",
      });
      return;
    }

    try {
      await createChecklistTemplate({
        qualification_id: newQualId,
        unit_id: newUnitId === "__qual__" ? null : newUnitId,
        title: newTitle.trim(),
        is_active: newStatus === "active",
        items: newItems.map((item, index) => ({
          label: item.label,
          response_type: serializeResponseType(item.responseType),
          order: index + 1,
        })),
      }).unwrap();

      setCreateOpen(false);
      setNewTitle("");
      setNewQualId("");
      setNewUnitId("__qual__");
      setNewStatus("active");
      setNewItems([]);
      toast({ title: "Checklist created" });
    } catch {
      toast({
        title: "Failed to create checklist",
        variant: "destructive",
      });
    }
  };

  // ── Edit ──
  const startEdit = (tpl: ChecklistTemplate) => {
    setEditingId(tpl.id);
    setEditTitle(tpl.title);
    setEditItems([...tpl.items]);
    setExpandedId(tpl.id);
  };

  const addItemToEdit = () => {
    if (!editItemLabel.trim()) return;
    setEditItems((prev) => [
      ...prev,
      {
        id: `ci-${Date.now()}`,
        label: editItemLabel.trim(),
        responseType: editItemType,
      },
    ]);
    setEditItemLabel("");
  };

  const removeEditItem = (id: string) =>
    setEditItems((prev) => prev.filter((i) => i.id !== id));

  const saveEdit = () => {
    if (!editTitle.trim() || editItems.length === 0) {
      toast({
        title: "Title and at least one item required",
        variant: "destructive",
      });
      return;
    }
    persist(
      templates.map((t) =>
        t.id === editingId
          ? {
              ...t,
              title: editTitle.trim(),
              items: editItems,
              updatedDate: new Date().toLocaleDateString("en-GB"),
            }
          : t,
      ),
    );
    setEditingId(null);
    toast({ title: "Checklist updated" });
  };

  const deleteTemplate = (id: string) => {
    persist(templates.filter((t) => t.id !== id));
    toast({ title: "Checklist deleted" });
  };

  return (
    <div className="space-y-6">
      <Link
        to="/admin/dashboard"
        className="inline-flex items-center gap-1.5 text-primary hover:underline text-sm"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ClipboardList className="w-6 h-6" /> IQA Verification Checklists
          </h1>
          <p className="text-sm text-muted-foreground">
            Build dynamic check-lists per qualification or per unit. IQAs use
            these when verifying learner work.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="w-4 h-4 mr-1" /> Create Checklist
        </Button>
      </div>

      {/* Filter */}
      <Select value={qualFilter} onValueChange={setQualFilter}>
        <SelectTrigger className="w-[280px]">
          <SelectValue placeholder="All Qualifications" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Qualifications</SelectItem>
          {qualificationOptions.map((q) => (
            <SelectItem key={q.id} value={q.id}>
              {q.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Templates list */}
      {filtered.length === 0 ? (
        <Card className="p-8 text-center">
          <ClipboardList className="w-10 h-10 mx-auto mb-2 text-muted-foreground opacity-50" />
          <p className="text-sm text-muted-foreground">
            No checklists created yet. Click "Create Checklist" to get started.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((tpl) => {
            const isExpanded = expandedId === tpl.id;
            const isEditing = editingId === tpl.id;

            return (
              <Card key={tpl.id}>
                <CardContent className="p-0">
                  {/* Header row */}
                  <button
                    className="w-full p-4 flex items-center justify-between gap-3 text-left hover:bg-muted/30 transition-colors"
                    onClick={() => setExpandedId(isExpanded ? null : tpl.id)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <p className="text-sm font-semibold">{tpl.title}</p>
                        <Badge
                          variant={tpl.unitCode ? "secondary" : "outline"}
                          className="text-[10px]"
                        >
                          {tpl.unitCode
                            ? `Unit: ${tpl.unitCode}`
                            : "Qualification-level"}
                        </Badge>
                        <Badge variant="outline" className="text-[10px]">
                          {tpl.items.length} checks
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {getQualTitle(tpl.qualificationId)}
                      </p>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="border-t px-4 pb-4 pt-3 space-y-3">
                      {isEditing ? (
                        /* ── Edit Mode ── */
                        <div className="space-y-3">
                          <div className="space-y-1.5">
                            <Label className="text-xs">Checklist Title</Label>
                            <Input
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                            />
                          </div>
                          <Separator />
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Check Items
                          </p>
                          <div className="space-y-1.5">
                            {editItems.map((item, i) => (
                              <div
                                key={item.id}
                                className="flex items-center gap-2 bg-muted/30 rounded px-3 py-2"
                              >
                                <span className="text-xs text-muted-foreground w-5">
                                  {i + 1}.
                                </span>
                                <span className="text-sm flex-1">
                                  {item.label}
                                </span>
                                <Badge
                                  variant="outline"
                                  className="text-[10px]"
                                >
                                  {RESPONSE_TYPE_LABELS[item.responseType]}
                                </Badge>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 text-destructive"
                                  onClick={() => removeEditItem(item.id)}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <Input
                              placeholder="New check item text..."
                              value={editItemLabel}
                              onChange={(e) => setEditItemLabel(e.target.value)}
                              className="flex-1"
                              onKeyDown={(e) =>
                                e.key === "Enter" && addItemToEdit()
                              }
                            />
                            <Select
                              value={editItemType}
                              onValueChange={(v) =>
                                setEditItemType(v as CheckResponseType)
                              }
                            >
                              <SelectTrigger className="w-[160px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="yes-no">Yes / No</SelectItem>
                                <SelectItem value="yes-no-na">
                                  Yes / No / N/A
                                </SelectItem>
                                <SelectItem value="met-notmet-na">
                                  Met / Not Met / N/A
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={addItemToEdit}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                          <div className="flex gap-2 pt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingId(null)}
                            >
                              <X className="w-3 h-3 mr-1" /> Cancel
                            </Button>
                            <Button size="sm" onClick={saveEdit}>
                              <Save className="w-3 h-3 mr-1" /> Save Changes
                            </Button>
                          </div>
                        </div>
                      ) : (
                        /* ── View Mode ── */
                        <>
                          <div className="space-y-1.5">
                            {tpl.items.map((item, i) => (
                              <div
                                key={item.id}
                                className="flex items-center gap-2 text-sm bg-muted/20 rounded px-3 py-2"
                              >
                                <span className="text-xs text-muted-foreground w-5">
                                  {i + 1}.
                                </span>
                                <span className="flex-1">{item.label}</span>
                                <Badge
                                  variant="outline"
                                  className="text-[10px]"
                                >
                                  {RESPONSE_TYPE_LABELS[item.responseType]}
                                </Badge>
                              </div>
                            ))}
                          </div>
                          <div className="flex gap-2 pt-1">
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1"
                              onClick={() => startEdit(tpl)}
                            >
                              <Pencil className="w-3 h-3" /> Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1 text-destructive"
                              onClick={() => deleteTemplate(tpl.id)}
                            >
                              <Trash2 className="w-3 h-3" /> Delete
                            </Button>
                          </div>
                          <p className="text-[10px] text-muted-foreground">
                            Created: {tpl.createdDate} · Updated:{" "}
                            {tpl.updatedDate}
                          </p>
                        </>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* ── Create Dialog ── */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Verification Checklist</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Qualification *</Label>
              <Select
                value={newQualId}
                onValueChange={(v) => {
                  setNewQualId(v);
                  setNewUnitId("__qual__");
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select qualification" />
                </SelectTrigger>
                <SelectContent>
                  {qualificationOptions.map((q) => (
                    <SelectItem key={q.id} value={q.id}>
                      {q.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Unit</Label>
              <Select value={newUnitId} onValueChange={setNewUnitId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__qual__">Select Unit</SelectItem>
                  {newQualId &&
                    createUnitOptions.map((u) => (
                      <SelectItem
                        key={"unit_code" in u ? u.id : u.code}
                        value={"unit_code" in u ? u.id : u.code}
                      >
                        {"unit_code" in u
                          ? `${u.unit_code} — ${u.title}`
                          : `${u.code} — ${u.name}`}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Status</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Checklist Title *</Label>
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Internal Verification — Quality Check"
              />
            </div>

            <Separator />

            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Check Items
              </p>
              {newItems.length > 0 && (
                <div className="space-y-1.5 mb-3">
                  {newItems.map((item, i) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-2 bg-muted/30 rounded px-3 py-2"
                    >
                      <span className="text-xs text-muted-foreground w-5">
                        {i + 1}.
                      </span>
                      <span className="text-sm flex-1">{item.label}</span>
                      <Badge variant="outline" className="text-[10px]">
                        {RESPONSE_TYPE_LABELS[item.responseType]}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-destructive"
                        onClick={() => removeNewItem(item.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <Input
                  placeholder="e.g. Evidence is authentic and valid"
                  value={newItemLabel}
                  onChange={(e) => setNewItemLabel(e.target.value)}
                  className="flex-1"
                  onKeyDown={(e) => e.key === "Enter" && addItemToNew()}
                />
                <Select
                  value={newItemType}
                  onValueChange={(v) => setNewItemType(v as CheckResponseType)}
                >
                  <SelectTrigger className="w-[160px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes-no">Yes / No</SelectItem>
                    <SelectItem value="yes-no-na">Yes / No / N/A</SelectItem>
                    <SelectItem value="met-notmet-na">
                      Met / Not Met / N/A
                    </SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" onClick={addItemToNew}>
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter className="pt-4">
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={isCreatingChecklist}>
              {isCreatingChecklist ? "Creating..." : "Create Checklist"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChecklistBuilder;
