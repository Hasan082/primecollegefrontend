export interface NotificationData {
  id: string;
  type: "feedback" | "resubmission" | "competent" | "system" | "resource";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  link?: string;
}

export const mockNotifications: NotificationData[] = [
  {
    id: "n1",
    type: "feedback",
    title: "New Feedback Received",
    message: "Your trainer has provided feedback on Unit 4: Safeguarding and Protection. Resubmission required for criteria 2.3 and 3.1.",
    timestamp: "2025-01-15T14:30:00Z",
    read: false,
    link: "/learner/qualification/adult-care-l4/unit/u4",
  },
  {
    id: "n2",
    type: "competent",
    title: "Unit Marked Competent",
    message: "Congratulations! Unit 2: Equality, Diversity and Inclusion has been marked as Competent.",
    timestamp: "2024-12-22T10:15:00Z",
    read: false,
    link: "/learner/qualification/adult-care-l4/unit/u2",
  },
  {
    id: "n3",
    type: "competent",
    title: "Unit Marked Competent",
    message: "Congratulations! Unit 1: Duty of Care has been marked as Competent. Excellent work!",
    timestamp: "2024-12-20T09:00:00Z",
    read: true,
    link: "/learner/qualification/adult-care-l4/unit/u1",
  },
  {
    id: "n4",
    type: "resource",
    title: "New Resource Available",
    message: "A new guidance document has been uploaded for Unit 5: Person-Centred Approaches.",
    timestamp: "2025-01-10T08:45:00Z",
    read: false,
    link: "/learner/qualification/adult-care-l4/unit/u5",
  },
  {
    id: "n5",
    type: "system",
    title: "Welcome to Prime College",
    message: "Your enrolment in Level 4 Diploma in Adult Care is confirmed. Start exploring your learning resources.",
    timestamp: "2024-09-15T12:00:00Z",
    read: true,
  },
  {
    id: "n6",
    type: "resubmission",
    title: "Resubmission Required",
    message: "Your submission for Unit 4: Safeguarding and Protection requires additional evidence. Please review the feedback and resubmit.",
    timestamp: "2025-01-15T14:35:00Z",
    read: false,
    link: "/learner/qualification/adult-care-l4/unit/u4",
  },
  {
    id: "n7",
    type: "feedback",
    title: "Assessment Complete",
    message: "Your trainer has completed the assessment for CMI405: Managing Stakeholder Relationships. View your results.",
    timestamp: "2025-02-28T16:20:00Z",
    read: true,
    link: "/learner/qualification/management-l4",
  },
];
