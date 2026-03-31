import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Trash2, Edit2, ChevronDown, ChevronRight, GripVertical, Link as LinkIcon, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LinkGroup } from "@/redux/apis/footerApi";
import { cn } from "@/lib/utils";

interface SortableLinkGroupProps {
  id: string;
  group: LinkGroup;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
  isExpanded: boolean;
  onToggleExpand: (id: string) => void;
}

const SortableLinkGroup = ({
  id,
  group,
  onEdit,
  onDelete,
  isExpanded,
  onToggleExpand,
}: SortableLinkGroupProps) => {
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
        "group relative mb-3 rounded-xl border bg-card/40 transition-all hover:bg-card/60",
        isDragging && "opacity-50 grayscale shadow-2xl",
        isExpanded && "ring-1 ring-primary/20"
      )}
    >
      <div className="flex items-center gap-3 p-4">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab text-muted-foreground hover:text-primary transition-colors touch-none"
        >
          <GripVertical className="h-5 w-5" />
        </button>

        <div 
          className="flex-1 cursor-pointer flex items-center justify-between"
          onClick={() => onToggleExpand(id)}
        >
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <LinkIcon className="h-4 w-4" />
            </div>
            <div>
              <h4 className="font-semibold text-sm">{group.title}</h4>
              <p className="text-xs text-muted-foreground">
                {group.links.length} link{group.links.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 pr-2">
             <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-primary"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            {isExpanded ? <ChevronDown className="h-4 w-4 ml-2" /> : <ChevronRight className="h-4 w-4 ml-2" />}
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="px-14 pb-4 space-y-2 border-t border-border/50 pt-4 bg-muted/5 rounded-b-xl">
          {group.links.map((link, idx) => (
            <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-background/50 border group/link">
              <div className="flex flex-col">
                <span className="text-sm font-medium">{link.label}</span>
                <span className="text-xs text-muted-foreground truncate max-w-[200px]">{link.url}</span>
              </div>
              <div className="flex items-center gap-2">
                {link.is_external && (
                  <Badge variant="outline" className="text-[10px] h-4 px-1 gap-1">
                    <ExternalLink className="h-2 w-2" /> External
                  </Badge>
                )}
                {!link.is_active && (
                   <Badge variant="secondary" className="text-[10px] h-4 px-1">Inactive</Badge>
                )}
              </div>
            </div>
          ))}
          {group.links.length === 0 && (
            <p className="text-center py-2 text-xs text-muted-foreground italic">No links in this group</p>
          )}
        </div>
      )}
    </div>
  );
};

export default SortableLinkGroup;
