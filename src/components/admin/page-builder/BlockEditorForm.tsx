import { useState } from "react";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Loader2, Plus, X } from "lucide-react";
import { useUploadCMSImageMutation } from "@/redux/apis/pageBuilderApi";
import { useGetQualificationSliderOptionsQuery } from "@/redux/apis/qualification/qualificationApi";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Textarea } from "@/components/ui/textarea";

import type { ContentBlock, TextAlignment, BlockStyle } from "@/types/pageBuilder";
import { normalizeQualificationSliderData } from "@/utils/pageBuilder";
import RichTextEditor from "./RichTextEditor";
import ItemListEditor from "./ItemListEditor";

// Refactored Fields
import Field from "./fields/Field";
import ImageField from "./fields/ImageField";
import CTABackgroundEditor from "./fields/CTABackgroundEditor";

interface BlockEditorFormProps {
  block: ContentBlock;
  onSave: (data: Record<string, unknown>, meta: { alignment?: TextAlignment; style?: BlockStyle; label?: string }) => void;
  onClose: () => void;
  onUploadingChange?: (isUploading: boolean) => void;
}

interface QualificationOption {
  id: string;
  title: string;
  category?: string;
  level?: string;
}

const SortableQualificationRow = ({
  qualification,
  onRemove,
}: {
  qualification: QualificationOption;
  onRemove: (qualificationId: string) => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: qualification.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex min-w-0 items-center gap-3 rounded-lg border bg-background px-3 py-2 shadow-sm"
    >
      <button
        type="button"
        className="cursor-grab touch-none rounded p-1 text-muted-foreground hover:bg-muted"
        aria-label={`Reorder ${qualification.title}`}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <div className="min-w-0 flex-1 overflow-hidden">
        <div className="line-clamp-2 break-words text-sm font-medium leading-5 text-foreground">
          {qualification.title}
        </div>
        <div className="truncate text-[11px] text-muted-foreground">
          {[qualification.category, qualification.level].filter(Boolean).join(" • ") || qualification.id}
        </div>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8 shrink-0"
        onClick={() => onRemove(qualification.id)}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};

const BlockEditorForm = ({ block, onSave, onClose, onUploadingChange }: BlockEditorFormProps) => {
  const [local, setLocal] = useState<Record<string, unknown>>(block.data as Record<string, unknown>);
  const [blockLabel, setBlockLabel] = useState(block.label);
  const [isUploading, _setIsUploading] = useState(false);
  const [qualificationSelectOpen, setQualificationSelectOpen] = useState(false);
  const [uploadCMSImage] = useUploadCMSImageMutation();
  const { data: qualificationOptionsResponse = [], isLoading: isQualificationsLoading } = useGetQualificationSliderOptionsQuery();
  const qualificationOptions = qualificationOptionsResponse as QualificationOption[];
  const qualificationSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const setIsUploading = (v: boolean) => { _setIsUploading(v); onUploadingChange?.(v); };
  const update = (key: string, value: unknown) => setLocal((prev) => ({ ...prev, [key]: value }));

  const handleSave = () => {
    if (isUploading) return;
    const nextLocal =
      block.type === "qualification_slider"
        ? normalizeQualificationSliderData(local)
        : block.type === "popular-qualifications"
        ? {
            ...local,
            selection_mode: (local.selection_mode as string) === "manual" ? "manual" : "latest",
            qualification_ids:
              (local.selection_mode as string) === "manual"
                ? selectedQualificationIds
                : [],
            show_count: Math.max(1, Number(local.show_count) || 4),
          }
        : local;
    onSave(nextLocal, { label: blockLabel });
    onClose();
  };

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

  const toggleQualification = (qualificationId: string, checked: boolean) => {
    const current = Array.isArray(local.qualification_ids)
      ? (local.qualification_ids as string[]).filter(Boolean)
      : [];

    const next = checked
      ? Array.from(new Set([...current, qualificationId]))
      : current.filter((id) => id !== qualificationId);

    update("qualification_ids", next);
  };

  const handleQualificationDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const current = Array.isArray(local.qualification_ids)
      ? (local.qualification_ids as string[]).filter(Boolean)
      : [];
    const oldIndex = current.findIndex((id) => id === active.id);
    const newIndex = current.findIndex((id) => id === over.id);

    if (oldIndex < 0 || newIndex < 0) return;
    update("qualification_ids", arrayMove(current, oldIndex, newIndex));
  };

  const selectedQualificationIds = Array.isArray(local.qualification_ids)
    ? (local.qualification_ids as string[]).filter(Boolean)
    : [];
  const selectedQualifications = selectedQualificationIds.map((id) =>
    qualificationOptions.find((qualification) => qualification.id === id) || { id, title: id },
  );
  const availableQualifications = qualificationOptions.filter(
    (qualification) => !selectedQualificationIds.includes(qualification.id),
  );


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

      {((typeof local.title === "string" && block.type !== "qualification_slider") || typeof local.headline === "string") && (
        <Field label={typeof local.title === "string" ? "Title / Headline" : "Headline"} 
               value={(local.title || local.headline) as string} 
               onChange={(v) => update(typeof local.title === "string" ? "title" : "headline", v)} />
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

      {block.type === "pricing" && (
        <div className="space-y-4 border-t pt-4">
          <Label className="text-sm font-bold">Pricing Configuration</Label>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Price" value={(local.price as string) || ""} onChange={(v) => update("price", v)} />
            <Field label="Duration" value={(local.duration as string) || ""} onChange={(v) => update("duration", v)} />
          </div>
          <div>
            <Label>Features</Label>
            <Textarea
              value={Array.isArray(local.features) ? (local.features as string[]).join("\n") : ""}
              onChange={(e) =>
                update(
                  "features",
                  e.target.value
                    .split(/\n|,/)
                    .map((item) => item.trim())
                    .filter(Boolean),
                )
              }
              placeholder={"One feature per line"}
              className="mt-1 min-h-[120px]"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="CTA Label" value={(local.ctaLabel as string) || ""} onChange={(v) => update("ctaLabel", v)} />
            <Field label="CTA Href" value={(local.ctaHref as string) || ""} onChange={(v) => update("ctaHref", v)} />
          </div>
        </div>
      )}

      {typeof local.image !== "undefined" && !["image", "hero"].includes(block.type) && (
        <ImageField value={local.image} onChange={(f) => onImageUpload(f, "image")} isUploading={isUploading} 
                    imagePosition={local.imagePosition as string} onPositionChange={(v) => update("imagePosition", v)} />
      )}

      {Array.isArray(local.items) && !["qualification_slider", "popular-qualifications", "blog"].includes(block.type) && (
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

      {block.type === "qualification_slider" && (
        <div className="space-y-4 border-t pt-4">
          <Label className="text-sm font-bold">Slider Configuration</Label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-[10px] text-muted-foreground uppercase">Selection Mode</Label>
              <select 
                className="w-full h-8 text-sm border rounded bg-background"
                value={(local.selection_mode as string) || "manual"}
                onChange={(e) => {
                  const mode = e.target.value;
                  update("selection_mode", mode);
                  if (mode === "latest") {
                    update("qualification_ids", []);
                    setQualificationSelectOpen(false);
                  }
                }}
              >
                <option value="manual">Manual Selection</option>
                <option value="latest">Latest Qualifications</option>
              </select>
            </div>
            <Field label="Show Count" value={String(local.show_count || 4)} onChange={(v) => update("show_count", parseInt(v) || 4)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 pt-4">
              <input 
                type="checkbox" 
                id="autoplay"
                checked={!!local.autoplay} 
                onChange={(e) => update("autoplay", e.target.checked)} 
              />
              <Label htmlFor="autoplay" className="text-xs">Autoplay</Label>
            </div>
            <Field label="Delay (ms)" value={String(local.delay_ms || 5000)} onChange={(v) => update("delay_ms", parseInt(v) || 5000)} />
          </div>

          {(local.selection_mode as string) !== "latest" && (
            <div className="pt-2 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <Label className="text-sm font-bold">Manual Qualification Selection</Label>
                <span className="text-[10px] text-muted-foreground font-mono">
                  {selectedQualificationIds.length} selected
                </span>
              </div>
              <div className="rounded-xl border bg-muted/20 p-3 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">Selected qualifications</p>
                    <p className="text-[11px] text-muted-foreground">
                      Add qualifications, then drag and drop to control the slider order.
                    </p>
                  </div>
                  <Popover open={qualificationSelectOpen} onOpenChange={setQualificationSelectOpen}>
                    <PopoverTrigger asChild>
                      <Button type="button" variant="outline" size="sm" className="shrink-0">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Qualification
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[min(420px,calc(100vw-2rem))] max-w-[calc(100vw-2rem)] p-0" align="end">
                      <Command>
                        <CommandInput placeholder="Search qualifications..." />
                        <CommandList>
                          <CommandEmpty>
                            {isQualificationsLoading ? "Loading qualifications..." : "No more qualifications available."}
                          </CommandEmpty>
                          <CommandGroup>
                            {availableQualifications.map((qualification) => (
                              <CommandItem
                                key={qualification.id}
                                value={`${qualification.title} ${qualification.category || ""} ${qualification.level || ""} ${qualification.id}`}
                                onSelect={() => {
                                  toggleQualification(qualification.id, true);
                                  setQualificationSelectOpen(false);
                                }}
                                className="gap-3"
                              >
                                <div className="min-w-0 flex-1">
                                  <div className="truncate text-sm font-medium">{qualification.title}</div>
                                  <div className="text-[11px] text-muted-foreground">
                                    {[qualification.category, qualification.level].filter(Boolean).join(" • ") || qualification.id}
                                  </div>
                                </div>
                                <Plus className="h-4 w-4 text-muted-foreground" />
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                {selectedQualifications.length > 0 ? (
                  <DndContext
                    sensors={qualificationSensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleQualificationDragEnd}
                  >
                    <SortableContext items={selectedQualificationIds} strategy={verticalListSortingStrategy}>
                      <div className="space-y-2">
                        {selectedQualifications.map((qualification) => (
                          <SortableQualificationRow
                            key={qualification.id}
                            qualification={qualification}
                            onRemove={(qualificationId) => toggleQualification(qualificationId, false)}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                ) : (
                  <div className="rounded-lg border border-dashed bg-background px-4 py-6 text-center">
                    <p className="text-sm text-muted-foreground">No qualifications added yet.</p>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Use <span className="font-medium text-foreground">Add Qualification</span> to start building the manual slider.
                    </p>
                  </div>
                )}
              </div>

            </div>
          )}
        </div>
      )}

      {block.type === "popular-qualifications" && (
        <div className="space-y-4 border-t pt-4">
          <Label className="text-sm font-bold">Popular Qualifications Configuration</Label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-[10px] text-muted-foreground uppercase">Selection Mode</Label>
              <select
                className="w-full h-8 text-sm border rounded bg-background"
                value={(local.selection_mode as string) || "latest"}
                onChange={(e) => {
                  const mode = e.target.value;
                  update("selection_mode", mode);
                  if (mode === "latest") {
                    update("qualification_ids", []);
                    setQualificationSelectOpen(false);
                  }
                }}
              >
                <option value="latest">Auto Latest Qualifications</option>
                <option value="manual">Manual Override</option>
              </select>
            </div>
            <Field label="Show Count" value={String(local.show_count || 4)} onChange={(v) => update("show_count", parseInt(v) || 4)} />
          </div>

          {(local.selection_mode as string) !== "latest" && (
            <div className="pt-2 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <Label className="text-sm font-bold">Manual Qualification Selection</Label>
                <span className="text-[10px] text-muted-foreground font-mono">
                  {selectedQualificationIds.length} selected
                </span>
              </div>
              <div className="rounded-xl border bg-muted/20 p-3 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">Selected qualifications</p>
                    <p className="text-[11px] text-muted-foreground">
                      Add qualifications, then drag and drop to control display order.
                    </p>
                  </div>
                  <Popover open={qualificationSelectOpen} onOpenChange={setQualificationSelectOpen}>
                    <PopoverTrigger asChild>
                      <Button type="button" variant="outline" size="sm" className="shrink-0">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Qualification
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[min(420px,calc(100vw-2rem))] max-w-[calc(100vw-2rem)] p-0" align="end">
                      <Command>
                        <CommandInput placeholder="Search qualifications..." />
                        <CommandList>
                          <CommandEmpty>
                            {isQualificationsLoading ? "Loading qualifications..." : "No more qualifications available."}
                          </CommandEmpty>
                          <CommandGroup>
                            {availableQualifications.map((qualification) => (
                              <CommandItem
                                key={qualification.id}
                                value={`${qualification.title} ${qualification.category || ""} ${qualification.level || ""} ${qualification.id}`}
                                onSelect={() => {
                                  toggleQualification(qualification.id, true);
                                  setQualificationSelectOpen(false);
                                }}
                                className="gap-3"
                              >
                                <div className="min-w-0 flex-1">
                                  <div className="truncate text-sm font-medium">{qualification.title}</div>
                                  <div className="text-[11px] text-muted-foreground">
                                    {[qualification.category, qualification.level].filter(Boolean).join(" • ") || qualification.id}
                                  </div>
                                </div>
                                <Plus className="h-4 w-4 text-muted-foreground" />
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                {selectedQualifications.length > 0 ? (
                  <DndContext sensors={qualificationSensors} collisionDetection={closestCenter} onDragEnd={handleQualificationDragEnd}>
                    <SortableContext items={selectedQualificationIds} strategy={verticalListSortingStrategy}>
                      <div className="space-y-2">
                        {selectedQualifications.map((qualification) => (
                          <SortableQualificationRow
                            key={qualification.id}
                            qualification={qualification}
                            onRemove={(qualificationId) => toggleQualification(qualificationId, false)}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                ) : (
                  <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
                    No qualifications selected yet.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}


      <div className="flex justify-end gap-2 pt-2 border-t">
        <Button variant="outline" onClick={onClose} disabled={isUploading}>Cancel</Button>
        <Button onClick={handleSave} disabled={isUploading}>{isUploading ? "Uploading..." : "Save Changes"}</Button>
      </div>
    </div>
  );
};

export default BlockEditorForm;
