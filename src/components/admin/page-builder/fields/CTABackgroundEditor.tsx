import { useRef } from "react";
import { Palette, Upload } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Image } from "@/components/Image";

interface CTABackgroundEditorProps {
  local: Record<string, unknown>;
  update: (key: string, value: unknown) => void;
  onImageUpload: (file: File, key: string) => void;
  isUploading: boolean;
}

const CTABackgroundEditor = ({
  local,
  update,
  onImageUpload,
  isUploading,
}: CTABackgroundEditorProps) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const bgMode = (local.bgMode as string) || "color";
  const bgColor = (local.bgColor as string) || "#0c2d6b";
  const bgImage = local.bgImage;
  const overlayColor = (local.overlayColor as string) || "rgba(0,0,0,0.5)";

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onImageUpload(file, "bgImage");
  };

  return (
    <div className="space-y-3 rounded-lg border border-border p-4 bg-muted/20">
      <Label className="flex items-center gap-2 text-sm font-semibold">
        <Palette className="h-4 w-4" /> Background Style
      </Label>
      <div className="flex gap-2">
        <Button
          type="button"
          variant={bgMode === "transparent" ? "default" : "outline"}
          size="sm"
          className="flex-1"
          onClick={() => update("bgMode", "transparent")}
        >
          Transparent
        </Button>
        <Button
          type="button"
          variant={bgMode === "color" ? "default" : "outline"}
          size="sm"
          className="flex-1"
          onClick={() => update("bgMode", "color")}
        >
          Solid Color
        </Button>
        <Button
          type="button"
          variant={bgMode === "image" ? "default" : "outline"}
          size="sm"
          className="flex-1"
          onClick={() => update("bgMode", "image")}
        >
          Background Image
        </Button>
      </div>

      {bgMode === "color" && (
        <div>
          <Label className="text-xs text-muted-foreground">Background Color</Label>
          <div className="flex items-center gap-2 mt-1">
            <input
              type="color"
              value={bgColor}
              onChange={(e) => update("bgColor", e.target.value)}
              className="w-10 h-9 rounded border border-border cursor-pointer"
            />
            <Input
              value={bgColor}
              onChange={(e) => update("bgColor", e.target.value)}
              className="flex-1 h-9 font-mono text-sm"
              placeholder="#0c2d6b"
            />
          </div>
        </div>
      )}

      {bgMode === "image" && (
        <div className="space-y-3">
          {bgImage && (
            <div className="rounded-lg border border-border overflow-hidden bg-muted/30 max-h-32 flex items-center justify-center relative">
              {typeof bgImage === "string" ? (
                <img src={bgImage} alt="BG Preview" className="max-h-32 w-full object-cover" />
              ) : (
                <Image image={bgImage} className="max-h-32 w-full object-cover" />
              )}
              <div className="absolute inset-0" style={{ backgroundColor: overlayColor }} />
              <span className="absolute text-white text-xs font-medium z-10">Preview with overlay</span>
            </div>
          )}
          <div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleUpload}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => fileRef.current?.click()}
              disabled={isUploading}
            >
              <Upload className="h-3.5 w-3.5 mr-1.5" />
              {isUploading ? "Uploading..." : bgImage ? "Change Image" : "Upload Background Image"}
            </Button>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Overlay Color</Label>
            <div className="flex items-center gap-2 mt-1">
              <input
                type="color"
                value={overlayColor.startsWith("rgba") ? "#000000" : overlayColor}
                onChange={(e) => {
                  const hex = e.target.value;
                  const r = parseInt(hex.slice(1, 3), 16);
                  const g = parseInt(hex.slice(3, 5), 16);
                  const b = parseInt(hex.slice(5, 7), 16);
                  update("overlayColor", `rgba(${r},${g},${b},0.5)`);
                }}
                className="w-10 h-9 rounded border border-border cursor-pointer"
              />
              <Input
                value={overlayColor}
                onChange={(e) => update("overlayColor", e.target.value)}
                className="flex-1 h-9 font-mono text-sm"
                placeholder="rgba(0,0,0,0.5)"
              />
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">Use rgba format to control opacity, e.g. rgba(0,0,0,0.5)</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CTABackgroundEditor;
