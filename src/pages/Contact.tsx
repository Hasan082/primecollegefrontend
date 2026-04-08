import LoadingSpinner from "@/components/LoadingSpinner";
import { CMSPageRenderer } from "@/components/cms/CMSBlockRenderer";
import { useGetPageQuery } from "@/redux/apis/pageBuilderApi";
import { getRenderableBlocks } from "@/utils/pageBuilder";

const Contact = () => {
  const { data: pageResponse, isLoading } = useGetPageQuery("contact");
  const blocks = getRenderableBlocks(pageResponse?.data, "contact");

  if (isLoading) return <LoadingSpinner />;

  return <CMSPageRenderer blocks={blocks} pageSlug="contact" />;
};

export default Contact;
