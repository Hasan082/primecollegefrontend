import {
  Users, Award, CheckCircle, Shield, BookOpen, Target, Heart,
  Star, Lightbulb, TrendingUp, Globe, Zap, Clock, ThumbsUp,
  Layers, Briefcase, Smile, GraduationCap, Building, Rocket, Megaphone,
} from "lucide-react";
import type { ContentBlock, BlockStyle, TextAlignment } from "@/types/pageBuilder";
import React from "react";

interface BlockPreviewRendererProps {
  blocks: ContentBlock[];
  pageTitle: string;
}

const iconMap: Record<string, React.ElementType> = {
  Users, Award, CheckCircle, Shield, BookOpen, Target, Heart,
  Star, Lightbulb, TrendingUp, Globe, Zap, Clock, ThumbsUp,
  Layers, Briefcase, Smile, GraduationCap, Building, Rocket, Megaphone,
};

/** Build inline style from BlockStyle */
const buildBlockStyle = (style?: BlockStyle): React.CSSProperties => {
  if (!style) return {};
  const s: React.CSSProperties = {};
  if (style.textColor) s.color = style.textColor;
  if (style.bgColor) s.backgroundColor = style.bgColor;
  if (style.bgImage) {
    s.backgroundImage = `url(${style.bgImage})`;
    s.backgroundSize = "cover";
    s.backgroundPosition = "center";
  }
  if (style.paddingTop) s.paddingTop = `${style.paddingTop}px`;
  if (style.paddingBottom) s.paddingBottom = `${style.paddingBottom}px`;
  if (style.paddingLeft) s.paddingLeft = `${style.paddingLeft}px`;
  if (style.paddingRight) s.paddingRight = `${style.paddingRight}px`;
  if (style.marginTop) s.marginTop = `${style.marginTop}px`;
  if (style.marginBottom) s.marginBottom = `${style.marginBottom}px`;
  return s;
};

const alignClass = (a?: TextAlignment) =>
  a === "left" ? "text-left" : a === "right" ? "text-right" : "text-center";

/** Wrapper that applies style + overlay */
const StyledWrapper = ({
  block,
  defaultClass,
  children,
}: {
  block: ContentBlock;
  defaultClass: string;
  children: React.ReactNode;
}) => {
  const style = buildBlockStyle(block.style);
  const hasBgImage = block.style?.bgImage;

  return (
    <div key={block.id} className={`relative ${defaultClass}`} style={style}>
      {hasBgImage && block.style?.bgOverlay && (
        <div className="absolute inset-0" style={{ backgroundColor: block.style.bgOverlay }} />
      )}
      <div className={`relative z-10 ${alignClass(block.alignment)}`}>{children}</div>
    </div>
  );
};

