import type { BlockType } from "@/types/pageBuilder";

export interface ItemField {
  key: string;
  label: string;
  type: "input" | "textarea";
  placeholder?: string;
}

export const MEDIA_ENABLED_BLOCKS: BlockType[] = ["cards", "why-us", "blog", "logos", "hero", "popular-qualifications", "info-cards"];

export const ITEM_FIELDS: Partial<Record<BlockType, ItemField[]>> = {
  hero: [
    { key: "category", label: "Category", type: "input", placeholder: "e.g. Healthcare" },
    { key: "title", label: "Title", type: "input", placeholder: "Slide title" },
    { key: "price", label: "Price", type: "input", placeholder: "e.g. £650" },
    { key: "cta", label: "CTA Label", type: "input", placeholder: "e.g. Enroll Now" },
  ],
  modules: [
    { key: "title", label: "Title", type: "input", placeholder: "Module title" },
    { key: "description", label: "Description", type: "textarea", placeholder: "Module description" },
  ],
  faq: [
    { key: "question", label: "Question", type: "input", placeholder: "Enter question" },
    { key: "answer", label: "Answer", type: "textarea", placeholder: "Enter answer" },
  ],
  stats: [
    { key: "title", label: "Label", type: "input", placeholder: "e.g. Students" },
    { key: "value", label: "Value", type: "input", placeholder: "e.g. 500+" },
    { key: "description", label: "Description", type: "input", placeholder: "Short description" },
  ],
  cards: [
    { key: "title", label: "Title", type: "input", placeholder: "Card title" },
    { key: "category", label: "Category", type: "input", placeholder: "e.g. Business" },
    { key: "level", label: "Level", type: "input", placeholder: "e.g. Level 5" },
    { key: "price", label: "Price", type: "input", placeholder: "e.g. £1,200" },
  ],
  logos: [
    { key: "title", label: "Name", type: "input", placeholder: "Partner name" },
  ],
  blog: [
    { key: "title", label: "Title", type: "input", placeholder: "Post title" },
    { key: "description", label: "Description", type: "textarea", placeholder: "Short summary" },
    { key: "date", label: "Date", type: "input", placeholder: "e.g. 2025-01-15" },
    { key: "category", label: "Category", type: "input", placeholder: "e.g. News" },
  ],
  "why-us": [
    { key: "title", label: "Title", type: "input", placeholder: "Feature title" },
    { key: "description", label: "Description", type: "textarea", placeholder: "Feature description" },
  ],
  features: [
    { key: "title", label: "Title", type: "input", placeholder: "Feature title" },
    { key: "description", label: "Description", type: "textarea", placeholder: "Feature description" },
  ],
  "popular-qualifications": [
    { key: "title", label: "Title", type: "input", placeholder: "Qualification title" },
    { key: "category", label: "Category", type: "input", placeholder: "e.g. Business" },
    { key: "level", label: "Level", type: "input", placeholder: "e.g. Level 3" },
    { key: "price", label: "Price", type: "input", placeholder: "e.g. £450" },
  ],
  "contact-form": [
    { key: "name", label: "Field ID (name)", type: "input", placeholder: "e.g. first_name" },
    { key: "label", label: "Label", type: "input", placeholder: "e.g. First Name" },
    { key: "type", label: "Type (text, email, textarea)", type: "input", placeholder: "e.g. text" },
    { key: "required", label: "Required (true/false)", type: "input", placeholder: "e.g. true" },
  ],
  "qualification_slider": [
    { key: "id", label: "Qualification ID (UUID)", type: "input", placeholder: "Enter UUID" },
  ],
  "info-cards": [
    { key: "title", label: "Card Title", type: "input", placeholder: "e.g. First Aid" },
    { key: "description", label: "Card Description", type: "textarea", placeholder: "Enter details..." },
  ]
};
