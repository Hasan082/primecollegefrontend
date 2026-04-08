import LoadingSpinner from "@/components/LoadingSpinner";
import { CMSPageRenderer } from "@/components/cms/CMSBlockRenderer";
import { useGetPageQuery } from "@/redux/apis/pageBuilderApi";
import { getRenderableBlocks } from "@/utils/pageBuilder";

const Index = () => {
  const { data: pageResponse, isLoading } = useGetPageQuery("home");
  const blocks = getRenderableBlocks(pageResponse?.data, "home");

  if (isLoading) return <LoadingSpinner />;

  return <CMSPageRenderer blocks={blocks} pageSlug="home" />;
};

export default Index;
