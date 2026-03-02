import { useState, useRef, lazy, Suspense } from "react";
import { Upload, ImageIcon, AlignLeft, AlignRight, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ContentBlock } from "@/types/pageBuilder";
import RichTextEditor from "./RichTextEditor";

interface BlockEditorFormProps {
  block: ContentBlock;
  onChange: (data: Record<string, unknown>) => void;
  onClose: () => void;
}

const BlockEditorForm = ({ block, onChange, onClose }: BlockEditorFormProps) => {
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
          <RichTextEditor value={local.content as string} onChange={(v) => update("content", v)} />
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

      {Array.isArray(local.paragraphs) && (
        <div>
          <Label>Paragraphs</Label>
          {(local.paragraphs as string[]).map((p, i) => (
            <div key={i} className="mt-2">
              <RichTextEditor
                value={p}
                onChange={(val) => {
                  const next = [...(local.paragraphs as string[])];
                  next[i] = val;
                  update("paragraphs", next);
                }}
              />
            </div>
          ))}
        </div>
      )}

      {block.type === "cta" && <CTABackgroundEditor local={local} update={update} />}

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave}>Save Changes</Button>
      </div>
    </div>
  );
};

// ─── Field ───
const Field = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => (
  <div>
    <Label>{label}</Label>
    <Input value={value} onChange={(e) => onChange(e.target.value)} />
  </div>
);

// ─── CTA Background Editor ───
const CTABackgroundEditor = ({ local, update }: { local: Record<string, unknown>; update: (key: string, value: unknown) => void }) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const bgMode = (local.bgMode as string) || "color";
  const bgColor = (local.bgColor as string) || "#0c2d6b";
  const bgImage = (local.bgImage as string) || "";
  const overlayColor = (local.overlayColor as string) || "rgba(0,0,0,0.5)";

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") update("bgImage", reader.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-3 rounded-lg border border-border p-4 bg-muted/20">
      <Label className="flex items-center gap-2 text-sm font-semibold">
        <Palette className="h-4 w-4" /> Background Style
      </Label>
      <div className="flex gap-2">
        <Button type="button" variant={bgMode === "color" ? "default" : "outline"} size="sm" className="flex-1" onClick={() => update("bgMode", "color")}>
          Solid Color
        </Button>
        <Button type="button" variant={bgMode === "image" ? "default" : "outline"} size="sm" className="flex-1" onClick={() => update("bgMode", "image")}>
          Background Image
        </Button>
      </div>

      {bgMode === "color" && (
        <div>
          <Label className="text-xs text-muted-foreground">Background Color</Label>
          <div className="flex items-center gap-2 mt-1">
            <input type="color" value={bgColor} onChange={(e) => update("bgColor", e.target.value)} className="w-10 h-9 rounded border border-border cursor-pointer" />
            <Input value={bgColor} onChange={(e) => update("bgColor", e.target.value)} className="flex-1 h-9 font-mono text-sm" placeholder="#0c2d6b" />
          </div>
        </div>
      )}

      {bgMode === "image" && (
        <div className="space-y-3">
          {bgImage && (
            <div className="rounded-lg border border-border overflow-hidden bg-muted/30 max-h-32 flex items-center justify-center relative">
              <img src={bgImage} alt="BG Preview" className="max-h-32 w-full object-cover" />
              <div className="absolute inset-0" style={{ backgroundColor: overlayColor }} />
              <span className="absolute text-white text-xs font-medium z-10">Preview with overlay</span>
            </div>
          )}
          <div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
            <Button type="button" variant="outline" size="sm" className="w-full" onClick={() => fileRef.current?.click()}>
              <Upload className="h-3.5 w-3.5 mr-1.5" /> {bgImage ? "Change Image" : "Upload Background Image"}
            </Button>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Overlay Color</Label>
            <div className="flex items-center gap-2 mt-1">
              <input
                type="color"
                value={overlayColor.startsWith("rgba") ? "#000000" : overlayColor}
                onChange={(e) => {
                  const hex = e.target.value;
                  const r = parseInt(hex.slice(1, 3), 16);
                  const g = parseInt(hex.slice(3, 5), 16);
                  const b = parseInt(hex.slice(5, 7), 16);
                  update("overlayColor", `rgba(${r},${g},${b},0.5)`);
                }}
                className="w-10 h-9 rounded border border-border cursor-pointer"
              />
              <Input value={overlayColor} onChange={(e) => update("overlayColor", e.target.value)} className="flex-1 h-9 font-mono text-sm" placeholder="rgba(0,0,0,0.5)" />
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">Use rgba format to control opacity, e.g. rgba(0,0,0,0.5)</p>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Image Field ───
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
      <Label className="flex items-center gap-2"><ImageIcon className="h-4 w-4" /> Image</Label>
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
      <div className="flex gap-2">
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
        <Button type="button" variant="outline" size="sm" className="flex-1" onClick={() => fileRef.current?.click()}>
          <Upload className="h-3.5 w-3.5 mr-1.5" /> Upload Image
        </Button>
        <Select value={isDataUrl || isUrl ? "" : value} onValueChange={onChange}>
          <SelectTrigger className="flex-1 h-9"><SelectValue placeholder="Or choose preset" /></SelectTrigger>
          <SelectContent>
            {PRESET_IMAGES.map((img) => (<SelectItem key={img} value={img}>{img}</SelectItem>))}
          </SelectContent>
        </Select>
      </div>
      {onPositionChange && (
        <div>
          <Label className="text-xs text-muted-foreground mb-1.5 block">Image Position</Label>
          <div className="flex gap-2">
            <Button type="button" variant={imagePosition === "left" ? "default" : "outline"} size="sm" className="flex-1" onClick={() => onPositionChange("left")}>
              <AlignLeft className="h-3.5 w-3.5 mr-1.5" /> Left
            </Button>
            <Button type="button" variant={imagePosition === "right" ? "default" : "outline"} size="sm" className="flex-1" onClick={() => onPositionChange("right")}>
              <AlignRight className="h-3.5 w-3.5 mr-1.5" /> Right
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlockEditorForm;
