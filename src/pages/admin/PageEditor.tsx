/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import type {
  ContentBlock,
  BlockType,
  TextAlignment,
  BlockStyle,
} from "@/types/pageBuilder";
import { BLOCK_TYPE_LABELS, getDefaultBlockData } from "@/types/pageBuilder";
import { defaultPages } from "@/data/defaultPages";
import {
  useGetPageQuery,
  useUpdatePageMutation,
} from "@/redux/apis/pageBuilderApi";
import { handleResponse } from "@/utils/handleResponse";
import { TryCatch } from "@/utils/apiTryCatch";
import { getHomeDefaultBlocks } from "@/data/homeBlocks";
import { getAboutDefaultBlocks } from "@/data/aboutBlocks";
import { getContactDefaultBlocks } from "@/data/contactBlocks";

// Refactored Components
import PageEditorHeader from "@/components/admin/page-builder/PageEditorHeader";
import BlockList from "@/components/admin/page-builder/BlockList";
import SEOPanel from "@/components/admin/page-builder/SEOPanel";
import BlockPreviewRenderer from "@/components/admin/page-builder/BlockPreviewRenderer";
import AddBlockDialog from "@/components/admin/page-builder/AddBlockDialog";
import EditBlockDialog from "@/components/admin/page-builder/EditBlockDialog";

const getPreviewPath = (slug: string) => {
  if (slug.startsWith("blog-")) return `/blog/${slug.replace(/^blog-/, "")}`;
  if (slug.startsWith("qualification-"))
    return `/qualifications/${slug.replace(/^qualification-/, "")}`;
  return `/${slug}`;
};

const PageEditor = () => {
  const { pageId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const initialPage = defaultPages.find((p) => p.id === pageId);
  const { data: pageData } = useGetPageQuery(pageId, { skip: !pageId });
  const cmsPage = pageData?.data;

  const [pageTitle, setPageTitle] = useState(initialPage?.title || "Untitled");
  const [blocks, setBlocks] = useState<ContentBlock[]>(initialPage?.blocks || []);
  const [slug, setSlug] = useState((initialPage?.slug || pageId || "").replace(/^\//, ""));
  const [meta, setMeta] = useState(initialPage?.meta || {});
  const [addOpen, setAddOpen] = useState(false);
  const [editBlock, setEditBlock] = useState<ContentBlock | null>(null);
  const [showPreview, setShowPreview] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [updatePage] = useUpdatePageMutation();

  useEffect(() => {
    if (!cmsPage || hasLoaded) return;
    setPageTitle(cmsPage.title || "Untitled");
    try {
      const rawBlocks = cmsPage.blocks;
      const parsed = typeof rawBlocks === "string" ? JSON.parse(rawBlocks) : rawBlocks;
      let finalBlocks = parsed || [];
      if (finalBlocks.length === 0) {
        if (pageId === "home") finalBlocks = getHomeDefaultBlocks();
        else if (pageId === "about") finalBlocks = getAboutDefaultBlocks();
        else if (pageId === "contact") finalBlocks = getContactDefaultBlocks();
      }
      setBlocks(finalBlocks);
    } catch (e) { 
      console.error("Failed to parse blocks:", e); 
      let fallback = [];
      if (pageId === "home") fallback = getHomeDefaultBlocks();
      else if (pageId === "about") fallback = getAboutDefaultBlocks();
      else if (pageId === "contact") fallback = getContactDefaultBlocks();
      setBlocks(fallback); 
    }
    setSlug((cmsPage.slug || pageId || "").replace(/^\//, ""));
    setIsPublished(cmsPage.is_published || false);
    setMeta({ title: cmsPage.seo_title || "", description: cmsPage.seo_description || "" });
    setHasLoaded(true);
  }, [cmsPage, pageId, hasLoaded]);

  useEffect(() => { setHasLoaded(false); }, [pageId]);

  const savePage = async (updatedBlocks?: ContentBlock[]) => {
    const [data, error] = await TryCatch(updatePage({
      slug: pageId as string,
      payload: {
        blocks: JSON.stringify(updatedBlocks || blocks),
        title: pageTitle, slug,
        seo_title: meta.title, seo_description: meta.description,
        is_published: isPublished,
      },
    }).unwrap());
    if (!error || data?.success) if (updatedBlocks) setBlocks(updatedBlocks);
    return { data, error };
  };

  const handleBlockSave = (id: string, data: any, meta: any) => {
    const updated = blocks.map((b) => b.id === id ? { ...b, ...meta, data: { ...b.data, ...data } } : b);
    savePage(updated);
    setEditBlock(null);
  };

  const handleRemove = (id: string) => {
    const updated = blocks.filter((b) => b.id !== id);
    savePage(updated);
  };

  const handleAdd = (type: BlockType) => {
    const block = getDefaultBlockData(type);
    const updated = [...blocks, block];
    savePage(updated).then(({ error }) => { if (!error) { setAddOpen(false); setEditBlock(block); } });
  };

  const isHomePage = pageId === 'home' || slug === 'home';
  const isAboutPage = pageId === 'about' || slug === 'about';
  const isContactPage = pageId === 'contact' || slug === 'contact';
  const isSpecialPage = isHomePage || isAboutPage || isContactPage;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-4">
      <PageEditorHeader 
        pageTitle={pageTitle} setPageTitle={setPageTitle} slug={slug}
        isPublished={isPublished} setIsPublished={setIsPublished}
        showPreview={showPreview} setShowPreview={setShowPreview}
        handleSave={() => savePage()} getPreviewPath={getPreviewPath}
      />
      <SEOPanel slug={slug} onSlugChange={setSlug} meta={meta} onMetaChange={setMeta} />
      <div className={`grid gap-6 ${showPreview ? "grid-cols-1 lg:grid-cols-[1fr_320px]" : "grid-cols-1 max-w-4xl"}`}>
        <BlockList blocks={blocks} setBlocks={setBlocks} onEdit={setEditBlock} onRemove={handleRemove} onAdd={() => setAddOpen(true)} isHomePage={isSpecialPage} />
        {showPreview && (
          <div className="hidden lg:block sticky top-6 rounded-lg border border-border bg-background overflow-hidden h-[80vh]">
            <div className="bg-muted px-3 py-1.5 border-b border-border flex items-center gap-2 text-[9px] font-mono">
              <span className="truncate flex-1">{getPreviewPath(slug)}</span>
            </div>
            <div className="overflow-y-auto h-full pb-10">
              <BlockPreviewRenderer blocks={blocks} pageTitle={pageTitle} />
            </div>
          </div>
        )}
      </div>
      <AddBlockDialog open={addOpen} onOpenChange={setAddOpen} addBlock={handleAdd} 
        allowedBlocks={isHomePage ? ["cta", "text", "faq", "stats", "logos", "cards"] : 
                       isAboutPage ? ["cta", "text", "faq", "stats", "features", "image-text", "about-split"] :
                       isContactPage ? ["cta", "text", "contact-form", "map"] :
                       undefined} 
      />
      <EditBlockDialog block={editBlock} open={!!editBlock} isUploading={isUploading} setIsUploading={setIsUploading} onSave={handleBlockSave} onClose={() => setEditBlock(null)} />
    </div>
  );
};

export default PageEditor;
