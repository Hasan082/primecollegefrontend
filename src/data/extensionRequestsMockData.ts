import { EXTENSION_PLANS, type ExtensionRequest } from "@/lib/deadlines";

export const mockExtensionRequests: ExtensionRequest[] = [
  {
    id: "er-1",
    learnerId: "l7",
    learnerName: "James White",
    qualificationId: "q1",
    qualificationTitle: "Level 3 Diploma in Business Administration",
    plan: EXTENSION_PLANS[0], // 1 month £50
    requestedDate: "01/03/2026",
    status: "pending",
  },
  {
    id: "er-2",
    learnerId: "l3",
    learnerName: "Michael Brown",
    qualificationId: "q2",
    qualificationTitle: "Level 4 Diploma in Adult Care",
    plan: EXTENSION_PLANS[2], // 3 months £120
    requestedDate: "25/02/2026",
    status: "pending",
  },
  {
    id: "er-3",
    learnerId: "l5",
    learnerName: "David Taylor",
    qualificationId: "q1",
    qualificationTitle: "Level 3 Diploma in Business Administration",
    plan: EXTENSION_PLANS[1], // 2 months £90
    requestedDate: "20/02/2026",
    status: "approved",
    reviewedBy: "Sarah Jones",
    reviewedDate: "22/02/2026",
  },
];
