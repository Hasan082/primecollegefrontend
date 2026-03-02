import { useState } from "react";
import { Plus, Trash2, ChevronDown, ChevronRight, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import type { BlockType } from "@/types/pageBuilder";

type AnyItem = Record<string, string | undefined>;

interface ItemField {
  key: string;
  label: string;
  type: "input" | "textarea";
  placeholder?: string;
}

const ITEM_FIELDS: Partial<Record<BlockType, ItemField[]>> = {
  modules: [
    { key: "title", label: "Title", type: "input", placeholder: "Module title" },
    { key: "description", label: "Description", type: "textarea", placeholder: "Module description" },
  ],
  faq: [
    { key: "question", label: "Question", type: "input", placeholder: "Enter question" },
    { key: "answer", label: "Answer", type: "textarea", placeholder: "Enter answer" },
  ],
  stats: [
    { key: "title", label: "Label", type: "input", placeholder: "e.g. Students" },
    { key: "value", label: "Value", type: "input", placeholder: "e.g. 500+" },
    { key: "description", label: "Description", type: "input", placeholder: "Short description" },
  ],
  cards: [
    { key: "title", label: "Title", type: "input", placeholder: "Card title" },
    { key: "category", label: "Category", type: "input", placeholder: "e.g. Business" },
    { key: "level", label: "Level", type: "input", placeholder: "e.g. Level 5" },
    { key: "price", label: "Price", type: "input", placeholder: "e.g. £1,200" },
  ],
  logos: [
    { key: "title", label: "Name", type: "input", placeholder: "Partner name" },
    { key: "image", label: "Image URL", type: "input", placeholder: "https://..." },
  ],
  blog: [
    { key: "title", label: "Title", type: "input", placeholder: "Post title" },
    { key: "description", label: "Description", type: "textarea", placeholder: "Short summary" },
    { key: "date", label: "Date", type: "input", placeholder: "e.g. 2025-01-15" },
    { key: "category", label: "Category", type: "input", placeholder: "e.g. News" },
  ],
  "why-us": [
    { key: "title", label: "Title", type: "input", placeholder: "Feature title" },
    { key: "icon", label: "Icon name", type: "input", placeholder: "e.g. Shield, Award" },
    { key: "description", label: "Description", type: "textarea", placeholder: "Feature description" },
  ],
};

const getNewItem = (blockType: BlockType): AnyItem => {
  const fields = ITEM_FIELDS[blockType];
  if (!fields) return { title: "" };
  const item: AnyItem = {};
  fields.forEach((f) => {
    item[f.key] = "";
  });
  return item;
};

const getItemLabel = (item: AnyItem): string =>
  item.title || item.question || item.name || "Untitled";

interface ItemListEditorProps {
  blockType: BlockType;
  items: AnyItem[];
  onChange: (items: AnyItem[]) => void;
}

const ItemListEditor = ({ blockType, items, onChange }: ItemListEditorProps) => {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const fields = ITEM_FIELDS[blockType];

  if (!fields) {
    return (
      <p className="text-xs text-muted-foreground italic">
        Item editing is not available for this block type.
      </p>
    );
  }

  const toggle = (i: number) => setExpandedIdx(expandedIdx === i ? null : i);

  const updateItem = (idx: number, key: string, value: string) => {
    const next = items.map((item, i) =>
      i === idx ? { ...item, [key]: value } : item
    );
    onChange(next);
  };

  const addItem = () => {
    const next = [...items, getNewItem(blockType)];
    onChange(next);
    setExpandedIdx(next.length - 1);
  };

  const removeItem = (idx: number) => {
    onChange(items.filter((_, i) => i !== idx));
    if (expandedIdx === idx) setExpandedIdx(null);
  };

  const moveItem = (from: number, to: number) => {
    if (to < 0 || to >= items.length) return;
    const next = [...items];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange(next);
    setExpandedIdx(to);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <Label>Items ({items.length})</Label>
        <Button type="button" variant="outline" size="sm" className="h-7 text-xs" onClick={addItem}>
          <Plus className="h-3 w-3 mr-1" /> Add
        </Button>
      </div>

      <div className="border border-border rounded-md overflow-hidden bg-muted/20">
        {items.length === 0 && (
          <p className="text-xs text-muted-foreground italic p-3 text-center">
            No items yet — click Add to create one
          </p>
        )}

        <div className="max-h-[400px] overflow-y-auto divide-y divide-border">
          {items.map((item, i) => {
            const isOpen = expandedIdx === i;
            return (
              <div key={i} className="bg-background">
                {/* Header row */}
                <div
                  className="flex items-center gap-1.5 px-2 py-1.5 cursor-pointer hover:bg-muted/40 transition-colors"
                  onClick={() => toggle(i)}
                >
                  <GripVertical className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
                  <Badge variant="outline" className="shrink-0 text-[10px] h-5 w-5 p-0 flex items-center justify-center">
                    {i + 1}
                  </Badge>
                  {isOpen ? (
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  )}
                  <span className="text-sm truncate flex-1">{getItemLabel(item) || "Untitled"}</span>
                  <div className="flex gap-0.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <Button
                      type="button" variant="ghost" size="sm"
                      className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                      disabled={i === 0}
                      onClick={() => moveItem(i, i - 1)}
                    >↑</Button>
                    <Button
                      type="button" variant="ghost" size="sm"
                      className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                      disabled={i === items.length - 1}
                      onClick={() => moveItem(i, i + 1)}
                    >↓</Button>
                    <Button
                      type="button" variant="ghost" size="sm"
                      className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                      onClick={() => removeItem(i)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {/* Expanded editor */}
                {isOpen && (
                  <div className="px-3 pb-3 pt-1 space-y-2 border-t border-border/50 bg-muted/10">
                    {fields.map((field) => (
                      <div key={field.key}>
                        <Label className="text-xs text-muted-foreground">{field.label}</Label>
                        {field.type === "textarea" ? (
                          <Textarea
                            value={item[field.key] || ""}
                            onChange={(e) => updateItem(i, field.key, e.target.value)}
                            placeholder={field.placeholder}
                            className="mt-0.5 min-h-[60px] text-sm"
                          />
                        ) : (
                          <Input
                            value={item[field.key] || ""}
                            onChange={(e) => updateItem(i, field.key, e.target.value)}
                            placeholder={field.placeholder}
                            className="mt-0.5 h-8 text-sm"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ItemListEditor;
