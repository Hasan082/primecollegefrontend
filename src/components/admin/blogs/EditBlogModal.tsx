import { useEffect, useMemo, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { skipToken } from "@reduxjs/toolkit/query";
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
  BlogDetail,
  useCreateBlogCategoryMutation,
  useGetBlogCategoriesQuery,
  useGetBlogQuery,
  usePatchBlogMutation,
} from "@/redux/apis/blogs/blogApi";
import { sanitizeRichHtml } from "@/utils/sanitizeRichHtml";

interface EditBlogModalProps {
  isModalOpen: boolean;
  closeModal: () => void;
  blogSlug: string | null;
}

const createInitialState = (): BlogFormState => ({
  blogTitle: "",
  blogExcerpt: "",
  blogDescription: "",
  blogCategory: "",
  isActive: false,
  featureImage: null,
});

const getCategoryId = (blog: BlogDetail | undefined) => {
  if (!blog) return "";
  if (typeof blog.blog_category === "string") return blog.blog_category;
  if (
    blog.blog_category &&
    typeof blog.blog_category === "object" &&
    "id" in blog.blog_category
  ) {
    return blog.blog_category.id;
  }
  return blog.category_id ?? "";
};

const EditBlogModal = ({
  isModalOpen,
  closeModal,
  blogSlug,
}: EditBlogModalProps) => {
  const { toast } = useToast();
  const [form, setForm] = useState<BlogFormState>(createInitialState);
  const [existingFeatureImage, setExistingFeatureImage] = useState<string | null>(null);
  const { data: blogResponse, isLoading: isLoadingBlog, isError } = useGetBlogQuery(
    blogSlug ?? skipToken,
    { skip: !isModalOpen || !blogSlug },
  );
  const [patchBlog, { isLoading: isUpdatingBlog }] = usePatchBlogMutation();
  const [createBlogCategory, { isLoading: isCreatingCategory }] =
    useCreateBlogCategoryMutation();
  const {
    data: categoriesResponse,
    refetch: refetchCategories,
  } = useGetBlogCategoriesQuery({ page_size: 100 }, { skip: !isModalOpen });

  const categories = useMemo(
    () => categoriesResponse?.data ?? [],
    [categoriesResponse?.data],
  );

  useEffect(() => {
    const blog = blogResponse?.data;
    if (!blog || !isModalOpen) return;

    setForm({
      blogTitle: blog.blog_title ?? "",
      blogExcerpt: blog.blog_excerpt ?? "",
      blogDescription: blog.blog_description ?? "",
      blogCategory: getCategoryId(blog),
      isActive: blog.is_active ?? false,
      featureImage: null,
    });
    setExistingFeatureImage(
      blog.feature_image?.sources?.desktop ||
        blog.feature_image?.sources?.original ||
        blog.feature_image?.src ||
        null,
    );
  }, [blogResponse?.data, isModalOpen]);

  useEffect(() => {
    if (!isModalOpen) {
      setForm(createInitialState());
      setExistingFeatureImage(null);
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
        description: `${response.data.name} is now available.`,
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
    if (!blogSlug) return;

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
        description: "Please select a category.",
        variant: "destructive",
      });
      return;
    }

    const sanitizedDescription = sanitizeRichHtml(form.blogDescription);

    const payload = new FormData();
    payload.append("blog_title", form.blogTitle.trim());
    payload.append("blog_category", form.blogCategory);
    payload.append("blog_excerpt", form.blogExcerpt.trim());
    payload.append("blog_description", sanitizedDescription);
    payload.append("is_active", String(form.isActive));
    if (form.featureImage) {
      payload.append("feature_image", form.featureImage);
    }

    try {
      await patchBlog({ blogSlug, body: payload }).unwrap();
      toast({
        title: "Blog updated",
        description: "Your changes have been saved successfully.",
      });
      closeModal();
    } catch {
      toast({
        title: "Unable to update blog",
        description: "Please review the form and try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Blog</DialogTitle>
          <DialogDescription>
            Update blog content, switch category, or replace the feature image.
          </DialogDescription>
        </DialogHeader>

        {isLoadingBlog ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : isError || !blogResponse?.data ? (
          <p className="text-sm text-destructive">
            Failed to load this blog. Please close the modal and try again.
          </p>
        ) : (
          <BlogFormFields
            form={form}
            categories={categories}
            isCreatingCategory={isCreatingCategory}
            existingFeatureImage={existingFeatureImage}
            onFieldChange={updateField}
            onCreateCategory={handleCreateCategory}
          />
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={closeModal}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isUpdatingBlog || isLoadingBlog || isError}
          >
            {isUpdatingBlog ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditBlogModal;
