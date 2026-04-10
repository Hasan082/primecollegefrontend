import { getAboutDefaultBlocks } from "@/data/aboutBlocks";
import { getContactDefaultBlocks } from "@/data/contactBlocks";
import { getHomeDefaultBlocks } from "@/data/homeBlocks";
import type {
  CMSPage,
  CMSPageCategory,
  ContentBlock,
  PreviewPageKind,
  PreviewRouteContext,
  QualificationSliderBlock,
} from "@/types/pageBuilder";
import { BLOCK_TYPE_LABELS, LOCKED_BLOCK_TYPES } from "@/types/pageBuilder";

type UnknownRecord = Record<string, unknown>;

const isObject = (value: unknown): value is UnknownRecord =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const asString = (value: unknown, fallback = ""): string =>
  typeof value === "string" ? value : fallback;

const asBoolean = (value: unknown, fallback = false): boolean =>
  typeof value === "boolean" ? value : fallback;

const asNumber = (value: unknown, fallback: number): number => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
};

const normalizePopularQualificationsBlock = (block: ContentBlock): ContentBlock => {
  if (block.type !== "popular-qualifications") return block;

  const data = isObject(block.data) ? block.data : {};
  const rawMode = asString(data.selection_mode, Array.isArray(data.items) && data.items.length > 0 ? "manual" : "latest");
  const selection_mode = rawMode === "latest" ? "latest" : "manual";
  const qualification_ids = Array.isArray(data.qualification_ids)
    ? data.qualification_ids.filter((value): value is string => typeof value === "string" && value.length > 0)
    : [];
  const items = Array.isArray(data.items)
    ? data.items.filter((item): item is Record<string, unknown> => isObject(item))
    : [];

  return {
    ...block,
    data: {
      ...data,
      title: asString(data.title, "Popular Qualifications"),
      selection_mode,
      qualification_ids,
      show_count: Math.max(1, asNumber(data.show_count, 4)),
      items,
    },
  };
};

const normalizeQualificationSliderBlock = (block: ContentBlock): ContentBlock => {
  if (block.type !== "qualification_slider") return block;

  const data = isObject(block.data) ? block.data : {};
  const rawMode = asString(data.selection_mode, "manual");
  const selection_mode = rawMode === "auto" ? "latest" : rawMode === "latest" ? "latest" : "manual";
  const qualification_ids = Array.isArray(data.qualification_ids)
    ? data.qualification_ids.filter((value): value is string => typeof value === "string" && value.length > 0)
    : [];
  const items = Array.isArray(data.items)
    ? data.items.filter((item): item is NonNullable<QualificationSliderBlock["data"]["items"]>[number] => isObject(item) && typeof item.id === "string" && typeof item.slug === "string")
    : undefined;

  return {
    ...block,
    data: {
      selection_mode,
      qualification_ids,
      show_count: Math.max(1, asNumber(data.show_count, 4)),
      autoplay: asBoolean(data.autoplay, true),
      delay_ms: Math.max(1000, asNumber(data.delay_ms, 5000)),
      ...(items ? { items } : {}),
    },
  };
};

const getHomeQualificationSliderBlock = (): ContentBlock =>
  normalizeQualificationSliderBlock({
    id: "home_popular",
    type: "qualification_slider",
    label: "Qualification Slider",
    isLocked: true,
    isFixed: true,
    data: {
      selection_mode: "latest",
      qualification_ids: [],
      show_count: 4,
      autoplay: true,
      delay_ms: 5000,
    },
  } as ContentBlock);

const normalizeHomePageBlocks = (blocks: ContentBlock[]): ContentBlock[] => {
  const nonHeroBlocks = blocks.filter((block) => block.type !== "hero");
  const qualificationIndex = nonHeroBlocks.findIndex((block) => block.type === "qualification_slider");
  const qualificationBlock = qualificationIndex >= 0
    ? normalizeQualificationSliderBlock({
        ...nonHeroBlocks[qualificationIndex],
        isLocked: true,
        isFixed: true,
      })
    : getHomeQualificationSliderBlock();
  const remainingBlocks = nonHeroBlocks.filter((block, index) => index !== qualificationIndex);

  return [qualificationBlock, ...remainingBlocks];
};

