/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Eye, EyeOff } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type {
  ContentBlock,
  BlockType,
  TextAlignment,
  BlockStyle,
} from "@/types/pageBuilder";
import { BLOCK_TYPE_LABELS, getDefaultBlockData } from "@/types/pageBuilder";
import { defaultPages } from "@/data/defaultPages";
import SortableBlock from "@/components/admin/page-builder/SortableBlock";
import BlockEditorForm from "@/components/admin/page-builder/BlockEditorForm";
import SEOPanel from "@/components/admin/page-builder/SEOPanel";
import BlockPreviewRenderer from "@/components/admin/page-builder/BlockPreviewRenderer";
import {
  useGetPageQuery,
  useUpdatePageMutation,
} from "@/redux/apis/pageBuilderApi";
import { handleResponse } from "@/utils/handleResponse";
import { TryCatch } from "@/utils/apiTryCatch";

const getPreviewPath = (slug: string) => {
  if (slug.startsWith("blog-")) return `/blog/${slug.replace(/^blog-/, "")}`;
  if (slug.startsWith("qualification-"))
    return `/qualifications/${slug.replace(/^qualification-/, "")}`;
  return `/${slug}`;
};

const BLOCK_DESCRIPTIONS: Record<BlockType, string> = {
  hero: "Full-width banner",
  text: "Title + content",
  image: "Full-width image",
  "image-text": "Side by side",
  modules: "Numbered list",
  faq: "Accordion Q&A",
  stats: "Counter cards",
  cta: "Action banner",
  cards: "Grid of cards",
  logos: "Logo carousel",
  blog: "News grid",
  "why-us": "Feature highlights",
  pricing: "Price display",
};

