import { Link, useParams } from "react-router-dom";
import { skipToken } from "@reduxjs/toolkit/query";
import { ArrowLeft, Calendar } from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";
import {
  type BlogCategorySummary,
  useGetBlogCategoriesQuery,
  useGetBlogQuery,
  useGetBlogsQuery,
} from "@/redux/apis/blogs/blogApi";
import { sanitizeRichHtml } from "@/utils/sanitizeRichHtml";

import heroClassroom from "@/assets/hero-classroom.jpg";

const BlogDetail = () => {
  const { slug = "" } = useParams<{ slug: string }>();

  const {
    data: blogResponse,
    isLoading: isBlogLoading,
    isError: isBlogError,
  } = useGetBlogQuery(slug || skipToken, {
    skip: !slug,
  });

  const blog = blogResponse?.data;

  const { data: categoriesResponse } = useGetBlogCategoriesQuery({
    is_active: true,
  });

  const { data: relatedBlogsResponse, isLoading: isRelatedLoading } =
    useGetBlogsQuery(
      blog?.category_slug
        ? {
            category_slug: blog.category_slug,
            page_size: 3,
            is_active: true,
          }
        : skipToken,
    );

  const categoriesPayload = categoriesResponse?.data as unknown;
  const categories: BlogCategorySummary[] = Array.isArray(categoriesPayload)
    ? (categoriesPayload as BlogCategorySummary[])
    : categoriesPayload &&
        typeof categoriesPayload === "object" &&
        Array.isArray((categoriesPayload as { results?: unknown[] }).results)
      ? ((categoriesPayload as { results: BlogCategorySummary[] }).results ?? [])
      : [];
  const relatedPosts = (relatedBlogsResponse?.data?.results ?? []).filter(
    (item) => item.id !== blog?.id,
  );
  const sanitizedDescription = blog?.blog_description
    ? sanitizeRichHtml(blog.blog_description)
    : "";

  if (isBlogLoading) {
    return (
      <div className="bg-muted/30">
        <div className="container mx-auto px-4 py-10">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <div className="h-[300px] animate-pulse rounded-xl bg-muted/40 md:h-[420px]" />
              <div className="h-4 w-28 animate-pulse rounded bg-muted/40" />
              <div className="h-10 w-3/4 animate-pulse rounded bg-muted/40" />
              <div className="h-4 w-48 animate-pulse rounded bg-muted/40" />
              <div className="space-y-3">
                <div className="h-4 w-full animate-pulse rounded bg-muted/40" />
                <div className="h-4 w-full animate-pulse rounded bg-muted/40" />
                <div className="h-4 w-5/6 animate-pulse rounded bg-muted/40" />
              </div>
            </div>
            <div className="space-y-6">
              <div className="h-48 animate-pulse rounded-xl bg-muted/40" />
              <div className="h-64 animate-pulse rounded-xl bg-muted/40" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isBlogError || !blog) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="mb-4 text-2xl font-bold text-foreground">
          Post Not Found
        </h1>
        <Link to="/blogs" className="text-primary hover:underline">
          ← Back to Blog
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Breadcrumb
        items={[{ label: "Blogs", href: "/blogs" }, { label: blog.blog_title }]}
      />

      <div className="bg-muted/30">
        <div className="container mx-auto px-4 py-10">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
            <article className="lg:col-span-2">
              <div className="mb-8 overflow-hidden rounded-xl">
                <img
                  src={
                    blog.feature_image?.sources?.desktop ||
                    blog.feature_image?.src ||
                    heroClassroom
                  }
                  srcSet={blog.feature_image?.srcset}
                  sizes="(min-width: 1024px) 66vw, 100vw"
                  alt={blog.blog_title}
                  className="h-[300px] w-full object-cover md:h-[420px]"
                />
              </div>

              <div className="mb-4 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-secondary" />
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {blog.category_name}
                </span>
              </div>

              <h1 className="mb-4 text-2xl font-bold leading-tight text-foreground md:text-3xl lg:text-4xl">
                {blog.blog_title}
              </h1>

              <div className="mb-8 flex flex-wrap items-center gap-4 border-b border-border pb-8">
                <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {new Date(blog.created_at).toLocaleDateString()}
                </span>
              </div>

              {blog.blog_excerpt ? (
                <p className="mb-8 text-base leading-relaxed text-muted-foreground">
                  {blog.blog_excerpt}
                </p>
              ) : null}

              <div
                className="prose prose-lg max-w-none text-muted-foreground leading-relaxed prose-headings:text-foreground prose-headings:font-bold prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:mb-4 prose-li:text-muted-foreground prose-strong:text-foreground prose-a:text-primary"
                dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
              />

              <div className="mt-12 rounded-2xl bg-primary px-6 py-10 text-center md:px-10">
                <h2 className="mb-3 text-2xl font-bold text-primary-foreground">
                  Need Help Choosing?
                </h2>
                <p className="mx-auto mb-6 max-w-2xl text-sm text-primary-foreground/85 md:text-base">
                  Speak to our team and we'll help you find the right
                  qualification for your goals.
                </p>
                <Link
                  to="/contact"
                  className="inline-block rounded-lg bg-secondary px-7 py-3 text-sm font-semibold text-secondary-foreground hover:opacity-90"
                >
                  Contact Us
                </Link>
              </div>

              <div className="mt-12 border-t border-border pt-8">
                <Link
                  to="/blogs"
                  className="inline-flex items-center gap-2 font-semibold text-primary hover:opacity-80 transition-opacity"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Blog
                </Link>
              </div>
            </article>

            <aside className="space-y-8 lg:col-span-1">
              <div className="rounded-2xl border border-border bg-card p-6">
                <h3 className="text-lg font-bold text-foreground">Ready to Start?</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Explore our qualifications and take the next step in your career.
                </p>
                <Link
                  to="/qualifications"
                  className="mt-5 inline-flex w-full items-center justify-center rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90"
                >
                  View Qualifications
                </Link>
              </div>

              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="mb-1 text-base font-bold text-foreground">
                  Categories
                </h3>
                <div className="mb-4 h-0.5 w-8 bg-primary" />
                <div className="space-y-0">
                  {categories.map((category) => (
                    <Link
                      key={category.id}
                      to={`/blogs?category=${category.category_slug}`}
                      className={`flex items-center justify-between border-b border-border py-2.5 last:border-0 ${
                        category.category_slug === blog.category_slug
                          ? "font-semibold text-foreground"
                          : "text-muted-foreground"
                      }`}
                    >
                      <span className="text-sm">{category.name}</span>
                      <span className="text-sm">({category.blog_count})</span>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="mb-1 text-base font-bold text-foreground">
                  Related Articles
                </h3>
                <div className="mb-4 h-0.5 w-8 bg-primary" />
                <div className="space-y-4">
                  {isRelatedLoading ? (
                    Array.from({ length: 2 }).map((_, index) => (
                      <div key={index} className="space-y-2">
                        <div className="aspect-[16/9] animate-pulse rounded-lg bg-muted/40" />
                        <div className="h-3 w-24 animate-pulse rounded bg-muted/40" />
                        <div className="h-4 w-full animate-pulse rounded bg-muted/40" />
                      </div>
                    ))
                  ) : relatedPosts.length > 0 ? (
                    relatedPosts.map((related) => (
                      <Link
                        key={related.id}
                        to={`/blogs/${related.blog_slug}`}
                        className="group block"
                      >
                        <div className="mb-2 aspect-[16/9] overflow-hidden rounded-lg">
                          <img
                            src={
                              related.feature_image?.sources?.card ||
                              related.feature_image?.src ||
                              heroClassroom
                            }
                            srcSet={related.feature_image?.srcset}
                            sizes="320px"
                            alt={related.blog_title}
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(related.created_at).toLocaleDateString()}
                        </span>
                        <h4 className="text-sm font-semibold leading-snug text-foreground group-hover:text-primary transition-colors">
                          {related.blog_title}
                        </h4>
                      </Link>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No related articles found.
                    </p>
                  )}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogDetail;
