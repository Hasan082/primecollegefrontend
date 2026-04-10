import BlogCategoryPicker from "@/components/admin/blogs/BlogCategoryPicker";
import RichTextEditor from "@/components/admin/page-builder/RichTextEditor";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { BlogCategorySummary } from "@/redux/apis/blogs/blogApi";

export interface BlogFormState {
  blogTitle: string;
  blogExcerpt: string;
  blogDescription: string;
  blogCategory: string;
  isActive: boolean;
  featureImage: File | null;
}

interface BlogFormFieldsProps {
  form: BlogFormState;
  categories: BlogCategorySummary[];
  isCreatingCategory: boolean;
  existingFeatureImage?: string | null;
  onFieldChange: <K extends keyof BlogFormState>(field: K, value: BlogFormState[K]) => void;
  onCreateCategory: (name: string) => Promise<void>;
}

const BlogFormFields = ({
  form,
  categories,
  isCreatingCategory,
  existingFeatureImage,
  onFieldChange,
  onCreateCategory,
}: BlogFormFieldsProps) => {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="blog-title">Post Title</Label>
        <Input
          id="blog-title"
          value={form.blogTitle}
          onChange={(event) => onFieldChange("blogTitle", event.target.value)}
          placeholder="Enter post title"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="blog-excerpt">Excerpt</Label>
        <Textarea
          id="blog-excerpt"
          value={form.blogExcerpt}
          onChange={(event) => onFieldChange("blogExcerpt", event.target.value)}
          placeholder="Short summary of the post..."
          className="min-h-[120px]"
        />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Status</Label>
          <Select
            value={form.isActive ? "active" : "draft"}
            onValueChange={(value) => onFieldChange("isActive", value === "active")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <BlogCategoryPicker
          categories={categories}
          value={form.blogCategory}
          onChange={(value) => onFieldChange("blogCategory", value)}
          onCreateCategory={onCreateCategory}
          isCreatingCategory={isCreatingCategory}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="blog-feature-image">Feature Image</Label>
        <Input
          id="blog-feature-image"
          type="file"
          accept="image/*"
          onChange={(event) => onFieldChange("featureImage", event.target.files?.[0] ?? null)}
        />
        {existingFeatureImage && !form.featureImage ? (
          <div className="overflow-hidden rounded-lg border bg-muted/20">
            <img
              src={existingFeatureImage}
              alt={form.blogTitle || "Current blog feature"}
              className="h-48 w-full object-cover"
            />
          </div>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label>Content</Label>
        <RichTextEditor
          value={form.blogDescription}
          onChange={(value) => onFieldChange("blogDescription", value)}
          placeholder="Write your blog content..."
        />
      </div>
    </div>
  );
};

export default BlogFormFields;
