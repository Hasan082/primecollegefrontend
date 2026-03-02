import type { ContentBlock } from "@/types/pageBuilder";

interface BlockPreviewRendererProps {
  blocks: ContentBlock[];
  pageTitle: string;
}

const BlockPreviewRenderer = ({ blocks, pageTitle }: BlockPreviewRendererProps) => {
  if (blocks.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
        Add blocks to see a live preview
      </div>
    );
  }

  return (
    <div className="space-y-0 text-xs overflow-y-auto max-h-full">
      {blocks.map((block) => {
        const d = block.data as Record<string, unknown>;
        switch (block.type) {
          case "hero":
            return (
              <div key={block.id} className="relative bg-primary text-primary-foreground p-6 min-h-[80px]">
                {d.image && typeof d.image === "string" && d.image.startsWith("data:") && (
                  <img src={d.image} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" />
                )}
                <div className="relative z-10">
                  <h2 className="text-sm font-bold">{d.title as string}</h2>
                  {d.subtitle && <p className="text-[10px] opacity-80 mt-0.5">{d.subtitle as string}</p>}
                </div>
              </div>
            );
          case "text":
            return (
              <div key={block.id} className="p-4 border-b border-border">
                {d.title && <h3 className="text-[11px] font-semibold mb-1">{d.title as string}</h3>}
                <p className="text-[10px] text-muted-foreground line-clamp-3">{d.content as string}</p>
              </div>
            );
          case "image-text":
            return (
              <div key={block.id} className={`p-4 border-b border-border flex gap-3 ${d.imagePosition === "left" ? "flex-row" : "flex-row-reverse"}`}>
                <div className="w-1/3 bg-muted rounded flex items-center justify-center text-[9px] text-muted-foreground min-h-[40px]">
                  {d.image && typeof d.image === "string" && d.image.startsWith("data:")
                    ? <img src={d.image} alt="" className="w-full h-full object-cover rounded" />
                    : "IMG"
                  }
                </div>
                <div className="flex-1">
                  <h3 className="text-[11px] font-semibold mb-1">{d.headline as string}</h3>
                  {Array.isArray(d.paragraphs) && (
                    <p className="text-[10px] text-muted-foreground line-clamp-2">{(d.paragraphs as string[])[0]}</p>
                  )}
                </div>
              </div>
            );
          case "stats":
            return (
              <div key={block.id} className="p-4 border-b border-border">
                {d.title && <h3 className="text-[11px] font-semibold mb-2 text-center">{d.title as string}</h3>}
                <div className="flex gap-2 justify-center">
                  {Array.isArray(d.items) && (d.items as { value: string; title: string }[]).slice(0, 3).map((item, i) => (
                    <div key={i} className="text-center bg-muted rounded p-2 flex-1">
                      <p className="text-[11px] font-bold text-primary">{item.value}</p>
                      <p className="text-[9px] text-muted-foreground">{item.title}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          case "cta": {
            const bgMode = d.bgMode as string;
            const style: React.CSSProperties = bgMode === "image" && d.bgImage
              ? { backgroundImage: `url(${d.bgImage})`, backgroundSize: "cover", backgroundPosition: "center" }
              : { backgroundColor: (d.bgColor as string) || "#0c2d6b" };
            return (
              <div key={block.id} className="relative p-6 text-center text-white" style={style}>
                {bgMode === "image" && d.bgImage && (
                  <div className="absolute inset-0" style={{ backgroundColor: (d.overlayColor as string) || "rgba(0,0,0,0.5)" }} />
                )}
                <div className="relative z-10">
                  <h3 className="text-[11px] font-bold">{d.title as string}</h3>
                  {d.content && <p className="text-[10px] opacity-80 mt-0.5">{d.content as string}</p>}
                  {d.ctaLabel && (
                    <span className="inline-block mt-2 px-3 py-1 bg-white/20 rounded text-[9px] font-medium">
                      {d.ctaLabel as string}
                    </span>
                  )}
                </div>
              </div>
            );
          }
          case "cards":
            return (
              <div key={block.id} className="p-4 border-b border-border">
                {d.title && <h3 className="text-[11px] font-semibold mb-2">{d.title as string}</h3>}
                <div className="grid grid-cols-2 gap-1.5">
                  {Array.isArray(d.items) && (d.items as { title: string }[]).slice(0, 4).map((item, i) => (
                    <div key={i} className="bg-muted rounded p-2">
                      <p className="text-[9px] font-medium truncate">{item.title}</p>
                    </div>
                  ))}
                  {(!Array.isArray(d.items) || (d.items as unknown[]).length === 0) && (
                    <p className="text-[9px] text-muted-foreground col-span-2 italic">No cards</p>
                  )}
                </div>
              </div>
            );
          case "faq":
            return (
              <div key={block.id} className="p-4 border-b border-border">
                {d.title && <h3 className="text-[11px] font-semibold mb-1">{d.title as string}</h3>}
                {Array.isArray(d.items) && (d.items as { question: string }[]).slice(0, 3).map((item, i) => (
                  <div key={i} className="border border-border rounded px-2 py-1 mt-1 text-[9px]">{item.question}</div>
                ))}
              </div>
            );
          case "modules":
            return (
              <div key={block.id} className="p-4 border-b border-border">
                {d.title && <h3 className="text-[11px] font-semibold mb-1">{d.title as string}</h3>}
                {Array.isArray(d.items) && (d.items as { title: string }[]).slice(0, 3).map((item, i) => (
                  <div key={i} className="flex items-center gap-1.5 mt-1">
                    <span className="w-4 h-4 rounded-full bg-primary text-primary-foreground text-[8px] flex items-center justify-center shrink-0">{i + 1}</span>
                    <span className="text-[9px] truncate">{item.title}</span>
                  </div>
                ))}
              </div>
            );
          case "logos":
            return (
              <div key={block.id} className="p-4 border-b border-border text-center">
                {d.title && <h3 className="text-[11px] font-semibold mb-1">{d.title as string}</h3>}
                <div className="flex gap-2 justify-center">
                  {Array.isArray(d.items) && (d.items as { title: string }[]).slice(0, 4).map((item, i) => (
                    <div key={i} className="bg-muted rounded p-1.5 text-[8px] text-muted-foreground">{item.title}</div>
                  ))}
                </div>
              </div>
            );
          case "why-us":
            return (
              <div key={block.id} className="p-4 border-b border-border">
                {d.title && <h3 className="text-[11px] font-semibold mb-1">{d.title as string}</h3>}
                <div className="grid grid-cols-3 gap-1">
                  {Array.isArray(d.items) && (d.items as { title: string }[]).slice(0, 3).map((item, i) => (
                    <div key={i} className="bg-muted rounded p-1.5 text-center text-[8px]">{item.title}</div>
                  ))}
                </div>
              </div>
            );
          case "pricing":
            return (
              <div key={block.id} className="p-4 border-b border-border text-center">
                <p className="text-sm font-bold text-primary">{d.price as string}</p>
                {d.duration && <p className="text-[9px] text-muted-foreground">{d.duration as string}</p>}
              </div>
            );
          default:
            return (
              <div key={block.id} className="p-3 border-b border-border text-[10px] text-muted-foreground italic">
                {block.label}
              </div>
            );
        }
      })}
    </div>
  );
};

export default BlockPreviewRenderer;
