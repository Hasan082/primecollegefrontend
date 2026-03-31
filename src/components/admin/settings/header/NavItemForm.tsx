import { useState, useEffect } from "react";
import { Plus, Trash2, X, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NavLinkItem } from "@/redux/apis/navbarApi";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
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
} from "@dnd-kit/sortable";
import SortableChildItem from "./SortableChildItem";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface NavItemFormProps {
  onSave: (item: NavLinkItem) => void;
  onCancel: () => void;
  initialData?: NavLinkItem;
  title: string;
}

const NavItemForm = ({
  onSave,
  onCancel,
  initialData,
  title,
}: NavItemFormProps) => {
  const [formData, setFormData] = useState<NavLinkItem>({
    label: "",
    href: "",
    order: 0,
    is_active: true,
    is_dropdown: false,
    is_mega_menu: false,
    children: [],
  });

  const [newChild, setNewChild] = useState({ label: "", href: "", is_active: true });
  const [editingChildIndex, setEditingChildIndex] = useState<number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        children: initialData.children || [],
      });
    } else {
      setFormData({
        label: "",
        href: "",
        order: 0,
        is_active: true,
        is_dropdown: false,
        is_mega_menu: false,
        children: [],
      });
    }
  }, [initialData]);

  const handleAddChild = () => {
    if (!newChild.label) return;
    setFormData((prev) => {
      const children = [...(prev.children || [])];
      if (editingChildIndex !== null) {
        children[editingChildIndex] = { ...newChild, order: editingChildIndex + 1 };
      } else {
        children.push({ ...newChild, order: children.length + 1 });
      }
      return { ...prev, children };
    });
    setNewChild({ label: "", href: "", is_active: true });
    setEditingChildIndex(null);
  };

  const handleEditChild = (index: number) => {
    const child = formData.children?.[index];
    if (child) {
      setNewChild({ label: child.label, href: child.href || "", is_active: child.is_active });
      setEditingChildIndex(index);
    }
  };

  const removeChild = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      children: prev.children?.filter((_, i) => i !== index),
    }));
  };

  const handleChildDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setFormData((prev) => {
        const oldIndex = prev.children?.findIndex((_, idx) => `child-${idx}` === active.id) ?? -1;
        const newIndex = prev.children?.findIndex((_, idx) => `child-${idx}` === over.id) ?? -1;
        if (oldIndex !== -1 && newIndex !== -1 && prev.children) {
          const newChildren = arrayMove(prev.children, oldIndex, newIndex).map(
            (child, idx) => ({ ...child, order: idx + 1 }),
          );
          return { ...prev, children: newChildren };
        }
        return prev;
      });
    }
  };

  const handleSave = () => {
    if (!formData.label) return;
    onSave(formData);
  };

  return (
    <Card className="border-primary/20 shadow-md">
      <CardHeader className="flex flex-row items-center justify-between border-b py-4">
        <CardTitle className="text-lg">{title}</CardTitle>
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="label">Label *</Label>
            <Input
              id="label"
              value={formData.label}
              onChange={(e) => setFormData((p) => ({ ...p, label: e.target.value }))}
              placeholder="e.g. About Us"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="href">URL / Path</Label>
            <Input
              id="href"
              value={formData.href}
              onChange={(e) => setFormData((p) => ({ ...p, href: e.target.value }))}
              placeholder="e.g. /about"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(v) => setFormData((p) => ({ ...p, is_active: v }))}
            />
            <Label htmlFor="is_active">Active Status</Label>
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Label className="whitespace-nowrap">Menu Type</Label>
            <Select
              value={formData.is_mega_menu ? "mega" : formData.is_dropdown ? "dropdown" : "normal"}
              onValueChange={(v) => {
                setFormData((p) => ({
                  ...p,
                  is_mega_menu: v === "mega",
                  is_dropdown: v === "dropdown",
                }));
              }}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal Link</SelectItem>
                <SelectItem value="dropdown">Dropdown</SelectItem>
                <SelectItem value="mega">Mega Menu</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {(formData.is_mega_menu || formData.is_dropdown) && (
          <div className="space-y-4 pt-2">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Plus className="h-3.5 w-3.5" /> Submenu Items
            </h3>
            
            <div className="space-y-2">
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleChildDragEnd}>
                <SortableContext items={formData.children?.map((_, idx) => `child-${idx}`) || []} strategy={verticalListSortingStrategy}>
                    {formData.children?.map((child, idx) => (
                      <SortableChildItem
                        key={`child-${idx}`}
                        id={`child-${idx}`}
                        label={child.label}
                        href={child.href}
                        is_active={child.is_active}
                        onEdit={() => handleEditChild(idx)}
                        onDelete={() => removeChild(idx)}
                      />
                    ))}
                </SortableContext>
              </DndContext>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end p-4 border rounded-lg border-dashed bg-muted/10 relative">
              {editingChildIndex !== null && (
                <div className="absolute -top-3 left-4 bg-background px-2 text-[10px] font-bold text-primary flex items-center gap-1">
                  Editing Child #{editingChildIndex + 1}
                  <Button variant="ghost" size="icon" className="h-4 w-4" onClick={() => { setEditingChildIndex(null); setNewChild({ label: "", href: "", is_active: true }); }}>
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
              <div className="space-y-1.5">
                <Label className="text-xs">Child Label</Label>
                <Input
                  value={newChild.label}
                  onChange={(e) => setNewChild((p) => ({ ...p, label: e.target.value }))}
                  className="h-9"
                  placeholder="e.g. History"
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between mb-1">
                  <Label className="text-xs">Child Path</Label>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="child_active" className="text-[10px]">Active</Label>
                    <Switch
                      id="child_active"
                      checked={newChild.is_active}
                      onCheckedChange={(v) => setNewChild((p) => ({ ...p, is_active: v }))}
                      className="scale-75"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newChild.href}
                    onChange={(e) => setNewChild((p) => ({ ...p, href: e.target.value }))}
                    className="h-9 flex-1"
                    placeholder="e.g. /history"
                  />
                  <Button size="sm" className="h-9 px-3 shrink-0" variant={editingChildIndex !== null ? "default" : "secondary"} onClick={handleAddChild}>
                    {editingChildIndex !== null ? "Update" : "Add"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="gap-2">
            <Save className="h-4 w-4" /> Apply Changes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default NavItemForm;
