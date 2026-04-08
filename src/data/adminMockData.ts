export interface QualificationUnit {
  code: string;
  name: string;
}

export interface AdminQualification {
  id: string;
  title: string;
  code: string;
  level: string;
  category: string;
  awardingBody: string;
  status: "active" | "draft" | "archived";
  price: number;
  accessDuration: string;
  totalUnits: number;
  enrolledLearners: number;
  createdDate: string;
  is_cpd: boolean;
  units?: QualificationUnit[];
}

export interface AdminLearner {
  id: string;
  learnerUserId?: string;
  name: string;
  email: string;
  phone: string;
  learnerId: string;
  qualification: string;
  qualificationId: string;
  assignedTrainer: string;
  enrolledDate: string;
  paymentMethod: "online" | "manual" | "employer";
  paymentStatus: "paid" | "pending" | "overdue";
  progress: number;
  status: "active" | "completed" | "suspended" | "on_hold";
  accessExpiry: string;
}

export interface AdminTrainer {
  id: string;
  name: string;
  email: string;
  specialisms: string[];
  assignedLearners: number;
  pendingReviews: number;
  status: "active" | "inactive";
}

export const adminQualifications: AdminQualification[] = [
  { id: "q1", title: "Level 3 Diploma in Business Administration", code: "BUS-L3-DIP", level: "Level 3", category: "Business", awardingBody: "VTCT", status: "active", price: 1200, accessDuration: "12 months", totalUnits: 12, enrolledLearners: 24, createdDate: "01/06/2024", is_cpd: false, units: [
    { code: "BUS301", name: "Principles of Business" }, { code: "BUS302", name: "Communication in Business" }, { code: "BUS303", name: "Managing Business Information" },
    { code: "BUS304", name: "Resource Management" }, { code: "BUS305", name: "Business Project Planning" }, { code: "BUS306", name: "Team Dynamics" },
    { code: "BUS307", name: "Financial Operations" }, { code: "BUS308", name: "Marketing Fundamentals" }, { code: "BUS309", name: "Business Ethics" },
    { code: "BUS310", name: "Strategic Planning" }, { code: "BUS311", name: "Leadership Skills" }, { code: "BUS312", name: "Business Law" },
  ]},
  { id: "q2", title: "Level 4 Diploma in Adult Care", code: "VTCT-L4-ADULT", level: "Level 4", category: "Care", awardingBody: "VTCT", status: "active", price: 1500, accessDuration: "18 months", totalUnits: 10, enrolledLearners: 18, createdDate: "15/07/2024", is_cpd: false, units: [
    { code: "VTCT301", name: "Safeguarding Adults" }, { code: "VTCT302", name: "Person-Centred Care" }, { code: "VTCT303", name: "Mental Health Awareness" },
    { code: "VTCT304", name: "Communication in Care" }, { code: "VTCT305", name: "Health & Safety" }, { code: "VTCT306", name: "Equality & Diversity" },
    { code: "VTCT307", name: "Duty of Care" }, { code: "VTCT308", name: "Professional Development" }, { code: "VTCT309", name: "Record Keeping" }, { code: "VTCT310", name: "Leadership in Care" },
  ]},
  { id: "q3", title: "Level 4 Diploma in Management and Leadership", code: "CMI-L4-DIP", level: "Level 4", category: "Management", awardingBody: "CMI", status: "active", price: 1800, accessDuration: "18 months", totalUnits: 12, enrolledLearners: 15, createdDate: "01/08/2024", is_cpd: true, units: [
    { code: "CMI401", name: "Principles of Management" }, { code: "CMI402", name: "Strategic Leadership" }, { code: "CMI403", name: "Operational Management" },
    { code: "CMI404", name: "Change Management" }, { code: "CMI405", name: "Financial Management" }, { code: "CMI406", name: "Resource Planning" },
    { code: "CMI407", name: "People Management" }, { code: "CMI408", name: "Communication & Negotiation" }, { code: "CMI409", name: "Project Management" },
    { code: "CMI410", name: "Quality Management" }, { code: "CMI411", name: "Risk Management" }, { code: "CMI412", name: "Innovation & Improvement" },
  ]},
  { id: "q4", title: "Level 2 Certificate in Mental Health Awareness", code: "MH-L2-CERT", level: "Level 2", category: "Care", awardingBody: "VTCT", status: "active", price: 450, accessDuration: "6 months", totalUnits: 6, enrolledLearners: 32, createdDate: "10/05/2024", is_cpd: false, units: [
    { code: "MH201", name: "Understanding Mental Health" }, { code: "MH202", name: "Mental Health First Aid" }, { code: "MH203", name: "Stress Management" },
    { code: "MH204", name: "Supporting Others" }, { code: "MH205", name: "Wellbeing in the Workplace" }, { code: "MH206", name: "Reflective Practice" },
  ]},
  { id: "q5", title: "Level 2 Certificate in Customer Service", code: "CS-L2-CERT", level: "Level 2", category: "Business", awardingBody: "VTCT", status: "active", price: 400, accessDuration: "6 months", totalUnits: 5, enrolledLearners: 28, createdDate: "20/04/2024", is_cpd: false, units: [
    { code: "CS201", name: "Customer Service Principles" }, { code: "CS202", name: "Communication Skills" }, { code: "CS203", name: "Handling Complaints" },
    { code: "CS204", name: "Service Improvement" }, { code: "CS205", name: "Professional Behaviour" },
  ]},
  { id: "q6", title: "Level 3 Certificate in First Aid at Work", code: "FA-L3-CERT", level: "Level 3", category: "First Aid", awardingBody: "VTCT", status: "draft", price: 350, accessDuration: "3 months", totalUnits: 4, enrolledLearners: 0, createdDate: "01/02/2025", is_cpd: false, units: [
    { code: "FA301", name: "Emergency First Aid" }, { code: "FA302", name: "Workplace Hazards" }, { code: "FA303", name: "CPR & AED" }, { code: "FA304", name: "Incident Reporting" },
  ]},
  { id: "q7", title: "Online Safety & Digital Wellbeing – Protecting Children in the Digital Environment and Managing Screen Safety", code: "OSDW-2024", level: "Level 1", category: "Care", awardingBody: "The Prime College", status: "active", price: 0, accessDuration: "12 months", totalUnits: 5, enrolledLearners: 120, createdDate: "10/01/2025", is_cpd: true },
];

