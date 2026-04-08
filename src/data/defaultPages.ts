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
    slug: "about",
    type: "static",
    blocks: [
      { id: "about_hero", type: "hero", label: "About Hero", data: { title: "About Prime College", subtitle: "Broaden your horizons and elevate your career with our industry-leading qualifications.", image: "classroom" } },
      { id: "about_intro", type: "about-split", label: "About Us Intro", data: { headline: "Excellence in Online Learning & Professional Development", paragraphs: ["We provide high-quality education tailored to your career goals."], ctaLabel: "Learn Case Studies", ctaHref: "/about" } },
      { id: "about_approach", type: "why-us", label: "Smart Approach", data: { title: "Smart Approach", content: "Experience the difference with Prime College's unique approach to education.", items: [{ title: "Expert Tutors", description: "Learn from industry professionals.", icon: "Users" }, { title: "Flexible Learning", description: "Study at your own pace.", icon: "Clock" }, { title: "Global Certification", description: "Recognized worldwide.", icon: "Award" }] } },
    ],
    meta: { title: "About – The Prime College", description: "Learn about The Prime College's vision, mission and approach to professional education." },
  },
  {
    id: "contact",
    title: "Contact Us",
    slug: "contact",
    type: "static",
    blocks: [
      { id: "contact_hero", type: "hero", label: "Contact Hero", data: { title: "Get in Touch", subtitle: "Have a question or need assistance? We're here to help you every step of the way.", image: "business" } },
      { id: "contact_form", type: "contact-form", label: "Contact Details & Form", data: { title: "Get in Touch", address: "13 Lanark Square, London E14 9QD", email: "info@primecollege.uk", phone: "+44 20 1234 5678", hours: "Mon - Fri: 9:00 AM - 5:00 PM", formFields: [{ name: "name", label: "Full Name", type: "text", required: true }, { name: "email", label: "Email Address", type: "email", required: true }, { name: "subject", label: "Subject", type: "text", required: false }, { name: "message", label: "Message", type: "textarea", required: true }] } },
      { id: "contact_map", type: "map", label: "Find Us", data: { title: "Find Us", iframeUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2483.234!2d-0.0175!3d51.5075!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x487602d64e0e8b7f%3A0x1234567890abcdef!2s13%20Lanark%20Square%2C%20London%20E14%209QD!5e0!3m2!1sen!2suk!4v1700000000000" } },
    ],
    meta: { title: "Contact Us – The Prime College", description: "Get in touch with The Prime College for any inquiries regarding our qualifications and services." },
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
  // Blog Posts
  {
    id: "blog-how-to-choose-the-right-qualification",
    title: "How to Choose the Right Qualification for Your Career",
    slug: "/blogs/how-to-choose-the-right-qualification",
    type: "blog-post",
    blogMeta: {
      author: "The Prime College",
      date: "12 Feb 2026",
      category: "Career Advice",
      image: "business",
      readTime: "5 min read",
      excerpt: "Navigating the world of professional qualifications can be overwhelming. Here's our guide to finding the perfect course that aligns with your career aspirations and professional goals.",
    },
    blocks: [
      {
        id: "blog1_img",
        type: "hero",
        label: "Featured Image",
        data: { title: "", subtitle: "", image: "business" },
      },
      {
        id: "blog1_intro",
        type: "text",
        label: "Introduction",
        alignment: "left",
        data: {
          title: "Introduction",
          content: "<p>Choosing the right qualification is one of the most impactful decisions you can make for your career. With a wide range of options available — from Level 3 diplomas to Level 7 strategic management programmes — understanding which path aligns with your goals is essential.</p>",
        },
      },
      {
        id: "blog1_goals",
        type: "text",
        label: "Career Goals",
        alignment: "left",
        data: {
          title: "Assess Your Career Goals",
          content: "<p>Before selecting a qualification, take time to reflect on where you want to be in 2–5 years. Are you looking to move into a management role? Do you want to specialise in health and social care? Or are you aiming for a senior leadership position?</p><p>Each qualification level serves a different purpose. Level 3 and 4 qualifications are ideal for those early in their careers, while Level 6 and 7 programmes are designed for experienced professionals seeking strategic and leadership expertise.</p>",
        },
      },
      {
        id: "blog1_accreditation",
        type: "text",
        label: "Accreditation",
        alignment: "left",
        data: {
          title: "Consider Accreditation",
          content: "<p>Always ensure your chosen qualification is accredited by a recognised awarding body such as OTHM, QUALIFI, or CMI. Accredited qualifications carry greater weight with employers and demonstrate that the programme meets rigorous quality standards.</p>",
        },
      },
      {
        id: "blog1_flexibility",
        type: "text",
        label: "Flexibility",
        alignment: "left",
        data: {
          title: "Think About Flexibility",
          content: "<p>Modern learners need flexibility. Look for programmes that allow you to study at your own pace, submit evidence online, and access resources digitally. The Prime College offers exactly this — a structured yet flexible learning experience that fits around your professional commitments.</p>",
        },
      },
      {
        id: "blog1_cta",
        type: "cta",
        label: "Call to Action",
        data: {
          title: "Need Help Choosing?",
          content: "Speak to our team and we'll help you find the right qualification for your goals.",
          ctaLabel: "Contact Us",
          ctaHref: "/contact",
          bgMode: "color",
          bgColor: "#0c2d6b",
        },
      },
    ],
    meta: { title: "How to Choose the Right Qualification – The Prime College", description: "Guide to finding the perfect professional qualification for your career." },
  },
  {
    id: "blog-importance-of-accredited-qualifications",
    title: "The Importance of Accredited Qualifications in the UK Job Market",
    slug: "/blogs/importance-of-accredited-qualifications",
    type: "blog-post",
    blogMeta: {
      author: "The Prime College",
      date: "5 Feb 2026",
      category: "Industry Insights",
      image: "executive",
      readTime: "4 min read",
      excerpt: "Employers increasingly value Ofqual-regulated qualifications. Learn why accredited diplomas from OTHM and QUALIFI can give you a competitive edge in today's market.",
    },
    blocks: [
      {
        id: "blog2_img",
        type: "hero",
        label: "Featured Image",
        data: { title: "", subtitle: "", image: "executive" },
      },
      {
        id: "blog2_why",
        type: "text",
        label: "Why It Matters",
        alignment: "left",
        data: {
          title: "Why Accreditation Matters",
          content: "<p>In an increasingly competitive job market, having an accredited qualification can set you apart from other candidates. Employers trust qualifications that are regulated by Ofqual and awarded by recognised bodies because they guarantee a standard of learning and assessment.</p>",
        },
      },
      {
        id: "blog2_ofqual",
        type: "text",
        label: "Ofqual",
        alignment: "left",
        data: {
          title: "What Is Ofqual Regulation?",
          content: "<p>Ofqual (the Office of Qualifications and Examinations Regulation) is the government body responsible for maintaining standards in qualifications in England. When a qualification is Ofqual-regulated, it means the content, assessment methods, and awarding processes have been rigorously reviewed.</p>",
        },
      },
      {
        id: "blog2_bodies",
        type: "text",
        label: "Awarding Bodies",
        alignment: "left",
        data: {
          title: "Recognised Awarding Bodies",
          content: "<p>The Prime College works with leading awarding organisations including OTHM, QUALIFI, VTCT, and CMI. Each of these bodies is recognised for delivering high-quality, industry-relevant qualifications that employers respect.</p>",
        },
      },
      {
        id: "blog2_impact",
        type: "text",
        label: "Career Impact",
        alignment: "left",
        data: {
          title: "Career Impact",
          content: "<p>Accredited qualifications can lead to higher salaries, faster promotions, and greater job security. Many employers require specific qualification levels for management and leadership roles, making investment in accredited education a strategic career move.</p>",
        },
      },
    ],
    meta: { title: "Importance of Accredited Qualifications – The Prime College", description: "Why accredited qualifications matter in the UK job market." },
  },
  {
    id: "blog-prime-college-100-percent-completion-rate",
    title: "The Prime College Achieves 100% Learner Completion Rate",
    slug: "/blogs/prime-college-100-percent-completion-rate",
    type: "blog-post",
    blogMeta: {
      author: "The Prime College",
      date: "28 Jan 2026",
      category: "College News",
      image: "classroom",
      readTime: "3 min read",
      excerpt: "We're proud to announce that The Prime College has maintained a 100% completion rate across all programmes, reflecting our commitment to learner success and support.",
    },
    blocks: [
      {
        id: "blog3_img",
        type: "hero",
        label: "Featured Image",
        data: { title: "", subtitle: "", image: "classroom" },
      },
      {
        id: "blog3_milestone",
        type: "text",
        label: "Milestone",
        alignment: "left",
        data: {
          title: "A Milestone Achievement",
          content: "<p>The Prime College is proud to announce that we have achieved and maintained a 100% learner completion rate across all of our qualification programmes. This milestone reflects our unwavering commitment to learner success and the effectiveness of our support systems.</p>",
        },
      },
      {
        id: "blog3_how",
        type: "text",
        label: "How We Achieve This",
        alignment: "left",
        data: {
          title: "How We Achieve This",
          content: "<p>Our success is built on several key pillars:</p><ul><li><strong>Dedicated Tutor Support:</strong> Every learner is assigned a personal tutor who provides ongoing guidance, feedback, and encouragement.</li><li><strong>Flexible Learning:</strong> Our platform allows learners to study at their own pace.</li><li><strong>Quality Resources:</strong> Comprehensive learning materials help learners understand exactly what is expected.</li><li><strong>Timely Feedback:</strong> Our trainers provide prompt, constructive assessment feedback.</li></ul>",
        },
      },
      {
        id: "blog3_meaning",
        type: "text",
        label: "What This Means",
        alignment: "left",
        data: {
          title: "What This Means for You",
          content: "<p>When you enrol with The Prime College, you're choosing a provider with a proven track record of helping every single learner achieve their qualification. We don't just enrol learners — we see them through to completion.</p>",
        },
      },
    ],
    meta: { title: "100% Completion Rate – The Prime College", description: "The Prime College maintains a 100% learner completion rate." },
  },
];
