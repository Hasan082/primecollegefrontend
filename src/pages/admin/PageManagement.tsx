/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  Plus,
  Pencil,
  Globe,
  GraduationCap,
  ArrowLeft,
  BookOpen,
  Trash2,
  Loader2,
} from "lucide-react";
import Swal from "sweetalert2";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { PageConfig } from "@/types/pageBuilder";
import { defaultPages } from "@/data/defaultPages";
import {
  useCreatePageMutation,
  useDeletePageMutation,
  useGetPagesQuery,
} from "@/redux/apis/pageBuilderApi";
import { TryCatch } from "@/utils/apiTryCatch";
import { handleResponse } from "@/utils/handleResponse";
import { safeParseBlocks } from "@/utils/pageBuilder";

const inferPageType = (
  slug: string,
): "static" | "qualification" | "blog-post" => {
  if (slug.startsWith("blog-")) return "blog-post";
  if (slug.startsWith("qualification-")) return "qualification";
  return "static";
};

const normalizePageSlug = (
  rawSlug: string,
  type: "static" | "qualification" | "blog-post",
) => {
  const baseSlug = rawSlug
    .replace(/^\//, "")
    .replace(/[^a-z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  if (type === "blog-post") {
    return baseSlug.startsWith("blog-") ? baseSlug : `blog-${baseSlug}`;
  }

  if (type === "qualification") {
    return baseSlug.startsWith("qualification-")
      ? baseSlug
      : `qualification-${baseSlug}`;
  }

  return baseSlug.replace(/^blog-/, "").replace(/^qualification-/, "");
};

const PageManagement = () => {
  const {
    data: pageData,
    refetch,
    isLoading: isPageLoading,
  } = useGetPagesQuery(null);
  const [addOpen, setAddOpen] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [newPage, setNewPage] = useState({
    title: "",
    slug: "",
    type: "static" as "static" | "qualification" | "blog-post",
  });
  const { toast } = useToast();
  const [createPage, { isLoading }] = useCreatePageMutation();
  const [deletePage, { isLoading: isPageDeleting }] = useDeletePageMutation();

  const handleAddPage = async () => {
    if (!newPage.title) {
      toast({ title: "Title are required", variant: "destructive" });
      return;
    }

    const cleanSlug = normalizePageSlug(
      newPage.slug || newPage.title || "page",
      newPage.type,
    );
    const page: PageConfig = {
      id: cleanSlug,
      title: newPage.title,
      slug: cleanSlug,
      type: newPage.type,
      blocks: [],
      updatedAt: new Date().toISOString(),
    };

    const [data, error] = await TryCatch(createPage(page).unwrap());

    const result = handleResponse({
      data,
      error,
      successMessage: "Page created — add blocks in the editor",
      onSuccess: () => {
        setNewPage({ title: "", slug: "", type: "static" });
        setAddOpen(false);
        refetch();
      },
    });

    toast({
      title: result.type === "success" ? "Success" : "Error",
      description: result.message,
      variant: result.type === "error" ? "destructive" : "default",
    });
  };

  const handleDeletePage = (id: string) => {
    Swal.fire({
      title: "Are you sure?",
      text: "Once deleted, this item cannot be recovered.",
      confirmButtonText: "Delete",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
    }).then(async (res) => {
      if (!res.isConfirmed) return;
      setDeletingId(id);
      const [data, error] = await TryCatch(deletePage(id).unwrap());

      const result = handleResponse({
        data,
        error,
        successMessage: "Page deleted success",
        onSuccess: () => refetch(),
      });

      toast({
        title: result.type === "success" ? "Success" : "Error",
        description: result.message,
        variant: result.type === "error" ? "destructive" : "default",
      });
      setDeletingId("");
    });
  };

  const staticPages =
    pageData?.data?.results?.filter(
      (p) => !p.slug?.includes("blog") && !p.slug?.includes("qualification"),
    ) || [];
  const qualPages =
    pageData?.data?.results?.filter((p) => p.slug?.includes("qualification")) ||
    [];
  const blogPages =
    pageData?.data?.results?.filter((p) => p.slug?.includes("blog")) || [];

  return (
    <div className="space-y-6">
      <Link
        to="/admin/dashboard"
        className="inline-flex items-center gap-1.5 text-primary hover:underline text-sm"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Page Builder</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create and manage pages using the block-based editor
          </p>
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
        {isPageLoading ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              Loading pages...
            </CardContent>
          </Card>
        ) : staticPages.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              No static pages yet.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {staticPages.map((page) => (
              <PageCard
                deletingId={deletingId}
                isPageDeleting={isPageDeleting}
                key={page.id}
                onDelete={handleDeletePage}
                page={page}
              />
            ))}
          </div>
        )}
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
              <p>
                No qualification pages yet. Add one from Qualification
                Management or click "New Page".
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {qualPages.map((page) => (
              <PageCard
                key={page.id}
                deletingId={deletingId}
                isPageDeleting={isPageDeleting}
                page={page}
              />
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
              <p>
                No blog posts yet. Click "New Page" and select "Blog Post" to
                create one.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {blogPages.map((page) => (
              <PageCard
                key={page.id}
                page={page}
                deletingId={deletingId}
                isPageDeleting={isPageDeleting}
                onDelete={handleDeletePage}
              />
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
              <Input
                value={newPage.title}
                onChange={(e) =>
                  setNewPage((p) => ({ ...p, title: e.target.value }))
                }
                placeholder="e.g. Our Team"
              />
            </div>
            <div>
              <Label>URL Slug</Label>
              <div className="flex items-center mt-1">
                <div className="flex items-center h-10 px-3 rounded-l-md border border-r-0 border-border bg-muted text-muted-foreground text-sm font-mono">
                  /
                </div>
                <Input
                  value={newPage.slug.replace(/^\//, "")}
                  onChange={(e) =>
                    setNewPage((p) => ({
                      ...p,
                      slug: e.target.value
                        .toLowerCase()
                        .replace(/[^a-z0-9-_]/g, ""),
                    }))
                  }
                  className="rounded-l-none"
                  placeholder="e.g. our-team"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                The URL path for this page (letters, numbers, hyphens and
                underscores only)
              </p>
            </div>
            <div>
              <Label>Page Type</Label>
              <Select
                value={newPage.type}
                onValueChange={(v) =>
                  setNewPage((p) => ({
                    ...p,
                    type: v as "static" | "qualification" | "blog-post",
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="static">Static Page</SelectItem>
                  <SelectItem value="qualification">
                    Qualification Detail
                  </SelectItem>
                  <SelectItem value="blog-post">Blog Post</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button disabled={isLoading} onClick={handleAddPage}>
              {isLoading ? "Creating..." : "Create Page"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const showDeleteButton = (slug: string) => {
  const lists = ["home", "contact", "about"];

  return !lists?.includes(slug);
};

const PageCard = ({
  page,
  onDelete,
  isPageDeleting,
  deletingId,
}: {
  page: PageConfig;
  onDelete?: (id: string) => void;
  isPageDeleting: boolean;
  deletingId: string;
}) => {
  return (
    <Card className="hover:shadow-md transition-shadow h-full flex flex-col">
      <CardContent className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate">
              {page.title}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5 font-mono">
              {`/${page.slug}`}
            </p>
          </div>
          <div className="ml-2 shrink-0 flex flex-col items-end gap-1">
            <Badge variant={page.isPublished ? "default" : "secondary"}>
              {page.isPublished ? "Published" : "Draft"}
            </Badge>
            <Badge variant="outline">
              {safeParseBlocks(page.blocks).length} block
              {safeParseBlocks(page.blocks).length !== 1 ? "s" : ""}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4 flex-wrap">
          {safeParseBlocks(page.blocks)
            .slice(0, 3)
            .map((b) => (
              <Badge key={b.id} variant="secondary" className="text-[10px]">
                {b.label}
              </Badge>
            ))}
          {safeParseBlocks(page.blocks).length > 3 && (
            <span>+{safeParseBlocks(page.blocks).length - 3} more</span>
          )}
        </div>
        <div className="mt-auto flex gap-2">
          <Link
            to={`/admin/pages/${page.slug.replace(/^\//, "")}`}
            className="flex-1"
          >
            <Button size="sm" className="w-full">
              <Pencil className="h-3.5 w-3.5 mr-1.5" /> Edit Page
            </Button>
          </Link>
          {onDelete && showDeleteButton(page?.slug) && (
            <Button
              disabled={isPageDeleting}
              size="sm"
              variant="destructive"
              onClick={() => onDelete(page.slug)}
            >
              {isPageDeleting && deletingId === page?.slug ? (
                <Loader2 className="animate-spin h-3.5 w-3.5" />
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PageManagement;
