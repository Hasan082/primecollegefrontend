import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderLogoSettingsProps {
  logo: string | File | null;
  altText: string;
  onUpdate: (field: string, value: string | File | null) => void;
}

const HeaderLogoSettings = ({ logo, altText, onUpdate }: HeaderLogoSettingsProps) => {
  const [preview, setPreview] = useState<string | null>(
    typeof logo === "string" ? (logo.startsWith("http") || logo.startsWith("/") ? logo : null) : null
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpdate("header_logo", file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    onUpdate("header_logo", null);
    setPreview(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Logo Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4">
          <Label>Logo Image</Label>
          
          <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 bg-muted/20 relative group transition-colors hover:bg-muted/30">
            {preview ? (
              <div className="relative max-w-full">
                <img
                  src={preview}
                  alt="Logo preview"
                  className="max-h-32 object-contain rounded shadow-sm"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="h-6 w-6 absolute -top-2 -right-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => { e.stopPropagation(); removeLogo(); }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <div className="text-center space-y-2 pointer-events-none">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                  <ImageIcon className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="text-xs text-muted-foreground font-medium">
                  Click to upload or drag logo image
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
          <p className="text-[10px] text-muted-foreground italic">
            Recommended size: 200x60px. Supports PNG, JPG, SVG.
          </p>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="header_logo_alt_text">Alt Text</Label>
          <Input
            id="header_logo_alt_text"
            placeholder="e.g. Prime College"
            value={altText}
            onChange={(e) => onUpdate("header_logo_alt_text", e.target.value)}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default HeaderLogoSettings;
