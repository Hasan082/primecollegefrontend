import { useParams } from "react-router-dom";
import LoadingSpinner from "@/components/LoadingSpinner";
import { CMSPageRenderer } from "@/components/cms/CMSBlockRenderer";
import { useGetPageQuery } from "@/redux/apis/pageBuilderApi";
import { getRenderableBlocks } from "@/utils/pageBuilder";
import NotFound from "./NotFound";

const StaticPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: pageResponse, isLoading, isError } = useGetPageQuery(slug ?? "", {
    skip: !slug,
  });
  const blocks = getRenderableBlocks(pageResponse?.data, slug);

  if (isLoading) return <LoadingSpinner />;
  if (isError || !pageResponse?.data) return <NotFound />;

  return <CMSPageRenderer blocks={blocks} pageSlug={slug} />;
};

export default StaticPage;
