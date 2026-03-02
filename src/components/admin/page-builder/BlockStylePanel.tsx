import { useState, useRef } from "react";
import { ChevronDown, ChevronUp, Upload, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { BlockStyle } from "@/types/pageBuilder";

interface BlockStylePanelProps {
  style: BlockStyle;
  onChange: (style: BlockStyle) => void;
}

const BRAND_COLORS = [
  { label: "Primary", value: "#043868" },
  { label: "Secondary", value: "#eec21e" },
  { label: "White", value: "#ffffff" },
  { label: "Dark", value: "#1a1a1a" },
  { label: "Light Grey", value: "#f3f4f6" },
  { label: "Grey", value: "#6b7280" },
];

const SPACING_OPTIONS = [
  { label: "None", value: "0" },
  { label: "XS", value: "8" },
  { label: "SM", value: "16" },
  { label: "MD", value: "24" },
  { label: "LG", value: "40" },
  { label: "XL", value: "64" },
];

const BlockStylePanel = ({ style, onChange }: BlockStylePanelProps) => {
  const [open, setOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const update = (key: keyof BlockStyle, value: string) => {
    onChange({ ...style, [key]: value });
  };

  const clear = (key: keyof BlockStyle) => {
    const next = { ...style };
    delete next[key];
    onChange(next);
  };

  const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") update("bgImage", reader.result);
    };
    reader.readAsDataURL(file);
  };

  const hasStyles = style.textColor || style.bgColor || style.bgImage ||
    style.paddingTop || style.paddingBottom || style.marginTop || style.marginBottom;

  return (
    <div className="rounded-lg border border-border bg-muted/20 overflow-hidden">
      <button
        type="button"
        className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-muted/40 transition-colors"
        onClick={() => setOpen(!open)}
      >
        <span className="flex items-center gap-2">
          <Palette className="h-4 w-4" />
          Block Styling
          {hasStyles && <span className="w-2 h-2 rounded-full bg-primary" />}
        </span>
        {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-4 border-t border-border pt-3">
          {/* Text Color */}
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">Text Color</Label>
            <div className="flex gap-1.5 flex-wrap">
              {BRAND_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  className={`w-7 h-7 rounded-md border-2 transition-all hover:scale-110 ${style.textColor === c.value ? "border-primary ring-1 ring-primary" : "border-border"}`}
                  style={{ backgroundColor: c.value }}
                  onClick={() => update("textColor", c.value)}
                  title={c.label}
                />
              ))}
              <div className="relative w-7 h-7 rounded-md border-2 border-border overflow-hidden">
                <input
                  type="color"
                  value={style.textColor || "#000000"}
                  onChange={(e) => update("textColor", e.target.value)}
                  className="absolute inset-0 w-full h-full cursor-pointer opacity-0"
                />
                <span className="flex items-center justify-center w-full h-full text-[9px] font-bold text-muted-foreground">+</span>
              </div>
              {style.textColor && (
                <Button type="button" variant="ghost" size="sm" className="h-7 text-[10px] px-2" onClick={() => clear("textColor")}>
                  Reset
                </Button>
              )}
            </div>
          </div>

          {/* Background Color */}
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">Background Color</Label>
            <div className="flex gap-1.5 flex-wrap">
              {BRAND_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  className={`w-7 h-7 rounded-md border-2 transition-all hover:scale-110 ${style.bgColor === c.value ? "border-primary ring-1 ring-primary" : "border-border"}`}
                  style={{ backgroundColor: c.value }}
                  onClick={() => update("bgColor", c.value)}
                  title={c.label}
                />
              ))}
              <div className="relative w-7 h-7 rounded-md border-2 border-border overflow-hidden">
                <input
                  type="color"
                  value={style.bgColor || "#ffffff"}
                  onChange={(e) => update("bgColor", e.target.value)}
                  className="absolute inset-0 w-full h-full cursor-pointer opacity-0"
                />
                <span className="flex items-center justify-center w-full h-full text-[9px] font-bold text-muted-foreground">+</span>
              </div>
              {style.bgColor && (
                <Button type="button" variant="ghost" size="sm" className="h-7 text-[10px] px-2" onClick={() => clear("bgColor")}>
                  Reset
                </Button>
              )}
            </div>
          </div>

          {/* Background Image */}
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">Background Image</Label>
            {style.bgImage && (
              <div className="rounded-md border border-border overflow-hidden mb-2 max-h-20 relative">
                <img src={style.bgImage} alt="BG" className="w-full h-20 object-cover" />
                {style.bgOverlay && <div className="absolute inset-0" style={{ backgroundColor: style.bgOverlay }} />}
              </div>
            )}
            <div className="flex gap-2">
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleBgUpload} />
              <Button type="button" variant="outline" size="sm" className="flex-1 text-xs" onClick={() => fileRef.current?.click()}>
                <Upload className="h-3 w-3 mr-1.5" /> {style.bgImage ? "Change" : "Upload"}
              </Button>
              {style.bgImage && (
                <Button type="button" variant="ghost" size="sm" className="text-xs text-destructive" onClick={() => { clear("bgImage"); clear("bgOverlay"); }}>
                  Remove
                </Button>
              )}
            </div>
            {style.bgImage && (
              <div className="mt-2">
                <Label className="text-[10px] text-muted-foreground">Overlay</Label>
                <Input
                  value={style.bgOverlay || ""}
                  onChange={(e) => update("bgOverlay", e.target.value)}
                  placeholder="rgba(0,0,0,0.5)"
                  className="h-7 text-xs mt-0.5"
                />
              </div>
            )}
          </div>

          {/* Spacing */}
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">Spacing (px)</Label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-[10px] text-muted-foreground">Padding Top</Label>
                <select
                  value={style.paddingTop || ""}
                  onChange={(e) => e.target.value ? update("paddingTop", e.target.value) : clear("paddingTop")}
                  className="w-full h-7 text-xs rounded-md border border-input bg-background px-2"
                >
                  <option value="">Default</option>
                  {SPACING_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label} ({s.value}px)</option>)}
                </select>
              </div>
              <div>
                <Label className="text-[10px] text-muted-foreground">Padding Bottom</Label>
                <select
                  value={style.paddingBottom || ""}
                  onChange={(e) => e.target.value ? update("paddingBottom", e.target.value) : clear("paddingBottom")}
                  className="w-full h-7 text-xs rounded-md border border-input bg-background px-2"
                >
                  <option value="">Default</option>
                  {SPACING_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label} ({s.value}px)</option>)}
                </select>
              </div>
              <div>
                <Label className="text-[10px] text-muted-foreground">Padding Left</Label>
                <select
                  value={style.paddingLeft || ""}
                  onChange={(e) => e.target.value ? update("paddingLeft", e.target.value) : clear("paddingLeft")}
                  className="w-full h-7 text-xs rounded-md border border-input bg-background px-2"
                >
                  <option value="">Default</option>
                  {SPACING_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label} ({s.value}px)</option>)}
                </select>
              </div>
              <div>
                <Label className="text-[10px] text-muted-foreground">Padding Right</Label>
                <select
                  value={style.paddingRight || ""}
                  onChange={(e) => e.target.value ? update("paddingRight", e.target.value) : clear("paddingRight")}
                  className="w-full h-7 text-xs rounded-md border border-input bg-background px-2"
                >
                  <option value="">Default</option>
                  {SPACING_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label} ({s.value}px)</option>)}
                </select>
              </div>
              <div>
                <Label className="text-[10px] text-muted-foreground">Margin Top</Label>
                <select
                  value={style.marginTop || ""}
                  onChange={(e) => e.target.value ? update("marginTop", e.target.value) : clear("marginTop")}
                  className="w-full h-7 text-xs rounded-md border border-input bg-background px-2"
                >
                  <option value="">Default</option>
                  {SPACING_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label} ({s.value}px)</option>)}
                </select>
              </div>
              <div>
                <Label className="text-[10px] text-muted-foreground">Margin Bottom</Label>
                <select
                  value={style.marginBottom || ""}
                  onChange={(e) => e.target.value ? update("marginBottom", e.target.value) : clear("marginBottom")}
                  className="w-full h-7 text-xs rounded-md border border-input bg-background px-2"
                >
                  <option value="">Default</option>
                  {SPACING_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label} ({s.value}px)</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlockStylePanel;
