export interface ResourceFile {
  name: string;
  type: string;
  size: string;
}

export interface UploadedFile {
  name: string;
  uploadedDate: string;
  size: string;
  status: "awaiting_assessment" | "assessed" | "resubmission";
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: "single" | "multiple";
  options: string[];
  correctAnswers?: number[]; // indices
}

export interface AssignmentData {
  id: string;
  title: string;
  type: "quiz" | "written" | "file_upload";
  description: string;
  questions?: QuizQuestion[];
  wordLimit?: number;
  status: "not_started" | "in_progress" | "submitted" | "assessed";
}

export interface SubmissionVersionData {
  id: string;
  version: number;
  evidenceRef: string;
  files: { name: string; size: string }[];
  description: string;
  linkedCriteria: string[];
  submittedDate: string;
  status: "submitted" | "under_review" | "competent" | "resubmission_required" | "not_yet_competent";
  feedback?: string;
  assessedDate?: string;
  assessorName?: string;
  iqaVerified?: boolean;
  iqaDate?: string;
}

export interface UnitDetail {
  overview: string;
  requirements: string[];
  creditValue: number;
  guidedLearningHours: number;
  assessmentMethod: string;
  resources: ResourceFile[];
  uploadedFiles: UploadedFile[];
  assignments: AssignmentData[];
  submissionHistory?: SubmissionVersionData[];
}

export interface UnitData {
  id: string;
  code: string;
  title: string;
  status: "competent" | "awaiting_assessment" | "resubmission" | "not_started" | "awaiting_iqa";
  submittedDate?: string;
  assessedDate?: string;
  feedback?: string;
  detail?: UnitDetail;
}

export interface QualificationData {
  id: string;
  title: string;
  category: string;
  categoryColor: string;
  code: string;
  enrolledDate: string;
  status: "in_progress" | "completed";
  awardingBody: string;
  paymentConfirmed: boolean;
  units: UnitData[];
}

// Reusable assignment templates
const careQuizAssignment = (unitId: string): AssignmentData => ({
  id: `${unitId}-quiz`,
  title: "Knowledge Assessment Quiz",
  type: "quiz",
  description: "Complete this quiz to demonstrate your theoretical understanding. You must score 80% or above to pass.",
  status: "not_started",
  questions: [
    {
      id: "q1", question: "Which of the following best describes person-centred care?",
      type: "single",
      options: [
        "Care that follows a strict routine set by the care provider",
        "Care that focuses on the individual's needs, preferences, and choices",
        "Care that prioritises efficiency over individual preferences",
        "Care determined solely by medical professionals"
      ],
    },
    {
      id: "q2", question: "What are the key principles of duty of care? (Select all that apply)",
      type: "multiple",
      options: [
        "Acting in the best interest of individuals",
        "Not causing harm through actions or omissions",
        "Following organisational policies only",
        "Providing appropriate support and guidance",
        "Ignoring safeguarding concerns"
      ],
    },
    {
      id: "q3", question: "Under the Equality Act 2010, which of the following are protected characteristics? (Select all that apply)",
      type: "multiple",
      options: [
        "Age", "Disability", "Job title", "Race", "Religion or belief", "Income level"
      ],
    },
    {
      id: "q4", question: "What is the primary purpose of a risk assessment in care settings?",
      type: "single",
      options: [
        "To eliminate all risks completely",
        "To identify hazards and implement control measures",
        "To comply with paperwork requirements only",
        "To restrict service users' activities"
      ],
    },
  ],
});

const writtenAssignment = (unitId: string, title: string, desc: string, wordLimit: number): AssignmentData => ({
  id: `${unitId}-written`,
  title,
  type: "written",
  description: desc,
  wordLimit,
  status: "not_started",
});


