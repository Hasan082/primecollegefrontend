import React from "react";
import {
  BookOpen,
  BadgeDollarSign,
  Image as ImageIcon,
  Layers3,
  MessageSquareText,
  Newspaper,
  PanelTop,
  Text,
  LayoutGrid,
  ArrowRight,
  Users,
  BarChart3,
  Sparkles,
  Mail,
  MapPinned,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BlockType, BLOCK_TYPE_LABELS } from "@/types/pageBuilder";

const BLOCK_DESCRIPTIONS: Partial<Record<BlockType, string>> = {
  text: "Section copy",
  "full-width-text-image": "Full-width banner with text and background image",
  image: "Standalone image",
  "image-text": "Text with image",
  modules: "Course structure",
  faq: "Frequently asked questions",
  cta: "Banner with action",
  cards: "Related items grid",
  blog: "Latest posts",
  pricing: "Pricing table",
  "popular-qualifications": "Qualification grid",
  "why-us": "Why choose us",
  stats: "Statistics",
  logos: "Logo carousel",
  features: "Features grid",
  "contact-form": "Contact form",
  map: "Google map",
};

const BLOCK_ICONS: Partial<Record<BlockType, React.ElementType>> = {
  text: Text,
  "full-width-text-image": PanelTop,
  image: ImageIcon,
  "image-text": LayoutGrid,
  modules: BookOpen,
  faq: MessageSquareText,
  cta: ArrowRight,
  cards: Layers3,
  blog: Newspaper,
  pricing: BadgeDollarSign,
  "popular-qualifications": Layers3,
  "why-us": Users,
  stats: BarChart3,
  logos: Sparkles,
  features: Layers3,
  "contact-form": Mail,
  map: MapPinned,
};

const BLOCK_PREVIEWS: Partial<Record<BlockType, React.ReactNode>> = {
  text: (
    <div className="space-y-2 rounded-lg border border-border/60 bg-muted/20 p-3">
      <div className="h-2.5 w-24 rounded bg-foreground/20" />
      <div className="h-2 w-full rounded bg-foreground/10" />
      <div className="h-2 w-5/6 rounded bg-foreground/10" />
      <div className="h-2 w-4/6 rounded bg-foreground/10" />
    </div>
  ),
  "full-width-text-image": (
    <div className="overflow-hidden rounded-lg border border-border/60">
      <div className="relative h-24 bg-slate-700">
        <div className="absolute inset-0 bg-black/35" />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-4">
          <div className="h-3 w-24 rounded bg-white/90" />
          <div className="h-2 w-32 rounded bg-white/60" />
          <div className="h-5 w-16 rounded bg-secondary/90" />
        </div>
      </div>
    </div>
  ),
  image: (
    <div className="overflow-hidden rounded-lg border border-border/60 bg-muted/20 p-2">
      <div className="h-24 rounded bg-gradient-to-br from-slate-200 to-slate-300" />
    </div>
  ),
  "image-text": (
    <div className="grid grid-cols-2 gap-2 rounded-lg border border-border/60 bg-muted/20 p-2">
      <div className="h-24 rounded bg-gradient-to-br from-slate-200 to-slate-300" />
      <div className="space-y-2 py-1">
        <div className="h-2.5 w-16 rounded bg-foreground/20" />
        <div className="h-2 w-full rounded bg-foreground/10" />
        <div className="h-2 w-5/6 rounded bg-foreground/10" />
        <div className="h-5 w-14 rounded bg-secondary/80" />
      </div>
    </div>
  ),
  cta: (
    <div className="rounded-lg border border-border/60 bg-primary p-4 text-center">
      <div className="mx-auto h-3 w-24 rounded bg-white/85" />
      <div className="mx-auto mt-2 h-2 w-32 rounded bg-white/60" />
      <div className="mx-auto mt-3 h-5 w-16 rounded bg-secondary" />
    </div>
  ),
  cards: (
    <div className="grid grid-cols-2 gap-2 rounded-lg border border-border/60 bg-muted/20 p-2">
      {[0, 1].map((i) => (
        <div key={i} className="rounded-md border border-border/50 bg-background p-2">
          <div className="mb-2 h-10 rounded bg-slate-200" />
          <div className="h-2 w-12 rounded bg-foreground/20" />
          <div className="mt-2 h-2 w-full rounded bg-foreground/10" />
          <div className="mt-1 h-2 w-4/6 rounded bg-foreground/10" />
        </div>
      ))}
    </div>
  ),
  faq: (
    <div className="space-y-2 rounded-lg border border-border/60 bg-muted/20 p-3">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex items-center justify-between rounded border border-border/50 bg-background px-2 py-2">
          <div className="h-2 w-24 rounded bg-foreground/15" />
          <div className="h-2 w-2 rounded-full bg-foreground/30" />
        </div>
      ))}
    </div>
  ),
  stats: (
    <div className="grid grid-cols-3 gap-2 rounded-lg border border-border/60 bg-primary/10 p-3">
      {[0, 1, 2].map((i) => (
        <div key={i} className="text-center">
          <div className="mx-auto h-4 w-8 rounded bg-primary/40" />
          <div className="mx-auto mt-2 h-2 w-10 rounded bg-foreground/15" />
        </div>
      ))}
    </div>
  ),
  features: (
    <div className="grid grid-cols-2 gap-2 rounded-lg border border-border/60 bg-muted/20 p-2">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="rounded-md border border-border/50 bg-background p-2">
          <div className="h-2.5 w-10 rounded bg-foreground/20" />
          <div className="mt-2 h-2 w-full rounded bg-foreground/10" />
        </div>
      ))}
    </div>
  ),
  "contact-form": (
    <div className="grid grid-cols-2 gap-2 rounded-lg border border-border/60 bg-muted/20 p-2">
      <div className="space-y-2">
        <div className="h-2.5 w-16 rounded bg-foreground/20" />
        <div className="h-2 w-20 rounded bg-foreground/10" />
        <div className="h-2 w-24 rounded bg-foreground/10" />
      </div>
      <div className="space-y-2">
        <div className="h-6 rounded bg-background border border-border/50" />
        <div className="h-6 rounded bg-background border border-border/50" />
        <div className="h-8 rounded bg-background border border-border/50" />
      </div>
    </div>
  ),
  custom: (
    <div className="rounded-lg border border-border/60 bg-muted/20 p-2">
      <div className="rounded border border-dashed border-primary/40 bg-background p-3 font-mono text-[9px] text-muted-foreground">
        &lt;div class="grid..."&gt;
        <br />
        &nbsp;&nbsp;&lt;h2&gt;Custom&lt;/h2&gt;
        <br />
        &lt;/div&gt;
      </div>
    </div>
  ),
};

