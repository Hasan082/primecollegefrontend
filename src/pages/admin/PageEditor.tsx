import { useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, ChevronUp, ChevronDown, Trash2, GripVertical, Eye, Upload, ImageIcon, AlignLeft, AlignRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { ContentBlock, BlockType } from "@/types/pageBuilder";
import { BLOCK_TYPE_LABELS, getDefaultBlockData } from "@/types/pageBuilder";
import { defaultPages } from "@/data/defaultPages";

const PageEditor = () => {
  const { pageId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const initialPage = defaultPages.find((p) => p.id === pageId);
  const [pageTitle, setPageTitle] = useState(initialPage?.title || "Untitled");
  const [blocks, setBlocks] = useState<ContentBlock[]>(initialPage?.blocks || []);
  const [addOpen, setAddOpen] = useState(false);
  const [editBlock, setEditBlock] = useState<ContentBlock | null>(null);

  const moveBlock = useCallback((index: number, dir: -1 | 1) => {
    setBlocks((prev) => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }, []);

  const removeBlock = useCallback((id: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
    toast({ title: "Block removed" });
  }, [toast]);

  const addBlock = useCallback((type: BlockType) => {
    const block = getDefaultBlockData(type);
    setBlocks((prev) => [...prev, block] as ContentBlock[]);
    setAddOpen(false);
    setEditBlock(block);
    toast({ title: `${BLOCK_TYPE_LABELS[type]} added` });
  }, [toast]);

  const updateBlockData = useCallback((id: string, data: Record<string, unknown>) => {
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, data: { ...(b.data as Record<string, unknown>), ...data } } as ContentBlock : b)));
  }, []);

  const handleSave = () => {
    toast({ title: "Page saved successfully", description: "Changes will persist when connected to a backend." });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/admin/pages")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <Input
            value={pageTitle}
            onChange={(e) => setPageTitle(e.target.value)}
            className="text-xl font-bold border-none bg-transparent px-0 h-auto focus-visible:ring-0"
          />
          <p className="text-xs text-muted-foreground mt-0.5 font-mono">{initialPage?.slug || `/${pageId}`}</p>
        </div>
        <Button onClick={handleSave}>Save Page</Button>
      </div>

      {/* Blocks */}
      {blocks.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground mb-4">No blocks yet. Add your first block to start building the page.</p>
            <Button onClick={() => setAddOpen(true)}>
              <Plus className="h-4 w-4 mr-2" /> Add Block
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {blocks.map((block, i) => (
            <Card key={block.id} className="group">
              <CardHeader className="py-3 px-4 flex flex-row items-center gap-3">
                <GripVertical className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                <Badge variant="secondary" className="text-xs shrink-0">{block.label}</Badge>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-muted-foreground truncate">
                    {getBlockPreview(block)}
                  </p>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => moveBlock(i, -1)} disabled={i === 0}>
                    <ChevronUp className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => moveBlock(i, 1)} disabled={i === blocks.length - 1}>
                    <ChevronDown className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditBlock(block)}>
                    <Eye className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeBlock(block.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      {/* Add button */}
      {blocks.length > 0 && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> Add Block
          </Button>
        </div>
      )}

      {/* Add Block Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Block</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-2">
            {(Object.keys(BLOCK_TYPE_LABELS) as BlockType[]).map((type) => (
              <Button key={type} variant="outline" className="h-auto py-3 flex flex-col items-center gap-1" onClick={() => addBlock(type)}>
                <span className="text-sm font-medium">{BLOCK_TYPE_LABELS[type]}</span>
                <span className="text-[10px] text-muted-foreground">{getBlockDescription(type)}</span>
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Block Dialog */}
      <Dialog open={!!editBlock} onOpenChange={() => setEditBlock(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit: {editBlock?.label}</DialogTitle>
          </DialogHeader>
          {editBlock && (
            <BlockEditorForm
              block={editBlock}
              onChange={(data) => updateBlockData(editBlock.id, data)}
              onClose={() => setEditBlock(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ─── Block Editor Form ───
const BlockEditorForm = ({
  block,
  onChange,
  onClose,
}: {
  block: ContentBlock;
  onChange: (data: Record<string, unknown>) => void;
  onClose: () => void;
}) => {
  const [local, setLocal] = useState<Record<string, unknown>>(block.data as Record<string, unknown>);

  const update = (key: string, value: unknown) => {
    setLocal((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    onChange(local);
    onClose();
  };

  return (
    <div className="space-y-4 py-2">
      {/* Common fields */}
      {typeof local.title === "string" && (
        <Field label="Title" value={local.title as string} onChange={(v) => update("title", v)} />
      )}
      {typeof local.subtitle === "string" && (
        <Field label="Subtitle" value={local.subtitle as string} onChange={(v) => update("subtitle", v)} />
      )}
      {typeof local.headline === "string" && (
        <Field label="Headline" value={local.headline as string} onChange={(v) => update("headline", v)} />
      )}
      {typeof local.content === "string" && (
        <div>
          <Label>Content</Label>
          <Textarea value={local.content as string} onChange={(e) => update("content", e.target.value)} rows={4} />
        </div>
      )}
      {typeof local.image === "string" && (
        <ImageField
          value={local.image as string}
          onChange={(v) => update("image", v)}
          imagePosition={local.imagePosition as string | undefined}
          onPositionChange={local.imagePosition !== undefined ? (v) => update("imagePosition", v) : undefined}
        />
      )}
      {typeof local.ctaLabel === "string" && (
        <div className="grid grid-cols-2 gap-3">
          <Field label="CTA Label" value={local.ctaLabel as string} onChange={(v) => update("ctaLabel", v)} />
          <Field label="CTA Link" value={(local.ctaHref as string) || ""} onChange={(v) => update("ctaHref", v)} />
        </div>
      )}
      {typeof local.price === "string" && (
        <div className="grid grid-cols-2 gap-3">
          <Field label="Price" value={local.price as string} onChange={(v) => update("price", v)} />
          {typeof local.duration === "string" && (
            <Field label="Duration" value={local.duration as string} onChange={(v) => update("duration", v)} />
          )}
        </div>
      )}

      {/* Array items preview */}
      {Array.isArray(local.items) && (
        <div>
          <Label>Items ({(local.items as unknown[]).length})</Label>
          <div className="border border-border rounded-md p-3 mt-1 space-y-2 max-h-48 overflow-y-auto bg-muted/30">
            {(local.items as { title?: string; question?: string }[]).map((item, i) => (
              <div key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                <Badge variant="outline" className="shrink-0 text-[10px]">{i + 1}</Badge>
                <span className="truncate">{item.title || item.question || "Item"}</span>
              </div>
            ))}
            {(local.items as unknown[]).length === 0 && (
              <p className="text-xs text-muted-foreground italic">No items yet</p>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Item editing will be available when connected to a backend</p>
        </div>
      )}

      {/* Paragraphs */}
      {Array.isArray(local.paragraphs) && (
        <div>
          <Label>Paragraphs</Label>
          {(local.paragraphs as string[]).map((p, i) => (
            <Textarea
              key={i}
              value={p}
              onChange={(e) => {
                const next = [...(local.paragraphs as string[])];
                next[i] = e.target.value;
                update("paragraphs", next);
              }}
              rows={2}
              className="mt-2"
            />
          ))}
        </div>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave}>Save Changes</Button>
      </div>
    </div>
  );
};

const Field = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => (
  <div>
    <Label>{label}</Label>
    <Input value={value} onChange={(e) => onChange(e.target.value)} />
  </div>
);

// ─── Image Field with Upload + Position ───
const PRESET_IMAGES = ["classroom", "business", "leadership", "executive", "care"];

const ImageField = ({
  value,
  onChange,
  imagePosition,
  onPositionChange,
}: {
  value: string;
  onChange: (v: string) => void;
  imagePosition?: string;
  onPositionChange?: (v: string) => void;
}) => {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") onChange(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const isDataUrl = value.startsWith("data:");
  const isUrl = value.startsWith("http");

  return (
    <div className="space-y-3">
      <Label className="flex items-center gap-2">
        <ImageIcon className="h-4 w-4" /> Image
      </Label>

      {/* Preview */}
      {(isDataUrl || isUrl) && (
        <div className="rounded-lg border border-border overflow-hidden bg-muted/30 max-h-40 flex items-center justify-center">
          <img src={value} alt="Preview" className="max-h-40 object-contain" />
        </div>
      )}
      {!isDataUrl && !isUrl && value && (
        <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm text-muted-foreground flex items-center gap-2">
          <ImageIcon className="h-4 w-4 shrink-0" />
          Preset: <span className="font-medium text-foreground">{value}</span>
        </div>
      )}

      {/* Upload + Preset */}
      <div className="flex gap-2">
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
        <Button type="button" variant="outline" size="sm" className="flex-1" onClick={() => fileRef.current?.click()}>
          <Upload className="h-3.5 w-3.5 mr-1.5" /> Upload Image
        </Button>
        <Select value={isDataUrl || isUrl ? "" : value} onValueChange={onChange}>
          <SelectTrigger className="flex-1 h-9">
            <SelectValue placeholder="Or choose preset" />
          </SelectTrigger>
          <SelectContent>
            {PRESET_IMAGES.map((img) => (
              <SelectItem key={img} value={img}>{img}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Image Position Toggle */}
      {onPositionChange && (
        <div>
          <Label className="text-xs text-muted-foreground mb-1.5 block">Image Position</Label>
          <div className="flex gap-2">
            <Button
              type="button"
              variant={imagePosition === "left" ? "default" : "outline"}
              size="sm"
              className="flex-1"
              onClick={() => onPositionChange("left")}
            >
              <AlignLeft className="h-3.5 w-3.5 mr-1.5" /> Left
            </Button>
            <Button
              type="button"
              variant={imagePosition === "right" ? "default" : "outline"}
              size="sm"
              className="flex-1"
              onClick={() => onPositionChange("right")}
            >
              <AlignRight className="h-3.5 w-3.5 mr-1.5" /> Right
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

const getBlockPreview = (block: ContentBlock): string => {
  const d = block.data as Record<string, unknown>;
  return (d.title as string) || (d.headline as string) || (d.content as string)?.slice(0, 60) || block.type;
};

const getBlockDescription = (type: BlockType): string => {
  const desc: Record<BlockType, string> = {
    hero: "Full-width banner",
    text: "Title + content",
    "image-text": "Side by side",
    modules: "Numbered list",
    faq: "Accordion Q&A",
    stats: "Counter cards",
    cta: "Action banner",
    cards: "Grid of cards",
    logos: "Logo carousel",
    blog: "News grid",
    "why-us": "Feature highlights",
    pricing: "Price display",
  };
  return desc[type];
};

export default PageEditor;
