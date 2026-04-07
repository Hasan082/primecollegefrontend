import React from "react";
import type { ContentBlock } from "@/types/pageBuilder";

// Refactored Renderers
import { HeroRenderer, ImageRenderer, TextRenderer } from "./renderers/CommonRenderers";
import { ImageTextRenderer, WhyUsRenderer, CTARenderer, ContactFormRenderer, MapRenderer } from "./renderers/ComplexRenderers";
import { CardRenderer, StatsRenderer, FAQRenderer, LogoRenderer } from "./renderers/GridRenderers";

interface BlockPreviewRendererProps {
  blocks: ContentBlock[];
  pageTitle?: string;
}

const BlockPreviewRenderer = ({ blocks, pageTitle }: BlockPreviewRendererProps) => {
  return (
    <div className="flex flex-col">
      {blocks.map((block) => (
        <React.Fragment key={block.id}>
          {renderBlock(block)}
        </React.Fragment>
      ))}
    </div>
  );
};

const renderBlock = (block: ContentBlock) => {
  const d = block.data as any;

  switch (block.type) {
    case "hero":
    case "qualification_hero":
      return <HeroRenderer block={block} />;
    case "image":
      return <ImageRenderer block={block} />;
    case "text":
      return <TextRenderer block={block} />;
    case "image-text":
    case "about-split":
      return <ImageTextRenderer block={block} />;
    case "why-us":
      return <WhyUsRenderer block={block} />;
    case "cta":
      return <CTARenderer block={block} />;
    case "contact-form":
      return <ContactFormRenderer block={block} />;
    case "map":
      return <MapRenderer block={block} />;
    case "stats":
      return <StatsRenderer block={block} />;
    case "faq":
      return <FAQRenderer block={block} />;
    case "logos":
      return <LogoRenderer block={block} />;
    case "modules":
    case "features":
      return (
        <div className="py-6 px-4 bg-background">
          {d.title && <h3 className="text-[11px] font-bold text-foreground mb-1">{d.title as string}</h3>}
          <div className="space-y-1.5 mt-2">
            {Array.isArray(d.items) && d.items.slice(0, 3).map((item: any, i: number) => (
              <div key={i} className="flex gap-2">
                <span className="shrink-0 w-3 h-3 rounded-full bg-primary text-white flex items-center justify-center text-[6px] font-bold mt-0.5">{i + 1}</span>
                <p className="text-[9px] text-muted-foreground">{item.title}</p>
              </div>
            ))}
          </div>
        </div>
      );
    case "cards":
    case "blog":
    case "popular-qualifications":
      return <CardRenderer block={block} />;
    default:
      return (
        <div className="p-4 bg-muted/50 border border-dashed border-border flex items-center justify-center min-h-[50px]">
          <p className="text-[9px] text-muted-foreground">Block: {block.label}</p>
        </div>
      );
  }
};

export default BlockPreviewRenderer;
