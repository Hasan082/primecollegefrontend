import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface SortableChildItemProps {
  id: string;
  label: string;
  href?: string;
  short_description?: string;
  is_active?: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

const SortableChildItem = ({ id, label, href, short_description, is_active = true, onEdit, onDelete }: SortableChildItemProps) => {
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
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 p-2 bg-background border rounded group"
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-move text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <GripVertical className="h-4 w-4" />
      </button>
      
      <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium truncate">{label}</span>
            <span className="text-xs text-muted-foreground truncate opacity-60">({href})</span>
          </div>
          {short_description && (
            <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">{short_description}</p>
          )}
        </div>
        {!is_active && (
          <Badge variant="destructive" className="text-[10px] h-4 shrink-0">Inactive</Badge>
        )}
      </div>
      
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={onEdit}
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-destructive"
          onClick={onDelete}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
};

export default SortableChildItem;