export const learnerQualifications: QualificationData[] = [
  {
    id: "adult-care-l4",
    title: "Level 4 Diploma in Adult Care",
    category: "Care",
    categoryColor: "bg-pink-500",
    code: "VTCT-L4-ADULT-2024",
    enrolledDate: "15/09/2024",
    status: "in_progress",
    awardingBody: "Level 3 Diploma in Adult Care (VTCT)",
    paymentConfirmed: true,
    units: [
      {
        id: "u1", code: "VTCT301", title: "Duty of Care in Adult Care",
        status: "competent", submittedDate: "15/12/2024", assessedDate: "20/12/2024",
        feedback: "All criteria met successfully. Excellent understanding of duty of care principles.",
        detail: {

          overview: "This unit focuses on understanding the concept of duty of care and how it applies to your own role in adult care settings. You will learn about dilemmas that may arise and how to address complaints.",
          requirements: [
            "Understand the implications of duty of care",
            "Explain what it means to have a duty of care in own work role",
            "Describe how duty of care affects own work role",
            "Describe dilemmas that may arise between duty of care and individual rights",
            "Explain how to manage risks associated with duty of care"
          ],
          creditValue: 10,
          guidedLearningHours: 40,
          assessmentMethod: "Portfolio of Evidence",
          resources: [
            { name: "Unit Specification.pdf", type: "PDF", size: "245 KB" },
            { name: "Assessment Criteria Guide.pdf", type: "PDF", size: "180 KB" },
            { name: "Evidence Template.docx", type: "DOCX", size: "68 KB" },
            { name: "Example Portfolio.pdf", type: "PDF", size: "1.2 MB" },
          ],
          uploadedFiles: [
            { name: "Duty_of_Care_Portfolio.pdf", uploadedDate: "15/12/2024", size: "2.1 MB", status: "assessed" },
          ],
          assignments: [
            careQuizAssignment("u1"),
            writtenAssignment("u1", "Reflective Account", "Write a reflective account describing a situation where you had to balance duty of care with individual rights. Discuss the dilemma, how you handled it, and what you learned.", 1500),
          ],
          submissionHistory: [
            {
              id: "sub-u1-v1",
              version: 1,
              evidenceRef: "EV-2024-001",
              files: [{ name: "Duty_of_Care_Portfolio.pdf", size: "2.1 MB" }],
              description: "Complete portfolio covering duty of care principles, dilemmas between duty of care and individual rights, and risk management procedures.",
              linkedCriteria: ["AC 1.1", "AC 2.1", "AC 3.1"],
              submittedDate: "15/12/2024",
              status: "competent",
              feedback: "All criteria met successfully. Excellent understanding of duty of care principles.",
              assessedDate: "20/12/2024",
              assessorName: "Sarah Thompson",
              iqaVerified: true,
              iqaDate: "22/12/2024",
            },
          ],
        }
      },
      {
        id: "u2", code: "VTCT302", title: "Equality, Diversity and Inclusion in Adult Care",
        status: "competent", submittedDate: "18/12/2024", assessedDate: "22/12/2024",
        feedback: "Excellent evidence provided with clear real-world examples.",
        detail: {
          overview: "This unit covers the importance of equality, diversity and inclusion in adult care settings. You will explore legislation, organisational practices, and how to promote inclusive working.",
          requirements: [
            "Understand the importance of diversity, equality and inclusion",
            "Know how to work in an inclusive way",
            "Know how to access information and support about equality and inclusion",
            "Demonstrate inclusive practices in the workplace"
          ],
          creditValue: 10, guidedLearningHours: 45, assessmentMethod: "Portfolio of Evidence",
          resources: [
            { name: "Unit Specification.pdf", type: "PDF", size: "210 KB" },
            { name: "Equality Act 2010 Summary.pdf", type: "PDF", size: "320 KB" },
            { name: "Case Studies.pdf", type: "PDF", size: "150 KB" },
          ],
          uploadedFiles: [
            { name: "EDI_Evidence_Portfolio.pdf", uploadedDate: "18/12/2024", size: "1.8 MB", status: "assessed" },
          ],
          assignments: [
            careQuizAssignment("u2"),
            writtenAssignment("u2", "Case Study Analysis", "Analyse the provided case study and discuss how equality, diversity and inclusion principles should be applied. Reference relevant legislation.", 2000),
            
          ],
        }
      },
      {
        id: "u3", code: "VTCT303", title: "Health and Safety in Care Settings",
        status: "awaiting_assessment", submittedDate: "05/01/2025",
        detail: {
          overview: "This unit provides an understanding of the health and safety legislation, policies and procedures in adult care settings. You will learn risk assessment processes and emergency procedures.",
          requirements: [
            "Understand own responsibilities regarding health and safety",
            "Understand risk assessment procedures",
            "Know how to respond to accidents and sudden illness",
            "Understand procedures for handling hazardous substances",
            "Know fire safety procedures"
          ],
          creditValue: 15, guidedLearningHours: 60, assessmentMethod: "Portfolio of Evidence",
          resources: [
            { name: "Unit Specification.pdf", type: "PDF", size: "290 KB" },
            { name: "Risk Assessment Template.docx", type: "DOCX", size: "85 KB" },
            { name: "COSHH Guidelines.pdf", type: "PDF", size: "420 KB" },
            { name: "Fire Safety Checklist.pdf", type: "PDF", size: "95 KB" },
          ],
          uploadedFiles: [
            { name: "Health_Safety_Portfolio.pdf", uploadedDate: "05/01/2025", size: "3.1 MB", status: "awaiting_assessment" },
          ],
          assignments: [
            careQuizAssignment("u3"),
            writtenAssignment("u3", "Risk Assessment Report", "Complete a risk assessment for a care setting scenario. Identify hazards, assess risks, and propose control measures following the HSE 5-step approach.", 2500),
          ],
          submissionHistory: [
            {
              id: "sub-u3-v1",
              version: 1,
              evidenceRef: "EV-2025-005",
              files: [{ name: "Health_Safety_Portfolio.pdf", size: "3.1 MB" }],
              description: "Health and safety portfolio including risk assessments, COSHH records, and fire safety procedures documentation.",
              linkedCriteria: ["AC 1.1", "AC 2.1", "AC 3.1", "AC 4.1"],
              submittedDate: "05/01/2025",
              status: "under_review",
            },
          ],
        }
      },
      {
        id: "u4", code: "VTCT304", title: "Safeguarding and Protection in Care Settings",
        status: "resubmission", submittedDate: "10/01/2025", assessedDate: "15/01/2025",
        feedback: "Good attempt but criteria 2.3 and 3.1 need more detailed evidence. Please provide specific workplace examples.",
        detail: {
          overview: "This unit focuses on understanding and implementing safeguarding procedures in adult care settings. You will learn to recognise signs of abuse and neglect and understand reporting procedures.",
          requirements: [
            "Understand principles of safeguarding adults",
            "Know how to recognise signs of abuse and neglect",
            "Understand the role of the safeguarding lead",
            "Know how to respond to suspected or disclosed abuse",
            "Understand the importance of multi-agency working"
          ],
          creditValue: 15, guidedLearningHours: 55, assessmentMethod: "Portfolio of Evidence",
          resources: [
            { name: "Unit Specification.pdf", type: "PDF", size: "275 KB" },
            { name: "Safeguarding Policy Template.pdf", type: "PDF", size: "190 KB" },
            { name: "Signs of Abuse Guide.pdf", type: "PDF", size: "340 KB" },
          ],
          uploadedFiles: [
            { name: "Safeguarding_Portfolio_v1.pdf", uploadedDate: "10/01/2025", size: "2.4 MB", status: "resubmission" },
          ],
          assignments: [
            careQuizAssignment("u4"),
            writtenAssignment("u4", "Safeguarding Scenario Response", "Describe how you would respond to a safeguarding concern in your workplace. Include the steps you would take and who you would report to.", 1500),
          ],
          submissionHistory: [
            {
              id: "sub-u4-v2",
              version: 2,
              evidenceRef: "EV-2025-014",
              files: [{ name: "Safeguarding_Portfolio_v2.pdf", size: "2.8 MB" }],
              description: "Updated portfolio with additional workplace examples for criteria 2.3 and 3.1 as requested by assessor.",
              linkedCriteria: ["AC 1.1", "AC 2.3", "AC 3.1"],
              submittedDate: "20/01/2025",
              status: "submitted",
            },
            {
              id: "sub-u4-v1",
              version: 1,
              evidenceRef: "EV-2025-008",
              files: [{ name: "Safeguarding_Portfolio_v1.pdf", size: "2.4 MB" }],
              description: "Initial safeguarding portfolio covering all assessment criteria with workplace observations and professional discussion notes.",
              linkedCriteria: ["AC 1.1", "AC 2.1", "AC 2.3", "AC 3.1"],
              submittedDate: "10/01/2025",
              status: "resubmission_required",
              feedback: "Good attempt but criteria 2.3 and 3.1 need more detailed evidence. Please provide specific workplace examples.",
              assessedDate: "15/01/2025",
              assessorName: "Sarah Thompson",
            },
          ],
        }
      },
      {
        id: "u5", code: "VTCT305", title: "Person-Centred Approaches in Adult Care",
        status: "not_started",
        detail: {
          overview: "This unit focuses on understanding and implementing person-centred approaches in adult care settings. You will demonstrate competence in promoting individual choice, dignity, and independence whilst delivering high-quality care.",
          requirements: [
            "Understand person-centred values and how to apply them in care practice",
            "Promote individuals' rights and choices in daily care activities",
            "Support individuals to maintain dignity and respect",
            "Work in partnership with individuals, families, and other professionals"
          ],
          creditValue: 15, guidedLearningHours: 60, assessmentMethod: "Portfolio of Evidence",
          resources: [
            { name: "Unit Specification.pdf", type: "PDF", size: "245 KB" },
            { name: "Assessment Criteria Guide.pdf", type: "PDF", size: "180 KB" },
            { name: "Evidence Template.docx", type: "DOCX", size: "68 KB" },
            { name: "Example Portfolio.pdf", type: "PDF", size: "1.2 MB" },
          ],
          uploadedFiles: [],
          assignments: [
            {
              id: "u5-quiz", title: "Knowledge Assessment Quiz", type: "quiz",
              description: "Complete this quiz to demonstrate your theoretical understanding. You must score 80% or above to pass.",
              status: "not_started",
              questions: [
                {
                  id: "q1", question: "Which of the following best describes person-centred care?",
                  type: "single",
                  options: [
                    "Care that follows a strict routine set by the care provider",
                    "Care that focuses on the individual's needs, preferences, and choices",
                    "Care that prioritises efficiency over individual preferences",
                    "Care determined solely by medical professionals"
                  ],
                },
                {
                  id: "q2", question: "What are the benefits of person-centred approaches? (Select all that apply)",
                  type: "multiple",
                  options: [
                    "Improved wellbeing and quality of life",
                    "Greater individual empowerment",
                    "Reduced paperwork for staff",
                    "Enhanced dignity and respect",
                    "Better outcomes for individuals"
                  ],
                },
                {
                  id: "q3", question: "How should care plans be developed in a person-centred approach?",
                  type: "single",
                  options: [
                    "By the manager alone based on medical records",
                    "In partnership with the individual and their support network",
                    "Using a standardised template for all service users",
                    "By the local authority without individual input"
                  ],
                },
              ],
            },
            writtenAssignment("u5", "Reflective Account", "Write a reflective account describing how you promote person-centred values in your daily practice. Include specific examples of how you support choice, dignity, and independence.", 2000),
            
          ],
        }
      },
      { id: "u6", code: "VTCT306", title: "Communication in Care Settings", status: "not_started" },
      { id: "u7", code: "VTCT307", title: "Handling Information in Care Settings", status: "not_started" },
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
    awardingBody: "Level 4 Diploma in Management and Leadership (CMI)",
    paymentConfirmed: true,
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
      { id: "m6", code: "CMI406", title: "Managing Change", status: "awaiting_assessment", submittedDate: "05/03/2025" },
      { id: "m7", code: "CMI407", title: "Strategic Planning", status: "awaiting_assessment", submittedDate: "08/03/2025" },
      { id: "m8", code: "CMI408", title: "Innovation and Improvement", status: "not_started" },
      { id: "m9", code: "CMI409", title: "Managing Equality, Diversity and Inclusion", status: "not_started" },
      { id: "m10", code: "CMI410", title: "Ethical Leadership", status: "not_started" },
      { id: "m11", code: "CMI411", title: "Coaching and Mentoring", status: "not_started" },
      { id: "m12", code: "CMI412", title: "Project Management", status: "not_started" },
    ],
  },
];
