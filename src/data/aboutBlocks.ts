import { ContentBlock } from "@/types/pageBuilder";

export const getAboutDefaultBlocks = (): ContentBlock[] => [
  {
    id: "about_hero",
    type: "hero",
    label: "About Hero",
    isLocked: true,
    isFixed: true,
    data: {
      title: "About Prime College",
      subtitle: "Broaden your horizons and elevate your career with our industry-leading qualifications.",
      image: "", // Placeholder or default image URL if available
    }
  },
  {
    id: "about_intro",
    type: "about-split",
    label: "About Us Intro",
    isLocked: true,
    data: {
      headline: "Excellence in Online Learning & Professional Development",
      paragraphs: ["We provide high-quality education tailored to your career goals."],
      ctaLabel: "Learn Case Studies",
      ctaHref: "/about"
    }
  },
  {
    id: "about_vision",
    type: "image-text",
    label: "Our Vision",
    isLocked: true,
    data: {
      headline: "Our Vision",
      paragraphs: [
        "To be a global leader in professional education.",
        "Empowering learners through innovation and technology."
      ],
      image: "",
      imagePosition: "right"
    }
  },
  {
    id: "about_approach",
    type: "why-us",
    label: "Smart Approach",
    isLocked: true,
    data: {
      title: "Smart Approach",
      content: "Experience the difference with Prime College's unique approach to education.",
      items: [
        { title: "Expert Tutors", description: "Learn from industry professionals.", icon: "Users" },
        { title: "Flexible Learning", description: "Study at your own pace.", icon: "Clock" },
        { title: "Global Certification", description: "Recognized worldwide.", icon: "Award" }
      ]
    }
  },
  {
    id: "about_values",
    type: "features",
    label: "Our Values",
    isLocked: true,
    data: {
      title: "Our Core Values",
      items: [
        { title: "Integrity", description: "Transparency and ethics in everything we do." },
        { title: "Excellence", description: "Striving for the highest quality in education." },
        { title: "Innovation", description: "Adopting modern tools for better learning." },
        { title: "Student-First", description: "Your success is our priority." }
      ]
    }
  },
  {
    id: "about_cta_final",
    type: "cta",
    label: "Final CTA",
    isLocked: true,
    data: {
      title: "Ready to Transform Your Career?",
      content: "Join thousands of students and start your journey today.",
      ctaLabel: "Browse All Courses",
      ctaHref: "/qualifications"
    }
  }
];
