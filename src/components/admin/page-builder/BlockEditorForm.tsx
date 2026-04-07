import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useUploadCMSImageMutation } from "@/redux/apis/pageBuilderApi";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import type { ContentBlock, TextAlignment, BlockStyle } from "@/types/pageBuilder";
import RichTextEditor from "./RichTextEditor";
import BlockStylePanel from "./BlockStylePanel";
import ItemListEditor from "./ItemListEditor";

// Refactored Fields
import AlignmentToggle from "./fields/AlignmentToggle";
import Field from "./fields/Field";
import ImageField from "./fields/ImageField";
import CTABackgroundEditor from "./fields/CTABackgroundEditor";

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

  const setIsUploading = (v: boolean) => { _setIsUploading(v); onUploadingChange?.(v); };
  const update = (key: string, value: unknown) => setLocal((prev) => ({ ...prev, [key]: value }));

  const handleSave = () => { if (!isUploading) { onSave(local, { alignment, style: blockStyle, label: blockLabel }); onClose(); } };

  const onImageUpload = async (file: File, path: string) => {
    setIsUploading(true);
    const formData = new FormData(); formData.append("image", file);
    try {
      const res = await uploadCMSImage(formData).unwrap();
      if (res.success && res.data?.image) {
        if (path.includes(".")) {
          const [p1, p2, p3] = path.split(".");
          if (p1 === "items" || p1 === "slides") {
            const next = [...(local[p1] as any[])];
            next[parseInt(p2)] = { ...next[parseInt(p2)], [p3]: res.data.image };
            update(p1, next);
          }
        } else update(path, res.data.image);
      }
    } catch (e) { console.error("Upload failed:", e); } finally { setIsUploading(false); }
  };

  const showGlobalAlignment = block.type !== "text";

  return (
    <div className="space-y-4 py-2">
      <div>
        <Label className="text-[10px] text-muted-foreground uppercase">Internal Label</Label>
        <Field label="" value={blockLabel} onChange={setBlockLabel} />
      </div>

      {block.type === "image" && (
        <div className="space-y-3">
          <ImageField value={local.image } onChange={(f) => onImageUpload(f, "image")} isUploading={isUploading} />
          <Field label="Alt Text" value={(local.alt as string) || ""} onChange={(v) => update("alt", v)} />
          <Field label="Caption" value={(local.caption as string) || ""} onChange={(v) => update("caption", v)} />
        </div>
      )}

      {(typeof local.title === "string" || typeof local.headline === "string") && (
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <Field label={typeof local.title === "string" ? "Title / Headline" : "Headline"} 
                   value={(local.title || local.headline) as string} 
                   onChange={(v) => update(typeof local.title === "string" ? "title" : "headline", v)} />
          </div>
          {block.type === "text" ? (
             <AlignmentToggle value={(local.alignment as TextAlignment) || "center"} onChange={(v) => update("alignment", v)} />
          ) : (showGlobalAlignment && <AlignmentToggle value={alignment} onChange={setAlignment} />)}
        </div>
      )}

      {typeof local.subtitle === "string" && <Field label="Subtitle" value={local.subtitle as string} onChange={(v) => update("subtitle", v)} />}
      
      {typeof local.content === "string" && block.type !== "image-text" && (
        <div><Label>Main Content</Label><RichTextEditor value={local.content as string} onChange={(v) => update("content", v)} /></div>
      )}

      {(block.type === "image-text" || block.type === "about-split") && (
        <div>
          <Label className="text-xs text-muted-foreground">Detailed Description / Paragraphs</Label>
          <RichTextEditor value={(local.description as string) || (Array.isArray(local.paragraphs) ? (local.paragraphs as string[]).join("") : "")}
            onChange={(v) => { update("description", v); update("paragraphs", [v]); }} />
        </div>
      )}

      {typeof local.ctaLabel === "string" && (
        <div className="grid grid-cols-2 gap-3">
          <Field label="CTA Label" value={local.ctaLabel as string} onChange={(v) => update("ctaLabel", v)} />
          <Field label="CTA Href" value={local.ctaHref as string} onChange={(v) => update("ctaHref", v)} />
        </div>
      )}

      {typeof local.image !== "undefined" && !["image", "hero"].includes(block.type) && (
        <ImageField value={local.image} onChange={(f) => onImageUpload(f, "image")} isUploading={isUploading} 
                    imagePosition={local.imagePosition as string} onPositionChange={(v) => update("imagePosition", v)} />
      )}

      {Array.isArray(local.items) && (
        <ItemListEditor blockType={block.type} items={local.items} onChange={(items: any) => update("items", items)} onImageUpload={onImageUpload} isUploading={isUploading} />
      )}

      {Array.isArray(local.slides) && (
        <ItemListEditor blockType={block.type} items={local.slides} onChange={(slides: any) => update("slides", slides)} onImageUpload={onImageUpload} isUploading={isUploading} />
      )}

      {block.type === "contact-form" && (
        <div className="space-y-4 border-t pt-4">
          <Label className="text-sm font-bold">Contact Details</Label>
          <Field label="Address" value={local.address as string} onChange={(v) => update("address", v)} />
          <Field label="Email" value={local.email as string} onChange={(v) => update("email", v)} />
          <Field label="Phone" value={local.phone as string} onChange={(v) => update("phone", v)} />
          <Field label="Office Hours" value={local.hours as string} onChange={(v) => update("hours", v)} />
          
          <div className="pt-2">
            <Label className="text-sm font-bold">Form Fields Configuration</Label>
            <ItemListEditor 
              blockType="contact-form" 
              items={local.formFields as any[]} 
              onChange={(v) => update("formFields", v)} 
            />
          </div>
        </div>
      )}

      {block.type === "map" && (
        <div className="space-y-4 border-t pt-4">
          <Label className="text-sm font-bold">Map Configuration</Label>
          <Field label="Title" value={local.title as string} onChange={(v) => update("title", v)} />
          <Field label="Google Maps Embed URL (iframe src)" value={local.iframeUrl as string} onChange={(v) => update("iframeUrl", v)} />
          <p className="text-[10px] text-muted-foreground italic">Use the URL from the 'src' attribute of a Google Maps iframe embed code.</p>
        </div>
      )}

      {block.type === "cta" && <CTABackgroundEditor local={local} update={update} onImageUpload={onImageUpload} isUploading={isUploading} />}

      <BlockStylePanel style={blockStyle} onChange={setBlockStyle} />

      <div className="flex justify-end gap-2 pt-2 border-t">
        <Button variant="outline" onClick={onClose} disabled={isUploading}>Cancel</Button>
        <Button onClick={handleSave} disabled={isUploading}>{isUploading ? "Uploading..." : "Save Changes"}</Button>
      </div>
    </div>
  );
};

export default BlockEditorForm;
