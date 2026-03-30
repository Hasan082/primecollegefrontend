import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, ClipboardList, Pencil } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  useUpdateChecklistTemplateMutation,
} from "@/redux/apis/qualification/qualificationApi";
import {
  type ChecklistTemplate,
  type ChecklistItem,
  type CheckResponseType,
  loadTemplates,
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

type ChecklistRow = ChecklistTemplate & {
  unitId: string | null;
  isActive: boolean;
};

type CreateFormErrors = {
  qualification?: string;
  unit?: string;
  title?: string;
  items?: string;
};

type EditFormErrors = {
  qualification?: string;
  unit?: string;
  title?: string;
  items?: string;
};

const ChecklistBuilder = () => {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<ChecklistRow[]>(
    loadTemplates().map((template) => ({
      ...template,
      unitId: template.unitCode,
      isActive: true,
    })),
  );
  const [qualFilter, setQualFilter] = useState("all");

  // Create dialog
  const [createOpen, setCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newQualId, setNewQualId] = useState("");
  const [newUnitId, setNewUnitId] = useState("__qual__");
  const [newStatus, setNewStatus] = useState("active");
  const [newItems, setNewItems] = useState<ChecklistItem[]>([]);
  const [newItemLabel, setNewItemLabel] = useState("");
  const [newItemType, setNewItemType] = useState<CheckResponseType>("yes-no");
  const [createErrors, setCreateErrors] = useState<CreateFormErrors>({});

  // Edit mode
  const [editOpen, setEditOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQualId, setEditQualId] = useState("");
  const [editUnitId, setEditUnitId] = useState("__qual__");
  const [editStatus, setEditStatus] = useState("active");
  const [editTitle, setEditTitle] = useState("");
  const [editItems, setEditItems] = useState<ChecklistItem[]>([]);
  const [editItemLabel, setEditItemLabel] = useState("");
  const [editItemType, setEditItemType] = useState<CheckResponseType>("yes-no");
  const [editErrors, setEditErrors] = useState<EditFormErrors>({});
  const [createChecklistTemplate, { isLoading: isCreatingChecklist }] =
    useCreateChecklistTemplateMutation();
  const [updateChecklistTemplate, { isLoading: isUpdatingChecklist }] =
    useUpdateChecklistTemplateMutation();

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
  const { data: editUnitOptionsResponse } =
    useGetUnitOptionsByQualificationQuery(editQualId, {
      skip: !editQualId,
    });

  const qualificationOptions = qualificationOptionsResponse?.data?.length
    ? qualificationOptionsResponse.data
    : adminQualifications;

  const getQualUnits = (qualId: string) =>
    adminQualifications.find((q) => q.id === qualId)?.units || [];

  const createUnitOptions = unitOptionsResponse?.data?.length
    ? unitOptionsResponse.data
    : getQualUnits(newQualId);
  const editUnitOptions = editUnitOptionsResponse?.data?.length
    ? editUnitOptionsResponse.data
    : getQualUnits(editQualId);

  useEffect(() => {
    const apiTemplates = checklistTemplatesResponse?.data?.results?.map(
      (template: {
        id: string;
        qualification_id: string;
        unit_id: string | null;
        title: string;
        is_active: boolean;
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
        unitId: template.unit_id,
        isActive: template.is_active,
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

  const validateCreateForm = () => {
    const errors: CreateFormErrors = {};

    if (!newQualId) {
      errors.qualification = "Qualification is required";
    }

    if (!newUnitId || newUnitId === "__qual__") {
      errors.unit = "Unit is required";
    }

    if (!newTitle.trim()) {
      errors.title = "Title is required";
    }

    if (newItems.length === 0) {
      errors.items = "At least one item is required";
    }

    setCreateErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateEditForm = () => {
    const errors: EditFormErrors = {};

    if (!editQualId) {
      errors.qualification = "Qualification is required";
    }

    if (!editUnitId || editUnitId === "__qual__") {
      errors.unit = "Unit is required";
    }

    if (!editTitle.trim()) {
      errors.title = "Title is required";
    }

    if (editItems.length === 0) {
      errors.items = "At least one item is required";
    }

    setEditErrors(errors);
    return Object.keys(errors).length === 0;
  };

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
    setCreateErrors((prev) => ({ ...prev, items: undefined }));
  };

  const removeNewItem = (id: string) =>
    setNewItems((prev) => prev.filter((i) => i.id !== id));

  const handleCreate = async () => {
    if (!validateCreateForm()) {
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
      setCreateErrors({});
      toast({ title: "Checklist created" });
    } catch {
      toast({
        title: "Failed to create checklist",
        variant: "destructive",
      });
    }
  };

  // ── Edit ──
  const startEdit = (tpl: ChecklistRow) => {
    setEditingId(tpl.id);
    setEditOpen(true);
    setEditQualId(tpl.qualificationId);
    setEditUnitId(tpl.unitId ?? "__qual__");
    setEditStatus(tpl.isActive ? "active" : "inactive");
    setEditTitle(tpl.title);
    setEditItems([...tpl.items]);
    setEditErrors({});
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
    setEditErrors((prev) => ({ ...prev, items: undefined }));
  };

  const removeEditItem = (id: string) =>
    setEditItems((prev) => prev.filter((i) => i.id !== id));

  const saveEdit = async () => {
    if (!editingId || !validateEditForm()) {
      return;
    }

    try {
      await updateChecklistTemplate({
        id: editingId,
        qualification_id: editQualId,
        unit_id: editUnitId === "__qual__" ? null : editUnitId,
        title: editTitle.trim(),
        is_active: editStatus === "active",
        items: editItems.map((item, index) => ({
          label: item.label,
          response_type: serializeResponseType(item.responseType),
          order: index + 1,
        })),
      }).unwrap();

      setEditOpen(false);
      setEditingId(null);
      setEditErrors({});
      toast({ title: "Checklist updated" });
    } catch {
      toast({
        title: "Failed to update checklist",
        variant: "destructive",
      });
    }
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
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Qualification</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Checks</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((tpl) => (
                  <TableRow key={tpl.id}>
                    <TableCell className="font-medium">{tpl.title}</TableCell>
                    <TableCell className="max-w-[280px] truncate">
                      {getQualTitle(tpl.qualificationId)}
                    </TableCell>
                    <TableCell>
                      {tpl.unitCode ? (
                        <Badge variant="secondary" className="text-[10px]">
                          {tpl.unitCode}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px]">
                          Qualification-level
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={tpl.isActive ? "default" : "secondary"}
                        className="text-[10px]"
                      >
                        {tpl.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>{tpl.items.length}</TableCell>
                    <TableCell>{tpl.updatedDate}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1"
                        onClick={() => startEdit(tpl)}
                      >
                        <Pencil className="w-3 h-3" /> Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
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
                  setCreateErrors((prev) => ({
                    ...prev,
                    qualification: undefined,
                    unit: undefined,
                  }));
                }}
              >
                <SelectTrigger
                  className={
                    createErrors.qualification ? "border-destructive" : ""
                  }
                >
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
              {createErrors.qualification && (
                <p className="text-xs text-destructive">
                  {createErrors.qualification}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Unit *</Label>
              <Select
                value={newUnitId}
                onValueChange={(value) => {
                  setNewUnitId(value);
                  setCreateErrors((prev) => ({ ...prev, unit: undefined }));
                }}
              >
                <SelectTrigger
                  className={createErrors.unit ? "border-destructive" : ""}
                >
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
              {createErrors.unit && (
                <p className="text-xs text-destructive">{createErrors.unit}</p>
              )}
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
                onChange={(e) => {
                  setNewTitle(e.target.value);
                  setCreateErrors((prev) => ({ ...prev, title: undefined }));
                }}
                placeholder="e.g. Internal Verification — Quality Check"
                className={createErrors.title ? "border-destructive" : ""}
              />
              {createErrors.title && (
                <p className="text-xs text-destructive">{createErrors.title}</p>
              )}
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
              {createErrors.items && (
                <p className="mb-3 text-xs text-destructive">
                  {createErrors.items}
                </p>
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

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Verification Checklist</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Qualification *</Label>
              <Select
                value={editQualId}
                onValueChange={(v) => {
                  setEditQualId(v);
                  setEditUnitId("__qual__");
                  setEditErrors((prev) => ({
                    ...prev,
                    qualification: undefined,
                    unit: undefined,
                  }));
                }}
              >
                <SelectTrigger
                  className={
                    editErrors.qualification ? "border-destructive" : ""
                  }
                >
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
              {editErrors.qualification && (
                <p className="text-xs text-destructive">
                  {editErrors.qualification}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Unit *</Label>
              <Select
                value={editUnitId}
                onValueChange={(value) => {
                  setEditUnitId(value);
                  setEditErrors((prev) => ({ ...prev, unit: undefined }));
                }}
              >
                <SelectTrigger
                  className={editErrors.unit ? "border-destructive" : ""}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__qual__">Select Unit</SelectItem>
                  {editQualId &&
                    editUnitOptions.map((u) => (
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
              {editErrors.unit && (
                <p className="text-xs text-destructive">{editErrors.unit}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Status</Label>
              <Select value={editStatus} onValueChange={setEditStatus}>
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
                value={editTitle}
                onChange={(e) => {
                  setEditTitle(e.target.value);
                  setEditErrors((prev) => ({ ...prev, title: undefined }));
                }}
                placeholder="e.g. Internal Verification — Quality Check"
                className={editErrors.title ? "border-destructive" : ""}
              />
              {editErrors.title && (
                <p className="text-xs text-destructive">{editErrors.title}</p>
              )}
            </div>

            <Separator />

            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Check Items
              </p>
              {editItems.length > 0 && (
                <div className="space-y-1.5 mb-3">
                  {editItems.map((item, i) => (
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
                        onClick={() => removeEditItem(item.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              {editErrors.items && (
                <p className="mb-3 text-xs text-destructive">
                  {editErrors.items}
                </p>
              )}
              <div className="flex gap-2">
                <Input
                  placeholder="New check item text..."
                  value={editItemLabel}
                  onChange={(e) => setEditItemLabel(e.target.value)}
                  className="flex-1"
                  onKeyDown={(e) => e.key === "Enter" && addItemToEdit()}
                />
                <Select
                  value={editItemType}
                  onValueChange={(v) => setEditItemType(v as CheckResponseType)}
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
                <Button variant="outline" size="sm" onClick={addItemToEdit}>
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter className="pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setEditOpen(false);
                setEditingId(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={saveEdit} disabled={isUpdatingChecklist}>
              {isUpdatingChecklist ? "Saving..." : "Update Checklist"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChecklistBuilder;
