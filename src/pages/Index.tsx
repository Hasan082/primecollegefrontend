import LoadingSpinner from "@/components/LoadingSpinner";
import { CMSPageRenderer } from "@/components/cms/CMSBlockRenderer";
import { useGetBlogsQuery } from "@/redux/apis/blogs/blogApi";
import { useGetPageQuery } from "@/redux/apis/pageBuilderApi";
import type { ContentBlock } from "@/types/pageBuilder";
import { getRenderableBlocks } from "@/utils/pageBuilder";

const Index = () => {
  const { data: pageResponse, isLoading: isPageLoading } =
    useGetPageQuery("home");
  const { data: blogsResponse, isLoading: isBlogsLoading } = useGetBlogsQuery({
    page_size: 3,
  });

  const blogItems = (blogsResponse?.data?.results ?? []).map((blog) => ({
    title: blog.blog_title,
    blog_excerpt: blog.blog_excerpt,
    date: new Date(blog.created_at).toLocaleDateString(),
    category: blog.category_name,
    image:
      blog.feature_image?.sources?.card ||
      blog.feature_image?.sources?.desktop ||
      blog.feature_image?.src,
    image_srcset: blog.feature_image?.srcset,
    slug: blog.blog_slug,
  }));

  const blocks = getRenderableBlocks(pageResponse?.data, "home").map((block) =>
    block.type === "blog"
      ? {
          ...block,
          data: {
            ...(block.data as ContentBlock["data"]),
            items: blogItems,
          },
        }
      : block,
  );

  if (isPageLoading || isBlogsLoading) return <LoadingSpinner />;

  return <CMSPageRenderer blocks={blocks} pageSlug="home" />;
};

export default Index;
