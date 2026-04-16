import type { IQAReviewQueueItem } from "@/types/iqa.types";

export type LifecycleLabel =
  | "Not Started"
  | "In Progress"
  | "Submitted"
  | "Awaiting Assessment"
  | "Awaiting IQA"
  | "Action Required"
  | "Signed Off"
  | "Completed"
  | "Escalated";

export type IqaWorkflowLabel =
  | "Awaiting IQA"
  | "Signed Off"
  | "Action Required"
  | "Escalated";

export const IQA_WORKFLOW_LABELS: IqaWorkflowLabel[] = [
  "Awaiting IQA",
  "Signed Off",
  "Action Required",
  "Escalated",
];

export function getIqaWorkflowLabel(iqaStatus?: string | null): IqaWorkflowLabel {
  if (iqaStatus === "Pending IQA Review") {
    return "Awaiting IQA";
  }
  if (iqaStatus === "IQA Approved") {
    return "Signed Off";
  }
  if (iqaStatus === "Escalated to Admin") {
    return "Escalated";
  }
  return "Action Required";
}

export function getIqaWorkflowBadgeVariant(
  label: IqaWorkflowLabel,
): "default" | "secondary" | "destructive" | "outline" {
  if (label === "Signed Off") {
    return "default";
  }
  if (label === "Escalated") {
    return "destructive";
  }
  if (label === "Action Required") {
    return "secondary";
  }
  return "outline";
}

export function getSubmissionOutcomeLabel(status?: string | null) {
  const normalized = (status || "").trim().toLowerCase();

  if (normalized === "submitted") {
    return "Submitted";
  }
  if (normalized === "pending" || normalized === "under_review") {
    return "Awaiting Assessment";
  }
  if (normalized === "competent" || normalized === "completed") {
    return "Completed";
  }
  if (
    normalized === "resubmit" ||
    normalized === "resubmission_required" ||
    normalized === "not_competent"
  ) {
    return "Action Required";
  }

  return (status || "unknown").replace(/_/g, " ");
}

export function getIqaDecisionLabel(decision?: string | null) {
  if (decision === "approved") {
    return "Signed Off";
  }
  if (decision === "changes_required" || decision === "referred_back") {
    return "Action Required";
  }
  return decision ? decision.replace(/_/g, " ") : "—";
}

export function getLifecycleLabel(value?: string | null): LifecycleLabel {
  const normalized = (value || "").trim().toLowerCase().replace(/\s+/g, "_");

  if (!normalized || normalized === "not_started") {
    return "Not Started";
  }
  if (normalized === "in_progress") {
    return "In Progress";
  }
  if (normalized === "submitted") {
    return "Submitted";
  }
  if (
    normalized === "pending" ||
    normalized === "under_review" ||
    normalized === "waiting_for_assessor_review" ||
    normalized === "awaiting_assessment"
  ) {
    return "Awaiting Assessment";
  }
  if (
    normalized === "iqa_review" ||
    normalized === "waiting_for_iqa_review" ||
    normalized === "pending_iqa_review" ||
    normalized === "awaiting_iqa_review" ||
    normalized === "awaiting_iqa_assessment"
  ) {
    return "Awaiting IQA";
  }
  if (
    normalized === "resubmit" ||
    normalized === "resubmission_required" ||
    normalized === "not_competent" ||
    normalized === "not_yet_competent" ||
    normalized === "changes_required" ||
    normalized === "referred_back" ||
    normalized === "assessor_action_required"
  ) {
    return "Action Required";
  }
  if (
    normalized === "iqa_approved" ||
    normalized === "approved" ||
    normalized === "signed_off"
  ) {
    return "Signed Off";
  }
  if (
    normalized === "competent" ||
    normalized === "completed" ||
    normalized === "trainer_approved"
  ) {
    return "Completed";
  }
  if (normalized === "escalated_to_admin" || normalized === "escalated") {
    return "Escalated";
  }

  return "Not Started";
}

export function getSubmissionTypeLabel(value?: string | null) {
  if (!value) {
    return "Unknown";
  }

  const normalized = value.trim().toLowerCase().replace(/\s+/g, "_");

  if (normalized === "written") {
    return "Written Assignment";
  }
  if (normalized === "evidence") {
    return "Evidence Portfolio";
  }

  return value.replace(/_/g, " ");
}

export function getQueueItemDisplayState(item: IQAReviewQueueItem) {
  return {
    workflowLabel: getIqaWorkflowLabel(item.iqa_status),
    outcomeLabel: getSubmissionOutcomeLabel(item.status),
  };
}
