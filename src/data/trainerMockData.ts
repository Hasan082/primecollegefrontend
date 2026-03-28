export interface LearnerUnit {
  code: string;
  name: string;
  status: "Competent" | "Pending Assessment" | "Not Started" | "Resubmission Required";
  completedDate?: string;
}

export interface TrainerLearner {
  id: string;
  name: string;
  email: string;
  phone: string;
  learnerId: string;
  qualification: string;
  qualificationCategory: string;
  enrolledDate: string;
  progress: number;
  unitsCompleted: number;
  totalUnits: number;
  pendingSubmissions: number;
  isCpd: boolean;
  units: LearnerUnit[];
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
  {
    id: "l1", name: "John Smith", email: "john.smith@example.com", phone: "+44 7700 900123",
    learnerId: "LRN-2024-001", qualification: "Level 3 Diploma in Business Administration", qualificationCategory: "Business",
    enrolledDate: "10/01/2024", progress: 65, unitsCompleted: 8, totalUnits: 12, pendingSubmissions: 1, isCpd: false,
    units: [
      { code: "BUS301", name: "Principles of Business", status: "Competent", completedDate: "15/02/2024" },
      { code: "BUS302", name: "Communication in Business", status: "Competent", completedDate: "10/03/2024" },
      { code: "BUS303", name: "Managing Business Information", status: "Competent", completedDate: "05/04/2024" },
      { code: "BUS304", name: "Resource Management", status: "Competent", completedDate: "12/05/2024" },
      { code: "BUS305", name: "Business Project Planning", status: "Pending Assessment" },
      { code: "BUS306", name: "Team Dynamics", status: "Competent", completedDate: "20/06/2024" },
      { code: "BUS307", name: "Financial Operations", status: "Competent", completedDate: "15/07/2024" },
      { code: "BUS308", name: "Marketing Fundamentals", status: "Competent", completedDate: "10/08/2024" },
      { code: "BUS309", name: "Business Ethics", status: "Competent", completedDate: "05/09/2024" },
      { code: "BUS310", name: "Strategic Planning", status: "Not Started" },
      { code: "BUS311", name: "Leadership Skills", status: "Not Started" },
      { code: "BUS312", name: "Business Law", status: "Not Started" },
    ],
  },
  {
    id: "l2", name: "Emma Johnson", email: "emma.j@example.com", phone: "+44 7700 900456",
    learnerId: "LRN-2024-002", qualification: "Level 2 Certificate in Mental Health Awareness", qualificationCategory: "Care",
    enrolledDate: "01/10/2024", progress: 83, unitsCompleted: 5, totalUnits: 6, pendingSubmissions: 1, isCpd: false,
    units: [
      { code: "MH201", name: "Understanding Mental Health", status: "Pending Assessment" },
      { code: "MH202", name: "Mental Health First Aid", status: "Competent", completedDate: "15/11/2024" },
      { code: "MH203", name: "Stress Management", status: "Competent", completedDate: "01/12/2024" },
      { code: "MH204", name: "Supporting Others", status: "Competent", completedDate: "20/12/2024" },
      { code: "MH205", name: "Wellbeing in the Workplace", status: "Competent", completedDate: "10/01/2025" },
      { code: "MH206", name: "Recovery and Resilience", status: "Competent", completedDate: "28/01/2025" },
    ],
  },
  {
    id: "l3", name: "Michael Brown", email: "m.brown@example.com", phone: "+44 7700 900789",
    learnerId: "LRN-2024-003", qualification: "Level 4 Diploma in Adult Care", qualificationCategory: "Care",
    enrolledDate: "20/08/2024", progress: 50, unitsCompleted: 6, totalUnits: 10, pendingSubmissions: 1, isCpd: false,
    units: [
      { code: "VTCT301", name: "Duty of Care", status: "Competent", completedDate: "15/09/2024" },
      { code: "VTCT302", name: "Equality and Diversity", status: "Competent", completedDate: "10/10/2024" },
      { code: "VTCT303", name: "Health and Safety in Care Settings", status: "Competent", completedDate: "05/11/2024" },
      { code: "VTCT304", name: "Person-Centred Care", status: "Competent", completedDate: "01/12/2024" },
      { code: "VTCT305", name: "Communication in Care", status: "Competent", completedDate: "20/12/2024" },
      { code: "VTCT306", name: "Safeguarding and Protection", status: "Pending Assessment" },
      { code: "VTCT307", name: "Handling Information", status: "Competent", completedDate: "15/01/2025" },
      { code: "VTCT308", name: "Medication Management", status: "Not Started" },
      { code: "VTCT309", name: "End of Life Care", status: "Not Started" },
      { code: "VTCT310", name: "Mental Capacity and DoLS", status: "Not Started" },
    ],
  },
  {
    id: "l4", name: "Sarah Wilson", email: "s.wilson@example.com", phone: "+44 7700 900321",
    learnerId: "LRN-2024-004", qualification: "Level 4 Diploma in Management and Leadership", qualificationCategory: "Management",
    enrolledDate: "05/11/2024", progress: 92, unitsCompleted: 11, totalUnits: 12, pendingSubmissions: 0, isCpd: true,
    units: [
      { code: "ML401", name: "Leadership Principles", status: "Competent", completedDate: "01/12/2024" },
      { code: "ML402", name: "Strategic Management", status: "Competent", completedDate: "15/12/2024" },
      { code: "ML403", name: "Managing Teams", status: "Competent", completedDate: "05/01/2025" },
      { code: "ML404", name: "Decision Making", status: "Competent", completedDate: "20/01/2025" },
      { code: "ML405", name: "Performance Management", status: "Competent", completedDate: "28/01/2025" },
      { code: "ML406", name: "Change Management", status: "Competent", completedDate: "05/02/2025" },
      { code: "ML407", name: "Financial Management", status: "Competent", completedDate: "10/02/2025" },
      { code: "ML408", name: "Project Management", status: "Competent", completedDate: "15/02/2025" },
      { code: "ML409", name: "Quality Management", status: "Competent", completedDate: "18/02/2025" },
      { code: "ML410", name: "Risk Management", status: "Competent", completedDate: "20/02/2025" },
      { code: "ML411", name: "Innovation and Improvement", status: "Competent", completedDate: "22/02/2025" },
      { code: "ML412", name: "Corporate Governance", status: "Not Started" },
    ],
  },
];

export const pendingSubmissions: PendingSubmission[] = [
  {
    id: "s1", learnerId: "LRN-2024-001", learnerName: "John Smith",
    qualification: "Level 3 Diploma in Business Administration", qualificationCategory: "Business",
    unitCode: "BUS305", unitTitle: "Business Project Planning",
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
    unitCode: "MH201", unitTitle: "Understanding Mental Health",
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
