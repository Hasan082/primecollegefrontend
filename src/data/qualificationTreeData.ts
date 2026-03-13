export interface TreeUnit {
  unitCode: string;
  unitName: string;
  status: "Not Started" | "In Progress" | "Assessed" | "Awaiting IQA" | "IQA Approved" | "Not Sampled" | "Action Required";
  assessorName: string;
  lastActivityDate: string;
  completionPercent: number;
  evidenceCount: number;
}

export interface TreeLearner {
  learnerId: string;
  learnerName: string;
  enrolmentDate: string;
  overallProgress: number;
  units: TreeUnit[];
}

export interface TreeQualification {
  qualificationId: string;
  qualificationName: string;
  awardingBody: string;
  totalLearners: number;
  learners: TreeLearner[];
}

export const qualificationTreeData: TreeQualification[] = [
  {
    qualificationId: "cmi-l5",
    qualificationName: "CMI Level 5 Management & Leadership",
    awardingBody: "CMI",
    totalLearners: 4,
    learners: [
      {
        learnerId: "L001",
        learnerName: "John Smith",
        enrolmentDate: "2025-09-15",
        overallProgress: 67,
        units: [
          { unitCode: "501", unitName: "Principles of Management", status: "IQA Approved", assessorName: "Sarah Jones", lastActivityDate: "2026-02-14", completionPercent: 100, evidenceCount: 2 },
          { unitCode: "502", unitName: "Developing Professional Skills", status: "Awaiting IQA", assessorName: "Sarah Jones", lastActivityDate: "2026-02-28", completionPercent: 100, evidenceCount: 3 },
          { unitCode: "503", unitName: "Resource Management", status: "In Progress", assessorName: "Sarah Jones", lastActivityDate: "2026-03-05", completionPercent: 60, evidenceCount: 1 },
        ],
      },
      {
        learnerId: "L002",
        learnerName: "Emily Davis",
        enrolmentDate: "2025-10-01",
        overallProgress: 33,
        units: [
          { unitCode: "501", unitName: "Principles of Management", status: "Action Required", assessorName: "Sarah Jones", lastActivityDate: "2026-02-12", completionPercent: 100, evidenceCount: 1 },
          { unitCode: "502", unitName: "Developing Professional Skills", status: "Not Started", assessorName: "Sarah Jones", lastActivityDate: "-", completionPercent: 0, evidenceCount: 0 },
          { unitCode: "503", unitName: "Resource Management", status: "Not Started", assessorName: "Sarah Jones", lastActivityDate: "-", completionPercent: 0, evidenceCount: 0 },
        ],
      },
      {
        learnerId: "L005",
        learnerName: "James Wilson",
        enrolmentDate: "2025-11-01",
        overallProgress: 50,
        units: [
          { unitCode: "501", unitName: "Principles of Management", status: "Not Sampled", assessorName: "Rachel Green", lastActivityDate: "2026-01-20", completionPercent: 100, evidenceCount: 2 },
          { unitCode: "502", unitName: "Developing Professional Skills", status: "Assessed", assessorName: "Rachel Green", lastActivityDate: "2026-02-18", completionPercent: 100, evidenceCount: 1 },
          { unitCode: "503", unitName: "Resource Management", status: "Awaiting IQA", assessorName: "Rachel Green", lastActivityDate: "2026-02-20", completionPercent: 100, evidenceCount: 1 },
        ],
      },
      {
        learnerId: "L007",
        learnerName: "Robert Taylor",
        enrolmentDate: "2025-12-01",
        overallProgress: 25,
        units: [
          { unitCode: "501", unitName: "Principles of Management", status: "Awaiting IQA", assessorName: "Rachel Green", lastActivityDate: "2026-02-24", completionPercent: 100, evidenceCount: 1 },
          { unitCode: "502", unitName: "Developing Professional Skills", status: "In Progress", assessorName: "Rachel Green", lastActivityDate: "2026-03-01", completionPercent: 40, evidenceCount: 0 },
          { unitCode: "503", unitName: "Resource Management", status: "Not Started", assessorName: "Rachel Green", lastActivityDate: "-", completionPercent: 0, evidenceCount: 0 },
        ],
      },
    ],
  },
  {
    qualificationId: "vtct-l3",
    qualificationName: "VTCT Level 3 Health & Social Care",
    awardingBody: "VTCT",
    totalLearners: 2,
    learners: [
      {
        learnerId: "L003",
        learnerName: "Michael Brown",
        enrolmentDate: "2025-09-20",
        overallProgress: 75,
        units: [
          { unitCode: "301", unitName: "Communication in Care", status: "IQA Approved", assessorName: "David Wilson", lastActivityDate: "2026-01-28", completionPercent: 100, evidenceCount: 2 },
          { unitCode: "302", unitName: "Safeguarding", status: "In Progress", assessorName: "David Wilson", lastActivityDate: "2026-02-15", completionPercent: 50, evidenceCount: 1 },
        ],
      },
      {
        learnerId: "L004",
        learnerName: "Sarah Thompson",
        enrolmentDate: "2025-10-10",
        overallProgress: 40,
        units: [
          { unitCode: "301", unitName: "Communication in Care", status: "Assessed", assessorName: "David Wilson", lastActivityDate: "2026-02-01", completionPercent: 100, evidenceCount: 1 },
          { unitCode: "302", unitName: "Safeguarding", status: "Action Required", assessorName: "David Wilson", lastActivityDate: "2026-02-07", completionPercent: 100, evidenceCount: 1 },
        ],
      },
    ],
  },
  {
    qualificationId: "cpd-prof",
    qualificationName: "CPD Professional Development",
    awardingBody: "CPD",
    totalLearners: 1,
    learners: [
      {
        learnerId: "L006",
        learnerName: "Anna Clarke",
        enrolmentDate: "2026-01-15",
        overallProgress: 50,
        units: [
          { unitCode: "101", unitName: "Workplace Communication", status: "Awaiting IQA", assessorName: "Sarah Jones", lastActivityDate: "2026-03-04", completionPercent: 100, evidenceCount: 2 },
          { unitCode: "102", unitName: "Professional Ethics", status: "In Progress", assessorName: "Sarah Jones", lastActivityDate: "2026-03-08", completionPercent: 30, evidenceCount: 0 },
        ],
      },
    ],
  },
];
