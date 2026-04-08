import LoadingSpinner from "@/components/LoadingSpinner";
import { CMSPageRenderer } from "@/components/cms/CMSBlockRenderer";
import { useGetPageQuery } from "@/redux/apis/pageBuilderApi";
import { getRenderableBlocks } from "@/utils/pageBuilder";

const About = () => {
  const { data: pageResponse, isLoading } = useGetPageQuery("about");
  const blocks = getRenderableBlocks(pageResponse?.data, "about");

  if (isLoading) return <LoadingSpinner />;

  return <CMSPageRenderer blocks={blocks} pageSlug="about" />;
};

export default About;
