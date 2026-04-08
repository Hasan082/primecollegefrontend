import { useCallback } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import SortableBlock from "./SortableBlock";
import { ContentBlock } from "@/types/pageBuilder";

interface BlockListProps {
  blocks: ContentBlock[];
  setBlocks: React.Dispatch<React.SetStateAction<ContentBlock[]>>;
  onEdit: (block: ContentBlock) => void;
  onRemove: (id: string) => void;
  onAdd: () => void;
  isHomePage?: boolean;
}

const BlockList = ({
  blocks,
  setBlocks,
  onEdit,
  onRemove,
  onAdd,
  isHomePage,
}: BlockListProps) => {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setBlocks((prev) => {
        const oldIndex = prev.findIndex((b) => b.id === active.id);
        const newIndex = prev.findIndex((b) => b.id === over.id);
        const activeBlock = prev[oldIndex];
        const overBlock = prev[newIndex];

        if (!activeBlock || !overBlock) return prev;
        if (activeBlock.isFixed || overBlock.isFixed) return prev;
        if (isHomePage && (oldIndex === 0 || newIndex === 0)) return prev;

        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  }, [isHomePage, setBlocks]);

  if (blocks.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-12 text-center">
          <p className="text-muted-foreground mb-4">
            No blocks yet. Add your first block to start building the page.
          </p>
          <Button onClick={onAdd}>
            <Plus className="h-4 w-4 mr-2" /> Add Block
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={blocks.map((b) => b.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {blocks.map((block, index) => (
              <SortableBlock
                key={block.id}
                block={block}
                onEdit={() => onEdit(block)}
                onRemove={() => onRemove(block.id)}
                isFixed={Boolean(block.isFixed) || (isHomePage && index === 0)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <div className="flex justify-center">
        <Button variant="outline" onClick={onAdd}>
          <Plus className="h-4 w-4 mr-2" /> Add Block
        </Button>
      </div>
    </div>
  );
};

export default BlockList;
