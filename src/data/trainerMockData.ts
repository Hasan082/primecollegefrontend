export interface TrainerLearner {
  id: string;
  name: string;
  email: string;
  learnerId: string;
  qualification: string;
  qualificationCategory: string;
  enrolledDate: string;
  progress: number;
  unitsCompleted: number;
  totalUnits: number;
  pendingSubmissions: number;
}

export interface PendingSubmission {
  id: string;
  learnerId: string;
  learnerName: string;
  qualification: string;
  qualificationCategory: string;
  unitCode: string;
  unitTitle: string;
  submittedDate: string;
  daysWaiting: number;
  files: { name: string; type: string; size: string }[];
  criteria: string[];
}

export interface RecentAssessment {
  id: string;
  learnerId: string;
  learnerName: string;
  unitCode: string;
  unitTitle: string;
  assessedDate: string;
  submittedDate: string;
  outcome: "Competent" | "Resubmission Required" | "Not Yet Competent";
  qualification: string;
  assessorName: string;
  criteria: { code: string; title: string; evidence: string; met: boolean }[];
}

export const trainerLearners: TrainerLearner[] = [
  { id: "l1", name: "John Smith", email: "john.smith@example.com", learnerId: "LRN-2024-001", qualification: "Level 4 Diploma in Adult Care", qualificationCategory: "Care", enrolledDate: "2024-09-15", progress: 65, unitsCompleted: 8, totalUnits: 10, pendingSubmissions: 1 },
  { id: "l2", name: "Emma Johnson", email: "emma.j@example.com", learnerId: "LRN-2024-002", qualification: "Level 2 Certificate in Mental Health Awareness", qualificationCategory: "Care", enrolledDate: "2024-10-01", progress: 83, unitsCompleted: 5, totalUnits: 6, pendingSubmissions: 1 },
  { id: "l3", name: "Michael Brown", email: "m.brown@example.com", learnerId: "LRN-2024-003", qualification: "Level 4 Diploma in Adult Care", qualificationCategory: "Care", enrolledDate: "2024-08-20", progress: 50, unitsCompleted: 6, totalUnits: 10, pendingSubmissions: 1 },
  { id: "l4", name: "Sarah Wilson", email: "s.wilson@example.com", learnerId: "LRN-2024-004", qualification: "Level 4 Diploma in Management and Leadership", qualificationCategory: "Management", enrolledDate: "2024-11-05", progress: 92, unitsCompleted: 11, totalUnits: 12, pendingSubmissions: 0 },
];

export const pendingSubmissions: PendingSubmission[] = [
  {
    id: "s1", learnerId: "LRN-2024-001", learnerName: "John Smith",
    qualification: "Level 4 Diploma in Adult Care", qualificationCategory: "Care",
    unitCode: "VTCT303", unitTitle: "Health and Safety in Care Settings",
    submittedDate: "08/02/25", daysWaiting: 2,
    files: [
      { name: "Business_Planning_Portfolio.pdf", type: "PDF", size: "2.4 MB" },
      { name: "Project_Plan_Example.xlsx", type: "XLSX", size: "856 KB" },
    ],
    criteria: ["Define project scope and objectives", "Create detailed project plans with timelines", "Identify and allocate resources appropriately", "Assess and mitigate project risks", "Monitor and report on project progress"],
  },
  {
    id: "s2", learnerId: "LRN-2024-002", learnerName: "Emma Johnson",
    qualification: "Level 2 Certificate in Mental Health Awareness", qualificationCategory: "Care",
    unitCode: "VTCT201", unitTitle: "Understanding Mental Health",
    submittedDate: "07/02/25", daysWaiting: 3,
    files: [{ name: "Mental_Health_Essay.pdf", type: "PDF", size: "1.8 MB" }],
    criteria: ["Define key concepts of mental health", "Identify common mental health conditions", "Explain impact of mental health on individuals"],
  },
  {
    id: "s3", learnerId: "LRN-2024-003", learnerName: "Michael Brown",
    qualification: "Level 4 Diploma in Adult Care", qualificationCategory: "Care",
    unitCode: "VTCT306", unitTitle: "Safeguarding and Protection",
    submittedDate: "06/02/25", daysWaiting: 4,
    files: [{ name: "Safeguarding_Portfolio.pdf", type: "PDF", size: "3.1 MB" }],
    criteria: ["Understand safeguarding legislation", "Identify signs of abuse", "Explain reporting procedures"],
  },
];

export const recentAssessments: RecentAssessment[] = [
  {
    id: "a1", learnerId: "LRN-2024-005", learnerName: "David Taylor",
    unitCode: "BUS302", unitTitle: "Communication in Business",
    assessedDate: "09/02/2025", submittedDate: "06/02/2025",
    outcome: "Competent",
    qualification: "Level 3 Diploma in Business Administration",
    assessorName: "Sarah Jones",
    criteria: [
      { code: "1.1", title: "Understand different communication methods", evidence: "Written report on communication channels", met: true },
      { code: "1.2", title: "Apply effective verbal communication", evidence: "Video presentation demonstrating verbal skills", met: true },
      { code: "1.3", title: "Demonstrate written communication skills", evidence: "Professional business correspondence samples", met: true },
      { code: "2.1", title: "Use appropriate communication technology", evidence: "Digital communication portfolio", met: true },
    ],
  },
  {
    id: "a2", learnerId: "LRN-2024-006", learnerName: "Lisa Anderson",
    unitCode: "CS202", unitTitle: "Handling Customer Queries",
    assessedDate: "08/02/2025", submittedDate: "04/02/2025",
    outcome: "Competent",
    qualification: "Level 2 Certificate in Customer Service",
    assessorName: "Sarah Jones",
    criteria: [
      { code: "1.1", title: "Identify customer needs through questioning", evidence: "Role-play recordings of customer interactions", met: true },
      { code: "1.2", title: "Provide accurate information to customers", evidence: "Written responses to customer scenarios", met: true },
      { code: "2.1", title: "Escalate complex queries appropriately", evidence: "Case study with escalation decision log", met: true },
    ],
  },
  {
    id: "a3", learnerId: "LRN-2024-007", learnerName: "James White",
    unitCode: "BUS304", unitTitle: "Resource Management",
    assessedDate: "08/02/2025", submittedDate: "03/02/2025",
    outcome: "Resubmission Required",
    qualification: "Level 3 Diploma in Business Administration",
    assessorName: "Sarah Jones",
    criteria: [
      { code: "1.1", title: "Identify resource requirements for projects", evidence: "Resource planning document", met: true },
      { code: "1.2", title: "Allocate resources effectively", evidence: "Budget allocation spreadsheet", met: false },
      { code: "2.1", title: "Monitor resource utilisation", evidence: "Utilisation tracking report", met: false },
    ],
  },
];