export const adminLearners: AdminLearner[] = [
  { id: "l1", name: "John Smith", email: "john.smith@example.com", phone: "+44 7700 900123", learnerId: "LRN-2024-001", qualification: "Level 3 Diploma in Business Administration", qualificationId: "q1", assignedTrainer: "Sarah Jones", enrolledDate: "10/01/2024", paymentMethod: "online", paymentStatus: "paid", progress: 65, status: "active", accessExpiry: "10/01/2025" },
  { id: "l2", name: "Emma Johnson", email: "emma.j@example.com", phone: "+44 7700 900456", learnerId: "LRN-2024-002", qualification: "Level 2 Certificate in Mental Health Awareness", qualificationId: "q4", assignedTrainer: "Sarah Jones", enrolledDate: "01/10/2024", paymentMethod: "online", paymentStatus: "paid", progress: 83, status: "active", accessExpiry: "01/04/2025" },
  { id: "l3", name: "Michael Brown", email: "m.brown@example.com", phone: "+44 7700 900789", learnerId: "LRN-2024-003", qualification: "Level 4 Diploma in Adult Care", qualificationId: "q2", assignedTrainer: "Sarah Jones", enrolledDate: "20/08/2024", paymentMethod: "employer", paymentStatus: "paid", progress: 50, status: "active", accessExpiry: "20/02/2026" },
  { id: "l4", name: "Sarah Wilson", email: "s.wilson@example.com", phone: "+44 7700 900321", learnerId: "LRN-2024-004", qualification: "Level 4 Diploma in Management and Leadership", qualificationId: "q3", assignedTrainer: "Mark Thompson", enrolledDate: "05/11/2024", paymentMethod: "online", paymentStatus: "paid", progress: 92, status: "active", accessExpiry: "05/05/2026" },
  { id: "l5", name: "David Taylor", email: "d.taylor@example.com", phone: "+44 7700 900654", learnerId: "LRN-2024-005", qualification: "Level 3 Diploma in Business Administration", qualificationId: "q1", assignedTrainer: "Sarah Jones", enrolledDate: "15/09/2024", paymentMethod: "manual", paymentStatus: "paid", progress: 40, status: "active", accessExpiry: "15/09/2025" },
  { id: "l6", name: "Lisa Anderson", email: "l.anderson@example.com", phone: "+44 7700 900987", learnerId: "LRN-2024-006", qualification: "Level 2 Certificate in Customer Service", qualificationId: "q5", assignedTrainer: "Mark Thompson", enrolledDate: "12/12/2024", paymentMethod: "online", paymentStatus: "paid", progress: 100, status: "completed", accessExpiry: "12/06/2025" },
  { id: "l7", name: "James White", email: "j.white@example.com", phone: "+44 7700 900111", learnerId: "LRN-2024-007", qualification: "Level 3 Diploma in Business Administration", qualificationId: "q1", assignedTrainer: "Sarah Jones", enrolledDate: "01/11/2024", paymentMethod: "employer", paymentStatus: "pending", progress: 25, status: "active", accessExpiry: "01/11/2025" },
  { id: "l8", name: "Rachel Green", email: "r.green@example.com", phone: "+44 7700 900222", learnerId: "LRN-2024-008", qualification: "Level 4 Diploma in Adult Care", qualificationId: "q2", assignedTrainer: "Sarah Jones", enrolledDate: "20/01/2025", paymentMethod: "online", paymentStatus: "paid", progress: 10, status: "active", accessExpiry: "20/07/2026" },
  { id: "l9", name: "Sophie Turner", email: "s.turner@example.com", phone: "+44 7700 900333", learnerId: "LRN-2025-009", qualification: "Level 2 Certificate in Mental Health Awareness", qualificationId: "q4", assignedTrainer: "Mark Thompson", enrolledDate: "05/02/2025", paymentMethod: "online", paymentStatus: "paid", progress: 5, status: "active", accessExpiry: "05/08/2025" },
  { id: "l10", name: "Daniel Harris", email: "d.harris@example.com", phone: "+44 7700 900444", learnerId: "LRN-2025-010", qualification: "Level 4 Diploma in Management and Leadership", qualificationId: "q3", assignedTrainer: "Mark Thompson", enrolledDate: "10/02/2025", paymentMethod: "employer", paymentStatus: "paid", progress: 3, status: "active", accessExpiry: "10/08/2026" },
];

