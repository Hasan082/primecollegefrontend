import { ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface PageEditorHeaderProps {
  pageTitle: string;
  setPageTitle: (v: string) => void;
  previewPath: string;
  isPublished: boolean;
  setIsPublished: (v: boolean) => void;
  showPublishedToggle: boolean;
  showPreview: boolean;
  setShowPreview: (v: boolean) => void;
  isSaving: boolean;
  handleSave: () => void;
}

const PageEditorHeader = ({
  pageTitle,
  setPageTitle,
  previewPath,
  isPublished,
  setIsPublished,
  showPublishedToggle,
  showPreview,
  setShowPreview,
  isSaving,
  handleSave,
}: PageEditorHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-4">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => navigate("/admin/pages")}
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>
      <div className="flex-1">
        <Input
          value={pageTitle}
          onChange={(e) => setPageTitle(e.target.value)}
          className="text-xl font-bold border-none bg-transparent px-0 h-auto focus-visible:ring-0"
        />
        <p className="text-xs text-muted-foreground mt-0.5 font-mono">
          {previewPath}
        </p>
      </div>

      {showPublishedToggle ? (
        <div className="flex items-center gap-2 mr-2">
          <Label htmlFor="published-mode" className="text-xs font-medium">
            Published
          </Label>
          <Switch
            id="published-mode"
            checked={isPublished}
            onCheckedChange={setIsPublished}
          />
        </div>
      ) : null}

      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowPreview(!showPreview)}
      >
        {showPreview ? (
          <EyeOff className="h-3.5 w-3.5 mr-1.5" />
        ) : (
          <Eye className="h-3.5 w-3.5 mr-1.5" />
        )}
        {showPreview ? "Hide" : "Show"} Preview
      </Button>
      <Button onClick={handleSave} disabled={isSaving}>
        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {isSaving ? "Saving..." : "Save Page"}
      </Button>
    </div>
  );
};

export default PageEditorHeader;
