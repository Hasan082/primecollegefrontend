import React, { useRef, lazy, Suspense } from "react";
import { Smile, ImageIcon, Upload } from "lucide-react";
import dynamicIconImports from "lucide-react/dynamicIconImports";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Image } from "@/components/Image";

// Icon name mapping: PascalCase display → kebab-case key for dynamicIconImports
export const ICON_PRESETS: { name: string; key: keyof typeof dynamicIconImports }[] = [
  { name: "Users", key: "users" }, { name: "Shield", key: "shield" }, { name: "Award", key: "award" }, { name: "BookOpen", key: "book-open" },
  { name: "Target", key: "target" }, { name: "Heart", key: "heart" }, { name: "Star", key: "star" }, { name: "Lightbulb", key: "lightbulb" },
  { name: "TrendingUp", key: "trending-up" }, { name: "CheckCircle", key: "circle-check" }, { name: "Globe", key: "globe" }, { name: "Zap", key: "zap" },
  { name: "Clock", key: "clock" }, { name: "ThumbsUp", key: "thumbs-up" }, { name: "Layers", key: "layers" }, { name: "Briefcase", key: "briefcase" },
  { name: "GraduationCap", key: "graduation-cap" }, { name: "Building", key: "building" }, { name: "Rocket", key: "rocket" }, { name: "Megaphone", key: "megaphone" },
];

const lazyIconCache: Record<string, React.LazyExoticComponent<React.ComponentType<{ size?: number; className?: string }>>> = {};

const getLazyIcon = (kebab: string) => {
  if (!lazyIconCache[kebab]) {
    const importFn = dynamicIconImports[kebab as keyof typeof dynamicIconImports];
    if (!importFn) return null;
    lazyIconCache[kebab] = lazy(importFn) as any;
  }
  return lazyIconCache[kebab];
};

export const DynamicIcon = ({ iconKey, size = 16, className }: { iconKey: string; size?: number; className?: string }) => {
  const kebab = ICON_PRESETS.find((p) => p.name === iconKey)?.key || iconKey.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
  const LazyIcon = getLazyIcon(kebab);
  if (!LazyIcon) return <Smile size={size} className={className} />;
  return (
    <Suspense fallback={<div className="rounded bg-muted" style={{ width: size, height: size }} />}>
      <LazyIcon size={size} className={className} />
    </Suspense>
  );
};

export const MediaPicker = ({ item, onUpdate, onImageUpload, isUploading }: any) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const mediaType = item.mediaType || "icon";
  const imageSize = item.imageSize || "icon";

  return (
    <div className="space-y-2">
      <Label className="text-xs text-muted-foreground">Media</Label>
      <div className="flex gap-1.5 shadow-sm rounded-md p-1 bg-muted/40 border">
        <Button variant={mediaType === "icon" ? "default" : "ghost"} size="sm" className="flex-1 h-7 text-[10px]" onClick={() => onUpdate("mediaType", "icon")}><Smile className="h-3 w-3 mr-1" /> Icon</Button>
        <Button variant={mediaType === "text" ? "default" : "ghost"} size="sm" className="flex-1 h-7 text-[10px]" onClick={() => onUpdate("mediaType", "text")}><span className="font-bold mr-1">T</span> Text</Button>
        <Button variant={mediaType === "image" ? "default" : "ghost"} size="sm" className="flex-1 h-7 text-[10px]" onClick={() => onUpdate("mediaType", "image")}><ImageIcon className="h-3 w-3 mr-1" /> Image</Button>
      </div>

      {mediaType === "text" && (
        <div className="space-y-1 pt-1">
          <Label className="text-[10px] text-muted-foreground uppercase">Circle Text</Label>
          <input 
            type="text" 
            className="w-full h-8 text-sm px-2 border rounded bg-background" 
            placeholder="e.g. 01"
            value={item.circleText || ""}
            onChange={(e) => onUpdate("circleText", e.target.value)}
          />
        </div>
      )}

      {mediaType === "icon" && (
        <div className="grid grid-cols-5 gap-1 pt-1">
          {ICON_PRESETS.map((p) => (
            <Button key={p.name} variant={item.icon === p.name ? "default" : "outline"} size="sm" className="h-9 p-0 flex flex-col items-center justify-center gap-0.5" onClick={() => onUpdate("icon", p.name)}>
              <DynamicIcon iconKey={p.name} size={14} />
              <span className="text-[7px] leading-none">{p.name.slice(0, 5)}</span>
            </Button>
          ))}
        </div>
      )}

      {mediaType === "image" && (
        <div className="space-y-2">
          {item.image && (
            <div className={`rounded-md border overflow-hidden bg-muted/30 flex items-center justify-center p-2 ${imageSize === "full" ? "w-full" : "w-16 h-16 mx-auto rounded-full"}`}>
              <Image image={item.image} className="w-full h-full object-cover" />
            </div>
          )}
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
            const f = e.target.files?.[0]; if (f) { onImageUpload(f, "image"); onUpdate("mediaType", "image"); }
          }} />
          <div className="flex gap-1.5">
            <Button variant="outline" size="sm" className="flex-1 h-7 text-[10px]" onClick={() => fileRef.current?.click()} disabled={isUploading}>{isUploading ? "..." : "Upload"}</Button>
            <Button variant="outline" size="sm" className="h-7 text-[10px]" onClick={() => onUpdate("imageSize", imageSize === "icon" ? "full" : "icon")}>{imageSize === "icon" ? "🖼 Full" : "🔵 Icon"}</Button>
          </div>
        </div>
      )}
    </div>
  );
};
