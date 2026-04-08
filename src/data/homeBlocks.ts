import { ContentBlock } from "@/types/pageBuilder";

export const getHomeDefaultBlocks = (): ContentBlock[] => [
  {
    id: "home_popular",
    type: "qualification_slider",
    label: "Qualification Slider",
    isLocked: true,
    isFixed: true,
    data: {
      selection_mode: "latest",
      qualification_ids: [],
      show_count: 4,
      autoplay: true,
      delay_ms: 5000,
    }
  },
  {
    id: "home_welcome",
    type: "text",
    label: "Welcome Section",
    isLocked: true,
    data: {
      title: "Welcome to Prime College",
      content: "Broaden your horizons and elevate your career with our industry-leading qualifications."
    }
  },
  {
    id: "home_about",
    type: "about-split",
    label: "About Section",
    isLocked: true,
    data: {
      headline: "Excellence in Online Learning & Professional Development",
      paragraphs: ["We provide high-quality education tailored to your career goals."],
      ctaLabel: "Learn Case Studies",
      ctaHref: "/about"
    }
  },
  {
    id: "home_why_us",
    type: "why-us",
    label: "Why Choose Us",
    isLocked: true,
    data: {
      title: "Why Choose Us",
      content: "Experience the difference with Prime College's unique approach to education.",
      items: [
        { title: "Expert Tutors", description: "Learn from industry professionals.", icon: "Users" },
        { title: "Flexible Learning", description: "Study at your own pace.", icon: "Award" },
        { title: "Global Certification", description: "Recognized worldwide.", icon: "CheckCircle" }
      ]
    }
  },
  {
    id: "home_stats",
    type: "stats",
    label: "Success Statistics",
    isLocked: true,
    data: {
      title: "Our Impact in Numbers",
      content: "We take pride in our students' success around the globe.",
      items: [
        { title: "Students", value: "50,000+", description: "Satisfied learners" },
        { title: "Courses", value: "200+", description: "Accredited programs" },
        { title: "Success Rate", value: "98%", description: "Completion rate" }
      ]
    }
  },
  {
    id: "home_logos",
    type: "logos",
    label: "Accreditation Logos",
    isLocked: true,
    data: {
      title: "Our Accreditations",
      items: []
    }
  },
  {
    id: "home_features",
    type: "features",
    label: "Platform Features",
    isLocked: true,
    data: {
      title: "Modern Learning Experience",
      items: [
        { title: "Interactive Content", description: "Engaging video and text." },
        { title: "Mobile Ready", description: "Learn on any device." }
      ]
    }
  },
  {
    id: "home_cta",
    type: "cta",
    label: "Final Call to Action",
    isLocked: true,
    data: {
      title: "Ready to Transform Your Career?",
      content: "Join thousands of students and start your journey today.",
      ctaLabel: "Browse All Courses",
      ctaHref: "/qualifications"
    }
  },
  {
    id: "home_blog",
    type: "blog",
    label: "Latest From Our Blog",
    isLocked: true,
    data: {
      title: "Insights & Industry News",
      items: []
    }
  }
];
