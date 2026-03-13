// IQA Queue management — handles auto-flip from assessor sign-off to IQA sampling

import { samplingConfig } from "@/data/iqaMockData";

export interface IQAQueueEntry {
  id: string;
  learnerId: string;
  learnerName: string;
  qualification: string;
  unitCode: string;
  unitName: string;
  trainerId: string;
  trainerName: string;
  outcome: "Competent";
  signOffDate: string;
  trainerFeedback: string;
  criteriaSnapshot: { code: string; title: string; met: boolean }[];
  iqaStatus: "Pending IQA Review" | "IQA Approved" | "Assessor Action Required" | "Not Sampled";
  samplingReason: "Random" | "New Trainer" | "Resubmission" | "Auto — 100% Criteria Met" | "Course Auto-Select";
  iqaComments?: string;
  iqaReviewDate?: string;
  autoSelected: boolean;
}

export interface CourseSamplingPlan {
  qualificationId: string;
  qualificationName: string;
  samplingRate: number; // percentage 0-100
  sampleAll: boolean; // true = 100% IQA for this course
}

const QUEUE_KEY = "iqa_queue_entries";
const COURSE_SAMPLING_KEY = "iqa_course_sampling_plans";

// --- Queue CRUD ---

export function loadIQAQueue(): IQAQueueEntry[] {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveIQAQueue(entries: IQAQueueEntry[]) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(entries));
}

export function addToIQAQueue(entry: IQAQueueEntry) {
  const queue = loadIQAQueue();
  // Prevent duplicates
  if (queue.some(e => e.id === entry.id)) return;
  queue.unshift(entry);
  saveIQAQueue(queue);
}

export function updateIQAEntry(id: string, updates: Partial<IQAQueueEntry>) {
  const queue = loadIQAQueue();
  const idx = queue.findIndex(e => e.id === id);
  if (idx !== -1) {
    queue[idx] = { ...queue[idx], ...updates };
    saveIQAQueue(queue);
  }
}

// --- Course Sampling Plans ---

export function loadCourseSamplingPlans(): CourseSamplingPlan[] {
  try {
    return JSON.parse(localStorage.getItem(COURSE_SAMPLING_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveCourseSamplingPlans(plans: CourseSamplingPlan[]) {
  localStorage.setItem(COURSE_SAMPLING_KEY, JSON.stringify(plans));
}

export function getCourseSamplingPlan(qualificationName: string): CourseSamplingPlan | undefined {
  return loadCourseSamplingPlans().find(p => p.qualificationName === qualificationName);
}

export function upsertCourseSamplingPlan(plan: CourseSamplingPlan) {
  const plans = loadCourseSamplingPlans();
  const idx = plans.findIndex(p => p.qualificationId === plan.qualificationId);
  if (idx !== -1) {
    plans[idx] = plan;
  } else {
    plans.push(plan);
  }
  saveCourseSamplingPlans(plans);
}

// --- Auto-select logic ---

export function shouldAutoSelectForIQA(qualificationName: string): boolean {
  const plan = getCourseSamplingPlan(qualificationName);
  if (plan?.sampleAll) return true;
  
  const rate = plan?.samplingRate ?? samplingConfig.randomPercentage;
  // Deterministic random based on rate
  return Math.random() * 100 < rate;
}

export function createIQAEntryFromSignOff(params: {
  learnerId: string;
  learnerName: string;
  qualification: string;
  unitCode: string;
  unitName: string;
  trainerName: string;
  criteria: { code: string; title: string; met: boolean }[];
}): IQAQueueEntry {
  const { learnerId, qualification, unitCode } = params;
  const autoSelected = shouldAutoSelectForIQA(qualification);
  const plan = getCourseSamplingPlan(qualification);

  return {
    id: `iqa-auto-${learnerId}-${unitCode}-${Date.now()}`,
    learnerId: params.learnerId,
    learnerName: params.learnerName,
    qualification: params.qualification,
    unitCode: params.unitCode,
    unitName: params.unitName,
    trainerId: "current-trainer",
    trainerName: params.trainerName,
    outcome: "Competent",
    signOffDate: new Date().toLocaleDateString("en-GB"),
    trainerFeedback: "All criteria met — unit signed off as Competent.",
    criteriaSnapshot: params.criteria,
    iqaStatus: autoSelected ? "Pending IQA Review" : "Not Sampled",
    samplingReason: plan?.sampleAll
      ? "Course Auto-Select"
      : autoSelected
        ? "Auto — 100% Criteria Met"
        : "Random",
    autoSelected,
  };
}
