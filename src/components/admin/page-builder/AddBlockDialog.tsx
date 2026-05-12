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
                <CardContent className="flex h-full min-h-[132px] flex-col gap-3 p-4 sm:p-5">
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
