import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FooterLogoSettingsProps {
  logo: string | File | null;
  altText: string;
  onUpdate: (field: string, value: string | File | null) => void;
}

const FooterLogoSettings = ({ logo, altText, onUpdate }: FooterLogoSettingsProps) => {
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (typeof logo === "string") {
      setPreview(logo.startsWith("http") || logo.startsWith("/") ? logo : null);
    } else if (logo instanceof File) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(logo);
    } else {
      setPreview(null);
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
  };

  return (
    <Card className="border-none shadow-md bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <ImageIcon className="h-5 w-5 text-primary" /> Footer Logo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4">
          <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 bg-muted/20 relative group transition-all hover:bg-muted/30 hover:border-primary/50">
            {preview ? (
              <div className="relative max-w-full">
                <img
                  src={preview}
                  alt="Footer Logo preview"
                  className="max-h-32 object-contain rounded-lg shadow-sm"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="h-8 w-8 absolute -top-4 -right-4 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => { e.stopPropagation(); removeLogo(); }}
                  type="button"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="text-center space-y-3 pointer-events-none">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <ImageIcon className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Click to upload logo</p>
                  <p className="text-xs text-muted-foreground">SVG, PNG, JPG (max. 2MB)</p>
                </div>
              </div>
            )}
            <Input
              type="file"
              accept="image/*"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={handleFileChange}
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="footer_logo_alt_text" className="text-sm font-medium">Alt Text</Label>
          <Input
            id="footer_logo_alt_text"
            placeholder="e.g. Prime College Footer Logo"
            value={altText}
            onChange={(e) => onUpdate("footer_logo_alt_text", e.target.value)}
            className="bg-background/50"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default FooterLogoSettings;
