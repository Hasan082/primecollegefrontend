/* ── IQA Verification Checklists ── */

export type CheckResponseType = "yes-no" | "yes-no-na" | "met-notmet-na";

export interface ChecklistItem {
  id: string;
  label: string;
  responseType: CheckResponseType;
}

export interface ChecklistTemplate {
  id: string;
  qualificationId: string;
  /** null = qualification-level checklist, string = unit-level */
  unitCode: string | null;
  title: string;
  items: ChecklistItem[];
  createdDate: string;
  updatedDate: string;
}

export type CheckResponse = "yes" | "no" | "na" | "met" | "not-met" | "";

export interface CompletedChecklist {
  id: string;
  templateId: string;
  qualificationId: string;
  unitCode: string | null;
  iqaName: string;
  learnerName: string;
  responses: Record<string, CheckResponse>; // itemId → response
  summaryComment: string;
  completedDate: string;
}

const TEMPLATES_KEY = "iqa_checklist_templates";
const COMPLETED_KEY = "iqa_completed_checklists";

export const loadTemplates = (): ChecklistTemplate[] => {
  try {
    const saved = localStorage.getItem(TEMPLATES_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

export const saveTemplates = (templates: ChecklistTemplate[]) => {
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
};

export const loadCompletedChecklists = (): CompletedChecklist[] => {
  try {
    const saved = localStorage.getItem(COMPLETED_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

export const saveCompletedChecklists = (checklists: CompletedChecklist[]) => {
  localStorage.setItem(COMPLETED_KEY, JSON.stringify(checklists));
};

export const getResponseOptions = (type: CheckResponseType): { value: CheckResponse; label: string }[] => {
  switch (type) {
    case "yes-no":
      return [
        { value: "yes", label: "Yes" },
        { value: "no", label: "No" },
      ];
    case "yes-no-na":
      return [
        { value: "yes", label: "Yes" },
        { value: "no", label: "No" },
        { value: "na", label: "N/A" },
      ];
    case "met-notmet-na":
      return [
        { value: "met", label: "Met" },
        { value: "not-met", label: "Not Met" },
        { value: "na", label: "N/A" },
      ];
  }
};

export const RESPONSE_TYPE_LABELS: Record<CheckResponseType, string> = {
  "yes-no": "Yes / No",
  "yes-no-na": "Yes / No / N/A",
  "met-notmet-na": "Met / Not Met / N/A",
};
