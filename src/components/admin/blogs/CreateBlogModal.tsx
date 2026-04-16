import { useEffect, useMemo, useState } from "react";
import { Loader2, Save } from "lucide-react";
import BlogFormFields, { BlogFormState } from "@/components/admin/blogs/BlogFormFields";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  type BlogCategorySummary,
  useCreateBlogCategoryMutation,
  useCreateBlogMutation,
  useGetBlogCategoriesQuery,
} from "@/redux/apis/blogs/blogApi";
import { sanitizeRichHtml } from "@/utils/sanitizeRichHtml";

interface CreateBlogModalProps {
  isModalOpen: boolean;
  closeModal: () => void;
}

const createInitialState = (): BlogFormState => ({
  blogTitle: "",
  blogExcerpt: "",
  blogDescription: "",
  blogCategory: "",
  isActive: false,
  featureImage: null,
});

const CreateBlogModal = ({ isModalOpen, closeModal }: CreateBlogModalProps) => {
  const { toast } = useToast();
  const [form, setForm] = useState<BlogFormState>(createInitialState);
  const [createBlog, { isLoading: isCreatingBlog }] = useCreateBlogMutation();
  const [createBlogCategory, { isLoading: isCreatingCategory }] =
    useCreateBlogCategoryMutation();
  const {
    data: categoriesResponse,
    refetch: refetchCategories,
    isFetching: isFetchingCategories,
  } = useGetBlogCategoriesQuery(
    { page_size: 100 },
    { skip: !isModalOpen },
  );

  const categories = useMemo(() => {
    const payload = categoriesResponse?.data as unknown;
    if (Array.isArray(payload)) return payload as BlogCategorySummary[];
    if (payload && typeof payload === "object" && Array.isArray((payload as { results?: unknown[] }).results)) {
      return (payload as { results: BlogCategorySummary[] }).results ?? [];
    }
    return [];
  }, [categoriesResponse?.data]);

  useEffect(() => {
    if (!isModalOpen) {
      setForm(createInitialState());
    }
  }, [isModalOpen]);

  const updateField = <K extends keyof BlogFormState>(
    field: K,
    value: BlogFormState[K],
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreateCategory = async (name: string) => {
    try {
      const response = await createBlogCategory({
        name,
        is_active: true,
      }).unwrap();

      updateField("blogCategory", response.data.id);
      toast({
        title: "Category created",
        description: `${response.data.name} is ready to use.`,
      });
      refetchCategories();
    } catch {
      toast({
        title: "Unable to create category",
        description: "Please try again.",
        variant: "destructive",
      });
      throw new Error("create-category-failed");
    }
  };

  const handleSubmit = async () => {
    if (!form.blogTitle.trim() || !form.blogExcerpt.trim() || !form.blogDescription.trim()) {
      toast({
        title: "Missing required fields",
        description: "Title, excerpt, and content are required.",
        variant: "destructive",
      });
      return;
    }

    if (!form.blogCategory) {
      toast({
        title: "Category required",
        description: "Please select or create a category.",
        variant: "destructive",
      });
      return;
    }

    if (!form.featureImage) {
      toast({
        title: "Feature image required",
        description: "Please upload a feature image before creating the blog.",
        variant: "destructive",
      });
      return;
    }

    const sanitizedDescription = sanitizeRichHtml(form.blogDescription);

    const payload = new FormData();
    payload.append("blog_title", form.blogTitle.trim());
    payload.append("feature_image", form.featureImage);
    payload.append("blog_category", form.blogCategory);
    payload.append("blog_excerpt", form.blogExcerpt.trim());
    payload.append("blog_description", sanitizedDescription);
    payload.append("is_active", String(form.isActive));

    try {
      await createBlog(payload).unwrap();
      toast({
        title: "Blog created",
        description: "The new blog post has been added successfully.",
      });
      closeModal();
    } catch {
      toast({
        title: "Unable to create blog",
        description: "Please review the form and try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Blog</DialogTitle>
          <DialogDescription>
            Create a new post, upload a feature image, and assign it to a category.
          </DialogDescription>
        </DialogHeader>

        <BlogFormFields
          form={form}
          categories={categories}
          isCreatingCategory={isCreatingCategory || isFetchingCategories}
          onFieldChange={updateField}
          onCreateCategory={handleCreateCategory}
        />

        <DialogFooter>
          <Button type="button" variant="outline" onClick={closeModal}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={isCreatingBlog}>
            {isCreatingBlog ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Create Blog
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateBlogModal;
