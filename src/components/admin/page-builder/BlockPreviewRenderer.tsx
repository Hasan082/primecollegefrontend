import React from "react";
import { CMSBlockRenderer } from "@/components/cms/CMSBlockRenderer";
import type { ContentBlock } from "@/types/pageBuilder";

interface BlockPreviewRendererProps {
  blocks: ContentBlock[];
  pageTitle?: string;
  pageSlug?: string;
}

const BlockPreviewRenderer = ({ blocks, pageSlug }: BlockPreviewRendererProps) => {
  return (
    <div className="flex flex-col">
      {blocks.map((block) => (
        <React.Fragment key={block.id}>
          <CMSBlockRenderer block={block} pageSlug={pageSlug} />
        </React.Fragment>
      ))}
    </div>
  );
};

export default BlockPreviewRenderer;
