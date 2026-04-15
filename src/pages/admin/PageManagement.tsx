/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Globe, GraduationCap, ArrowLeft, BookOpen, FileText, Files } from "lucide-react";
import Swal from "sweetalert2";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import type { CMSPage, CmsPageCategory } from "@/types/pageBuilder";
import {
  type CreateCMSPagePayload,
  useCreatePageMutation,
  useDeletePageMutation,
  useGetPagesQuery,
} from "@/redux/apis/pageBuilderApi";
import { TryCatch } from "@/utils/apiTryCatch";
import { handleResponse } from "@/utils/handleResponse";
import {
  getFallbackBlocksForPageType,
  getRememberedCmsPageType,
  resolvePageType,
  rememberCmsPageType,
} from "@/utils/pageBuilder";

import PageCard from "@/components/admin/page-builder/PageCard";
import AddPageDialog from "@/components/admin/page-builder/AddPageDialog";

type NewPageType = "static" | "qualification" | "blog-post";

const normalizePageSlug = (rawSlug: string) =>
  rawSlug
    .toLowerCase()
    .replace(/^\//, "")
    .replace(/[^a-z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const PageManagement = () => {
  const { data: pageData, refetch, isLoading: isPageLoading } = useGetPagesQuery();
  const [addOpen, setAddOpen] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [newPage, setNewPage] = useState({ title: "", slug: "", type: "static" as NewPageType });
  const { toast } = useToast();
  const [createPage] = useCreatePageMutation();
  const [deletePage, { isLoading: isPageDeleting }] = useDeletePageMutation();

  const inferPageType = (page: CMSPage): CmsPageCategory => {
    return page.page_type || getRememberedCmsPageType(page.slug) || resolvePageType(page);
  };

  const handleAddPage = async () => {
    if (!newPage.title) {
      toast({ title: "Title is required", variant: "destructive" });
      return;
    }

    const cleanSlug = normalizePageSlug(newPage.slug || newPage.title);
    const resolvedPageType =
      newPage.type === "blog-post"
        ? "blog_post"
        : newPage.type === "qualification"
          ? "qualification_detail"
          : "static";
    const payload: CreateCMSPagePayload = {
      title: newPage.title,
      slug: cleanSlug,
      blocks: getFallbackBlocksForPageType(resolvedPageType, cleanSlug),
      is_published: false,
    };

    const [data, error] = await TryCatch(createPage(payload).unwrap());
    handleResponse({
      data,
      error,
      successMessage: "Page created",
      onSuccess: () => {
        rememberCmsPageType(cleanSlug, resolvedPageType);
        setNewPage({ title: "", slug: "", type: "static" });
        setAddOpen(false);
        refetch();
      },
    });
  };

  const handleDeletePage = (slug: string) => {
    Swal.fire({
      title: "Are you sure?",
      text: "Once deleted, this item cannot be recovered.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      confirmButtonColor: "#d33",
    }).then(async (res) => {
      if (!res.isConfirmed) return;
      setDeletingId(slug);
      const [data, error] = await TryCatch(deletePage(slug).unwrap());
      handleResponse({ data, error, successMessage: "Page deleted", onSuccess: () => refetch() });
      setDeletingId("");
    });
  };

  const results = pageData?.data?.results || [];
  const pageMeta = results.map((page) => ({
    page,
    pageType: inferPageType(page),
  }));

  const staticPages = pageMeta.filter(({ pageType }) => pageType === "static");
  const qualificationPages = pageMeta.filter(({ pageType }) => pageType === "qualification_detail");
  const blogPages = pageMeta.filter(({ pageType }) => pageType === "blog_post");
  const otherPages = pageMeta.filter(({ pageType }) => pageType === "general");

  return (
    <div className="space-y-6">
      <Link to="/admin/dashboard" className="inline-flex items-center gap-1.5 text-primary hover:underline text-sm">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Page Builder</h1>
        <Button onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> New Page
        </Button>
      </div>

      <SectionGroup
        title="Static Pages"
        icon={<Globe className="h-5 w-5 text-primary" />}
        isLoading={isPageLoading}
        pages={staticPages}
        onDelete={handleDeletePage}
        isDeleting={isPageDeleting}
        deletingId={deletingId}
        emptyMsg="No static pages yet."
      />
      <SectionGroup
        title="Qualification Pages"
        icon={<GraduationCap className="h-5 w-5 text-primary" />}
        pages={qualificationPages}
        onDelete={handleDeletePage}
        isDeleting={isPageDeleting}
        deletingId={deletingId}
        emptyMsg="No linked qualification detail pages detected yet."
      />
      <SectionGroup
        title="Blog Pages"
        icon={<BookOpen className="h-5 w-5 text-primary" />}
        pages={blogPages}
        onDelete={handleDeletePage}
        isDeleting={isPageDeleting}
        deletingId={deletingId}
        emptyMsg="No blog pages remembered in the admin yet."
      />
      <SectionGroup
        title="Other CMS Pages"
        icon={<Files className="h-5 w-5 text-primary" />}
        pages={otherPages}
        onDelete={handleDeletePage}
        isDeleting={isPageDeleting}
        deletingId={deletingId}
        emptyMsg="No additional CMS pages yet."
      />

      <AddPageDialog open={addOpen} onOpenChange={setAddOpen} newPage={newPage} setNewPage={setNewPage} onAdd={handleAddPage} />
    </div>
  );
};

const SectionGroup = ({
  title,
  icon,
  isLoading,
  pages,
  onDelete,
  isDeleting,
  deletingId,
  emptyMsg,
}: {
  title: string;
  icon: React.ReactNode;
  isLoading?: boolean;
  pages: Array<{ page: CMSPage; pageType: CmsPageCategory }>;
  onDelete?: (slug: string) => void;
  isDeleting: boolean;
  deletingId: string;
  emptyMsg: string;
}) => (
  <div>
    <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
      {icon} {title}
    </h2>
    {isLoading ? (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">Loading...</CardContent>
      </Card>
    ) : pages.length === 0 ? (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          <FileText className="h-10 w-10 mx-auto mb-3 opacity-40" />
          {emptyMsg}
        </CardContent>
      </Card>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pages.map(({ page, pageType }) => (
          <PageCard
            key={page.id}
            page={page}
            pageType={pageType}
            onDelete={onDelete}
            isPageDeleting={isDeleting}
            deletingId={deletingId}
          />
        ))}
      </div>
    )}
  </div>
);

export default PageManagement;
