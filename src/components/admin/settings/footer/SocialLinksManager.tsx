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
import { Plus, Share2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SocialLink } from "@/redux/apis/footerApi";
import { socialIcons } from "./socialIcons";
import SortableSocialItem from "./SortableSocialItem";
import { useState } from "react";

interface SocialLinksManagerProps {
  links: SocialLink[];
  onReorder: (links: SocialLink[]) => void;
  onDelete: (index: number) => void;
  onAdd: (link: SocialLink) => void;
  onToggleActive: (index: number, active: boolean) => void;
}

const SocialLinksManager = ({
  links,
  onReorder,
  onDelete,
  onAdd,
  onToggleActive,
}: SocialLinksManagerProps) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLink, setNewLink] = useState<{ platform: string; url: string }>({
    platform: "facebook",
    url: "",
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = links.findIndex((_, idx) => `social-${idx}` === active.id);
      const newIndex = links.findIndex((_, idx) => `social-${idx}` === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newLinks = arrayMove(links, oldIndex, newIndex).map((link, idx) => ({
          ...link,
          order: idx + 1,
        }));
        onReorder(newLinks);
      }
    }
  };

  const handleAdd = () => {
    if (!newLink.url) return;
    onAdd({
      platform: newLink.platform,
      url: newLink.url,
      order: links.length + 1,
      is_active: true,
    });
    setNewLink({ platform: "facebook", url: "" });
    setShowAddForm(false);
  };

  return (
    <Card className="border-none shadow-md bg-card/50 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="inline-flex items-center gap-2 text-lg font-semibold text-primary">
          <Share2 className="h-5 w-5" /> Social Media Links
        </CardTitle>
        <Button onClick={() => setShowAddForm(!showAddForm)} size="sm" variant={showAddForm ? "ghost" : "default"}>
          {showAddForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4 mr-1.5" /> }
          {showAddForm ? "Cancel" : "Add Link"}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {showAddForm && (
          <div className="p-4 rounded-xl border bg-primary/5 space-y-4 border-primary/20 animate-in fade-in zoom-in duration-200">
             <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Platform</Label>
                <Select
                  value={newLink.platform}
                  onValueChange={(val) => setNewLink({ ...newLink, platform: val })}
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(socialIcons).map((key) => (
                      <SelectItem key={key} value={key} className="capitalize">
                        <div className="flex items-center gap-2">
                           <span className="text-primary h-3.5 w-3.5">{socialIcons[key]}</span>
                           <span>{key}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">URL</Label>
                <Input
                  placeholder="https://..."
                  value={newLink.url}
                  onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                  className="bg-background"
                />
              </div>
            </div>
            <Button size="sm" onClick={handleAdd} className="w-full shadow-lg shadow-primary/10">Add Social Link</Button>
          </div>
        )}

        {links.length === 0 ? (
          <div className="text-center py-10 border-2 border-dashed rounded-xl text-muted-foreground bg-muted/5">
            <p className="text-sm">No social links yet.</p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={links.map((_, idx) => `social-${idx}`)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-1">
                {links.map((link, idx) => (
                  <SortableSocialItem
                    key={`social-${idx}`}
                    id={`social-${idx}`}
                    index={idx}
                    item={link}
                    onDelete={() => onDelete(idx)}
                    onToggleActive={(active) => onToggleActive(idx, active)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </CardContent>
    </Card>
  );
};

export default SocialLinksManager;
