import { useState } from "react";
import { Plus, X, Trash2, Link as LinkIcon, ExternalLink, Globe, Hash, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { FooterLink, LinkGroup } from "@/redux/apis/footerApi";
import { ScrollArea } from "@/components/ui/scroll-area";
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
    <div className="flex flex-col h-full max-h-[85vh] bg-background">
      <ScrollArea className="flex-1">
        <div className="p-6 space-y-8">
          {/* Group Title Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground uppercase tracking-wider">
              <Hash className="h-3.5 w-3.5" /> General Settings
            </div>
            <div className="grid gap-2">
              <Label htmlFor="group-title" className="text-sm font-semibold">Group Display Name</Label>
              <Input
                id="group-title"
                placeholder="e.g. Quick Links, Programs"
                value={group.title}
                onChange={(e) => setGroup({ ...group, title: e.target.value })}
                className="h-10 text-base focus:ring-2 focus:ring-primary/20 transition-all border-muted-foreground/20"
              />
            </div>
          </div>

          {/* Links Management Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground uppercase tracking-wider">
                <Globe className="h-3.5 w-3.5" /> Navigation Links
              </div>
              <Button 
                type="button" 
                variant={showAddLink ? "ghost" : "default"} 
                size="sm" 
                onClick={() => setShowAddLink(!showAddLink)}
                className="h-8 rounded-full px-4 gap-1.5 transition-all"
              >
                {showAddLink ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                {showAddLink ? "Cancel" : "Add New Link"}
              </Button>
            </div>

            {showAddLink && (
              <div className="p-5 rounded-2xl border-2 border-primary/10 bg-primary/5 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="link-label" className="text-xs font-bold text-primary/70">Link Label</Label>
                    <Input
                      id="link-label"
                      placeholder="e.g. Courses"
                      value={newLink.label}
                      onChange={(e) => setNewLink({ ...newLink, label: e.target.value })}
                      className="bg-background border-primary/20 h-9"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="link-url" className="text-xs font-bold text-primary/70">Target URL</Label>
                    <Input
                      id="link-url"
                      placeholder="/qualifications"
                      value={newLink.url}
                      onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                      className="bg-background border-primary/20 h-9"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2.5">
                      <Switch
                        id="is-external"
                        checked={newLink.is_external}
                        onCheckedChange={(checked) => setNewLink({ ...newLink, is_external: checked })}
                        className="data-[state=checked]:bg-primary"
                      />
                      <Label htmlFor="is-external" className="text-xs font-medium cursor-pointer">External Page</Label>
                    </div>
                  </div>
                  <Button size="sm" onClick={handleAddLink} disabled={!newLink.label || !newLink.url} className="rounded-full px-5">
                    <Check className="h-3.5 w-3.5 mr-1" /> Add to List
                  </Button>
                </div>
              </div>
            )}

            <div className="grid gap-3">
              {group.links.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed rounded-2xl bg-muted/5 text-muted-foreground space-y-2">
                  <Globe className="h-8 w-8 opacity-20" />
                  <p className="text-sm font-medium">No links added to this group yet.</p>
                </div>
              ) : (
                group.links.map((link, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-4 rounded-xl border bg-card/50 hover:bg-muted/10 transition-all border-border/50 group/item">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-muted-foreground">{idx + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0 grid sm:grid-cols-2 gap-4">
                      <Input
                        value={link.label}
                        onChange={(e) => handleUpdateLink(idx, "label", e.target.value)}
                        placeholder="Label"
                        className="h-8 text-sm font-bold border-transparent hover:border-input focus:border-input bg-transparent px-2"
                      />
                      <div className="flex items-center gap-2">
                        <Input
                          value={link.url}
                          onChange={(e) => handleUpdateLink(idx, "url", e.target.value)}
                          placeholder="URL"
                          className="h-8 text-sm border-transparent hover:border-input focus:border-input bg-transparent px-2 font-mono text-muted-foreground"
                        />
                        {link.is_external && <Badge variant="outline" className="h-5 text-[9px] font-black tracking-tighter shrink-0 border-primary/20 text-primary">EXT</Badge>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                       <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        onClick={() => handleRemoveLink(idx)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* Footer Actions */}
      <div className="px-6 py-4 border-t bg-muted/10 flex justify-end gap-3 shrink-0">
        <Button variant="outline" onClick={onCancel} className="rounded-full">Discard Changes</Button>
        <Button 
          onClick={() => onSave(group)} 
          disabled={!group.title} 
          className="rounded-full px-8 shadow-lg shadow-primary/10 active:scale-95 transition-all"
        >
          Update Group
        </Button>
      </div>
    </div>
  );
};

export default LinkGroupForm;
