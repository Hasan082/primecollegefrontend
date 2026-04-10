import { Calendar, Eye, Tag } from "lucide-react";
import { skipToken } from "@reduxjs/toolkit/query";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useGetBlogQuery } from "@/redux/apis/blogs/blogApi";
import { sanitizeRichHtml } from "@/utils/sanitizeRichHtml";
import { format } from "date-fns";

interface ViewBlogModalProps {
  isModalOpen: boolean;
  closeModal: () => void;
  blogSlug: string | null;
}

const ViewBlogModal = ({
  isModalOpen,
  closeModal,
  blogSlug,
}: ViewBlogModalProps) => {
  const { data, isLoading, isError } = useGetBlogQuery(blogSlug ?? skipToken, {
    skip: !isModalOpen || !blogSlug,
  });

  const blog = data?.data;
  const sanitizedDescription = blog?.blog_description
    ? sanitizeRichHtml(blog.blog_description)
    : "";

  return (
    <Dialog open={isModalOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto p-0">
        <div className="p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              Blog Preview
            </DialogTitle>
            <DialogDescription>
              Review the full blog post details returned by the API.
            </DialogDescription>
          </DialogHeader>
        </div>

        <Separator />

        <div className="space-y-6 p-6">
          {isLoading ? (
            <div className="space-y-3">
              <div className="h-8 w-1/3 animate-pulse rounded bg-muted" />
              <div className="h-64 animate-pulse rounded-xl bg-muted" />
              <div className="h-24 animate-pulse rounded bg-muted" />
            </div>
          ) : isError || !blog ? (
            <p className="text-sm text-destructive">
              Failed to load blog details. Please try again.
            </p>
          ) : (
            <>
              {blog.feature_image ? (
                <div className="overflow-hidden rounded-xl border bg-muted/20">
                  <img
                    src={
                      blog.feature_image.sources?.desktop ||
                      blog.feature_image.src
                    }
                    srcSet={blog.feature_image.srcset}
                    alt={blog.blog_title}
                    className="h-[320px] w-full object-cover"
                  />
                </div>
              ) : null}

              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge
                    variant="outline"
                    className={
                      blog.is_active
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-slate-200 bg-slate-100 text-slate-600"
                    }
                  >
                    {blog.is_active ? "Published" : "Draft"}
                  </Badge>
                  {blog.category_name ? (
                    <Badge variant="secondary" className="gap-1">
                      <Tag className="h-3.5 w-3.5" />
                      {blog.category_name}
                    </Badge>
                  ) : null}
                </div>

                <div>
                  <h2 className="text-2xl font-bold">{blog.blog_title}</h2>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  {blog.created_at && (
                    <span className="inline-flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {format(new Date(blog.created_at), "PPP p")}
                    </span>
                  )}
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Excerpt
                </h3>
                <p className="leading-7 text-foreground">{blog.blog_excerpt}</p>
              </div>

              <Separator />

              <div className="space-y-2">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Content
                </h3>
                <div
                  className="prose prose-sm max-w-none text-foreground"
                  dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
                />
              </div>

              {blog.related_articles && blog.related_articles.length > 0 ? (
                <>
                  <Separator />

                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                      Related Articles
                    </h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      {blog.related_articles.map((article) => (
                        <div
                          key={article.id}
                          className="overflow-hidden rounded-xl border bg-card"
                        >
                          {article.feature_image ? (
                            <img
                              src={
                                article.feature_image.sources?.card ||
                                article.feature_image.src
                              }
                              srcSet={article.feature_image.srcset}
                              alt={article.blog_title}
                              className="h-36 w-full object-cover"
                            />
                          ) : null}
                          <div className="space-y-2 p-4">
                            <div className="flex items-center gap-2">
                              {article.category_name ? (
                                <Badge variant="secondary">
                                  {article.category_name}
                                </Badge>
                              ) : null}
                            </div>
                            <h4 className="font-semibold leading-snug">
                              {article.blog_title}
                            </h4>
                            {article.blog_excerpt ? (
                              <p className="line-clamp-3 text-sm text-muted-foreground">
                                {article.blog_excerpt}
                              </p>
                            ) : null}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : null}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewBlogModal;