const BlockPreviewRenderer = ({ blocks, pageTitle }: BlockPreviewRendererProps) => {
  if (blocks.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
        Add blocks to see a live preview
      </div>
    );
  }

  return (
    <div className="text-xs overflow-y-auto max-h-full">
      {blocks.map((block) => {
        const d = block.data as Record<string, unknown>;
        switch (block.type) {
          case "hero":
            return (
              <StyledWrapper key={block.id} block={block} defaultClass="bg-primary text-primary-foreground p-8 min-h-[100px] flex items-center justify-center overflow-hidden">
                {d.image && typeof d.image === "string" && d.image.startsWith("data:") && (
                  <img src={d.image} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40" />
                )}
                <div className="relative z-10">
                  <h2 className="text-base font-bold leading-tight">{d.title as string}</h2>
                  {d.subtitle && <p className="text-[10px] opacity-80 mt-1">{d.subtitle as string}</p>}
                  {d.ctaLabel && (
                    <span className="inline-block mt-2 px-3 py-1 bg-secondary text-secondary-foreground rounded text-[8px] font-semibold">
                      {d.ctaLabel as string}
                    </span>
                  )}
                </div>
              </StyledWrapper>
            );

          case "text": {
            // Text block uses its own data.alignment for backward compat
            const textAlign = (d.alignment as string) || block.alignment || "center";
            const tAlignClass = textAlign === "left" ? "text-left" : textAlign === "right" ? "text-right" : "text-center";
            const inlineStyle = buildBlockStyle(block.style);
            return (
              <div key={block.id} className={`py-6 px-5 bg-background ${tAlignClass}`} style={inlineStyle}>
                {d.title && <h3 className="text-[11px] font-bold text-foreground mb-2">{d.title as string}</h3>}
                {d.content && typeof d.content === "string" && (
                  d.content.startsWith("<") ? (
                    <div className={`text-[10px] text-muted-foreground leading-relaxed max-w-[90%] ${textAlign === "center" ? "mx-auto" : ""} prose prose-xs [&_table]:w-full [&_table]:border-collapse [&_table]:mx-auto [&_table_td]:border [&_table_td]:border-border [&_table_td]:p-1 [&_table_td]:text-[9px] [&_table_th]:border [&_table_th]:border-border [&_table_th]:p-1 [&_table_th]:text-[9px] [&_table_th]:bg-muted [&_table_th]:font-semibold overflow-x-auto`} dangerouslySetInnerHTML={{ __html: d.content }} />
                  ) : (
                    <p className={`text-[10px] text-muted-foreground leading-relaxed max-w-[90%] ${textAlign === "center" ? "mx-auto" : ""}`}>{d.content}</p>
                  )
                )}
              </div>
            );
          }

          case "image-text": {
            const hasImg = d.image && typeof d.image === "string" && (d.image as string).length > 0;
            const imgIsData = hasImg && ((d.image as string).startsWith("data:") || (d.image as string).startsWith("http"));
            return (
              <StyledWrapper key={block.id} block={block} defaultClass="bg-primary text-primary-foreground py-6 px-5">
                <div className={`flex gap-4 ${d.imagePosition === "left" ? "flex-row" : "flex-row-reverse"}`}>
                  {hasImg && (
                    <div className="flex-1 rounded overflow-hidden">
                      {imgIsData ? (
                        <img src={d.image as string} alt="" className="w-full h-20 object-cover rounded" />
                      ) : (
                        <div className="w-full h-20 bg-primary-foreground/10 rounded flex items-center justify-center text-[8px] opacity-60">
                          📷 {d.image as string}
                        </div>
                      )}
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="text-[11px] font-bold leading-snug mb-1">{d.headline as string}</h3>
                    {Array.isArray(d.paragraphs) && (d.paragraphs as string[]).map((p, i) => (
                      typeof p === "string" && p.startsWith("<") ? (
                        <div key={i} className="text-[9px] opacity-80 leading-relaxed" dangerouslySetInnerHTML={{ __html: p }} />
                      ) : (
                        <p key={i} className="text-[9px] opacity-80 leading-relaxed">{p}</p>
                      )
                    ))}
                    {d.ctaLabel && (
                      <span className="inline-block mt-1 px-2 py-0.5 bg-secondary text-secondary-foreground rounded text-[8px] font-semibold">
                        {d.ctaLabel as string}
                      </span>
                    )}
                  </div>
                </div>
              </StyledWrapper>
            );
          }

          case "why-us":
            return (
              <StyledWrapper key={block.id} block={block} defaultClass="bg-muted py-6 px-4">
                {d.title && <h3 className="text-[11px] font-bold text-foreground mb-1">{d.title as string}</h3>}
                {d.content && (
                  <p className="text-[9px] text-muted-foreground mb-3 max-w-[90%] mx-auto">{d.content as string}</p>
                )}
                <div className="flex gap-2 justify-center">
                  {Array.isArray(d.items) && (d.items as { title: string; description?: string; icon?: string; image?: string; mediaType?: string; imageSize?: string }[]).map((item, i) => {
                    const useImage = item.mediaType === "image" && item.image;
                    const Icon = iconMap[item.icon || ""] || Users;
                    return (
                      <div key={i} className="flex-1 text-center">
                        {useImage && item.imageSize === "full" ? (
                          <div className="w-full h-12 overflow-hidden mx-auto mb-1 rounded border border-border">
                            <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                          </div>
                        ) : useImage ? (
                          <div className="w-10 h-10 rounded-full overflow-hidden mx-auto mb-1 border border-border">
                            <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center mx-auto mb-1">
                            <Icon className="w-4 h-4 text-primary-foreground" strokeWidth={1.5} />
                          </div>
                        )}
                        <p className="text-[9px] font-semibold text-foreground">{item.title}</p>
                        {item.description && (
                          <p className="text-[8px] text-muted-foreground mt-0.5 leading-tight">{item.description}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </StyledWrapper>
            );

          case "cards":
            return (
              <StyledWrapper key={block.id} block={block} defaultClass="py-6 px-4 bg-background">
                {d.title && <h3 className="text-[11px] font-bold text-foreground mb-3">{d.title as string}</h3>}
                <div className="grid grid-cols-2 gap-2">
                  {Array.isArray(d.items) && (d.items as { title: string; category?: string; level?: string; price?: string; image?: string; mediaType?: string; icon?: string; imageSize?: string }[]).slice(0, 4).map((item, i) => {
                    const useImage = item.mediaType === "image" && item.image;
                    const isIconSize = item.imageSize !== "full";
                    const Icon = iconMap[item.icon || ""] || null;
                    return (
                      <div key={i} className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                        {useImage && !isIconSize ? (
                          <div className="relative">
                            <img src={item.image} alt={item.title} className="w-full h-16 object-cover" />
                          </div>
                        ) : useImage && isIconSize ? (
                          <div className="h-10 bg-muted flex items-center justify-center">
                            <img src={item.image} alt={item.title} className="h-7 w-7 rounded-full object-cover border border-border" />
                          </div>
                        ) : Icon ? (
                          <div className="h-10 bg-muted flex items-center justify-center">
                            <Icon className="w-5 h-5 text-primary" strokeWidth={1.5} />
                          </div>
                        ) : (
                          <div className="h-10 bg-muted" />
                        )}
                        <div className="p-2">
                          {/* Show category inline if no full-width image or icon size */}
                          {item.category && (!useImage || isIconSize) && (
                            <span className="bg-secondary text-secondary-foreground text-[6px] font-bold px-1 py-0.5 rounded uppercase">
                              {item.category}
                            </span>
                          )}
                          <p className="text-[8px] font-bold text-foreground leading-tight line-clamp-2 mt-0.5">{item.title}</p>
                          {item.price && <p className="text-[9px] font-bold text-primary mt-0.5">{item.price}</p>}
                          <div className="mt-1.5 bg-primary text-primary-foreground text-center text-[7px] font-semibold py-0.5 rounded">
                            Enroll Now
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {(!Array.isArray(d.items) || (d.items as unknown[]).length === 0) && (
                    <p className="text-[9px] text-muted-foreground col-span-2 italic text-center">No cards added</p>
                  )}
                </div>
              </StyledWrapper>
            );

          case "stats":
            return (
              <StyledWrapper key={block.id} block={block} defaultClass="bg-primary text-primary-foreground py-6 px-4">
                {d.title && <h3 className="text-[11px] font-bold mb-1">{d.title as string}</h3>}
                {d.subtitle && <p className="text-[8px] opacity-70 mb-3 max-w-[90%] mx-auto">{d.subtitle as string}</p>}
                <div className="flex gap-2 justify-center">
                  {Array.isArray(d.items) && (d.items as { value: string; title: string; description?: string }[]).map((item, i) => (
                    <div key={i} className="text-center flex-1">
                      <p className="text-lg font-bold">{item.value}</p>
                      <p className="text-[8px] font-semibold text-secondary">{item.title}</p>
                      {item.description && <p className="text-[7px] opacity-60 mt-0.5">{item.description}</p>}
                    </div>
                  ))}
                </div>
              </StyledWrapper>
            );

          case "logos":
            return (
              <StyledWrapper key={block.id} block={block} defaultClass="py-5 px-4 bg-background">
                {d.title && <h3 className="text-[11px] font-bold text-foreground mb-2">{d.title as string}</h3>}
                <div className="flex gap-2 justify-center flex-wrap">
                  {Array.isArray(d.items) && (d.items as { title: string; image?: string; mediaType?: string }[]).map((item, i) => (
                    <div key={i} className="bg-muted rounded-md px-2 py-1.5 text-[8px] font-medium text-muted-foreground border border-border flex items-center gap-1.5">
                      {item.mediaType === "image" && item.image ? (
                        <img src={item.image} alt={item.title} className="h-5 w-auto object-contain" />
                      ) : (
                        <span>{item.title}</span>
                      )}
                    </div>
                  ))}
                </div>
              </StyledWrapper>
            );

          case "cta": {
            const bgMode = d.bgMode as string;
            const ctaStyle: React.CSSProperties = bgMode === "image" && d.bgImage
              ? { backgroundImage: `url(${d.bgImage})`, backgroundSize: "cover", backgroundPosition: "center" }
              : {};
            const usesImage = bgMode === "image" && d.bgImage;
            // Merge block-level style
            const mergedStyle = { ...ctaStyle, ...buildBlockStyle(block.style) };
            return (
              <div key={block.id} className={`relative py-8 px-5 ${usesImage ? '' : 'bg-primary text-primary-foreground'} ${alignClass(block.alignment)}`} style={mergedStyle}>
                {usesImage && (
                  <div className="absolute inset-0" style={{ backgroundColor: (d.overlayColor as string) || "rgba(0,0,0,0.5)" }} />
                )}
                <div className={`relative z-10 ${usesImage ? 'text-white' : ''}`}>
                  <h3 className="text-[12px] font-bold">{d.title as string}</h3>
                  {d.content && <p className="text-[9px] opacity-80 mt-1 max-w-[85%] mx-auto leading-relaxed">{d.content as string}</p>}
                  {d.ctaLabel && (
                    <span className="inline-block mt-2 px-3 py-1 bg-secondary text-secondary-foreground rounded text-[8px] font-semibold">
                      {d.ctaLabel as string}
                    </span>
                  )}
                </div>
              </div>
            );
          }

          case "faq":
            return (
              <StyledWrapper key={block.id} block={block} defaultClass="py-5 px-4 bg-background">
                {d.title && <h3 className="text-[11px] font-bold text-foreground mb-2">{d.title as string}</h3>}
                {Array.isArray(d.items) && (d.items as { question: string }[]).slice(0, 4).map((item, i) => (
                  <div key={i} className="border border-border rounded-md px-2.5 py-1.5 mt-1.5 text-[9px] font-medium text-foreground bg-muted/50">
                    {item.question}
                  </div>
                ))}
              </StyledWrapper>
            );

          case "modules":
            return (
              <StyledWrapper key={block.id} block={block} defaultClass="py-5 px-4 bg-background">
                {d.title && <h3 className="text-[11px] font-bold text-foreground mb-2">{d.title as string}</h3>}
                {Array.isArray(d.items) && (d.items as { title: string }[]).slice(0, 4).map((item, i) => (
                  <div key={i} className="flex items-center gap-2 mt-1.5">
                    <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[8px] flex items-center justify-center shrink-0 font-bold">
                      {i + 1}
                    </span>
                    <span className="text-[9px] text-foreground">{item.title}</span>
                  </div>
                ))}
              </StyledWrapper>
            );

          case "blog":
            return (
              <StyledWrapper key={block.id} block={block} defaultClass="py-5 px-4 bg-background">
                {d.title && <h3 className="text-[11px] font-bold text-foreground mb-2">{d.title as string}</h3>}
                <div className="grid grid-cols-3 gap-1.5">
                  {Array.isArray(d.items) && (d.items as { title: string; description?: string; category?: string; image?: string; mediaType?: string; imageSize?: string }[]).slice(0, 3).map((item, i) => {
                    const hasFullImage = item.mediaType === "image" && item.image && item.imageSize === "full";
                    const hasIconImage = item.mediaType === "image" && item.image && item.imageSize !== "full";
                    return (
                      <div key={i} className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                        {hasFullImage ? (
                          <div className="relative">
                            <img src={item.image} alt={item.title} className="w-full h-12 object-cover" />
                            {item.category && (
                              <span className="absolute top-1 left-1 bg-primary text-primary-foreground text-[5px] font-bold px-1 py-0.5 rounded">
                                {item.category}
                              </span>
                            )}
                          </div>
                        ) : hasIconImage ? (
                          <div className="h-8 bg-muted flex items-center justify-center">
                            <img src={item.image} alt={item.title} className="h-5 w-5 rounded-full object-cover border border-border" />
                          </div>
                        ) : (
                          <div className="h-8 bg-muted" />
                        )}
                        <div className="p-1.5">
                          <p className="text-[7px] font-bold text-foreground mt-0.5 line-clamp-2">{item.title}</p>
                          {item.description && (
                            <p className="text-[6px] text-muted-foreground mt-0.5 line-clamp-2 leading-tight">{item.description}</p>
                          )}
                          <span className="text-[6px] font-semibold text-primary mt-0.5 inline-block">Read More →</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </StyledWrapper>
            );

          case "pricing":
            return (
              <StyledWrapper key={block.id} block={block} defaultClass="py-5 px-4 bg-muted">
                <p className="text-base font-bold text-primary">{d.price as string}</p>
                {d.duration && <p className="text-[9px] text-muted-foreground mt-0.5">{d.duration as string}</p>}
              </StyledWrapper>
            );

          default: {
            const unknownBlock = block as ContentBlock;
            return (
              <div key={unknownBlock.id} className="p-4 text-[10px] text-muted-foreground italic bg-muted/30">
                {unknownBlock.label}
              </div>
            );
          }
        }
      })}
    </div>
  );
};

export default BlockPreviewRenderer;