export const normalizeBlock = (block: unknown, index = 0): ContentBlock | null => {
  if (!isObject(block)) return null;

  const type = asString(block.type) as ContentBlock["type"];
  if (!type || !(type in BLOCK_TYPE_LABELS)) return null;

  const normalized: ContentBlock = {
    id: asString(block.id, `legacy_block_${index + 1}`),
    type,
    label: asString(block.label, BLOCK_TYPE_LABELS[type]),
    data: isObject(block.data) ? block.data : {},
    alignment: ["left", "center", "right"].includes(asString(block.alignment))
      ? (block.alignment as ContentBlock["alignment"])
      : undefined,
    style: isObject(block.style) ? block.style : undefined,
    isLocked: asBoolean(block.isLocked, LOCKED_BLOCK_TYPES.includes(type)),
    isFixed: asBoolean(block.isFixed, type === "qualification_hero"),
  } as ContentBlock;

  return normalizePopularQualificationsBlock(normalizeQualificationSliderBlock(normalized));
};

/**
 * Accepts backend blocks that may still be malformed legacy strings and
 * normalizes them into a safe block array for editor/public rendering.
 */
export const safeParseBlocks = (blocks: unknown): ContentBlock[] => {
  if (!blocks) return [];

  const raw = (() => {
    if (Array.isArray(blocks)) return blocks;
    if (typeof blocks === "string") {
      try {
        const parsed = JSON.parse(blocks);
        return Array.isArray(parsed) ? parsed : [];
      } catch (error) {
        console.error("Failed to parse blocks JSON:", error);
        return [];
      }
    }
    return [];
  })();

  return raw
    .map((block, index) => normalizeBlock(block, index))
    .filter((block): block is ContentBlock => Boolean(block));
};

export const getFallbackBlocksForSlug = (slug: string): ContentBlock[] => {
  switch (slug) {
    case "home":
      return getHomeDefaultBlocks();
    case "about":
      return getAboutDefaultBlocks();
    case "contact":
      return getContactDefaultBlocks();
    default:
      return [];
  }
};

export const getRenderableBlocks = (
  pageOrBlocks: CMSPage | ContentBlock[] | string | null | undefined,
  fallbackSlug?: string,
): ContentBlock[] => {
  if (Array.isArray(pageOrBlocks) || typeof pageOrBlocks === "string" || !pageOrBlocks) {
    const parsed = safeParseBlocks(pageOrBlocks);
    const resolvedBlocks = parsed.length > 0 ? parsed : getFallbackBlocksForSlug(fallbackSlug || "");
    return (fallbackSlug || "") === "home" ? normalizeHomePageBlocks(resolvedBlocks) : resolvedBlocks;
  }

  const parsed = safeParseBlocks(pageOrBlocks.blocks);
  const resolvedSlug = fallbackSlug || pageOrBlocks.slug || "";
  const resolvedBlocks = parsed.length > 0 ? parsed : getFallbackBlocksForSlug(resolvedSlug);
  return resolvedSlug === "home" ? normalizeHomePageBlocks(resolvedBlocks) : resolvedBlocks;
};

export const normalizeCmsPageCategory = (value?: string | null): CmsPageCategory => {
  if (value === "qualification") return "qualification_detail";
  if (value === "blog-post") return "blog_post";
  if (value === "static" || value === "blog_post" || value === "qualification_detail") return value;
  return "general";
};

export const getCmsPageCategory = (slug: string): CmsPageCategory => {
  if (slug === "home" || slug === "about" || slug === "contact") return "static";
  if (slug.startsWith("blog-") || slug.startsWith("blogs/")) return "blog_post";
  if (slug.startsWith("qualification-")) return "qualification_detail";
  return "general";
};

export const resolvePageType = (page?: Pick<CMSPage, "slug" | "page_type"> | null): CmsPageCategory => {
  if (page?.page_type) return normalizeCmsPageCategory(page.page_type);
  if (page?.slug) return getCmsPageCategory(page.slug);
  return "general";
};

