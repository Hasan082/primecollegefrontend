import { ContentBlock } from "@/types/pageBuilder";

export const getContactDefaultBlocks = (): ContentBlock[] => [
  {
    id: "contact_hero",
    type: "hero",
    label: "Contact Hero",
    isLocked: true,
    isFixed: true,
    data: {
      title: "Get in Touch",
      subtitle: "Have a question or need assistance? We're here to help you every step of the way.",
      image: "",
    }
  },
  {
    id: "contact_form",
    type: "contact-form",
    label: "Contact Details",
    isLocked: true,
    data: {
      title: "Get in Touch",
      address: "13 Lanark Square, London E14 9QD",
      email: "info@primecollege.uk",
      phone: "+44 20 1234 5678",
      hours: "Mon - Fri: 9:00 AM - 5:00 PM",
      formFields: [
        { name: "name", label: "Full Name", type: "text", required: true },
        { name: "email", label: "Email Address", type: "email", required: true },
        { name: "subject", label: "Subject", type: "text", required: false },
        { name: "message", label: "Message", type: "textarea", required: true },
      ]
    }
  },
  {
    id: "contact_map",
    type: "map",
    label: "Find Us",
    isLocked: true,
    data: {
      title: "Find Us",
      iframeUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2483.234!2d-0.0175!3d51.5075!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x487602d64e0e8b7f%3A0x1234567890abcdef!2s13%20Lanark%20Square%2C%20London%20E14%209QD!5e0!3m2!1sen!2suk!4v1700000000000"
    }
  },
  {
    id: "contact_cta_final",
    type: "cta",
    label: "Final CTA",
    isLocked: true,
    data: {
      title: "Enroll into Our Courses Today!",
      content: "Start your professional journey with Prime College. We're here to support you at every stage.",
      ctaLabel: "Browse All Courses",
      ctaHref: "/qualifications"
    }
  }
];
