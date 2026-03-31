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
import { NavLinkItem } from "@/redux/apis/navbarApi";
import SortableNavItem from "./SortableNavItem";
import { useState } from "react";

interface NavigationListProps {
  items: NavLinkItem[];
  onReorder: (items: NavLinkItem[]) => void;
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
  onAdd: () => void;
}

const NavigationList = ({
  items,
  onReorder,
  onEdit,
  onDelete,
  onAdd,
}: NavigationListProps) => {
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
      const oldIndex = items.findIndex((_, idx) => `nav-${idx}` === active.id);
      const newIndex = items.findIndex((_, idx) => `nav-${idx}` === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newItems = arrayMove(items, oldIndex, newIndex).map((item, idx) => ({
          ...item,
          order: idx + 1,
        }));
        onReorder(newItems);
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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="inline-flex items-center gap-2 text-lg">
          <ListTree className="h-5 w-5 text-primary" /> Navigation Menu
        </CardTitle>
        <Button onClick={onAdd} size="sm">
          <Plus className="h-4 w-4 mr-1.5" /> Add Link
        </Button>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-lg text-muted-foreground">
            No navigation links yet.
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={items.map((_, idx) => `nav-${idx}`)}
              strategy={verticalListSortingStrategy}
            >
              {items.map((item, idx) => (
                <SortableNavItem
                  key={`nav-${idx}`}
                  id={`nav-${idx}`}
                  index={idx}
                  item={item}
                  onEdit={() => onEdit(idx)}
                  onDelete={() => onDelete(idx)}
                  isExpanded={expandedIds[`nav-${idx}`]}
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

export default NavigationList;