const normalizeBlogSlug = (slug: string): string => {
  const cleaned = slug.replace(/^\/+/, "").replace(/^blogs?\//, "").replace(/^blog-/, "");
  return cleaned;
};

export const getPreviewPageKind = ({
  slug,
  pageType,
  pageContext,
  qualificationSlug,
  isHomePage,
}: PreviewRouteContext): PreviewPageKind => {
  if (isHomePage || slug === "home") return "home";
  if (pageType === "qualification_detail" || pageContext?.qualification_slug || qualificationSlug) return "qualification-detail";
  if (pageType === "blog_post") return "blog-detail";
  if (slug) return "static";
  return "unknown";
};

export const getPreviewPath = ({
  slug,
  pageType,
  pageContext,
  qualificationSlug,
  isHomePage,
}: PreviewRouteContext): string => {
  const kind = getPreviewPageKind({ slug, pageType, pageContext, qualificationSlug, isHomePage });

  switch (kind) {
    case "home":
      return "/";
    case "qualification-detail":
      return `/qualifications/${pageContext?.qualification_slug || qualificationSlug || slug}`;
    case "blog-detail":
      return slug ? `/blogs/${normalizeBlogSlug(slug)}` : "/blogs";
    case "static":
      return slug === "home" ? "/" : `/${slug}`;
    default:
      return slug ? `/${slug}` : "/";
  }
};

const PAGE_TYPE_STORAGE_KEY = "primecollege.cms-page-types";

const canUseStorage = () => typeof window !== "undefined" && typeof window.localStorage !== "undefined";

export const getStoredCmsPageTypes = (): Record<string, CmsPageCategory> => {
  if (!canUseStorage()) return {};
  try {
    const raw = window.localStorage.getItem(PAGE_TYPE_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!isObject(parsed)) return {};
    return Object.fromEntries(
      Object.entries(parsed).map(([slug, pageType]) => [slug, normalizeCmsPageCategory(String(pageType))]),
    );
  } catch (error) {
    console.error("Failed to read CMS page type storage:", error);
    return {};
  }
};

export const rememberCmsPageType = (slug: string, pageType: CmsPageCategory) => {
  if (!slug || !canUseStorage()) return;
  const next = {
    ...getStoredCmsPageTypes(),
    [slug]: normalizeCmsPageCategory(pageType),
  };
  window.localStorage.setItem(PAGE_TYPE_STORAGE_KEY, JSON.stringify(next));
};

export const getRememberedCmsPageType = (slug: string): CmsPageCategory | undefined => {
  if (!slug) return undefined;
  return getStoredCmsPageTypes()[slug];
};

export const normalizeQualificationSliderData = (
  data: unknown,
): QualificationSliderBlock["data"] => {
  const normalizedBlock = normalizeQualificationSliderBlock({
    id: "normalized_qualification_slider",
    type: "qualification_slider",
    label: "Qualification Slider",
    data: isObject(data) ? data : {},
  } as ContentBlock) as QualificationSliderBlock;

  return {
    selection_mode: normalizedBlock.data.selection_mode,
    qualification_ids:
      normalizedBlock.data.selection_mode === "latest"
        ? []
        : normalizedBlock.data.qualification_ids || [],
    show_count: normalizedBlock.data.show_count,
    autoplay: normalizedBlock.data.autoplay,
    delay_ms: normalizedBlock.data.delay_ms,
    ...(normalizedBlock.data.items ? { items: normalizedBlock.data.items } : {}),
  };
};

export const filterOutSystemBlocks = (blocks: ContentBlock[]): ContentBlock[] =>
  blocks.filter((block) => block.type !== "qualification_hero");

export const preserveSystemBlockState = (
  incomingBlocks: ContentBlock[],
  existingBlocks: ContentBlock[],
): ContentBlock[] => {
  const existingSystemBlocks = existingBlocks.filter((block) => block.type === "qualification_hero");
  const nextBlocks = incomingBlocks.filter((block) => block.type !== "qualification_hero");
  return [...existingSystemBlocks, ...nextBlocks];
};

export const prepareBlocksForSave = (blocks: ContentBlock[]): ContentBlock[] =>
  blocks.map((block) => {
    if (block.type !== "qualification_slider") return block;

    const { items, ...restData } = normalizeQualificationSliderData(block.data);
    return {
      ...block,
      data: {
        ...restData,
        qualification_ids: restData.selection_mode === "latest" ? [] : restData.qualification_ids || [],
      },
    };
  });
