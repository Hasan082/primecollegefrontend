import { Users, Award, CheckCircle } from "lucide-react";
import type { ContentBlock } from "@/types/pageBuilder";

interface BlockPreviewRendererProps {
  blocks: ContentBlock[];
  pageTitle: string;
}

const iconMap: Record<string, React.ElementType> = {
  Users,
  Award,
  CheckCircle,
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
              <div key={block.id} className="relative bg-primary text-primary-foreground p-8 min-h-[100px] flex items-center justify-center overflow-hidden">
                {d.image && typeof d.image === "string" && d.image.startsWith("data:") && (
                  <img src={d.image} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40" />
                )}
                <div className="relative z-10 text-center">
                  <h2 className="text-base font-bold leading-tight">{d.title as string}</h2>
                  {d.subtitle && <p className="text-[10px] opacity-80 mt-1">{d.subtitle as string}</p>}
                  {d.ctaLabel && (
                    <span className="inline-block mt-2 px-3 py-1 bg-secondary text-secondary-foreground rounded text-[8px] font-semibold">
                      {d.ctaLabel as string}
                    </span>
                  )}
                </div>
              </div>
            );

          case "text":
            return (
              <div key={block.id} className="py-6 px-5 text-center bg-background">
                {d.title && <h3 className="text-[11px] font-bold text-foreground mb-2">{d.title as string}</h3>}
                {d.content && typeof d.content === "string" && (
                  d.content.startsWith("<") ? (
                    <div className="text-[10px] text-muted-foreground leading-relaxed max-w-[90%] mx-auto prose prose-xs" dangerouslySetInnerHTML={{ __html: d.content }} />
                  ) : (
                    <p className="text-[10px] text-muted-foreground leading-relaxed max-w-[90%] mx-auto">{d.content}</p>
                  )
                )}
              </div>
            );

          case "image-text":
            return (
              <div key={block.id} className="bg-primary text-primary-foreground py-6 px-5">
                <div className={`flex gap-4 ${d.imagePosition === "left" ? "flex-row" : "flex-row-reverse"}`}>
                  <div className="flex-1">
                    <h3 className="text-[11px] font-bold leading-snug mb-2">{d.headline as string}</h3>
                    {d.ctaLabel && (
                      <span className="inline-block mt-1 px-2 py-0.5 bg-secondary text-secondary-foreground rounded text-[8px] font-semibold">
                        {d.ctaLabel as string}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    {Array.isArray(d.paragraphs) && (d.paragraphs as string[]).map((p, i) => (
                      typeof p === "string" && p.startsWith("<") ? (
                        <div key={i} className="text-[9px] opacity-80 leading-relaxed" dangerouslySetInnerHTML={{ __html: p }} />
                      ) : (
                        <p key={i} className="text-[9px] opacity-80 leading-relaxed">{p}</p>
                      )
                    ))}
                  </div>
                </div>
              </div>
            );

          case "why-us":
            return (
              <div key={block.id} className="bg-muted py-6 px-4">
                {d.title && <h3 className="text-[11px] font-bold text-center text-foreground mb-1">{d.title as string}</h3>}
                {d.content && (
                  <p className="text-[9px] text-muted-foreground text-center mb-3 max-w-[90%] mx-auto">{d.content as string}</p>
                )}
                <div className="flex gap-2 justify-center">
                  {Array.isArray(d.items) && (d.items as { title: string; description?: string; icon?: string }[]).map((item, i) => {
                    const Icon = iconMap[item.icon || ""] || Users;
                    return (
                      <div key={i} className="flex-1 text-center">
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center mx-auto mb-1">
                          <Icon className="w-4 h-4 text-primary-foreground" strokeWidth={1.5} />
                        </div>
                        <p className="text-[9px] font-semibold text-foreground">{item.title}</p>
                        {item.description && (
                          <p className="text-[8px] text-muted-foreground mt-0.5 leading-tight">{item.description}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );

          case "cards":
            return (
              <div key={block.id} className="py-6 px-4 bg-background">
                {d.title && <h3 className="text-[11px] font-bold text-center text-foreground mb-3">{d.title as string}</h3>}
                <div className="grid grid-cols-2 gap-2">
                  {Array.isArray(d.items) && (d.items as { title: string; category?: string; level?: string; price?: string }[]).slice(0, 4).map((item, i) => (
                    <div key={i} className="bg-card border border-border rounded-lg overflow-hidden">
                      <div className="h-10 bg-muted" />
                      <div className="p-1.5">
                        <div className="flex gap-1 mb-0.5">
                          {item.category && (
                            <span className="bg-secondary text-secondary-foreground text-[7px] font-bold px-1 py-0.5 rounded uppercase">
                              {item.category}
                            </span>
                          )}
                        </div>
                        <p className="text-[8px] font-semibold text-foreground leading-tight line-clamp-2">{item.title}</p>
                        {item.price && <p className="text-[9px] font-bold text-primary mt-0.5">{item.price}</p>}
                        <div className="mt-1 bg-primary text-primary-foreground text-center text-[7px] font-semibold py-0.5 rounded">
                          Enroll Now
                        </div>
                      </div>
                    </div>
                  ))}
                  {(!Array.isArray(d.items) || (d.items as unknown[]).length === 0) && (
                    <p className="text-[9px] text-muted-foreground col-span-2 italic text-center">No cards added</p>
                  )}
                </div>
              </div>
            );

          case "stats":
            return (
              <div key={block.id} className="bg-primary text-primary-foreground py-6 px-4">
                {d.title && <h3 className="text-[11px] font-bold text-center mb-1">{d.title as string}</h3>}
                {d.subtitle && <p className="text-[8px] text-center opacity-70 mb-3 max-w-[90%] mx-auto">{d.subtitle as string}</p>}
                <div className="flex gap-2 justify-center">
                  {Array.isArray(d.items) && (d.items as { value: string; title: string; description?: string }[]).map((item, i) => (
                    <div key={i} className="text-center flex-1">
                      <p className="text-lg font-bold">{item.value}</p>
                      <p className="text-[8px] font-semibold text-secondary">{item.title}</p>
                      {item.description && <p className="text-[7px] opacity-60 mt-0.5">{item.description}</p>}
                    </div>
                  ))}
                </div>
              </div>
            );

          case "logos":
            return (
              <div key={block.id} className="py-5 px-4 bg-background text-center">
                {d.title && <h3 className="text-[11px] font-bold text-foreground mb-2">{d.title as string}</h3>}
                <div className="flex gap-2 justify-center flex-wrap">
                  {Array.isArray(d.items) && (d.items as { title: string }[]).map((item, i) => (
                    <div key={i} className="bg-muted rounded-md px-2 py-1.5 text-[8px] font-medium text-muted-foreground border border-border">
                      {item.title}
                    </div>
                  ))}
                </div>
              </div>
            );

          case "cta": {
            const bgMode = d.bgMode as string;
            const style: React.CSSProperties = bgMode === "image" && d.bgImage
              ? { backgroundImage: `url(${d.bgImage})`, backgroundSize: "cover", backgroundPosition: "center" }
              : {};
            const usesImage = bgMode === "image" && d.bgImage;
            return (
              <div key={block.id} className={`relative py-8 px-5 text-center ${usesImage ? '' : 'bg-primary text-primary-foreground'}`} style={style}>
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
              <div key={block.id} className="py-5 px-4 bg-background">
                {d.title && <h3 className="text-[11px] font-bold text-foreground mb-2">{d.title as string}</h3>}
                {Array.isArray(d.items) && (d.items as { question: string }[]).slice(0, 4).map((item, i) => (
                  <div key={i} className="border border-border rounded-md px-2.5 py-1.5 mt-1.5 text-[9px] font-medium text-foreground bg-muted/50">
                    {item.question}
                  </div>
                ))}
              </div>
            );

          case "modules":
            return (
              <div key={block.id} className="py-5 px-4 bg-background">
                {d.title && <h3 className="text-[11px] font-bold text-foreground mb-2">{d.title as string}</h3>}
                {Array.isArray(d.items) && (d.items as { title: string }[]).slice(0, 4).map((item, i) => (
                  <div key={i} className="flex items-center gap-2 mt-1.5">
                    <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[8px] flex items-center justify-center shrink-0 font-bold">
                      {i + 1}
                    </span>
                    <span className="text-[9px] text-foreground">{item.title}</span>
                  </div>
                ))}
              </div>
            );

          case "blog":
            return (
              <div key={block.id} className="py-5 px-4 bg-background">
                {d.title && <h3 className="text-[11px] font-bold text-foreground mb-2 text-center">{d.title as string}</h3>}
                <div className="grid grid-cols-3 gap-1.5">
                  {Array.isArray(d.items) && (d.items as { title: string; category?: string }[]).slice(0, 3).map((item, i) => (
                    <div key={i} className="bg-card border border-border rounded-md overflow-hidden">
                      <div className="h-8 bg-muted" />
                      <div className="p-1.5">
                        {item.category && (
                          <span className="bg-secondary text-secondary-foreground text-[6px] font-bold px-1 py-0.5 rounded uppercase">
                            {item.category}
                          </span>
                        )}
                        <p className="text-[7px] font-semibold text-foreground mt-0.5 line-clamp-2">{item.title}</p>
                        <span className="text-[7px] font-semibold text-primary">Read More →</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );

          case "pricing":
            return (
              <div key={block.id} className="py-5 px-4 bg-muted text-center">
                <p className="text-base font-bold text-primary">{d.price as string}</p>
                {d.duration && <p className="text-[9px] text-muted-foreground mt-0.5">{d.duration as string}</p>}
              </div>
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
