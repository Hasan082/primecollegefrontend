import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Trash2, GripVertical, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SocialLink } from "@/redux/apis/footerApi";
import { socialIcons } from "./socialIcons";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface SortableSocialItemProps {
  id: string;
  item: SocialLink;
  index: number;
  onDelete: () => void;
  onToggleActive: (active: boolean) => void;
}

const SortableSocialItem = ({
  id,
  item,
  onDelete,
  onToggleActive,
}: SortableSocialItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 0,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group flex items-center gap-4 p-3 mb-2 rounded-xl border bg-card/40 transition-all hover:bg-card/60",
        isDragging && "opacity-50 grayscale shadow-2xl shadow-primary/20",
        !item.is_active && "opacity-60 bg-muted/30"
      )}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab text-muted-foreground hover:text-primary transition-colors touch-none"
      >
        <GripVertical className="h-5 w-5" />
      </button>

      <div className="h-10 w-10 flex items-center justify-center rounded-full bg-primary/10 text-primary shadow-inner">
        {socialIcons[item.platform.toLowerCase()] || <ExternalLink className="h-4 w-4" />}
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold capitalize flex items-center gap-2">
          {item.platform}
          {!item.is_active && <Badge variant="secondary" className="text-[9px] h-3.5 px-1 font-bold">INACTIVE</Badge>}
        </h4>
        <p className="text-xs text-muted-foreground truncate italic">{item.url}</p>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-8 text-[10px] font-bold tracking-tight px-2",
            item.is_active ? "text-muted-foreground" : "text-primary"
          )}
          onClick={() => onToggleActive(!item.is_active)}
        >
          {item.is_active ? "DEACTIVATE" : "ACTIVATE"}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default SortableSocialItem;