interface AddBlockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  addBlock: (type: BlockType) => void;
  allowedBlocks?: BlockType[];
}

const AddBlockDialog = ({
  open,
  onOpenChange,
  addBlock,
  allowedBlocks,
}: AddBlockDialogProps) => {
  const blockTypes = (allowedBlocks || (Object.keys(BLOCK_TYPE_LABELS) as BlockType[]))
    .filter((type) => type !== "qualification_hero" && type !== "qualification_slider");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-1rem)] max-w-6xl max-h-[90vh] overflow-hidden p-4 sm:p-6">
        <DialogHeader className="pr-10 sm:pr-12">
          <DialogTitle>Add Block</DialogTitle>
        </DialogHeader>
        <div className="max-h-[calc(90vh-6rem)] overflow-y-auto pr-1">
          <div className="grid grid-cols-1 gap-3 pb-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {blockTypes.map((type) => (
            <Button
              key={type}
              variant="ghost"
              className="group h-full w-full p-0 text-left"
              onClick={() => addBlock(type)}
            >
                <Card className="h-full w-full border-border/70 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:border-primary/30 group-hover:shadow-md">
                <CardContent className="flex h-full min-h-[220px] flex-col gap-3 p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      {BLOCK_ICONS[type] ? (
                        React.createElement(BLOCK_ICONS[type] as React.ElementType, {
                          className: "h-5 w-5",
                        })
                      ) : null}
                    </div>
                    <span className="rounded-full border border-border px-2 py-1 text-[10px] font-medium text-muted-foreground">
                      Add
                    </span>
                  </div>
                  <div className="pointer-events-none">
                    {BLOCK_PREVIEWS[type] || (
                      <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
                        <div className="h-14 rounded bg-foreground/10" />
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <span className="block text-sm font-semibold text-foreground">
                      {BLOCK_TYPE_LABELS[type]}
                    </span>
                    <span className="block text-xs leading-relaxed text-muted-foreground">
                      {BLOCK_DESCRIPTIONS[type] || "Add this block to the page."}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Button>
          ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddBlockDialog;
