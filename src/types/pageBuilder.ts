// ─── Block type definitions for the page builder ───

export type BlockType =
  | "hero"
  | "text"
  | "image-text"
  | "modules"
  | "faq"
  | "stats"
  | "cta"
  | "cards"
  | "logos"
  | "blog"
  | "why-us"
  | "pricing";

export interface BlockBase {
  id: string;
  type: BlockType;
  label: string;
}

export interface HeroBlock extends BlockBase {
  type: "hero";
  data: {
    title: string;
    subtitle?: string;
    image?: string;
    ctaLabel?: string;
    ctaHref?: string;
    badges?: string[];
  };
}

export interface TextBlock extends BlockBase {
  type: "text";
  data: {
    title?: string;
    content: string;
    alignment?: "left" | "center";
  };
}

export interface ImageTextBlock extends BlockBase {
  type: "image-text";
  data: {
    headline: string;
    paragraphs: string[];
    image?: string;
    imagePosition?: "left" | "right";
    ctaLabel?: string;
    ctaHref?: string;
  };
}

export interface ModulesBlock extends BlockBase {
  type: "modules";
  data: {
    title?: string;
    items: { title: string; description?: string }[];
  };
}

export interface FAQBlock extends BlockBase {
  type: "faq";
  data: {
    title?: string;
    items: { question: string; answer: string }[];
  };
}

export interface StatsBlock extends BlockBase {
  type: "stats";
  data: {
    title?: string;
    subtitle?: string;
    items: { title: string; value: string; description?: string }[];
  };
}

export interface CTABlock extends BlockBase {
  type: "cta";
  data: {
    title: string;
    content?: string;
    ctaLabel?: string;
    ctaHref?: string;
    bgMode?: "color" | "image";
    bgColor?: string;
    bgImage?: string;
    overlayColor?: string;
  };
}

export interface CardsBlock extends BlockBase {
  type: "cards";
  data: {
    title?: string;
    items: { title: string; category?: string; level?: string; price?: string; image?: string; slug?: string }[];
  };
}

export interface LogosBlock extends BlockBase {
  type: "logos";
  data: {
    title?: string;
    items: { title: string; image?: string }[];
  };
}

export interface BlogBlock extends BlockBase {
  type: "blog";
  data: {
    title?: string;
    items: { title: string; description: string; date: string; category: string; image?: string }[];
  };
}

export interface WhyUsBlock extends BlockBase {
  type: "why-us";
  data: {
    title?: string;
    content?: string;
    items: { title: string; icon?: string; description: string }[];
  };
}

export interface PricingBlock extends BlockBase {
  type: "pricing";
  data: {
    price: string;
    duration?: string;
    features?: string[];
  };
}

export type ContentBlock =
  | HeroBlock
  | TextBlock
  | ImageTextBlock
  | ModulesBlock
  | FAQBlock
  | StatsBlock
  | CTABlock
  | CardsBlock
  | LogosBlock
  | BlogBlock
  | WhyUsBlock
  | PricingBlock;

export interface PageConfig {
  id: string;
  title: string;
  slug: string;
  type: "static" | "qualification";
  blocks: ContentBlock[];
  meta?: { title?: string; description?: string };
  updatedAt?: string;
}

// Helper
let _counter = 0;
export const generateBlockId = (): string => `block_${Date.now()}_${++_counter}`;

export const BLOCK_TYPE_LABELS: Record<BlockType, string> = {
  hero: "Hero Banner",
  text: "Text Section",
  "image-text": "Image + Text",
  modules: "Module List",
  faq: "FAQ Accordion",
  stats: "Statistics",
  cta: "Call to Action",
  cards: "Card Grid",
  logos: "Logo Carousel",
  blog: "Blog / News",
  "why-us": "Why Choose Us",
  pricing: "Pricing",
};

export const getDefaultBlockData = (type: BlockType): ContentBlock => {
  const id = generateBlockId();
  const label = BLOCK_TYPE_LABELS[type];

  const defaults: Record<BlockType, () => ContentBlock> = {
    hero: () => ({ id, type: "hero", label, data: { title: "Page Title", subtitle: "", image: "classroom", ctaLabel: "", ctaHref: "" } }),
    text: () => ({ id, type: "text", label, data: { title: "Section Title", content: "Enter your content here." } }),
    "image-text": () => ({ id, type: "image-text", label, data: { headline: "Headline", paragraphs: ["Paragraph text here."], imagePosition: "right" } }),
    modules: () => ({ id, type: "modules", label, data: { title: "Modules", items: [{ title: "Module 1", description: "Description" }] } }),
    faq: () => ({ id, type: "faq", label, data: { title: "FAQs", items: [{ question: "Question?", answer: "Answer." }] } }),
    stats: () => ({ id, type: "stats", label, data: { title: "Key Stats", items: [{ title: "Stat", value: "100", description: "Description" }] } }),
    cta: () => ({ id, type: "cta", label, data: { title: "Ready to Start?", content: "Contact us today.", ctaLabel: "Get Started", ctaHref: "/contact", bgMode: "color", bgColor: "#0c2d6b", bgImage: "", overlayColor: "rgba(0,0,0,0.5)" } }),
    cards: () => ({ id, type: "cards", label, data: { title: "Featured Items", items: [] } }),
    logos: () => ({ id, type: "logos", label, data: { title: "Our Partners", items: [] } }),
    blog: () => ({ id, type: "blog", label, data: { title: "Latest News", items: [] } }),
    "why-us": () => ({ id, type: "why-us", label, data: { title: "Why Choose Us", items: [{ title: "Feature", description: "Description" }] } }),
    pricing: () => ({ id, type: "pricing", label, data: { price: "£0", duration: "12 months" } }),
  };

  return defaults[type]();
};
