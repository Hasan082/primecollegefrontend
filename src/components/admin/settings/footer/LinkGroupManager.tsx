import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus, ListTree } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LinkGroup } from "@/redux/apis/footerApi";
import SortableLinkGroup from "./SortableLinkGroup";
import { useState } from "react";

interface LinkGroupManagerProps {
  groups: LinkGroup[];
  onReorder: (groups: LinkGroup[]) => void;
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
  onAdd: () => void;
}

const LinkGroupManager = ({
  groups,
  onReorder,
  onEdit,
  onDelete,
  onAdd,
}: LinkGroupManagerProps) => {
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = groups.findIndex((_, idx) => `group-${idx}` === active.id);
      const newIndex = groups.findIndex((_, idx) => `group-${idx}` === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newGroups = arrayMove(groups, oldIndex, newIndex).map((group, idx) => ({
          ...group,
          order: idx + 1,
        }));
        onReorder(newGroups);
      }
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <Card className="border-none shadow-md bg-card/50 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="inline-flex items-center gap-2 text-lg font-semibold">
          <ListTree className="h-5 w-5 text-primary" /> Footer Link Groups
        </CardTitle>
        <Button onClick={onAdd} size="sm" className="shadow-sm">
          <Plus className="h-4 w-4 mr-1.5" /> Add Group
        </Button>
      </CardHeader>
      <CardContent>
        {groups.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-xl text-muted-foreground bg-muted/5">
            <p className="text-sm">No link groups yet.</p>
            <p className="text-xs">Click "Add Group" to create your first navigation group.</p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={groups.map((_, idx) => `group-${idx}`)}
              strategy={verticalListSortingStrategy}
            >
              {groups.map((group, idx) => (
                <SortableLinkGroup
                  key={`group-${idx}`}
                  id={`group-${idx}`}
                  index={idx}
                  group={group}
                  onEdit={() => onEdit(idx)}
                  onDelete={() => onDelete(idx)}
                  isExpanded={expandedIds[`group-${idx}`]}
                  onToggleExpand={toggleExpand}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </CardContent>
    </Card>
  );
};

export default LinkGroupManager;
