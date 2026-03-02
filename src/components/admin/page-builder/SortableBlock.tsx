import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Eye, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ContentBlock } from "@/types/pageBuilder";

interface SortableBlockProps {
  block: ContentBlock;
  onEdit: () => void;
  onRemove: () => void;
}

const getBlockPreview = (block: ContentBlock): string => {
  const d = block.data as Record<string, unknown>;
  return (d.title as string) || (d.headline as string) || (d.content as string)?.slice(0, 60) || block.type;
};

const SortableBlock = ({ block, onEdit, onRemove }: SortableBlockProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <Card ref={setNodeRef} style={style} className="group">
      <CardHeader className="py-3 px-4 flex flex-row items-center gap-3">
        <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing touch-none shrink-0 text-muted-foreground/40 hover:text-muted-foreground transition-colors">
          <GripVertical className="h-4 w-4" />
        </button>
        <Badge variant="secondary" className="text-xs shrink-0">{block.label}</Badge>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-muted-foreground truncate">{getBlockPreview(block)}</p>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onEdit}>
            <Eye className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={onRemove}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardHeader>
    </Card>
  );
};

export default SortableBlock;
