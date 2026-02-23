export interface UnitData {
  id: string;
  code: string;
  title: string;
  status: "competent" | "awaiting_assessment" | "resubmission" | "not_started";
  submittedDate?: string;
  assessedDate?: string;
  feedback?: string;
}

export interface QualificationData {
  id: string;
  title: string;
  category: string;
  categoryColor: string;
  code: string;
  enrolledDate: string;
  status: "in_progress" | "completed";
  units: UnitData[];
}

export const learnerQualifications: QualificationData[] = [
  {
    id: "adult-care-l4",
    title: "Level 4 Diploma in Adult Care",
    category: "Care",
    categoryColor: "bg-pink-500",
    code: "VTCT-L4-ADULT-2024",
    enrolledDate: "15/09/2024",
    status: "in_progress",
    units: [
      {
        id: "u1", code: "VTCT301", title: "Duty of Care in Adult Care",
        status: "competent", submittedDate: "15/12/2024", assessedDate: "20/12/2024",
        feedback: "All criteria met successfully. Excellent understanding of duty of care principles."
      },
      {
        id: "u2", code: "VTCT302", title: "Equality, Diversity and Inclusion in Adult Care",
        status: "competent", submittedDate: "18/12/2024", assessedDate: "22/12/2024",
        feedback: "Excellent evidence provided with clear real-world examples."
      },
      {
        id: "u3", code: "VTCT303", title: "Health and Safety in Care Settings",
        status: "awaiting_assessment", submittedDate: "05/01/2025"
      },
      {
        id: "u4", code: "VTCT304", title: "Safeguarding and Protection in Care Settings",
        status: "resubmission", submittedDate: "10/01/2025", assessedDate: "15/01/2025",
        feedback: "Good attempt but criteria 2.3 and 3.1 need more detailed evidence. Please provide specific workplace examples."
      },
      { id: "u5", code: "VTCT305", title: "Communication in Care Settings", status: "not_started" },
      { id: "u6", code: "VTCT306", title: "Handling Information in Care Settings", status: "not_started" },
      { id: "u7", code: "VTCT307", title: "Person-Centred Approaches in Adult Care", status: "not_started" },
      { id: "u8", code: "VTCT308", title: "Infection Prevention and Control", status: "not_started" },
      { id: "u9", code: "VTCT309", title: "Mental Health Awareness", status: "not_started" },
      { id: "u10", code: "VTCT310", title: "Professional Practice in Health and Social Care", status: "not_started" },
    ],
  },
  {
    id: "management-l4",
    title: "Level 4 Diploma in Management and Leadership",
    category: "Management",
    categoryColor: "bg-purple-600",
    code: "CMI-L4-DIP-2024",
    enrolledDate: "10/01/2025",
    status: "in_progress",
    units: [
      {
        id: "m1", code: "CMI401", title: "Principles of Management and Leadership",
        status: "competent", submittedDate: "01/02/2025", assessedDate: "05/02/2025",
        feedback: "Strong theoretical knowledge demonstrated with practical application."
      },
      {
        id: "m2", code: "CMI402", title: "Developing and Leading Teams",
        status: "competent", submittedDate: "08/02/2025", assessedDate: "12/02/2025",
        feedback: "Comprehensive evidence with clear leadership examples."
      },
      {
        id: "m3", code: "CMI403", title: "Managing Performance",
        status: "competent", submittedDate: "15/02/2025", assessedDate: "18/02/2025",
        feedback: "Well-structured submission with excellent reflective practice."
      },
      {
        id: "m4", code: "CMI404", title: "Managing Budgets and Resources",
        status: "competent", submittedDate: "20/02/2025", assessedDate: "23/02/2025",
        feedback: "Good financial understanding demonstrated."
      },
      {
        id: "m5", code: "CMI405", title: "Managing Stakeholder Relationships",
        status: "competent", submittedDate: "25/02/2025", assessedDate: "28/02/2025",
        feedback: "Excellent stakeholder mapping and engagement strategies."
      },
      {
        id: "m6", code: "CMI406", title: "Managing Change", status: "awaiting_assessment",
        submittedDate: "05/03/2025"
      },
      {
        id: "m7", code: "CMI407", title: "Strategic Planning", status: "awaiting_assessment",
        submittedDate: "08/03/2025"
      },
      { id: "m8", code: "CMI408", title: "Innovation and Improvement", status: "not_started" },
      { id: "m9", code: "CMI409", title: "Managing Equality, Diversity and Inclusion", status: "not_started" },
      { id: "m10", code: "CMI410", title: "Ethical Leadership", status: "not_started" },
      { id: "m11", code: "CMI411", title: "Coaching and Mentoring", status: "not_started" },
      { id: "m12", code: "CMI412", title: "Project Management", status: "not_started" },
    ],
  },
];
