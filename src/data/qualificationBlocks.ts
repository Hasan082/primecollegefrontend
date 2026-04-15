import heroBusiness from "@/assets/hero-business.jpg";
import qualificationsBanner from "@/assets/qualifications-banner.jpg";
import type { ContentBlock } from "@/types/pageBuilder";

export const getQualificationDefaultBlocks = (): ContentBlock[] => [
  {
    id: "qualification_why",
    type: "image-text",
    label: "Why Choose This Qualification",
    isLocked: true,
    data: {
      headline: "Build Confidence & Advance Your Career",
      paragraphs: [
        "Our expert tutors are industry leaders with over 20 years of experience in coaching and mentoring learners.",
        "We provide live sessions with ongoing support and resources to ensure our learners succeed.",
      ],
      image: heroBusiness,
      imagePosition: "right",
      ctaLabel: "Contact Us",
      ctaHref: "/contact",
    },
  },
  {
    id: "qualification_structure",
    type: "modules",
    label: "Course Structure",
    isLocked: true,
    data: {
      title: "Qualification Structure",
      items: [
        {
          title: "Flexible Learning",
          description:
            "This qualification covers a comprehensive range of topics to provide learners with the knowledge and skills needed for success.",
        },
      ],
    },
  },
  {
    id: "qualification_certification",
    type: "cta",
    label: "Certification Banner",
    isLocked: true,
    data: {
      title: "Certification & Validity",
      content:
        "Upon successful completion, you will receive an internationally recognised qualification regulated by Ofqual. This certification is valued by employers across the UK and worldwide, opening doors to career advancement and further study.",
      ctaLabel: "Speak to Us",
      ctaHref: "/contact",
      bgMode: "image",
      bgImage: qualificationsBanner,
      overlayColor: "rgba(12, 45, 107, 0.9)",
    },
  },
  {
    id: "qualification_faq",
    type: "faq",
    label: "FAQs",
    isLocked: true,
    data: {
      title: "Frequently Asked Questions",
      items: [
        {
          question: "How is the qualification delivered?",
          answer: "Delivery can be live online, blended, or fully remote depending on the qualification and intake.",
        },
        {
          question: "What support do learners receive?",
          answer: "Learners receive tutor support, learning resources, and guidance throughout the course.",
        },
      ],
    },
  },
  {
    id: "qualification_related",
    type: "cards",
    label: "Related Qualifications",
    isLocked: true,
    data: {
      title: "Related Qualifications",
      items: [],
    },
  },
  {
    id: "qualification_cta",
    type: "cta",
    label: "More Than One Qualification",
    isLocked: true,
    data: {
      title: "More Than One Qualification?",
      content:
        "If you are looking to upskill your team in management and leadership, we will offer you comprehensive and flexible solutions.",
      ctaLabel: "Contact Us",
      ctaHref: "/contact",
    },
  },
];
