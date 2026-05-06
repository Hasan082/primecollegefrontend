import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageIcon, X, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Image } from "@/components/Image";

interface FooterLogoSettingsProps {
  logo: any; // Accept string, File, or structured object
  altText: string;
  onUpdate: (field: string, value: string | File | null) => void;
}

const FooterLogoSettings = ({ logo, altText, onUpdate }: FooterLogoSettingsProps) => {
  const [preview, setPreview] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!logo) {
      setPreview(null);
      return;
    }

    if (logo instanceof File) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(logo);
    } else {
      // It's a string or a structured object
      setPreview(logo);
    }
  }, [logo]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpdate("footer_logo", file);
    }
  };

  const removeLogo = () => {
    onUpdate("footer_logo", null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Card className="border-none shadow-md bg-card/50 backdrop-blur-sm overflow-hidden">
      <CardHeader className="pb-3 border-b border-border/50 bg-muted/10">
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shadow-inner">
            <ImageIcon className="h-4 w-4" />
          </div>
          Footer Logo
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="grid gap-4">
          <Label className="text-sm font-semibold text-foreground/70">Logo Image</Label>
          
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-10 bg-muted/20 relative group transition-all duration-300 hover:bg-muted/30 hover:border-primary/50 cursor-pointer overflow-hidden"
          >
            {preview ? (
              <div className="relative group/preview animate-in fade-in zoom-in-95 duration-300">
                <div className="bg-white p-4 rounded-xl shadow-inner border border-border/50">
                  <Image
                    image={preview}
                    alt="Footer Logo preview"
                    className="max-h-32 w-auto object-contain rounded-lg"
                  />
                </div>
                <Button
                  variant="destructive"
                  size="icon"
                  className="h-8 w-8 absolute -top-3 -right-3 rounded-full shadow-xl opacity-0 group-hover/preview:opacity-100 transition-all duration-200 scale-90 group-hover/preview:scale-100"
                  onClick={(e) => { e.stopPropagation(); removeLogo(); }}
                  type="button"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner transition-transform group-hover:scale-110 duration-300">
                  <Upload className="h-8 w-8" />
                </div>
                <div className="space-y-1">
                  <p className="text-base font-bold text-foreground">Click to upload logo</p>
                  <p className="text-xs text-muted-foreground font-medium">SVG, PNG, JPG (max. 2MB)</p>
                </div>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
         
        </div>

        <div className="grid gap-2">
          <Label htmlFor="footer_logo_alt_text" className="text-sm font-bold text-foreground/70">Accessibility Alt Text</Label>
          <Input
            id="footer_logo_alt_text"
            placeholder="e.g. Prime College Footer Logo"
            value={altText}
            onChange={(e) => onUpdate("footer_logo_alt_text", e.target.value)}
            className="bg-background/50 h-11 border-border/50 focus:border-primary/50 transition-all"
          />
          <p className="text-[10px] text-muted-foreground italic px-1">
            Describes the logo for screen readers and search engines.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default FooterLogoSettings;
