import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  BookText,
  Check,
  ChevronsUpDown,
  Eye,
  FolderTree,
  Newspaper,
  Pencil,
  Plus,
  Search,
  X,
} from "lucide-react";
import CreateBlogModal from "@/components/admin/blogs/CreateBlogModal";
import EditBlogModal from "@/components/admin/blogs/EditBlogModal";
import ViewBlogModal from "@/components/admin/blogs/ViewBlogModal";
import TablePagination from "@/components/admin/TablePagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGetBlogsQuery } from "@/redux/apis/blogs/blogApi";

const ITEMS_PER_PAGE = 10;

const BlogSettings = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategorySlug, setSelectedCategorySlug] = useState("");
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewBlogSlug, setViewBlogSlug] = useState<string | null>(null);
  const [editBlogSlug, setEditBlogSlug] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
      setCurrentPage(1);
    }, 400);

    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategorySlug]);

  const {
    data: blogsResponse,
    isLoading,
    isFetching,
    isError,
  } = useGetBlogsQuery({
    page: currentPage,
    page_size: ITEMS_PER_PAGE,
    search: debouncedSearch || undefined,
    category_slug: selectedCategorySlug || undefined,
  });

  const blogs = blogsResponse?.data?.results ?? [];
  const totalItems = blogsResponse?.data?.count ?? 0;
  const categories = blogsResponse?.data?.categories_summary ?? [];
  const selectedCategory = categories.find(
    (category) => category.category_slug === selectedCategorySlug,
  );

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalItems]);

  return (
    <div className="space-y-6">
      <Link
        to="/admin/dashboard"
        className="inline-flex items-center gap-1.5 text-primary hover:underline text-sm"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Link>

      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Blog Settings</h1>
          <p className="text-sm text-muted-foreground">
            Review published blog data from the backend and move through pages
            server-side.
          </p>
        </div>
        {isFetching && !isLoading ? (
          <p className="text-sm text-muted-foreground">
            Refreshing page {currentPage}...
          </p>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="rounded-xl bg-primary/10 p-3 text-primary">
              <Newspaper className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Blogs</p>
              <p className="text-2xl font-semibold">{totalItems}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="rounded-xl bg-emerald-100 p-3 text-emerald-700">
              <FolderTree className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Categories</p>
              <p className="text-2xl font-semibold">{categories.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <CardTitle className="text-lg">Blogs</CardTitle>
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                className="md:self-start"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Blog
              </Button>
            </div>

            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <div className="relative w-full flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search blogs..."
                  className="pl-9"
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center lg:flex-none">
                <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={categoryOpen}
                      className="w-full justify-between font-normal sm:w-[260px]"
                    >
                      <span className="truncate">
                        {selectedCategory
                          ? `${selectedCategory.name} (${selectedCategory.blog_count})`
                          : "All categories"}
                      </span>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-[var(--radix-popover-trigger-width)] p-0"
                    align="end"
                  >
                    <Command>
                      <CommandInput placeholder="Search categories..." />
                      <CommandList className="max-h-64">
                        <CommandEmpty>No categories found.</CommandEmpty>
                        <CommandGroup>
                          <CommandItem
                            value="all categories"
                            onSelect={() => {
                              setSelectedCategorySlug("");
                              setCategoryOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedCategorySlug === ""
                                  ? "opacity-100"
                                  : "opacity-0",
                              )}
                            />
                            All Categories
                          </CommandItem>
                          {categories.map((category) => (
                            <CommandItem
                              key={category.id}
                              value={`${category.name} ${category.category_slug} ${category.blog_count}`}
                              onSelect={() => {
                                setSelectedCategorySlug(category.category_slug);
                                setCategoryOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedCategorySlug ===
                                    category.category_slug
                                    ? "opacity-100"
                                    : "opacity-0",
                                )}
                              />
                              {category.name} ({category.blog_count})
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>

                {(search || selectedCategorySlug) && (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setSearch("");
                      setDebouncedSearch("");
                      setSelectedCategorySlug("");
                      setCurrentPage(1);
                    }}
                    className="px-3 sm:self-center"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Clear
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Blog</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Created</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell
                        colSpan={5}
                        className="h-14 animate-pulse bg-muted/20"
                      />
                    </TableRow>
                  ))
                ) : isError ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-24 text-center text-sm text-destructive"
                    >
                      Failed to load blogs. Please try again.
                    </TableCell>
                  </TableRow>
                ) : blogs.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-24 text-center text-sm text-muted-foreground"
                    >
                      No blogs found.
                    </TableCell>
                  </TableRow>
                ) : (
                  blogs.map((blog) => (
                    <TableRow key={blog.id}>
                      <TableCell>
                        <div className="flex min-w-[260px] items-center gap-3">
                          <div className="h-12 w-16 overflow-hidden rounded-md bg-muted">
                            {blog.feature_image ? (
                              <img
                                src={
                                  blog.feature_image.sources?.card ||
                                  blog.feature_image.src
                                }
                                srcSet={blog.feature_image.srcset}
                                alt={blog.blog_title}
                                className="h-full w-full object-cover"
                              />
                            ) : null}
                          </div>
                          <div className="space-y-1">
                            <p className="line-clamp-1 font-medium">
                              {blog.blog_title}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium">{blog.category_name}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            blog.is_active
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border-slate-200 bg-slate-100 text-slate-600"
                          }
                        >
                          {blog.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">
                        {new Date(blog.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setViewBlogSlug(blog.blog_slug)}
                            aria-label={`View ${blog.blog_title}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditBlogSlug(blog.blog_slug)}
                            aria-label={`Edit ${blog.blog_title}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <TablePagination
            currentPage={currentPage}
            totalItems={totalItems}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
          />
        </CardContent>
      </Card>

      <CreateBlogModal
        isModalOpen={isCreateModalOpen}
        closeModal={() => setIsCreateModalOpen(false)}
      />
      <ViewBlogModal
        isModalOpen={Boolean(viewBlogSlug)}
        closeModal={() => setViewBlogSlug(null)}
        blogSlug={viewBlogSlug}
      />
      <EditBlogModal
        isModalOpen={Boolean(editBlogSlug)}
        closeModal={() => setEditBlogSlug(null)}
        blogSlug={editBlogSlug}
      />
    </div>
  );
};

export default BlogSettings;
