import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BlockType, BLOCK_TYPE_LABELS } from "@/types/pageBuilder";

const BLOCK_DESCRIPTIONS: Partial<Record<BlockType, string>> = {
  hero: "Full-width banner",
  text: "Title + content",
  image: "Full-width image",
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
  qualification_hero: "Hero for qualification pages",
  "about-split": "Split layout for about page",
  "popular-qualifications": "Grid of popular qualifications",
  features: "Feature grid with icons",
  qualification_slider: "Qualification slider from CMS-resolved items",
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
    .filter((type) => type !== "qualification_hero");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Block</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3 py-2">
          {blockTypes.map((type) => (
            <Button
              key={type}
              variant="outline"
              className="h-auto py-3 flex flex-col items-center gap-1"
              onClick={() => addBlock(type)}
            >
              <span className="text-sm font-medium">
                {BLOCK_TYPE_LABELS[type]}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {BLOCK_DESCRIPTIONS[type]}
              </span>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddBlockDialog;
