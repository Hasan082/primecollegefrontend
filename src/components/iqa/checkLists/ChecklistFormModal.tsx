import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Separator } from "@/components/ui/separator";
import { RESPONSE_TYPE_LABELS, type CheckResponseType, type ChecklistItem } from "@/lib/checklists";

type QualificationOption = {
  id: string;
  title: string;
};

type UnitOption = {
  id?: string;
  title: string;
  unit_code?: string;
  code?: string;
  name?: string;
};

type FormErrors = {
  qualification?: string;
  unit?: string;
  title?: string;
  items?: string;
};

type ChecklistFormModalProps = {
  mode: "create" | "edit";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  qualificationId: string;
  unitId: string;
  status: string;
  title: string;
  items: ChecklistItem[];
  itemLabel: string;
  itemType: CheckResponseType;
  qualificationOptions: QualificationOption[];
  unitOptions: UnitOption[];
  errors: FormErrors;
  isSubmitting: boolean;
  onQualificationChange: (value: string) => void;
  onUnitChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onTitleChange: (value: string) => void;
  onItemLabelChange: (value: string) => void;
  onItemTypeChange: (value: CheckResponseType) => void;
  onAddItem: () => void;
  onRemoveItem: (id: string) => void;
  onSubmit: () => void;
};

const ChecklistFormModal = ({
  mode,
  open,
  onOpenChange,
  qualificationId,
  unitId,
  status,
  title,
  items,
  itemLabel,
  itemType,
  qualificationOptions,
  unitOptions,
  errors,
  isSubmitting,
  onQualificationChange,
  onUnitChange,
  onStatusChange,
  onTitleChange,
  onItemLabelChange,
  onItemTypeChange,
  onAddItem,
  onRemoveItem,
  onSubmit,
}: ChecklistFormModalProps) => {
  const isEdit = mode === "edit";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Verification Checklist" : "Create Verification Checklist"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label className="text-xs">Qualification *</Label>
            <Select value={qualificationId} onValueChange={onQualificationChange}>
              <SelectTrigger className={errors.qualification ? "border-destructive" : ""}>
                <SelectValue placeholder="Select qualification" />
              </SelectTrigger>
              <SelectContent>
                {qualificationOptions.map((qualification) => (
                  <SelectItem key={qualification.id} value={qualification.id}>
                    {qualification.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.qualification && (
              <p className="text-xs text-destructive">{errors.qualification}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Unit *</Label>
            <Select value={unitId} onValueChange={onUnitChange}>
              <SelectTrigger className={errors.unit ? "border-destructive" : ""}>
                <SelectValue placeholder="Select unit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__qual__">Select Unit</SelectItem>
                {unitOptions.map((unit) => (
                  <SelectItem key={unit.id ?? unit.code} value={unit.id ?? unit.code ?? ""}>
                    {unit.unit_code
                      ? `${unit.unit_code} — ${unit.title}`
                      : `${unit.code} — ${unit.name}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.unit && <p className="text-xs text-destructive">{errors.unit}</p>}
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Status</Label>
            <Select value={status} onValueChange={onStatusChange}>
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
              value={title}
              onChange={(event) => onTitleChange(event.target.value)}
              placeholder="e.g. Internal Verification — Quality Check"
              className={errors.title ? "border-destructive" : ""}
            />
            {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
          </div>

          <Separator />

          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Check Items
            </p>
            {items.length > 0 && (
              <div className="space-y-1.5 mb-3">
                {items.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-2 bg-muted/30 rounded px-3 py-2"
                  >
                    <span className="text-xs text-muted-foreground w-5">
                      {index + 1}.
                    </span>
                    <span className="text-sm flex-1">{item.label}</span>
                    <Badge variant="outline" className="text-[10px]">
                      {RESPONSE_TYPE_LABELS[item.responseType]}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-destructive"
                      onClick={() => onRemoveItem(item.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            {errors.items && <p className="mb-3 text-xs text-destructive">{errors.items}</p>}
            <div className="flex gap-2">
              <Input
                placeholder="e.g. Evidence is authentic and valid"
                value={itemLabel}
                onChange={(event) => onItemLabelChange(event.target.value)}
                className="flex-1"
                onKeyDown={(event) => event.key === "Enter" && onAddItem()}
              />
              <Select
                value={itemType}
                onValueChange={(value) => onItemTypeChange(value as CheckResponseType)}
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes-no">Yes / No</SelectItem>
                  <SelectItem value="yes-no-na">Yes / No / N/A</SelectItem>
                  <SelectItem value="met-notmet-na">Met / Not Met / N/A</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={onAddItem}>
                <Plus className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter className="pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={isSubmitting}>
            {isSubmitting
              ? isEdit
                ? "Saving..."
                : "Creating..."
              : isEdit
                ? "Update Checklist"
                : "Create Checklist"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ChecklistFormModal;
