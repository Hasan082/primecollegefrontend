import { useState } from "react";
import { Plus, Trash2, ChevronDown, ChevronRight, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import type { BlockType } from "@/types/pageBuilder";

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

import { ITEM_FIELDS, MEDIA_ENABLED_BLOCKS } from "./ItemFieldDefs";
import { MediaPicker } from "./MediaPicker";

const getNewItem = (blockType: BlockType): any => {
  const fields = ITEM_FIELDS[blockType];
  const item: any = { _dndId: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` };
  fields?.forEach((f) => { item[f.key] = ""; });
  if (MEDIA_ENABLED_BLOCKS.includes(blockType)) {
    item.mediaType = "icon";
    item.icon = "Star";
    item.image = "";
  }
  return item;
};

interface SortableItemProps {
  id: string;
  index: number;
  item: any;
  isOpen: boolean;
  onToggle: () => void;
  onRemove: () => void;
  onUpdate: (key: string, value: any) => void;
  onImageUpload: (file: File, key: string) => void;
  fields: any[];
  hasMedia: boolean;
  isUploading: boolean;
}

const SortableItem = ({
  id,
  index,
  item,
  isOpen,
  onToggle,
  onRemove,
  onUpdate,
  onImageUpload,
  fields,
  hasMedia,
  isUploading,
}: SortableItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="bg-background">
      <div className="flex items-center gap-2 px-2 py-2 cursor-pointer hover:bg-muted/30">
        <div {...attributes} {...listeners} className="p-1 cursor-grab active:cursor-grabbing">
          <GripVertical className="h-3.5 w-3.5 text-muted-foreground/30" />
        </div>
        <div className="flex-1 flex items-center gap-2" onClick={onToggle}>
          <Badge variant="outline" className="h-5 w-5 p-0 flex items-center justify-center text-[10px]">{index + 1}</Badge>
          {isOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
          <span className="text-sm truncate flex-1 font-medium">{item.title || item.question || item.name || item.id || `Item ${index + 1}`}</span>
        </div>
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive" onClick={(e) => { e.stopPropagation(); onRemove(); }}><Trash2 className="h-3.5 w-3.5" /></Button>
      </div>

      {isOpen && (
        <div className="px-3 pb-3 pt-1 space-y-3 bg-muted/5 border-t border-dashed">
          {hasMedia && <MediaPicker item={item} onUpdate={onUpdate} onImageUpload={(f: File, k: string) => onImageUpload(f, k)} isUploading={isUploading} />}
          {fields.map((f) => (
            <div key={f.key}>
              <Label className="text-[10px] text-muted-foreground uppercase tracking-tight">{f.label}</Label>
              {f.type === "textarea" ? (
                <Textarea value={item[f.key] || ""} onChange={(e) => onUpdate(f.key, e.target.value)} placeholder={f.placeholder} className="mt-1 text-sm min-h-[70px]" />
              ) : (
                <Input value={item[f.key] || ""} onChange={(e) => onUpdate(f.key, e.target.value)} placeholder={f.placeholder} className="mt-1 h-8 text-sm" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const ItemListEditor = ({ blockType, items, onChange, onImageUpload, isUploading }: any) => {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const fields = ITEM_FIELDS[blockType];
  const hasMedia = MEDIA_ENABLED_BLOCKS.includes(blockType);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  if (!fields) return <p className="text-xs text-muted-foreground italic">Item editing is not available for this block type.</p>;

  // Ensure all items have a unique ID for DnD
  const itemsWithIds = items.map((item: any, idx: number) => {
    if (item._dndId) return item;
    return { ...item, _dndId: `item_${idx}_${Math.random().toString(36).substr(2, 9)}` };
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = itemsWithIds.findIndex((item: any) => item._dndId === active.id);
      const newIndex = itemsWithIds.findIndex((item: any) => item._dndId === over?.id);

      onChange(arrayMove(itemsWithIds, oldIndex, newIndex));
    }
  };

  const updateItem = (idx: number, key: string, value: any) => {
    onChange(itemsWithIds.map((item: any, i: number) => i === idx ? { ...item, [key]: value } : item));
  };

  const addItem = () => {
    const next = [...itemsWithIds, getNewItem(blockType)];
    onChange(next); setExpandedIdx(next.length - 1);
  };

  const removeItem = (idx: number) => {
    onChange(itemsWithIds.filter((_: any, i: number) => i !== idx));
    if (expandedIdx === idx) setExpandedIdx(null);
    else if (expandedIdx !== null && expandedIdx > idx) setExpandedIdx(expandedIdx - 1);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <Label>Items ({items.length})</Label>
        <Button variant="outline" size="sm" className="h-7 text-xs px-2" onClick={addItem}><Plus className="h-3 w-3 mr-1" /> Add Item</Button>
      </div>

      <div className="border rounded-md divide-y bg-muted/10 max-h-[460px] overflow-y-auto">
        {items.length === 0 && <p className="p-4 text-center text-xs text-muted-foreground italic">No items yet</p>}
        
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={itemsWithIds.map((i: any) => i._dndId)}
            strategy={verticalListSortingStrategy}
          >
            {itemsWithIds.map((item: any, i: number) => (
              <SortableItem
                key={item._dndId}
                id={item._dndId}
                index={i}
                item={item}
                isOpen={expandedIdx === i}
                onToggle={() => setExpandedIdx(expandedIdx === i ? null : i)}
                onRemove={() => removeItem(i)}
                onUpdate={(k, v) => updateItem(i, k, v)}
                onImageUpload={(f, k) => onImageUpload(f, `items.${i}.${k}`)}
                fields={fields}
                hasMedia={hasMedia}
                isUploading={isUploading}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
};

export default ItemListEditor;
