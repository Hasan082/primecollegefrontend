import { useState } from "react";
import { Link } from "react-router-dom";
import { FileText, Plus, Pencil, Globe, GraduationCap, ArrowLeft, BookOpen, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { PageConfig } from "@/types/pageBuilder";
import { defaultPages } from "@/data/defaultPages";

const PageManagement = () => {
  const [pages, setPages] = useState<PageConfig[]>(defaultPages);
  const [addOpen, setAddOpen] = useState(false);
  const [newPage, setNewPage] = useState({ title: "", slug: "", type: "static" as "static" | "qualification" | "blog-post" });
  const { toast } = useToast();

  const handleAddPage = () => {
    if (!newPage.title || !newPage.slug) {
      toast({ title: "Title and slug are required", variant: "destructive" });
      return;
    }
    const slug = newPage.slug.startsWith("/") ? newPage.slug : `/${newPage.slug}`;
    const page: PageConfig = {
      id: slug.replace(/\//g, "-").replace(/^-/, "") || "page",
      title: newPage.title,
      slug,
      type: newPage.type,
      blocks: [],
      updatedAt: new Date().toISOString(),
    };
    setPages((prev) => [...prev, page]);
    setNewPage({ title: "", slug: "", type: "static" });
    
    setAddOpen(false);
    toast({ title: "Page created — add blocks in the editor" });
  };

  const staticPages = pages.filter((p) => p.type === "static");
  const qualPages = pages.filter((p) => p.type === "qualification");
  const blogPages = pages.filter((p) => p.type === "blog-post");

  return (
    <div className="space-y-6">
      <Link to="/admin/dashboard" className="inline-flex items-center gap-1.5 text-primary hover:underline text-sm">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Page Builder</h1>
          <p className="text-sm text-muted-foreground mt-1">Create and manage pages using the block-based editor</p>
        </div>
        <Button onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> New Page
        </Button>
      </div>

      {/* Static Pages */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
          <Globe className="h-5 w-5 text-primary" /> Static Pages
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {staticPages.map((page) => (
            <PageCard key={page.id} page={page} />
          ))}
        </div>
      </div>

      {/* Qualification Pages */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-primary" /> Qualification Pages
        </h2>
        {qualPages.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <FileText className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p>No qualification pages yet. Add one from Qualification Management or click "New Page".</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {qualPages.map((page) => (
              <PageCard key={page.id} page={page} />
            ))}
          </div>
        )}
      </div>

      {/* Blog Posts */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" /> Blog Posts
        </h2>
        {blogPages.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <FileText className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p>No blog posts yet. Click "New Page" and select "Blog Post" to create one.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {blogPages.map((page) => (
              <PageCard key={page.id} page={page} />
            ))}
          </div>
        )}
      </div>

      {/* Add Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Page</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Page Title</Label>
              <Input value={newPage.title} onChange={(e) => setNewPage((p) => ({ ...p, title: e.target.value }))} placeholder="e.g. Our Team" />
            </div>
            <div>
              <Label>URL Slug</Label>
              <Input
                value={newPage.slug}
                onChange={(e) => setNewPage((p) => ({ ...p, slug: e.target.value }))}
                placeholder="e.g. /our-team"
              />
              <p className="text-xs text-muted-foreground mt-1">The URL path for this page</p>
            </div>
            <div>
              <Label>Page Type</Label>
              <Select value={newPage.type} onValueChange={(v) => setNewPage((p) => ({ ...p, type: v as "static" | "qualification" | "blog-post" }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="static">Static Page</SelectItem>
                  <SelectItem value="qualification">Qualification Detail</SelectItem>
                  <SelectItem value="blog-post">Blog Post</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={handleAddPage}>Create Page</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const PageCard = ({ page, onDelete }: { page: PageConfig; onDelete?: (id: string) => void }) => (
  <Card className="hover:shadow-md transition-shadow h-full flex flex-col">
    <CardContent className="p-5 flex flex-col flex-1">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate">{page.title}</h3>
          <p className="text-xs text-muted-foreground mt-0.5 font-mono">{page.slug}</p>
        </div>
        <Badge variant="outline" className="ml-2 shrink-0">
          {page.blocks.length} block{page.blocks.length !== 1 ? "s" : ""}
        </Badge>
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4 flex-wrap">
        {page.blocks.slice(0, 3).map((b) => (
          <Badge key={b.id} variant="secondary" className="text-[10px]">
            {b.label}
          </Badge>
        ))}
        {page.blocks.length > 3 && <span>+{page.blocks.length - 3} more</span>}
      </div>
      <div className="mt-auto flex gap-2">
        <Link to={`/admin/pages/${page.id}`} className="flex-1">
          <Button size="sm" className="w-full">
            <Pencil className="h-3.5 w-3.5 mr-1.5" /> Edit Page
          </Button>
        </Link>
        {onDelete && (
          <Button size="sm" variant="destructive" onClick={() => onDelete(page.id)}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </CardContent>
  </Card>
);

export default PageManagement;
