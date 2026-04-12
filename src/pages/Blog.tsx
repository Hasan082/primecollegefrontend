import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";
import TablePagination from "@/components/admin/TablePagination";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetBlogsQuery } from "@/redux/apis/blogs/blogApi";

import heroClassroom from "@/assets/hero-classroom.jpg";
import contactBanner from "@/assets/contact-banner.jpg";

const ITEMS_PER_PAGE = 9;

const Blog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [activeCategory, setActiveCategory] = useState(
    searchParams.get("category") || "all",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
      setCurrentPage(1);
    }, 400);

    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory]);

  useEffect(() => {
    const categoryFromUrl = searchParams.get("category") || "all";
    if (categoryFromUrl !== activeCategory) {
      setActiveCategory(categoryFromUrl);
    }
  }, [searchParams, activeCategory]);

  useEffect(() => {
    const nextParams = new URLSearchParams(searchParams);

    if (activeCategory !== "all") {
      nextParams.set("category", activeCategory);
    } else {
      nextParams.delete("category");
    }

    setSearchParams(nextParams, { replace: true });
  }, [activeCategory, searchParams, setSearchParams]);

  const {
    data: blogsResponse,
    isLoading,
    isFetching,
    isError,
  } = useGetBlogsQuery({
    page: currentPage,
    page_size: ITEMS_PER_PAGE,
    search: debouncedSearch || undefined,
    category_slug: activeCategory !== "all" ? activeCategory : undefined,
    is_active: true,
  });

  const blogs = blogsResponse?.data?.results ?? [];
  const totalItems = blogsResponse?.data?.count ?? 0;
  const categories = blogsResponse?.data?.categories_summary ?? [];

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalItems]);

  return (
    <div>
      <div className="relative h-[300px] md:h-[400px] overflow-hidden">
        <img
          src={contactBanner}
          alt="Blog"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-primary/75" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center px-4">
            <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
              Blog & News
            </h1>
            <p className="text-primary-foreground/80 max-w-2xl mx-auto">
              Latest news, insights and career advice from The Prime College.
            </p>
          </div>
        </div>
      </div>

      <Breadcrumb items={[{ label: "Blog" }]} />

      <div className="bg-muted/30 py-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col gap-4 mb-8 md:flex-row md:items-center md:justify-between">
            <div className="relative flex-1 max-w-sm">
              <Input
                placeholder="Search posts..."
                className="pr-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="w-4 h-4 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2" />
            </div>

            <div className="flex items-center gap-3">
              <Select value={activeCategory} onValueChange={setActiveCategory}>
                <SelectTrigger className="w-[220px] bg-background">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem
                      key={category.id}
                      value={category.category_slug}
                    >
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {isFetching && !isLoading ? (
            <p className="mb-4 text-sm text-muted-foreground">
              Refreshing page {currentPage}...
            </p>
          ) : null}

          {isError ? (
            <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-6 py-10 text-center text-sm text-destructive">
              Failed to load blogs. Please try again.
            </div>
          ) : blogs.length === 0 && !isLoading ? (
            <div className="rounded-xl border border-border bg-card px-6 py-10 text-center text-sm text-muted-foreground">
              No blogs found.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading
                  ? Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
                    <div
                      key={`blog-skeleton-${index}`}
                      className="bg-card border border-border rounded-xl overflow-hidden"
                    >
                      <div className="aspect-[16/9] animate-pulse bg-muted/40" />
                      <div className="p-5 space-y-3">
                        <div className="h-4 w-28 animate-pulse rounded bg-muted/40" />
                        <div className="h-5 w-5/6 animate-pulse rounded bg-muted/40" />
                        <div className="h-4 w-full animate-pulse rounded bg-muted/40" />
                        <div className="h-4 w-2/3 animate-pulse rounded bg-muted/40" />
                      </div>
                    </div>
                  ))
                  : blogs.map((blog) => (
                    <Link
                      key={blog.id}
                      to={`/blogs/${blog.blog_slug}`}
                      className="bg-card border border-border rounded-xl overflow-hidden group flex h-full flex-col"
                    >
                      <div className="aspect-[16/9] overflow-hidden">
                        <img
                          src={
                            blog.feature_image?.sources?.card ||
                            blog.feature_image?.src ||
                            heroClassroom
                          }
                          srcSet={blog.feature_image?.srcset}
                          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                          alt={blog.blog_title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="p-5 flex flex-1 flex-col">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="bg-secondary text-secondary-foreground text-xs font-bold px-3 py-1 rounded uppercase">
                            {blog.category_name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(blog.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <h3 className="text-base font-semibold text-foreground leading-snug mb-2 group-hover:text-primary transition-colors">
                          {blog.blog_title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                          {blog.blog_excerpt}
                        </p>
                        <span className="mt-auto text-sm font-semibold text-primary">
                          Read More →
                        </span>
                      </div>
                    </Link>
                  ))}
              </div>

              <div className="mt-8">
                <TablePagination
                  currentPage={currentPage}
                  totalItems={totalItems}
                  itemsPerPage={ITEMS_PER_PAGE}
                  onPageChange={setCurrentPage}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Blog;
