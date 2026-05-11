/* eslint-disable @typescript-eslint/no-explicit-any */
import { useToast } from "@/hooks/use-toast";
import {
  useGetPageQuery,
  useUpdatePageMutation,
} from "@/redux/apis/pageBuilderApi";
import type {
  BlockType,
  CMSPageCategory,
  ContentBlock
} from "@/types/pageBuilder";
import { getDefaultBlockData } from "@/types/pageBuilder";
import { TryCatch } from "@/utils/apiTryCatch";
import {
  getAllowedBlockTypesForPage,
  getFallbackBlocksForPageType,
  getPreviewPath,
  getRenderableBlocks,
  normalizeCmsPageCategory,
  normalizePageBlocksForSlug,
  preserveSystemBlockState,
  rememberCmsPageType,
  resolvePageType,
} from "@/utils/pageBuilder";
import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";

import AddBlockDialog from "@/components/admin/page-builder/AddBlockDialog";
import BlockList from "@/components/admin/page-builder/BlockList";
import EditBlockDialog from "@/components/admin/page-builder/EditBlockDialog";
import PageEditorHeader from "@/components/admin/page-builder/PageEditorHeader";
import SEOPanel from "@/components/admin/page-builder/SEOPanel";

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
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [pageType, setPageType] = useState<CMSPageCategory>(queryPageType);
  const [updatePage, { isLoading: isSaving }] = useUpdatePageMutation();

  useEffect(() => {
    if (!cmsPage || hasLoaded) return;

    const resolvedSlug = (cmsPage.slug || pageId || "").replace(/^\//, "");
    const resolvedPageType = cmsPage.page_type
      ? normalizeCmsPageCategory(cmsPage.page_type)
      : queryPageType !== "general"
        ? queryPageType
        : rememberOrResolvePageType(cmsPage);
    const resolvedBlocks = getRenderableBlocks(cmsPage, resolvedSlug, resolvedPageType);
    const normalizedBlocks = resolvedBlocks;

    setPageTitle(cmsPage.title || "Untitled");
    setBlocks(normalizedBlocks);
    setSlug(resolvedSlug);
    setIsPublished(Boolean(cmsPage.is_published));
    setMeta({
      title: cmsPage.seo_title || "",
      description: cmsPage.seo_description || "",
    });

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
    const normalizedIncoming = normalizePageBlocksForSlug(updatedBlocks || blocks, slug);
    const normalizedExisting = normalizePageBlocksForSlug(blocks, slug);
    const nextBlocks = preserveSystemBlockState(normalizedIncoming, normalizedExisting);
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
    const target = blocks.find((block) => block.id === id);
    if (!target || target.type === "hero" || target.isLocked) return;
    const updated = blocks.filter((block) => block.id !== id);
    savePage(updated);
  };

  const handleAdd = (type: BlockType) => {
    if (type === "hero") return;
    if (type === "qualification_hero") return;
    if (isQualificationPage && type === "qualification_slider") return;
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
  const isQualificationPage = pageType === "qualification_detail";
  const CORE_SLUGS = ["home", "about", "contact"];
  const isGenericStaticPage =
    pageType === "static" && !CORE_SLUGS.includes(slug);
  const showPublishedToggle =
    !isHomePage &&
    slug !== "about" &&
    slug !== "contact" &&
    !isQualificationPage;
  const fallbackBlocks = useMemo(
    () => getFallbackBlocksForPageType(pageType, slug),
    [pageType, slug],
  );
  const visibleBlocks =
    blocks.length > 0 ? blocks : isQualificationPage ? [] : fallbackBlocks;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-4">
      <PageEditorHeader
        pageTitle={pageTitle}
        setPageTitle={setPageTitle}
        previewPath={previewPath}
        isPublished={isPublished}
        setIsPublished={setIsPublished}
        showPublishedToggle={showPublishedToggle}
        isSaving={isSaving}
        handleSave={() => savePage()}
      />
      <SEOPanel slug={slug} onSlugChange={setSlug} meta={meta} onMetaChange={setMeta} />
      <div className="grid grid-cols-1 max-w-4xl mx-auto gap-6">
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
      </div>
      <AddBlockDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        addBlock={handleAdd}
        allowedBlocks={getAllowedBlockTypesForPage(pageType, slug)}
      />
      <EditBlockDialog
        block={editBlock}
        open={!!editBlock}
        isUploading={isUploading}
        setIsUploading={setIsUploading}
        onSave={handleBlockSave}
        onClose={() => setEditBlock(null)}
        isGenericStaticPage={isGenericStaticPage}
      />
    </div>
  );
};

export default PageEditor;

const rememberOrResolvePageType = (page: { slug: string; page_type?: CMSPageCategory | null }) =>
  resolvePageType(page);
