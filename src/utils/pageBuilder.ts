import { ContentBlock } from "@/types/pageBuilder";

/**
 * Safely parses blocks data which might be an array or a stringified JSON array.
 * Returns an empty array if parsing fails or input is null/undefined.
 */
export const safeParseBlocks = (blocks: any): ContentBlock[] => {
  if (!blocks) return [];
  if (Array.isArray(blocks)) return blocks;
  if (typeof blocks === "string") {
    try {
      const parsed = JSON.parse(blocks);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error("Failed to parse blocks JSON:", e);
      return [];
    }
  }
  return [];
};
