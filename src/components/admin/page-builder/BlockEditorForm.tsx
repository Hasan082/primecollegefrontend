import { useState, useRef } from "react";
import { Upload, ImageIcon, AlignLeft, AlignRight, Palette, Loader2 } from "lucide-react";
import { useUploadCMSImageMutation } from "@/redux/apis/pageBuilderApi";
import { Image } from "@/components/Image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

import type { ContentBlock, TextAlignment, BlockStyle } from "@/types/pageBuilder";
import RichTextEditor from "./RichTextEditor";
import BlockStylePanel from "./BlockStylePanel";
import ItemListEditor from "./ItemListEditor";

interface BlockEditorFormProps {
  block: ContentBlock;
  onSave: (data: Record<string, unknown>, meta: { alignment?: TextAlignment; style?: BlockStyle; label?: string }) => void;
  onClose: () => void;
  onUploadingChange?: (isUploading: boolean) => void;
}

const BlockEditorForm = ({ block, onSave, onClose, onUploadingChange }: BlockEditorFormProps) => {
  const [local, setLocal] = useState<Record<string, unknown>>(block.data as Record<string, unknown>);
  const [alignment, setAlignment] = useState<TextAlignment>(block.alignment || "center");
  const [blockStyle, setBlockStyle] = useState<BlockStyle>(block.style || {});
  const [blockLabel, setBlockLabel] = useState(block.label);
  const [isUploading, _setIsUploading] = useState(false);
  const [uploadCMSImage] = useUploadCMSImageMutation();

  const setIsUploading = (v: boolean) => {
    _setIsUploading(v);
    onUploadingChange?.(v);
  };

  const update = (key: string, value: unknown) => {
    setLocal((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    if (isUploading) return;
    onSave(local, { alignment, style: blockStyle, label: blockLabel });
    onClose();
  };

  const handleClose = () => {
    if (isUploading) return;
    onClose();
  };

  const onImageUpload = async (file: File, path: string) => {
    setIsUploading(true);
    const formData = new FormData();
    formData.append("image", file);
    try {
      const res = await uploadCMSImage(formData).unwrap();
      if (res.success && res.data?.image) {
        if (path.includes(".")) {
          const parts = path.split(".");
          if (parts[0] === "items" && parts.length === 3) {
            const idx = parseInt(parts[1]);
            const key = parts[2];
            const nextItems = [...(local.items as any[])];
            nextItems[idx] = { ...nextItems[idx], [key]: res.data.image };
            update("items", nextItems);
          }
        } else {
          update(path, res.data.image);
        }
      }
    } catch (error) {
      console.error("Image upload failed:", error);
    } finally {
      setIsUploading(false);
    }
  };

  // Text block uses its own data.alignment for backward compat
  const showGlobalAlignment = block.type !== "text";

  return (
    <div className="space-y-4 py-2">
      {/* Editable Block Label */}
      <div>
        <Label className="text-xs text-muted-foreground">Block Label</Label>
        <Input value={blockLabel} onChange={(e) => setBlockLabel(e.target.value)} placeholder="e.g. Featured Image, Introduction..." className="h-8 text-sm" />
      </div>

      {/* Image-only block */}
      {block.type === "image" && (
        <div className="space-y-3">
          <ImageField value={local.image } onChange={(file) => onImageUpload(file, "image")} isUploading={isUploading} />
          <Field label="Alt Text" value={(local.alt as string) || ""} onChange={(v) => update("alt", v)} />
          <Field label="Caption" value={(local.caption as string) || ""} onChange={(v) => update("caption", v)} />
        </div>
      )}
      {/* Title + Alignment row */}
      {typeof local.title === "string" && (
        <div>
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <Field label="Title" value={local.title as string} onChange={(v) => update("title", v)} />
            </div>
            {block.type === "text" ? (
              <AlignmentToggle
                value={(local.alignment as TextAlignment) || "center"}
                onChange={(v) => update("alignment", v)}
              />
            ) : (
              <AlignmentToggle value={alignment} onChange={setAlignment} />
            )}
          </div>
        </div>
      )}

      {/* For blocks without title but with headline */}
      {typeof local.headline === "string" && (
        <div>
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <Field label="Headline" value={local.headline as string} onChange={(v) => update("headline", v)} />
            </div>
            {showGlobalAlignment && !local.title && (
              <AlignmentToggle value={alignment} onChange={setAlignment} />
            )}
          </div>
        </div>
      )}

      {/* For blocks without title or headline (e.g. pricing) — show alignment standalone */}
      {typeof local.title !== "string" && typeof local.headline !== "string" && showGlobalAlignment && (
        <div className="flex items-center gap-3">
          <Label className="text-xs text-muted-foreground">Align</Label>
          <AlignmentToggle value={alignment} onChange={setAlignment} />
        </div>
      )}

      {typeof local.subtitle === "string" && (
        <Field label="Subtitle" value={local.subtitle as string} onChange={(v) => update("subtitle", v)} />
      )}
      {typeof local.content === "string" && block.type !== "image-text" && (
        <div>
          <Label>Content</Label>
          <RichTextEditor value={local.content as string} onChange={(v) => update("content", v)} />
        </div>
      )}

      {/* Image+Text block: description field */}
      {block.type === "image-text" && (
        <div>
          <Label>Description</Label>
          <RichTextEditor
            value={(local.description as string) || (Array.isArray(local.paragraphs) ? (local.paragraphs as string[]).join("") : "")}
            onChange={(v) => {
              update("description", v);
              update("paragraphs", [v]);
            }}
          />
        </div>
      )}

      {typeof local.image !== "undefined" && (
        <ImageField
          value={local.image}
          onChange={(file) => onImageUpload(file, "image")}
          isUploading={isUploading}
          imagePosition={local.imagePosition as string | undefined}
          onPositionChange={local.imagePosition !== undefined ? (v) => update("imagePosition", v) : undefined}
        />
      )}

      {/* Paragraphs for non-image-text blocks */}
      {Array.isArray(local.paragraphs) && block.type !== "image-text" && (
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

      {(typeof local.ctaLabel === "string" || block.type === "hero") && (
        <div className="space-y-1">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Button Label" value={(local.ctaLabel as string) || ""} onChange={(v) => update("ctaLabel", v)} />
            <Field label="Button Link" value={(local.ctaHref as string) || ""} onChange={(v) => update("ctaHref", v)} />
          </div>
          <p className="text-[10px] text-muted-foreground">Leave empty to hide the button</p>
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
        <ItemListEditor
          blockType={block.type}
          items={local.items as any[]}
          onChange={(items) => update("items", items)}
          onImageUpload={onImageUpload}
          isUploading={isUploading}
        />
      )}

      {block.type === "cta" && <CTABackgroundEditor local={local} update={update} onImageUpload={onImageUpload} isUploading={isUploading} />}

      {/* Block Style Panel — available for ALL blocks */}
      <BlockStylePanel style={blockStyle} onChange={setBlockStyle} />

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" onClick={handleClose} disabled={isUploading}>Cancel</Button>
        <Button onClick={handleSave} disabled={isUploading}>
          {isUploading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Uploading...</> : "Save Changes"}
        </Button>
      </div>
    </div>
  );
};

// ─── Alignment Toggle ───
const AlignmentToggle = ({ value, onChange }: { value: TextAlignment; onChange: (v: TextAlignment) => void }) => (
  <div className="shrink-0">
    <Label className="text-xs text-muted-foreground mb-1 block">Align</Label>
    <div className="flex gap-1">
      {(["left", "center", "right"] as const).map((align) => (
        <Button
          key={align}
          type="button"
          variant={value === align ? "default" : "outline"}
          size="sm"
          className="h-9 w-9 p-0 text-xs capitalize"
          onClick={() => onChange(align)}
        >
          {align === "left" ? "L" : align === "center" ? "C" : "R"}
        </Button>
      ))}
    </div>
  </div>
);

// ─── Field ───
const Field = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => (
  <div>
    <Label>{label}</Label>
    <Input value={value} onChange={(e) => onChange(e.target.value)} />
  </div>
);

// ─── CTA Background Editor ───
const CTABackgroundEditor = ({ local, update, onImageUpload, isUploading }: { local: Record<string, unknown>; update: (key: string, value: unknown) => void; onImageUpload: (file: File, key: string) => void; isUploading: boolean }) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const bgMode = (local.bgMode as string) || "color";
  const bgColor = (local.bgColor as string) || "#0c2d6b";
  const bgImage = local.bgImage;
  const overlayColor = (local.overlayColor as string) || "rgba(0,0,0,0.5)";

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onImageUpload(file, "bgImage");
  };

  return (
    <div className="space-y-3 rounded-lg border border-border p-4 bg-muted/20">
      <Label className="flex items-center gap-2 text-sm font-semibold">
        <Palette className="h-4 w-4" /> CTA Background Style
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
              {typeof bgImage === "string" ? (
                <img src={bgImage} alt="BG Preview" className="max-h-32 w-full object-cover" />
              ) : (
                <Image image={bgImage} className="max-h-32 w-full object-cover" />
              )}
              <div className="absolute inset-0" style={{ backgroundColor: overlayColor }} />
              <span className="absolute text-white text-xs font-medium z-10">Preview with overlay</span>
            </div>
          )}
          <div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
            <Button type="button" variant="outline" size="sm" className="w-full" onClick={() => fileRef.current?.click()} disabled={isUploading}>
              <Upload className="h-3.5 w-3.5 mr-1.5" /> 
              {isUploading ? "Uploading..." : bgImage ? "Change Image" : "Upload Background Image"}
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
const ImageField = ({
  value,
  onChange,
  isUploading,
  imagePosition,
  onPositionChange,
}: {
  value: any;
  onChange: (file: File) => void;
  isUploading: boolean;
  imagePosition?: string;
  onPositionChange?: (v: string) => void;
}) => {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onChange(file);
  };

  const isString = typeof value === "string";
  const isObject = typeof value === "object" && value !== null;
  const hasValue = (isString && value.length > 0) || (isObject && (value.small || value.original));

  return (
    <div className="space-y-3">
      <Label className="flex items-center gap-2"><ImageIcon className="h-4 w-4" /> Image</Label>
      {hasValue && (
        <div className="rounded-lg border border-border overflow-hidden bg-muted/30 max-h-40 flex items-center justify-center">
          {isString ? (
            <img src={value} alt="Preview" className="max-h-40 object-contain" />
          ) : (
            <Image image={value} className="max-h-40 object-contain" />
          )}
        </div>
      )}
      <div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
        <Button type="button" variant="outline" size="sm" className="w-full" onClick={() => fileRef.current?.click()} disabled={isUploading}>
          <Upload className="h-3.5 w-3.5 mr-1.5" /> 
          {isUploading ? "Uploading..." : value ? "Change Image" : "Upload Image"}
        </Button>
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
