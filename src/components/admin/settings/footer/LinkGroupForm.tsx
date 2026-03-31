import { useState } from "react";
import { Plus, X, Trash2, GripVertical, ChevronDown, ChevronRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { FooterLink, LinkGroup } from "@/redux/apis/footerApi";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface LinkGroupFormProps {
  initialData?: LinkGroup;
  onSave: (group: LinkGroup) => void;
  onCancel: () => void;
  title: string;
}

const LinkGroupForm = ({ initialData, onSave, onCancel, title }: LinkGroupFormProps) => {
  const [group, setGroup] = useState<LinkGroup>(
    initialData || {
      title: "",
      order: 1,
      links: [],
    }
  );

  const [newLink, setNewLink] = useState<FooterLink>({
    label: "",
    url: "",
    is_external: false,
    order: 1,
    is_active: true,
  });

  const [showAddLink, setShowAddLink] = useState(false);

  const handleUpdateLink = (index: number, field: keyof FooterLink, value: any) => {
    const updatedLinks = [...group.links];
    updatedLinks[index] = { ...updatedLinks[index], [field]: value };
    setGroup({ ...group, links: updatedLinks });
  };

  const handleRemoveLink = (index: number) => {
    const updatedLinks = group.links.filter((_, i) => i !== index);
    setGroup({ ...group, links: updatedLinks });
  };

  const handleAddLink = () => {
    if (!newLink.label || !newLink.url) return;
    setGroup({
      ...group,
      links: [...group.links, { ...newLink, order: group.links.length + 1 }],
    });
    setNewLink({
      label: "",
      url: "",
      is_external: false,
      order: 1,
      is_active: true,
    });
    setShowAddLink(false);
  };

  return (
    <Card className="border-2 border-primary/20 shadow-xl bg-card">
      <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 bg-muted/30">
        <CardTitle className="text-lg font-bold text-primary">{title}</CardTitle>
        <Button variant="ghost" size="icon" onClick={onCancel} className="rounded-full">
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="space-y-2">
          <Label htmlFor="group-title" className="text-sm font-semibold">Group Title</Label>
          <Input
            id="group-title"
            placeholder="e.g. Quick Links, Programs, Support"
            value={group.title}
            onChange={(e) => setGroup({ ...group, title: e.target.value })}
            className="text-base font-medium"
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold">Links</Label>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={() => setShowAddLink(!showAddLink)}
              className="h-8 gap-1.5"
            >
              {showAddLink ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
              {showAddLink ? "Cancel" : "Add Link"}
            </Button>
          </div>

          {showAddLink && (
            <div className="p-4 rounded-xl border bg-muted/20 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="link-label" className="text-xs font-medium">Label</Label>
                  <Input
                    id="link-label"
                    placeholder="Link Name"
                    value={newLink.label}
                    onChange={(e) => setNewLink({ ...newLink, label: e.target.value })}
                    className="h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="link-url" className="text-xs font-medium">URL</Label>
                  <Input
                    id="link-url"
                    placeholder="/path or https://"
                    value={newLink.url}
                    onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                    className="h-9"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between bg-background p-2 rounded-lg border">
                <div className="flex items-center gap-6">
                   <div className="flex items-center gap-2">
                    <Switch
                      id="is-external"
                      checked={newLink.is_external}
                      onCheckedChange={(checked) => setNewLink({ ...newLink, is_external: checked })}
                    />
                    <Label htmlFor="is-external" className="text-xs cursor-pointer">External?</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                        id="is-active"
                        checked={newLink.is_active}
                        onCheckedChange={(checked) => setNewLink({ ...newLink, is_active: checked })}
                      />
                      <Label htmlFor="is-active" className="text-xs cursor-pointer">Active</Label>
                  </div>
                </div>
                <Button size="sm" onClick={handleAddLink} disabled={!newLink.label || !newLink.url}>
                  Add Link
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {group.links.length === 0 ? (
              <p className="text-center py-8 text-sm text-muted-foreground border-2 border-dashed rounded-xl italic">
                No links added yet. Click "Add Link" above.
              </p>
            ) : (
              group.links.map((link, idx) => (
                <div key={idx} className="flex flex-col p-3 rounded-xl border bg-background/50 hover:border-primary/30 transition-colors gap-3">
                   <div className="flex items-center justify-between">
                    <Input
                      value={link.label}
                      onChange={(e) => handleUpdateLink(idx, "label", e.target.value)}
                      placeholder="Label"
                      className="h-8 w-1/3 text-sm font-medium border-transparent hover:border-input focus:border-input bg-transparent"
                    />
                    <Input
                      value={link.url}
                      onChange={(e) => handleUpdateLink(idx, "url", e.target.value)}
                      placeholder="URL"
                      className="h-8 w-1/3 text-sm border-transparent hover:border-input focus:border-input bg-transparent"
                    />
                    <div className="flex items-center gap-2">
                         <div className="flex flex-col items-end mr-4">
                            <div className="flex items-center gap-2 mb-1">
                                <Switch
                                    checked={link.is_external}
                                    onCheckedChange={(checked) => handleUpdateLink(idx, "is_external", checked)}
                                    className="scale-75"
                                />
                                <span className="text-[10px] uppercase font-bold text-muted-foreground">Ext</span>
                            </div>
                         </div>
                       <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => handleRemoveLink(idx)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-3 bg-muted/10 border-t border-border/50 py-4">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={() => onSave(group)} disabled={!group.title}>Save Group</Button>
      </CardFooter>
    </Card>
  );
};

export default LinkGroupForm;