const PageEditor = () => {
  const { pageId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const initialPage = defaultPages.find((p) => p.id === pageId);
  const { data: pageData } = useGetPageQuery(pageId, { skip: !pageId });
  const cmsPage = pageData?.data;

  const [pageTitle, setPageTitle] = useState(initialPage?.title || "Untitled");
  const [blocks, setBlocks] = useState<ContentBlock[]>(
    initialPage?.blocks || [],
  );
  const [slug, setSlug] = useState(
    initialPage?.slug?.replace(/^\//, "") || pageId || "",
  );
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

    // Handle blocks if they come as a string or array
    const rawBlocks = cmsPage.blocks;
    try {
      const parsedBlocks =
        typeof rawBlocks === "string" ? JSON.parse(rawBlocks) : rawBlocks;
      setBlocks(parsedBlocks || []);
    } catch (e) {
      console.error("Failed to parse blocks:", e);
      setBlocks([]);
    }

    setSlug((cmsPage.slug || pageId || "").replace(/^\//, ""));
    setIsPublished(cmsPage.is_published || false);
    setMeta({
      title: cmsPage.seo_title || "",
      description: cmsPage.seo_description || "",
    });
    setHasLoaded(true);
  }, [cmsPage, pageId, hasLoaded]);

  useEffect(() => {
    setHasLoaded(false);
  }, [pageId]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setBlocks((prev) => {
        const oldIndex = prev.findIndex((b) => b.id === active.id);
        const newIndex = prev.findIndex((b) => b.id === over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  }, []);

  const removeBlock = async (id: string) => {
    const updatedBlocks = blocks.filter((b) => b.id !== id);
    setBlocks(updatedBlocks);

    const [data, error] = await TryCatch(
      updatePage({
        slug: pageId as string,
        payload: {
          blocks: JSON.stringify(updatedBlocks),
          title: pageTitle,
          seo_title: meta.title,
          seo_description: meta.description,
          is_published: isPublished,
        },
      }).unwrap(),
    );

    if (!error || data?.success) setBlocks(updatedBlocks);

    const result = handleResponse({
      data,
      error,
      successMessage: "Block removed",
    });

    toast({
      title: result.type === "success" ? "Success" : "Error",
      description: result.message,
      variant: result.type === "error" ? "destructive" : "default",
    });
  };

  const addBlock = async (type: BlockType) => {
    const block = getDefaultBlockData(type);
    const updatedBlocks = [...blocks, block] as ContentBlock[];

    const [data, error] = await TryCatch(
      updatePage({
        slug: pageId as string,
        payload: {
          blocks: JSON.stringify(updatedBlocks),
          title: pageTitle,
          seo_title: meta.title,
          seo_description: meta.description,
          is_published: isPublished,
        },
      }).unwrap(),
    );
    if (!error || data?.success) {
      setBlocks(updatedBlocks);
      setAddOpen(false);
      setEditBlock(block);
    }
    const result = handleResponse({
      data,
      error,
      successMessage: `${BLOCK_TYPE_LABELS[type]} added`,
    });

    toast({
      title: result.type === "success" ? "Success" : "Error",
      description: result.message,
      variant: result.type === "error" ? "destructive" : "default",
    });
  };

  const updateBlock = async (
    id: string,
    data: Record<string, unknown>,
    meta: { alignment?: TextAlignment; style?: BlockStyle; label?: string },
  ) => {
    const updatedBlocks = blocks.map((b) =>
      b.id === id
        ? {
            ...b,
            ...meta,
            data: { ...(b.data as Record<string, unknown>), ...data },
          }
        : b,
    );

    const [res, error] = await TryCatch(
      updatePage({
        slug: pageId as string,
        payload: {
          blocks: JSON.stringify(updatedBlocks),
          title: pageTitle,
          seo_title: meta.title,
          seo_description: meta.description,
          is_published: isPublished,
        },
      }).unwrap(),
    );
    if (!error || res?.success) setBlocks(updatedBlocks as any);
    const result = handleResponse({
      data: res,
      error,
      successMessage: "Block updated",
    });

    toast({
      title: result.type === "success" ? "Success" : "Error",
      description: result.message,
      variant: result.type === "error" ? "destructive" : "default",
    });
  };
  const handleSave = async () => {
    const [data, error] = await TryCatch(
      updatePage({
        slug: pageId as string,
        payload: {
          blocks: JSON.stringify(blocks),
          title: pageTitle,
          slug,
          seo_title: meta.title,
          seo_description: meta.description,
          is_published: isPublished,
        },
      }).unwrap(),
    );

    const result = handleResponse({
      data,
      error,
      successMessage: "Page saved successfully",
      onSuccess: () => {
        if (slug !== pageId) {
          navigate(`/admin/pages/${slug}`, { replace: true });
        }
      },
    });

    toast({
      title: result.type === "success" ? "Success" : "Error",
      description: result.message,
      variant: result.type === "error" ? "destructive" : "default",
    });
  };
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/admin/pages")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <Input
            value={pageTitle}
            onChange={(e) => setPageTitle(e.target.value)}
            className="text-xl font-bold border-none bg-transparent px-0 h-auto focus-visible:ring-0"
          />
          <p className="text-xs text-muted-foreground mt-0.5 font-mono">
            {getPreviewPath(slug)}
          </p>
        </div>

        <div className="flex items-center gap-2 mr-2">
          <Label htmlFor="published-mode" className="text-xs font-medium">
            Published
          </Label>
          <Switch
            id="published-mode"
            checked={isPublished}
            onCheckedChange={setIsPublished}
          />
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowPreview(!showPreview)}
        >
          {showPreview ? (
            <EyeOff className="h-3.5 w-3.5 mr-1.5" />
          ) : (
            <Eye className="h-3.5 w-3.5 mr-1.5" />
          )}
          {showPreview ? "Hide" : "Show"} Preview
        </Button>
        <Button onClick={handleSave}>Save Page</Button>
      </div>

      {/* SEO Panel */}
      <SEOPanel
        slug={slug}
        onSlugChange={setSlug}
        meta={meta}
        onMetaChange={setMeta}
      />

      {/* Main Layout */}
      <div
        className={`grid gap-6 ${showPreview ? "grid-cols-1 lg:grid-cols-[1fr_320px]" : "grid-cols-1 max-w-4xl"}`}
      >
        {/* Blocks Editor */}
        <div className="space-y-3">
          {blocks.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground mb-4">
                  No blocks yet. Add your first block to start building the
                  page.
                </p>
                <Button onClick={() => setAddOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" /> Add Block
                </Button>
              </CardContent>
            </Card>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={blocks.map((b) => b.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {blocks.map((block) => (
                    <SortableBlock
                      key={block.id}
                      block={block}
                      onEdit={() => setEditBlock(block)}
                      onRemove={() => removeBlock(block.id)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}

          {blocks.length > 0 && (
            <div className="flex justify-center">
              <Button variant="outline" onClick={() => setAddOpen(true)}>
                <Plus className="h-4 w-4 mr-2" /> Add Block
              </Button>
            </div>
          )}
        </div>

        {/* Live Preview */}
        {showPreview && (
          <div className="hidden lg:block">
            <div className="sticky top-6">
              <div className="rounded-lg border border-border bg-background overflow-hidden">
                <div className="bg-muted px-3 py-1.5 border-b border-border flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-destructive/40" />
                    <div className="w-2 h-2 rounded-full bg-secondary/60" />
                    <div className="w-2 h-2 rounded-full bg-primary/30" />
                  </div>
                  <span className="text-[9px] text-muted-foreground font-mono truncate flex-1">
                    {getPreviewPath(slug)}
                  </span>
                </div>
                <div className="max-h-[70vh] overflow-y-auto">
                  <BlockPreviewRenderer blocks={blocks} pageTitle={pageTitle} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Block Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Block</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-2">
            {(Object.keys(BLOCK_TYPE_LABELS) as BlockType[]).map((type) => (
              <Button
                key={type}
                variant="outline"
                className="h-auto py-3 flex flex-col items-center gap-1"
                onClick={() => addBlock(type)}
              >
                <span className="text-sm font-medium">
                  {BLOCK_TYPE_LABELS[type]}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {BLOCK_DESCRIPTIONS[type]}
                </span>
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Block Dialog */}
      <Dialog open={!!editBlock} onOpenChange={(open) => {
        if (!open && isUploading) return;
        if (!open) setEditBlock(null);
      }}>
        <DialogContent 
          className="max-w-2xl max-h-[80vh] overflow-y-auto"
          onInteractOutside={(e) => {
            if (isUploading) e.preventDefault();
          }}
        >
          <DialogHeader>
            <DialogTitle>Edit: {editBlock?.label}</DialogTitle>
          </DialogHeader>
          {editBlock && (
            <BlockEditorForm
              block={editBlock}
              onSave={(data, meta) => updateBlock(editBlock.id, data, meta)}
              onClose={() => setEditBlock(null)}
              onUploadingChange={setIsUploading}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PageEditor;
