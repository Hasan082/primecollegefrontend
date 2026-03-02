import { useState, useRef } from "react";
import { Search, Upload, ImageIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface SEOMeta {
  title?: string;
  description?: string;
  ogImage?: string;
}

interface SEOPanelProps {
  slug: string;
  onSlugChange: (slug: string) => void;
  meta: SEOMeta;
  onMetaChange: (meta: SEOMeta) => void;
}

const SEOPanel = ({ slug, onSlugChange, meta, onMetaChange }: SEOPanelProps) => {
  const [open, setOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const titleLen = (meta.title || "").length;
  const descLen = (meta.description || "").length;

  const handleOgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") onMetaChange({ ...meta, ogImage: reader.result });
    };
    reader.readAsDataURL(file);
  };

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <Button variant="outline" size="sm" className="w-full justify-start gap-2">
          <Search className="h-3.5 w-3.5" />
          SEO & Meta Settings
          <span className="ml-auto text-[10px] text-muted-foreground">{open ? "Close" : "Expand"}</span>
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-3">
        <div className="rounded-lg border border-border p-4 space-y-4 bg-muted/20">
          {/* Slug */}
          <div>
            <Label className="text-xs text-muted-foreground">Page Slug (URL)</Label>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-sm text-muted-foreground font-mono">/</span>
              <Input
                value={slug.replace(/^\//, "")}
                onChange={(e) => onSlugChange(`/${e.target.value.replace(/^\//, "")}`)}
                className="h-8 font-mono text-sm"
                placeholder="page-url"
              />
            </div>
          </div>

          {/* Meta Title */}
          <div>
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">Meta Title</Label>
              <span className={`text-[10px] ${titleLen > 60 ? "text-destructive" : "text-muted-foreground"}`}>
                {titleLen}/60
              </span>
            </div>
            <Input
              value={meta.title || ""}
              onChange={(e) => onMetaChange({ ...meta, title: e.target.value })}
              className="h-8 mt-1"
              placeholder="Page title for search engines"
            />
          </div>

          {/* Meta Description */}
          <div>
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">Meta Description</Label>
              <span className={`text-[10px] ${descLen > 160 ? "text-destructive" : "text-muted-foreground"}`}>
                {descLen}/160
              </span>
            </div>
            <Textarea
              value={meta.description || ""}
              onChange={(e) => onMetaChange({ ...meta, description: e.target.value })}
              rows={2}
              className="mt-1"
              placeholder="Brief description for search results"
            />
          </div>

          {/* OG Image */}
          <div>
            <Label className="text-xs text-muted-foreground">Social Share Image (OG Image)</Label>
            {meta.ogImage && (
              <div className="rounded-lg border border-border overflow-hidden bg-muted/30 max-h-28 mt-1 flex items-center justify-center">
                <img src={meta.ogImage} alt="OG Preview" className="max-h-28 object-contain" />
              </div>
            )}
            <div className="mt-2">
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleOgUpload} />
              <Button type="button" variant="outline" size="sm" className="w-full" onClick={() => fileRef.current?.click()}>
                {meta.ogImage ? (
                  <><ImageIcon className="h-3.5 w-3.5 mr-1.5" /> Change OG Image</>
                ) : (
                  <><Upload className="h-3.5 w-3.5 mr-1.5" /> Upload OG Image</>
                )}
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">Recommended: 1200×630px for optimal social media display</p>
          </div>

          {/* Preview */}
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">Search Preview</Label>
            <div className="rounded-md border border-border p-3 bg-background space-y-0.5">
              <p className="text-sm font-medium text-primary truncate">
                {meta.title || "Page Title"}
              </p>
              <p className="text-[11px] text-primary/70 font-mono truncate">
                primecollege.co.uk{slug}
              </p>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {meta.description || "No description set."}
              </p>
            </div>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default SEOPanel;
