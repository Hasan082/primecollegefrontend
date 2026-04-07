/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Globe, GraduationCap, ArrowLeft, BookOpen, FileText } from "lucide-react";
import Swal from "sweetalert2";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import type { PageConfig } from "@/types/pageBuilder";
import {
  useCreatePageMutation,
  useDeletePageMutation,
  useGetPagesQuery,
} from "@/redux/apis/pageBuilderApi";
import { TryCatch } from "@/utils/apiTryCatch";
import { handleResponse } from "@/utils/handleResponse";
import { getHomeDefaultBlocks } from "@/data/homeBlocks";
import { getAboutDefaultBlocks } from "@/data/aboutBlocks";
import { getContactDefaultBlocks } from "@/data/contactBlocks";

// Refactored Components
import PageCard from "@/components/admin/page-builder/PageCard";
import AddPageDialog from "@/components/admin/page-builder/AddPageDialog";

const normalizePageSlug = (rawSlug: string, type: "static" | "qualification" | "blog-post") => {
  const baseSlug = rawSlug.replace(/^\//, "").replace(/[^a-z0-9-_]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  if (type === "blog-post") return baseSlug.startsWith("blog-") ? baseSlug : `blog-${baseSlug}`;
  if (type === "qualification") return baseSlug.startsWith("qualification-") ? baseSlug : `qualification-${baseSlug}`;
  return baseSlug.replace(/^blog-/, "").replace(/^qualification-/, "");
};

const PageManagement = () => {
  const { data: pageData, refetch, isLoading: isPageLoading } = useGetPagesQuery(null);
  const [addOpen, setAddOpen] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [newPage, setNewPage] = useState({ title: "", slug: "", type: "static" as "static" | "qualification" | "blog-post" });
  const { toast } = useToast();
  const [createPage] = useCreatePageMutation();
  const [deletePage, { isLoading: isPageDeleting }] = useDeletePageMutation();

  const handleAddPage = async () => {
    if (!newPage.title) { toast({ title: "Title is required", variant: "destructive" }); return; }
    const cleanSlug = normalizePageSlug(newPage.slug || newPage.title, newPage.type);
    const page: PageConfig = {
      id: cleanSlug, title: newPage.title, slug: cleanSlug, type: newPage.type,
      blocks: 
        cleanSlug === "home" ? getHomeDefaultBlocks() : 
        cleanSlug === "about" ? getAboutDefaultBlocks() : 
        cleanSlug === "contact" ? getContactDefaultBlocks() : 
        [],
      updatedAt: new Date().toISOString(),
    };
    const [data, error] = await TryCatch(createPage(page).unwrap());
    handleResponse({ data, error, successMessage: "Page created", onSuccess: () => {
      setNewPage({ title: "", slug: "", type: "static" }); setAddOpen(false); refetch();
    }});
  };

  const handleDeletePage = (id: string) => {
    Swal.fire({ title: "Are you sure?", text: "Once deleted, this item cannot be recovered.", icon: "warning", showCancelButton: true, confirmButtonText: "Delete", confirmButtonColor: "#d33" })
    .then(async (res) => {
      if (!res.isConfirmed) return;
      setDeletingId(id);
      const [data, error] = await TryCatch(deletePage(id).unwrap());
      handleResponse({ data, error, successMessage: "Page deleted", onSuccess: () => refetch() });
      setDeletingId("");
    });
  };

  const results = pageData?.data?.results || [];
  const staticPages = results.filter((p) => !p.slug?.includes("blog") && !p.slug?.includes("qualification"));
  const qualPages = results.filter((p) => p.slug?.includes("qualification"));
  const blogPages = results.filter((p) => p.slug?.includes("blog"));

  return (
    <div className="space-y-6">
      <Link to="/admin/dashboard" className="inline-flex items-center gap-1.5 text-primary hover:underline text-sm"><ArrowLeft className="w-4 h-4" /> Back to Dashboard</Link>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Page Builder</h1>
        <Button onClick={() => setAddOpen(true)}><Plus className="h-4 w-4 mr-2" /> New Page</Button>
      </div>

      <SectionGroup title="Static Pages" icon={<Globe className="h-5 w-5 text-primary" />} isLoading={isPageLoading} pages={staticPages} onDelete={handleDeletePage} isDeleting={isPageDeleting} deletingId={deletingId} emptyMsg="No static pages yet." />
      <SectionGroup title="Qualification Pages" icon={<GraduationCap className="h-5 w-5 text-primary" />} pages={qualPages} deletingId={deletingId} isDeleting={isPageDeleting} emptyMsg="No qualification pages yet." />
      <SectionGroup title="Blog Posts" icon={<BookOpen className="h-5 w-5 text-primary" />} pages={blogPages} onDelete={handleDeletePage} isDeleting={isPageDeleting} deletingId={deletingId} emptyMsg="No blog posts yet." />

      <AddPageDialog open={addOpen} onOpenChange={setAddOpen} newPage={newPage} setNewPage={setNewPage} onAdd={handleAddPage} />
    </div>
  );
};

const SectionGroup = ({ title, icon, isLoading, pages, onDelete, isDeleting, deletingId, emptyMsg }: any) => (
  <div>
    <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">{icon} {title}</h2>
    {isLoading ? <Card><CardContent className="p-8 text-center text-muted-foreground">Loading...</CardContent></Card> :
     pages.length === 0 ? <Card><CardContent className="p-8 text-center text-muted-foreground"><FileText className="h-10 w-10 mx-auto mb-3 opacity-40" />{emptyMsg}</CardContent></Card> :
     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{pages.map((p: any) => <PageCard key={p.id} page={p} onDelete={onDelete} isPageDeleting={isDeleting} deletingId={deletingId} />)}</div>}
  </div>
);

export default PageManagement;
