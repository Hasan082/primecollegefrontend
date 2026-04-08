import { Link } from "react-router-dom";
import { Pencil, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { CMSPage, CmsPageCategory } from "@/types/pageBuilder";
import { getPreviewPath, safeParseBlocks } from "@/utils/pageBuilder";

const showDeleteButton = (slug: string) => {
  const lists = ["home", "contact", "about"];
  return !lists?.includes(slug);
};

interface PageCardProps {
  page: CMSPage;
  pageType?: CmsPageCategory;
  onDelete?: (id: string) => void;
  isPageDeleting: boolean;
  deletingId: string;
}

const PageCard = ({
  page,
  pageType,
  onDelete,
  isPageDeleting,
  deletingId,
}: PageCardProps) => {
  const blockCount = safeParseBlocks(page.blocks).length;
  const previewPath = getPreviewPath({
    slug: page.slug,
    pageType,
    pageContext: page.page_context,
    qualificationSlug: page.page_context?.qualification_slug,
    isHomePage: page.slug === "home",
  });

  return (
    <Card className="hover:shadow-md transition-shadow h-full flex flex-col">
      <CardContent className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate">
              {page.title}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5 font-mono">
              {previewPath}
            </p>
          </div>
          <div className="ml-2 shrink-0 flex flex-col items-end gap-1">
            <Badge variant={page.is_published ? "default" : "secondary"}>
              {page.is_published ? "Published" : "Draft"}
            </Badge>
            <Badge variant="outline">
              {blockCount} block{blockCount !== 1 ? "s" : ""}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4 flex-wrap">
          {pageType === "qualification_detail" && page.page_context?.qualification_title ? (
            <Badge variant="outline" className="text-[10px]">
              {page.page_context.qualification_title}
            </Badge>
          ) : null}
          {safeParseBlocks(page.blocks)
            .slice(0, 3)
            .map((b) => (
              <Badge key={b.id} variant="secondary" className="text-[10px]">
                {b.label}
              </Badge>
            ))}
          {blockCount > 3 && (
            <span>+{blockCount - 3} more</span>
          )}
        </div>
        <div className="mt-auto flex gap-2">
          <Link
            to={`/admin/pages/${page.slug.replace(/^\//, "")}?pageType=${encodeURIComponent(pageType || "general")}${page.page_context?.qualification_slug ? `&qualificationSlug=${encodeURIComponent(page.page_context.qualification_slug)}` : ""}`}
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

export default PageCard;
