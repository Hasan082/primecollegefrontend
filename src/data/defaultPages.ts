import type { PageConfig } from "@/types/pageBuilder";

// Default page configurations derived from existing JSON content
export const defaultPages: PageConfig[] = [
  {
    id: "home",
    title: "Home Page",
    slug: "/",
    type: "static",
    blocks: [
      {
        id: "home_welcome",
        type: "text",
        label: "Welcome Section",
        data: {
          title: "Welcome to The Prime College",
          content: "The Prime College is a leading provider of professional qualifications in the UK. We offer a wide range of nationally and internationally recognised qualifications in Business, Management, and Health & Social Care.",
        },
      },
      {
        id: "home_about",
        type: "image-text",
        label: "About Split",
        data: {
          headline: "We help individuals succeed in their careers by developing knowledge, skills and professional behaviours.",
          paragraphs: [
            "The Prime College (TPC) offers comprehensive training programs tailored to various industries.",
            "TPC regularly reviews and updates its curriculum to reflect industry advancements.",
          ],
          ctaLabel: "Read More →",
          ctaHref: "/about",
          imagePosition: "right",
        },
      },
      {
        id: "home_whyus",
        type: "why-us",
        label: "Why Choose Us",
        data: {
          title: "Why Choose Us",
          content: "We are committed to upholding the highest standards of quality, professionalism, and employee wellbeing.",
          items: [
            { title: "What we do", icon: "Users", description: "We specialise in one-on-one or group sessions." },
            { title: "How we do it", icon: "Award", description: "We provide teaching experts to develop programs that align with the industry standards." },
            { title: "Who is it for", icon: "CheckCircle", description: "Any person that is 18 and over and wishes to improve their CPD and employment prospects." },
          ],
        },
      },
      {
        id: "home_popular",
        type: "cards",
        label: "Popular Qualifications",
        data: {
          title: "Popular Qualifications",
          items: [
            { title: "OTHM Level 7 Diploma in Strategic Management and Leadership", category: "Management", level: "Level 7", price: "£1,500", image: "classroom" },
            { title: "OTHM Level 6 Diploma in Business Management", category: "Business", level: "Level 6", price: "£1,350", image: "executive" },
          ],
        },
      },
      {
        id: "home_stats",
        type: "stats",
        label: "Statistics",
        data: {
          title: "The Prime College's Delivery Standard",
          subtitle: "Through ISO9001 and Investors In People, our teaching model means we deliver qualifications that ensure we maintain a high standard.",
          items: [
            { title: "Training Courses", value: "27", description: "From Level 1 up to Level 7." },
            { title: "Different Countries", value: "5", description: "Courses delivered internationally." },
            { title: "Completion Rate", value: "100%", description: "Committed to every learner achieving their qualification." },
          ],
        },
      },
      {
        id: "home_logos",
        type: "logos",
        label: "Accreditation Logos",
        data: {
          title: "Awarding Bodies, Awards and Accreditations",
          items: [
            { title: "VTCT Approved" },
            { title: "Investors In People" },
            { title: "ISO 9001" },
            { title: "CMI Centre" },
          ],
        },
      },
      {
        id: "home_cta",
        type: "cta",
        label: "CTA Section",
        data: {
          title: "Start Your Journey Today",
          content: "Whether you are looking to start a new career, advance in your current role, or gain specialist knowledge, The Prime College has a qualification for you.",
          ctaLabel: "Contact Us",
          ctaHref: "/contact",
        },
      },
    ],
    meta: {
      title: "The Prime College – Professional Qualifications UK",
      description: "Leading provider of professional qualifications in Business, Management, and Health & Social Care.",
    },
  },
  {
    id: "about",
    title: "About Us",
    slug: "/about",
    type: "static",
    blocks: [
      { id: "about_hero", type: "hero", label: "Hero Banner", data: { title: "About The Prime College", subtitle: "A leading provider of professional qualifications", image: "classroom" } },
      { id: "about_text", type: "text", label: "Introduction", data: { title: "Our Story", content: "The Prime College has been providing high-quality professional qualifications since its founding." } },
      { id: "about_stats", type: "stats", label: "Key Figures", data: { title: "Our Impact", items: [{ title: "Learners", value: "500+", description: "Learners trained" }] } },
    ],
    meta: { title: "About – The Prime College", description: "Learn about The Prime College." },
  },
  {
    id: "recruitment",
    title: "Recruitment",
    slug: "/recruitment",
    type: "static",
    blocks: [
      { id: "rec_hero", type: "hero", label: "Hero Banner", data: { title: "Recruitment Services", subtitle: "Connecting talent with opportunity", image: "business" } },
      { id: "rec_text", type: "text", label: "Overview", data: { title: "Our Recruitment Services", content: "The Prime College offers a comprehensive recruitment service." } },
    ],
    meta: { title: "Recruitment – The Prime College", description: "Explore recruitment opportunities." },
  },
];
