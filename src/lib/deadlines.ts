import { differenceInDays, addDays, format, parse } from "date-fns";

export const DEADLINE_PRESETS = [
  { label: "7 days", value: 7 },
  { label: "14 days", value: 14 },
  { label: "21 days", value: 21 },
  { label: "30 days", value: 30 },
  { label: "60 days", value: 60 },
];

export type DeadlineStatus = "on-track" | "warning" | "urgent" | "overdue" | "none";

export interface UnitDeadline {
  unitCode: string;
  deadlineDays: number;
  setDate: string; // DD/MM/YYYY
  deadlineDate: string; // DD/MM/YYYY
}

export const parseDate = (dateStr: string): Date => {
  const [day, month, year] = dateStr.split("/").map(Number);
  return new Date(year, month - 1, day);
};

export const formatDateDDMMYYYY = (date: Date): string => {
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
};

export const getDeadlineStatus = (deadlineDateStr: string): DeadlineStatus => {
  const deadline = parseDate(deadlineDateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  deadline.setHours(0, 0, 0, 0);
  
  const daysRemaining = differenceInDays(deadline, today);

  if (daysRemaining < 0) return "overdue";
  if (daysRemaining <= 3) return "urgent";
  if (daysRemaining <= 7) return "warning";
  return "on-track";
};

export const getDaysRemaining = (deadlineDateStr: string): number => {
  const deadline = parseDate(deadlineDateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  deadline.setHours(0, 0, 0, 0);
  return differenceInDays(deadline, today);
};

export const createDeadline = (deadlineDays: number, unitCode: string): UnitDeadline => {
  const today = new Date();
  const deadlineDate = addDays(today, deadlineDays);
  return {
    unitCode,
    deadlineDays,
    setDate: formatDateDDMMYYYY(today),
    deadlineDate: formatDateDDMMYYYY(deadlineDate),
  };
};

export const getDeadlineLabel = (status: DeadlineStatus, daysRemaining: number): string => {
  switch (status) {
    case "overdue": return `Overdue by ${Math.abs(daysRemaining)} day${Math.abs(daysRemaining) !== 1 ? "s" : ""}`;
    case "urgent": return `${daysRemaining} day${daysRemaining !== 1 ? "s" : ""} remaining`;
    case "warning": return `${daysRemaining} days remaining`;
    case "on-track": return `${daysRemaining} days remaining`;
    default: return "No deadline set";
  }
};

export const getDeadlineBadgeVariant = (status: DeadlineStatus): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case "overdue": return "destructive";
    case "urgent": return "destructive";
    case "warning": return "secondary";
    case "on-track": return "default";
    default: return "outline";
  }
};
