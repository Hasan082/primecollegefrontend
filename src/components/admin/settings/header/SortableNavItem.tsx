import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Pencil, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NavLinkItem } from "@/redux/apis/navbarApi";

interface SortableNavItemProps {
  id: string;
  item: NavLinkItem;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  isExpanded?: boolean;
  onToggleExpand?: (id: string) => void;
  index: number;
}

const SortableNavItem = ({
  id,
  item,
  onEdit,
  onDelete,
  isExpanded,
  onToggleExpand,
  index,
}: SortableNavItemProps) => {
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

  const hasChildren = item.children && item.children.length > 0;

  return (
    <div ref={setNodeRef} style={style} className="bg-background border rounded-lg overflow-hidden mb-2">
      <div className="p-4 flex items-center gap-3">
        <button
          {...attributes}
          {...listeners}
          className="cursor-move text-muted-foreground hover:text-foreground transition-colors"
        >
          <GripVertical className="h-5 w-5" />
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium truncate">{item.label}</span>
            {item.is_mega_menu && (
              <Badge variant="secondary" className="text-[10px]">Mega Menu</Badge>
            )}
            {item.is_dropdown && (
              <Badge variant="outline" className="text-[10px]">Dropdown</Badge>
            )}
            {!item.is_active && (
              <Badge variant="destructive" className="text-[10px]">Inactive</Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate">{item.href || "No link"}</p>
        </div>

        <div className="flex items-center gap-1">
          {hasChildren && onToggleExpand && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onToggleExpand(id)}
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          )}
          <Button
            variant="link"
            size="sm"
            className="h-8 px-2 text-xs"
            onClick={() => onEdit(id)}
          >
            Edit
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive ml-1"
            onClick={() => onDelete(id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isExpanded && hasChildren && (
        <div className="bg-muted/30 border-t p-4 pl-12 space-y-2">
          {item.children?.map((child, childIdx) => (
            <div key={`${id}-child-${childIdx}`} className="flex items-center justify-between p-2 bg-background border rounded text-sm">
              <div className="flex-1 min-w-0">
                <span className="font-medium">{child.label}</span>
                <p className="text-xs text-muted-foreground truncate">{child.href}</p>
              </div>
              {!child.is_active && (
                <Badge variant="destructive" className="text-[10px] mr-2">Inactive</Badge>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SortableNavItem;
