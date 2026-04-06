/* ── IQA Verification Checklists ── */

export type CheckResponseType = "yes-no" | "yes-no-na" | "met-notmet-na";

export interface ChecklistItem {
  id: string;
  label: string;
  responseType: CheckResponseType;
}

export interface ChecklistApiItem {
  id: string;
  label: string;
  response_type: "yes_no" | "yes_no_na" | "met_notmet_na";
  order?: number;
  is_active?: boolean;
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

export interface ChecklistApiTemplate {
  id: string;
  qualification_id: string;
  qualification_title?: string;
  unit_id: string | null;
  unit_title?: string;
  title: string;
  is_active: boolean;
  items: ChecklistApiItem[];
  created_at: string;
  updated_at: string;
}

export interface AdminChecklistTemplate extends ChecklistTemplate {
  qualificationTitle: string;
  unitId: string | null;
  unitTitle: string;
  isActive: boolean;
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

export const parseChecklistResponseType = (
  responseType?: ChecklistApiItem["response_type"],
): CheckResponseType => {
  switch (responseType) {
    case "yes_no_na":
      return "yes-no-na";
    case "met_notmet_na":
      return "met-notmet-na";
    case "yes_no":
    default:
      return "yes-no";
  }
};

const formatChecklistDate = (date?: string) =>
  date ? new Date(date).toLocaleDateString("en-GB") : "";

export const mapChecklistTemplateFromApi = (
  template: ChecklistApiTemplate,
): AdminChecklistTemplate => ({
  id: template.id,
  qualificationId: template.qualification_id,
  qualificationTitle: template.qualification_title || "",
  unitCode: template.unit_id,
  unitId: template.unit_id,
  unitTitle: template.unit_title || "Qualification-level",
  title: template.title,
  isActive: template.is_active,
  items: (template.items || [])
    .slice()
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((item) => ({
      id: item.id,
      label: item.label,
      responseType: parseChecklistResponseType(item.response_type),
    })),
  createdDate: formatChecklistDate(template.created_at),
  updatedDate: formatChecklistDate(template.updated_at),
});
