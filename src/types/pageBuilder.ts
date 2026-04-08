// Shared CMS/page-builder block and page contracts.

export type BlockType =
  | "hero"
  | "qualification_hero"
  | "text"
  | "image"
  | "image-text"
  | "modules"
  | "faq"
  | "stats"
  | "cta"
  | "cards"
  | "logos"
  | "blog"
  | "why-us"
  | "pricing"
  | "about-split"
  | "popular-qualifications"
  | "features"
  | "contact-form"
  | "map"
  | "qualification_slider";

export type TextAlignment = "left" | "center" | "right";
export type CmsPageCategory = "static" | "blog_post" | "qualification_detail" | "general";
export type PreviewPageKind = "home" | "static" | "qualification-detail" | "blog-detail" | "unknown";

export interface BlockStyle {
  textColor?: string;
  bgColor?: string;
  bgImage?: string;
  bgOverlay?: string;
  paddingTop?: string;
  paddingBottom?: string;
  paddingLeft?: string;
  paddingRight?: string;
  marginTop?: string;
  marginBottom?: string;
}

export interface BlockBase {
  id: string;
  type: BlockType;
  label: string;
  alignment?: TextAlignment;
  style?: BlockStyle;
  isLocked?: boolean;
  isFixed?: boolean;
}

export interface HeroSlideItem {
  category: string;
  title: string;
  price: string;
  cta: string;
  image: string;
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
    slides?: HeroSlideItem[];
  };
}

export interface QualificationHeroBlock extends BlockBase {
  type: "qualification_hero";
  data: Record<string, unknown>;
  isLocked?: true;
  isFixed?: true;
}

export interface TextBlock extends BlockBase {
  type: "text";
  data: {
    title?: string;
    content: string;
    alignment?: TextAlignment;
  };
}

export interface ImageBlock extends BlockBase {
  type: "image";
  data: {
    image: string;
    alt?: string;
    caption?: string;
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
    description?: string;
  };
}

export interface ModulesBlock extends BlockBase {
  type: "modules";
  data: {
    title?: string;
    items: Array<{
      title: string;
      description?: string;
    }>;
  };
}

export interface FAQBlock extends BlockBase {
  type: "faq";
  data: {
    title?: string;
    items: Array<{
      question: string;
      answer: string;
    }>;
  };
}

export interface StatsBlock extends BlockBase {
  type: "stats";
  data: {
    title?: string;
    subtitle?: string;
    content?: string;
    items: Array<{
      title: string;
      value: string;
      description?: string;
    }>;
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
    items: Array<{
      title: string;
      category?: string;
      level?: string;
      price?: string;
      image?: string;
      slug?: string;
      description?: string;
    }>;
  };
}

export interface LogosBlock extends BlockBase {
  type: "logos";
  data: {
    title?: string;
    items: Array<{
      title: string;
      image?: string;
    }>;
  };
}

export interface BlogBlock extends BlockBase {
  type: "blog";
  data: {
    title?: string;
    items: Array<{
      title: string;
      description: string;
      date: string;
      category: string;
      image?: string;
      slug?: string;
    }>;
  };
}

