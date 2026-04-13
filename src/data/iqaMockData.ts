export interface IQASample {
  id: string;
  learnerId: string;
  learnerName: string;
  qualification: string;
  unit: string;
  trainerId: string;
  trainerName: string;
  outcome: "Competent" | "Resubmission Required" | "Not Yet Competent";
  submissionDate: string;
  assessmentDate: string;
  trainerFeedback: string;
  evidenceFiles: string[];
  criteria: string[];
  iqaStatus: "Pending IQA Review" | "IQA Approved" | "Trainer Action Required" | "Escalated to Admin";
  iqaComments?: string;
  iqaReviewDate?: string;
  samplingReason: "Random" | "New Trainer" | "Resubmission" | "Admin Selected";
}

export interface TrainerPerformance {
  id: string;
  name: string;
  email: string;
  totalAssessments: number;
  iqaApprovals: number;
  iqaFlags: number;
  resubmissionRate: number;
  avgTurnaroundDays: number;
  status: "Active" | "Inactive";
}

export const iqaSamples: IQASample[] = [
  {
    id: "iqa-001",
    learnerId: "L001",
    learnerName: "John Smith",
    qualification: "CMI Level 5 Management & Leadership",
    unit: "Unit 501: Principles of Management",
    trainerId: "T001",
    trainerName: "Sarah Jones",
    outcome: "Competent",
    submissionDate: "2026-02-10",
    assessmentDate: "2026-02-14",
    trainerFeedback: "Good understanding demonstrated. Evidence meets all criteria with strong reflective practice.",
    evidenceFiles: ["Assignment_501_JSmith.pdf", "Reflective_Log.docx"],
    criteria: ["AC 1.1 Analyse management theories", "AC 1.2 Evaluate leadership styles", "AC 1.3 Discuss organisational objectives"],
    iqaStatus: "Pending IQA Review",
    samplingReason: "Random",
  },
  {
    id: "iqa-002",
    learnerId: "L002",
    learnerName: "Emily Davis",
    qualification: "CMI Level 5 Management & Leadership",
    unit: "Unit 502: Developing Professional Skills",
    trainerId: "T001",
    trainerName: "Sarah Jones",
    outcome: "Resubmission Required",
    submissionDate: "2026-02-08",
    assessmentDate: "2026-02-12",
    trainerFeedback: "Needs more depth in AC 2.2. Please expand on practical examples.",
    evidenceFiles: ["Prof_Skills_EDavis.pdf"],
    criteria: ["AC 2.1 Assess personal skills", "AC 2.2 Develop a CPD plan", "AC 2.3 Reflect on feedback"],
    iqaStatus: "Pending IQA Review",
    samplingReason: "Resubmission",
  },
  {
    id: "iqa-003",
    learnerId: "L003",
    learnerName: "Michael Brown",
    qualification: "VTCT Level 3 Health & Social Care",
    unit: "Unit 301: Communication in Care",
    trainerId: "T002",
    trainerName: "David Wilson",
    outcome: "Competent",
    submissionDate: "2026-01-20",
    assessmentDate: "2026-01-25",
    trainerFeedback: "Excellent work. All criteria clearly evidenced.",
    evidenceFiles: ["Comm_Care_MBrown.pdf", "Case_Study.docx"],
    criteria: ["AC 1.1 Explain communication methods", "AC 1.2 Identify barriers", "AC 2.1 Apply communication techniques"],
    iqaStatus: "IQA Approved",
    iqaComments: "Assessment decision is accurate. Feedback is constructive and criteria-referenced.",
    iqaReviewDate: "2026-01-28",
    samplingReason: "New Trainer",
  },
  {
    id: "iqa-004",
    learnerId: "L004",
    learnerName: "Sarah Thompson",
    qualification: "VTCT Level 3 Health & Social Care",
    unit: "Unit 302: Safeguarding",
    trainerId: "T002",
    trainerName: "David Wilson",
    outcome: "Not Yet Competent",
    submissionDate: "2026-02-01",
    assessmentDate: "2026-02-05",
    trainerFeedback: "Insufficient evidence. Work does not meet the required standard.",
    evidenceFiles: ["Safeguarding_SThompson.pdf"],
    criteria: ["AC 1.1 Define safeguarding", "AC 1.2 Identify legislation", "AC 2.1 Describe procedures"],
    iqaStatus: "Trainer Action Required",
    iqaComments: "Feedback does not clearly reference the required assessment criteria. Trainer should specify which AC points are unmet.",
    iqaReviewDate: "2026-02-07",
    samplingReason: "New Trainer",
  },
  {
    id: "iqa-005",
    learnerId: "L005",
    learnerName: "James Wilson",
    qualification: "CMI Level 5 Management & Leadership",
    unit: "Unit 503: Resource Management",
    trainerId: "T003",
    trainerName: "Rachel Green",
    outcome: "Competent",
    submissionDate: "2026-02-15",
    assessmentDate: "2026-02-18",
    trainerFeedback: "Pass. Evidence uploaded.",
    evidenceFiles: ["Resource_Mgmt_JWilson.pdf"],
    criteria: ["AC 3.1 Evaluate resource allocation", "AC 3.2 Analyse budgeting", "AC 3.3 Plan resource strategy"],
    iqaStatus: "Escalated to Admin",
    iqaComments: "Assessment decision may be valid but feedback is severely lacking. No reference to criteria or learning outcomes. Potential systemic issue — trainer has given minimal feedback across multiple assessments.",
    iqaReviewDate: "2026-02-20",
    samplingReason: "Random",
  },
  {
    id: "iqa-006",
    learnerId: "L006",
    learnerName: "Anna Clarke",
    qualification: "CPD Professional Development",
    unit: "Unit 101: Workplace Communication",
    trainerId: "T001",
    trainerName: "Sarah Jones",
    outcome: "Competent",
    submissionDate: "2026-03-01",
    assessmentDate: "2026-03-04",
    trainerFeedback: "Learner demonstrates strong communication skills. Well-evidenced portfolio.",
    evidenceFiles: ["Workplace_Comm_AClarke.pdf", "Presentation_Slides.pptx"],
    criteria: ["AC 1.1 Demonstrate verbal skills", "AC 1.2 Written communication", "AC 2.1 Apply active listening"],
    iqaStatus: "Pending IQA Review",
    samplingReason: "Admin Selected",
  },
  {
    id: "iqa-007",
    learnerId: "L007",
    learnerName: "Robert Taylor",
    qualification: "CMI Level 5 Management & Leadership",
    unit: "Unit 501: Principles of Management",
    trainerId: "T003",
    trainerName: "Rachel Green",
    outcome: "Resubmission Required",
    submissionDate: "2026-02-20",
    assessmentDate: "2026-02-24",
    trainerFeedback: "Partial criteria met. Please address AC 1.3 with organisational examples.",
    evidenceFiles: ["Principles_RTaylor.pdf"],
    criteria: ["AC 1.1 Analyse management theories", "AC 1.2 Evaluate leadership styles", "AC 1.3 Discuss organisational objectives"],
    iqaStatus: "Pending IQA Review",
    samplingReason: "Resubmission",
  },
];

export const trainerPerformances: TrainerPerformance[] = [
  {
    id: "T001",
    name: "Sarah Jones",
    email: "trainer@primecollege.edu",
    totalAssessments: 48,
    iqaApprovals: 38,
    iqaFlags: 3,
    resubmissionRate: 12,
    avgTurnaroundDays: 3.2,
    status: "Active",
  },
  {
    id: "T002",
    name: "David Wilson",
    email: "d.wilson@primecollege.edu",
    totalAssessments: 31,
    iqaApprovals: 22,
    iqaFlags: 5,
    resubmissionRate: 18,
    avgTurnaroundDays: 4.8,
    status: "Active",
  },
  {
    id: "T003",
    name: "Rachel Green",
    email: "r.green@primecollege.edu",
    totalAssessments: 19,
    iqaApprovals: 10,
    iqaFlags: 6,
    resubmissionRate: 25,
    avgTurnaroundDays: 5.1,
    status: "Active",
  },
];

export const samplingConfig = {
  randomPercentage: 15,
  newTrainerMonths: 3,
  autoSampleResubmissions: true,
};