export const adminTrainers: AdminTrainer[] = [
  { id: "t1", name: "Sarah Jones", email: "trainer@primecollege.edu", specialisms: ["Business", "Care"], assignedLearners: 6, pendingReviews: 3, status: "active" },
  { id: "t2", name: "Mark Thompson", email: "m.thompson@primecollege.edu", specialisms: ["Management", "Business"], assignedLearners: 2, pendingReviews: 0, status: "active" },
  { id: "t3", name: "Dr. Helen Clark", email: "h.clark@primecollege.edu", specialisms: ["Care", "First Aid"], assignedLearners: 0, pendingReviews: 0, status: "inactive" },
];

export const adminStats = {
  totalLearners: 10,
  activeLearners: 9,
  completedLearners: 1,
  totalQualifications: 6,
  activeQualifications: 5,
  totalTrainers: 3,
  activeTrainers: 2,
  pendingSubmissions: 3,
  totalRevenue: 42350,
  monthlyEnrolments: [
    { month: "Sep", count: 2 },
    { month: "Oct", count: 1 },
    { month: "Nov", count: 2 },
    { month: "Dec", count: 1 },
    { month: "Jan", count: 1 },
    { month: "Feb", count: 1 },
  ],
  categoryDistribution: [
    { name: "Business", value: 3 },
    { name: "Care", value: 3 },
    { name: "Management", value: 1 },
    { name: "First Aid", value: 1 },
  ],
};