export interface WhyUsBlock extends BlockBase {
  type: "why-us";
  data: {
    title?: string;
    content?: string;
    items: Array<{
      title: string;
      icon?: string;
      description: string;
    }>;
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

export interface AboutSplitBlock extends BlockBase {
  type: "about-split";
  data: {
    headline: string;
    paragraphs: string[];
    ctaLabel?: string;
    ctaHref?: string;
    description?: string;
  };
}

export interface PopularQualificationsBlock extends BlockBase {
  type: "popular-qualifications";
  data: {
    title: string;
    items: Array<Record<string, unknown>>;
  };
}

export interface FeaturesBlock extends BlockBase {
  type: "features";
  data: {
    title: string;
    items: Array<{
      title: string;
      description: string;
    }>;
  };
}

export interface ContactFormBlock extends BlockBase {
  type: "contact-form";
  data: {
    title: string;
    address: string;
    email: string;
    phone: string;
    hours: string;
    formFields: Array<{
      name: string;
      label: string;
      type: string;
      required: boolean;
    }>;
  };
}

export interface MapBlock extends BlockBase {
  type: "map";
  data: {
    title: string;
    iframeUrl: string;
  };
}

export interface QualificationSliderItem {
  id: string;
  title: string;
  slug: string;
  featured_image: string | null;
  short_description: string;
  category: string | null;
  level: string | null;
  qualification_type: string | null;
  current_price: string | null;
  currency: string;
}

export interface QualificationSliderBlock extends BlockBase {
  type: "qualification_slider";
  data: {
    selection_mode: "manual" | "latest";
    qualification_ids?: string[];
    show_count: number;
    autoplay: boolean;
    delay_ms: number;
    items?: QualificationSliderItem[];
  };
}

export type ContentBlock =
  | HeroBlock
  | QualificationHeroBlock
  | TextBlock
  | ImageBlock
  | ImageTextBlock
  | ModulesBlock
  | FAQBlock
  | StatsBlock
  | CTABlock
  | CardsBlock
  | LogosBlock
  | BlogBlock
  | WhyUsBlock
  | PricingBlock
  | AboutSplitBlock
  | PopularQualificationsBlock
  | FeaturesBlock
  | ContactFormBlock
  | MapBlock
  | QualificationSliderBlock;

export interface CMSPage {
  id: string;
  title: string;
  slug: string;
  page_type?: Exclude<CmsPageCategory, "general"> | null;
  page_context?: {
    qualification_id: string;
    qualification_slug: string;
    qualification_title: string;
  } | null;
  blocks: ContentBlock[] | string | null;
  is_published: boolean;
  seo_title?: string | null;
  seo_description?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CMSPageListResponse {
  success?: boolean;
  message?: string;
  data?: {
    count?: number;
    next?: string | null;
    previous?: string | null;
    results: CMSPage[];
  };
}

export interface CMSPageDetailResponse {
  success?: boolean;
  message?: string;
  data?: CMSPage;
}

export interface CMSImageUploadResponse {
  success?: boolean;
  message?: string;
  data?: {
    id?: string;
    image?: string;
  };
}

export interface PageConfig {
  id: string;
  title: string;
  slug: string;
  type: "static" | "qualification" | "blog-post";
  blocks: ContentBlock[];
  meta?: {
    title?: string;
    description?: string;
  };
  updatedAt?: string;
  is_published?: boolean;
  blogMeta?: {
    author?: string;
    date?: string;
    category?: string;
    image?: string;
    readTime?: string;
    excerpt?: string;
    featured?: boolean;
  };
}

export interface PreviewRouteContext {
  slug: string;
  pageType?: CmsPageCategory;
  pageContext?: CMSPage["page_context"];
  qualificationSlug?: string | null;
  isHomePage?: boolean;
}

let counter = 0;
export const generateBlockId = (): string => `block_${Date.now()}_${++counter}`;

export const SYSTEM_BLOCK_TYPES: BlockType[] = ["qualification_hero"];
export const LOCKED_BLOCK_TYPES: BlockType[] = ["qualification_hero"];

export const BLOCK_TYPE_LABELS: Record<BlockType, string> = {
  hero: "Hero Banner",
  text: "Text Section",
  image: "Image",
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
  qualification_hero: "Qualification Hero",
  "about-split": "About Split",
  "popular-qualifications": "Popular Qualifications",
  features: "Features Grid",
  "contact-form": "Contact Form",
  map: "Google Map",
  qualification_slider: "Qualification Slider",
};

export const getDefaultBlockData = (type: BlockType): ContentBlock => {
  const id = generateBlockId();
  const label = BLOCK_TYPE_LABELS[type];

  const defaults: Record<BlockType, () => ContentBlock> = {
    hero: () => ({
      id,
      type: "hero",
      label,
      data: { title: "Page Title", subtitle: "", image: "", ctaLabel: "", ctaHref: "" },
    }),
    text: () => ({
      id,
      type: "text",
      label,
      data: { title: "Section Title", content: "Enter your content here." },
    }),
    image: () => ({
      id,
      type: "image",
      label,
      data: { image: "", alt: "", caption: "" },
    }),
    "image-text": () => ({
      id,
      type: "image-text",
      label,
      data: {
        headline: "Headline",
        paragraphs: ["Paragraph text here."],
        description: "",
        image: "",
        imagePosition: "right",
        ctaLabel: "",
        ctaHref: "",
      },
    }),
    modules: () => ({
      id,
      type: "modules",
      label,
      data: { title: "Modules", items: [{ title: "Module 1", description: "Description" }] },
    }),
    faq: () => ({
      id,
      type: "faq",
      label,
      data: { title: "FAQs", items: [{ question: "Question?", answer: "Answer." }] },
    }),
    stats: () => ({
      id,
      type: "stats",
      label,
      data: { title: "Key Stats", items: [{ title: "Stat", value: "100", description: "Description" }] },
    }),
    cta: () => ({
      id,
      type: "cta",
      label,
      data: {
        title: "Ready to Start?",
        content: "Contact us today.",
        ctaLabel: "Get Started",
        ctaHref: "/contact",
        bgMode: "color",
        bgColor: "#0c2d6b",
        bgImage: "",
        overlayColor: "rgba(0,0,0,0.5)",
      },
    }),
    cards: () => ({
      id,
      type: "cards",
      label,
      data: { title: "Featured Items", items: [] },
    }),
    logos: () => ({
      id,
      type: "logos",
      label,
      data: { title: "Our Partners", items: [] },
    }),
    blog: () => ({
      id,
      type: "blog",
      label,
      data: { title: "Latest News", items: [] },
    }),
    "why-us": () => ({
      id,
      type: "why-us",
      label,
      data: { title: "Why Choose Us", items: [{ title: "Feature", description: "Description" }] },
    }),
    pricing: () => ({
      id,
      type: "pricing",
      label,
      data: { price: "£0", duration: "12 months" },
    }),
    qualification_hero: () => ({
      id,
      type: "qualification_hero",
      label,
      isLocked: true,
      isFixed: true,
      data: {},
    }),
    "about-split": () => ({
      id,
      type: "about-split",
      label,
      data: {
        headline: "Headline",
        paragraphs: ["Paragraph 1", "Paragraph 2"],
        ctaLabel: "About Us",
        ctaHref: "/about",
      },
    }),
    "popular-qualifications": () => ({
      id,
      type: "popular-qualifications",
      label,
      data: { title: "Popular Qualifications", items: [] },
    }),
    features: () => ({
      id,
      type: "features",
      label,
      data: { title: "Features", items: [{ title: "Feature", description: "Description" }] },
    }),
    "contact-form": () => ({
      id,
      type: "contact-form",
      label,
      data: {
        title: "Get in Touch",
        address: "13 Lanark Square, London E14 9QD",
        email: "info@primecollege.uk",
        phone: "+44 20 1234 5678",
        hours: "Mon - Fri: 9:00 AM - 5:00 PM",
        formFields: [
          { name: "name", label: "Full Name", type: "text", required: true },
          { name: "email", label: "Email Address", type: "email", required: true },
          { name: "subject", label: "Subject", type: "text", required: false },
          { name: "message", label: "Message", type: "textarea", required: true },
        ],
      },
    }),
    map: () => ({
      id,
      type: "map",
      label,
      data: {
        title: "Find Us",
        iframeUrl:
          "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2483.234!2d-0.0175!3d51.5075!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x487602d64e0e8b7f%3A0x1234567890abcdef!2s13%20Lanark%20Square%2C%20London%20E14%209QD!5e0!3m2!1sen!2suk!4v1700000000000",
      },
    }),
    qualification_slider: () => ({
      id,
      type: "qualification_slider",
      label,
      data: {
        selection_mode: "manual",
        qualification_ids: [],
        show_count: 4,
        autoplay: true,
        delay_ms: 5000,
        items: [],
      },
    }),
  };

  return defaults[type]();
};
