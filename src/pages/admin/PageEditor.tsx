/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import type {
  BlockStyle,
  BlockType,
  CMSPageCategory,
  ContentBlock,
  TextAlignment,
} from "@/types/pageBuilder";
import { getDefaultBlockData } from "@/types/pageBuilder";
import {
  useGetPageQuery,
  useUpdatePageMutation,
} from "@/redux/apis/pageBuilderApi";
import { TryCatch } from "@/utils/apiTryCatch";
import {
  getFallbackBlocksForSlug,
  normalizeCmsPageCategory,
  getPreviewPath,
  getRenderableBlocks,
  preserveSystemBlockState,
  resolvePageType,
  rememberCmsPageType,
} from "@/utils/pageBuilder";

import PageEditorHeader from "@/components/admin/page-builder/PageEditorHeader";
import BlockList from "@/components/admin/page-builder/BlockList";
import SEOPanel from "@/components/admin/page-builder/SEOPanel";
import BlockPreviewRenderer from "@/components/admin/page-builder/BlockPreviewRenderer";
import AddBlockDialog from "@/components/admin/page-builder/AddBlockDialog";
import EditBlockDialog from "@/components/admin/page-builder/EditBlockDialog";

const PageEditor = () => {
  const { pageId } = useParams();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  const queryPageType = normalizeCmsPageCategory(searchParams.get("pageType"));
  const qualificationSlug = searchParams.get("qualificationSlug");
  const { data: pageData } = useGetPageQuery(pageId || "", { skip: !pageId });
  const cmsPage = pageData?.data;

  const [pageTitle, setPageTitle] = useState("Untitled");
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [slug, setSlug] = useState((pageId || "").replace(/^\//, ""));
  const [meta, setMeta] = useState({ title: "", description: "" });
  const [addOpen, setAddOpen] = useState(false);
  const [editBlock, setEditBlock] = useState<ContentBlock | null>(null);
  const [showPreview, setShowPreview] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [pageType, setPageType] = useState<CMSPageCategory>(queryPageType);
  const [updatePage] = useUpdatePageMutation();

  useEffect(() => {
    if (!cmsPage || hasLoaded) return;

    const resolvedSlug = (cmsPage.slug || pageId || "").replace(/^\//, "");
    const resolvedBlocks = getRenderableBlocks(cmsPage, resolvedSlug);

    setPageTitle(cmsPage.title || "Untitled");
    setBlocks(resolvedBlocks);
    setSlug(resolvedSlug);
    setIsPublished(Boolean(cmsPage.is_published));
    setMeta({
      title: cmsPage.seo_title || "",
      description: cmsPage.seo_description || "",
    });

    const resolvedPageType = cmsPage.page_type
      ? normalizeCmsPageCategory(cmsPage.page_type)
      : queryPageType !== "general"
        ? queryPageType
        : rememberOrResolvePageType(cmsPage);

    setPageType(resolvedPageType);
    if (!cmsPage.page_type) rememberCmsPageType(resolvedSlug, resolvedPageType);
    setHasLoaded(true);
  }, [cmsPage, hasLoaded, pageId, queryPageType]);

  useEffect(() => {
    setHasLoaded(false);
  }, [pageId]);

  const previewPath = useMemo(
    () =>
      getPreviewPath({
        slug,
        pageType,
        pageContext: cmsPage?.page_context,
        qualificationSlug,
        isHomePage: slug === "home",
      }),
    [cmsPage?.page_context, pageType, qualificationSlug, slug],
  );

  const savePage = async (updatedBlocks?: ContentBlock[]) => {
    const nextBlocks = preserveSystemBlockState(updatedBlocks || blocks, blocks);
    const [data, error] = await TryCatch(
      updatePage({
        slug: pageId as string,
        payload: {
          blocks: nextBlocks,
          title: pageTitle,
          slug,
          seo_title: meta.title,
          seo_description: meta.description,
          is_published: isPublished,
        },
      }).unwrap(),
    );

    if (!error || data?.success) {
      setBlocks(nextBlocks);
      if (!cmsPage?.page_type) rememberCmsPageType(slug, pageType);
      if (updatedBlocks) setEditBlock(null);
    } else {
      toast({
        title: "Unable to save page",
        description: error || "Please try again.",
        variant: "destructive",
      });
    }

    return { data, error };
  };

  const handleBlockSave = (id: string, data: any, blockMeta: any) => {
    const updated = blocks.map((block) =>
      block.id === id ? { ...block, ...blockMeta, data: { ...block.data, ...data } } : block,
    );
    savePage(updated);
  };

  const handleRemove = (id: string) => {
    const updated = blocks.filter((block) => block.id !== id);
    savePage(updated);
  };

  const handleAdd = (type: BlockType) => {
    if (type === "qualification_hero") return;
    const block = getDefaultBlockData(type);
    const updated = [...blocks, block];
    savePage(updated).then(({ error }) => {
      if (!error) {
        setAddOpen(false);
        setEditBlock(block);
      }
    });
  };

  const isHomePage = pageId === "home" || slug === "home";
  const isAboutPage = pageId === "about" || slug === "about";
  const isContactPage = pageId === "contact" || slug === "contact";
  const fallbackBlocks = useMemo(() => getFallbackBlocksForSlug(slug), [slug]);
  const visibleBlocks = blocks.length > 0 ? blocks : fallbackBlocks;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-4">
      <PageEditorHeader
        pageTitle={pageTitle}
        setPageTitle={setPageTitle}
        previewPath={previewPath}
        isPublished={isPublished}
        setIsPublished={setIsPublished}
        showPreview={showPreview}
        setShowPreview={setShowPreview}
        handleSave={() => savePage()}
      />
      <SEOPanel slug={slug} onSlugChange={setSlug} meta={meta} onMetaChange={setMeta} />
      <div className={`grid gap-6 ${showPreview ? "grid-cols-1 lg:grid-cols-[1fr_320px]" : "grid-cols-1 max-w-4xl"}`}>
        <BlockList
          blocks={visibleBlocks}
          setBlocks={setBlocks}
          onEdit={(block) => {
            if (block.type === "qualification_hero") return;
            setEditBlock(block);
          }}
          onRemove={handleRemove}
          onAdd={() => setAddOpen(true)}
          isHomePage={isHomePage}
        />
        {showPreview && (
          <div className="hidden lg:block sticky top-6 rounded-lg border border-border bg-background overflow-hidden h-[80vh]">
            <div className="bg-muted px-3 py-1.5 border-b border-border flex items-center gap-2 text-[9px] font-mono">
              <span className="truncate flex-1">{previewPath}</span>
            </div>
            <div className="overflow-y-auto h-full pb-10">
              <BlockPreviewRenderer blocks={visibleBlocks} pageTitle={pageTitle} />
            </div>
          </div>
        )}
      </div>
      <AddBlockDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        addBlock={handleAdd}
        allowedBlocks={
          isHomePage
            ? ["cta", "text", "faq", "stats", "logos", "cards", "qualification_slider"]
            : isAboutPage
              ? ["cta", "text", "faq", "stats", "features", "image-text", "about-split", "logos"]
              : isContactPage
                ? ["cta", "text", "contact-form", "map"]
                : undefined
        }
      />
      <EditBlockDialog
        block={editBlock}
        open={!!editBlock}
        isUploading={isUploading}
        setIsUploading={setIsUploading}
        onSave={handleBlockSave}
        onClose={() => setEditBlock(null)}
      />
    </div>
  );
};

export default PageEditor;

const rememberOrResolvePageType = (page: { slug: string; page_type?: CMSPageCategory | null }) =>
  resolvePageType(page);
