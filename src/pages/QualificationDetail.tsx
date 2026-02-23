import { useParams, Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import qualificationsBanner from "@/assets/qualifications-banner.jpg";
import heroClassroom from "@/assets/hero-classroom.jpg";
import heroBusiness from "@/assets/hero-business.jpg";
import heroCare from "@/assets/hero-care.jpg";
import CTASection from "@/components/CTASection";
import UpsellModal from "@/components/UpsellModal";
import { useCart } from "@/contexts/CartContext";

// Dummy data for all qualifications - keyed by slug
const qualificationsData: Record<string, {
  title: string;
  category: string;
  level: string;
  duration: string;
  price: string;
  description: string;
  image: string;
  courseStructure: { title: string; description: string }[];
  faqs: { question: string; answer: string }[];
  relatedSlugs: string[];
}> = {
  "othm-level-4-diploma-in-business-management": {
    title: "OTHM Level 4 Diploma in Business Management",
    category: "Business",
    level: "Level 4",
    duration: "9 months",
    price: "£1,000",
    description: "The OTHM Level 4 Diploma in Business Management is designed for learners who wish to gain a strong foundation in business management principles. This qualification provides the essential knowledge and skills needed to progress in the business world, covering key areas such as business environment, resource management, and business communication. Ideal for those starting their management career or looking to formalise their existing skills.",
    image: "business",
    courseStructure: [
      { title: "The Business Environment", description: "Understanding the key factors that influence business operations and decision-making in various contexts." },
      { title: "People Management", description: "Developing essential skills in managing people, teams, and organisational behaviour effectively." },
      { title: "Business Communication", description: "Mastering professional communication strategies for internal and external stakeholders." },
      { title: "Introduction to Business Finance", description: "Learning foundational financial principles including budgeting, forecasting, and financial reporting." },
      { title: "Business Decision Making", description: "Applying analytical tools and techniques to make informed business decisions." },
      { title: "Resource Management", description: "Understanding how to plan, allocate, and manage organisational resources efficiently." },
    ],
    faqs: [
      { question: "What are the entry requirements for this course?", answer: "Learners should be 18 years or older. No formal qualifications are required, but relevant work experience is beneficial." },
      { question: "Is this qualification recognised by employers?", answer: "Yes, OTHM qualifications are regulated by Ofqual and recognised by employers and universities across the UK and internationally." },
      { question: "Can I study while working full-time?", answer: "Absolutely. Our flexible learning approach allows you to study at your own pace alongside your professional commitments." },
    ],
    relatedSlugs: ["othm-level-5-extended-diploma-in-business-management", "othm-level-6-diploma-in-business-management", "othm-level-7-diploma-in-strategic-management-and-leadership"],
  },
  "othm-level-5-extended-diploma-in-business-management": {
    title: "OTHM Level 5 Extended Diploma in Business Management",
    category: "Business",
    level: "Level 5",
    duration: "12 months",
    price: "£1,200",
    description: "The OTHM Level 5 Extended Diploma in Business Management builds upon the foundational knowledge gained at Level 4, providing learners with advanced understanding of business management practices. This qualification is ideal for mid-level managers seeking to enhance their strategic capabilities and progress toward senior management roles or further academic study.",
    image: "business",
    courseStructure: [
      { title: "Principles of Management", description: "Exploring core management theories and their practical application in modern organisations." },
      { title: "Business Research Methods", description: "Developing robust research skills for analysing business problems and opportunities." },
      { title: "Managing Financial Resources", description: "Advanced financial management techniques including investment appraisal and cost analysis." },
      { title: "Leading and Managing Teams", description: "Strategies for effective leadership, team development, and performance management." },
      { title: "Marketing Strategy", description: "Developing comprehensive marketing plans aligned with organisational objectives." },
      { title: "Operations Management", description: "Understanding supply chain management, quality control, and operational efficiency." },
    ],
    faqs: [
      { question: "What qualifications do I need to enrol?", answer: "A Level 4 qualification or equivalent, or relevant management experience is recommended." },
      { question: "How is the course assessed?", answer: "Assessment is through assignments and case studies. There are no exams." },
      { question: "Can I pay in instalments?", answer: "Yes, we offer flexible payment plans. Please contact us for more details." },
    ],
    relatedSlugs: ["othm-level-4-diploma-in-business-management", "othm-level-6-diploma-in-business-management", "othm-level-7-diploma-in-strategic-management-and-leadership"],
  },
  "othm-level-6-diploma-in-business-management": {
    title: "OTHM Level 6 Diploma in Business Management",
    category: "Business",
    level: "Level 6",
    duration: "9 months",
    price: "£1,350",
    description: "The OTHM Level 6 Diploma in Business Management is designed for learners who want to develop their advanced business management skills and prepare for senior management roles or postgraduate study. This qualification covers strategic management, corporate responsibility, and advanced financial management to equip learners with the competencies needed at the highest levels of business leadership.",
    image: "business",
    courseStructure: [
      { title: "Strategic Business Management", description: "Analysing and developing strategic plans for sustainable business growth and competitive advantage." },
      { title: "Corporate Responsibility and Ethics", description: "Understanding the role of ethics, CSR, and governance in modern business practice." },
      { title: "Advanced Financial Management", description: "Complex financial analysis, risk management, and strategic financial decision-making." },
      { title: "Global Business Environment", description: "Examining the challenges and opportunities of operating in international markets." },
      { title: "Innovation and Entrepreneurship", description: "Fostering innovation and understanding entrepreneurial approaches to business development." },
      { title: "Strategic Human Resource Management", description: "Aligning HR strategy with organisational goals for optimal workforce performance." },
    ],
    faqs: [
      { question: "Is this equivalent to a degree?", answer: "The Level 6 Diploma is equivalent to the final year of an undergraduate degree and can provide entry to a master's programme." },
      { question: "How long does it take to complete?", answer: "The standard duration is 9 months, but flexible study options are available." },
      { question: "Are there any exams?", answer: "No, assessment is entirely through coursework, assignments, and case studies." },
    ],
    relatedSlugs: ["othm-level-5-extended-diploma-in-business-management", "othm-level-7-diploma-in-strategic-management-and-leadership", "othm-level-4-diploma-in-business-management"],
  },
  "othm-level-7-diploma-in-strategic-management-and-leadership": {
    title: "OTHM Level 7 Diploma in Strategic Management and Leadership",
    category: "Management",
    level: "Level 7",
    duration: "12 months",
    price: "£1,500",
    description: "The OTHM Level 7 Diploma in Strategic Management and Leadership is designed for managers and leaders who have the authority and inspiration to translate organisational strategy into effective operational performance. This qualification develops the strategic leadership skills required at the highest levels of management, providing a pathway to an MBA top-up or senior leadership roles.",
    image: "leadership",
    courseStructure: [
      { title: "Strategic Management", description: "Developing and implementing strategies for organisational success in complex business environments." },
      { title: "Strategic Leadership", description: "Advanced leadership theories and their application in driving organisational transformation." },
      { title: "Strategic Human Resource Management", description: "Managing human capital strategically to achieve long-term organisational objectives." },
      { title: "Advanced Business Research Methods", description: "Sophisticated research methodologies for evidence-based strategic decision-making." },
      { title: "Strategic Financial Management", description: "High-level financial planning, analysis, and control for strategic management purposes." },
      { title: "Supply Chain and Operations Management", description: "Optimising supply chain strategies and operational processes for competitive advantage." },
    ],
    faqs: [
      { question: "Can this lead to an MBA?", answer: "Yes, upon completion you can top up to a full MBA with our university partners in as little as 6 months." },
      { question: "Who is this qualification for?", answer: "This is ideal for senior managers, directors, and aspiring executives looking to enhance their strategic capabilities." },
      { question: "What is the mode of delivery?", answer: "We offer flexible blended learning combining online resources with face-to-face sessions." },
    ],
    relatedSlugs: ["qualifi-level-7-diploma-in-strategic-management-and-leadership", "othm-level-6-diploma-in-business-management", "othm-level-5-extended-diploma-in-business-management"],
  },
  "qualifi-level-7-diploma-in-strategic-management-and-leadership": {
    title: "QUALIFI Level 7 Diploma in Strategic Management and Leadership",
    category: "Management",
    level: "Level 7",
    duration: "12 months",
    price: "£1,600",
    description: "The QUALIFI Level 7 Diploma in Strategic Management and Leadership is an advanced qualification for senior professionals looking to enhance their strategic leadership capabilities. This programme develops critical thinking, strategic planning, and leadership skills necessary to operate at the highest levels of organisational management, with direct progression routes to MBA programmes.",
    image: "leadership",
    courseStructure: [
      { title: "Manage Team Performance", description: "Techniques for monitoring, evaluating, and improving team performance across the organisation." },
      { title: "Strategic Direction", description: "Setting and communicating strategic direction aligned with organisational vision and mission." },
      { title: "Strategic Planning", description: "Comprehensive strategic planning methodologies for long-term organisational success." },
      { title: "Development as a Strategic Manager", description: "Personal and professional development for strategic leadership effectiveness." },
      { title: "Strategic Change Management", description: "Leading and managing organisational change initiatives for successful transformation." },
      { title: "Strategic Marketing", description: "Developing and implementing marketing strategies at the strategic level." },
    ],
    faqs: [
      { question: "How is QUALIFI different from OTHM?", answer: "Both are Ofqual-regulated awarding bodies. QUALIFI offers a slightly different curriculum focus but both are equally recognised." },
      { question: "What are the entry requirements?", answer: "A Level 6 qualification or significant management experience at a senior level is required." },
      { question: "Can I pay in instalments?", answer: "Yes, flexible payment plans are available. Contact us to discuss options." },
    ],
    relatedSlugs: ["othm-level-7-diploma-in-strategic-management-and-leadership", "othm-level-7-diploma-in-healthcare-management", "othm-level-6-diploma-in-business-management"],
  },
  "qualifi-level-3-diploma-in-health-and-social-care": {
    title: "QUALIFI Level 3 Diploma in Health and Social Care",
    category: "Care",
    level: "Level 3",
    duration: "6 months",
    price: "£950",
    description: "The QUALIFI Level 3 Diploma in Health and Social Care provides foundational knowledge and understanding of the health and social care sector. This qualification is ideal for individuals seeking to enter the care profession or those already working in care who want to formalise their knowledge. It covers essential topics including safeguarding, communication, and person-centred care approaches.",
    image: "care",
    courseStructure: [
      { title: "Introduction to Health and Social Care", description: "Understanding the fundamental principles and values underpinning health and social care practice." },
      { title: "Safeguarding and Protection", description: "Learning how to recognise and respond to safeguarding concerns in care settings." },
      { title: "Effective Communication", description: "Developing verbal and non-verbal communication skills for working with service users." },
      { title: "Understanding Customer Needs", description: "Learning how to identify and respond to the diverse needs of service users effectively." },
      { title: "Problem-Solving in Care Settings", description: "Techniques for addressing challenges and resolving issues in care environments." },
      { title: "Legislation and Regulation", description: "Developing knowledge of key legislation and regulatory frameworks governing care practice." },
    ],
    faqs: [
      { question: "Do I need previous care experience?", answer: "No prior experience is required. This qualification is designed as an entry point into the care sector." },
      { question: "Will this help me get a job in care?", answer: "Yes, this qualification is widely recognised by care employers and provides a strong foundation for a care career." },
      { question: "Can I progress to higher-level qualifications?", answer: "Yes, successful completion can lead to Level 4 and Level 5 qualifications in Health and Social Care." },
    ],
    relatedSlugs: ["othm-level-5-diploma-in-health-and-social-care-management", "othm-level-7-diploma-in-healthcare-management", "qualifi-level-7-diploma-in-strategic-management-and-leadership"],
  },
  "othm-level-5-diploma-in-health-and-social-care-management": {
    title: "OTHM Level 5 Diploma in Health and Social Care Management",
    category: "Care",
    level: "Level 5",
    duration: "9 months",
    price: "£1,100",
    description: "The OTHM Level 5 Diploma in Health and Social Care Management is designed for those who wish to develop specialist knowledge and skills in managing health and social care services. This qualification prepares learners for leadership roles within the care sector, covering essential topics such as policy development, service improvement, and managing quality standards.",
    image: "care",
    courseStructure: [
      { title: "Principles of Health and Social Care Policy", description: "Analysing and understanding the policy frameworks that govern health and social care delivery." },
      { title: "Managing Quality in Care", description: "Implementing and maintaining quality standards across health and social care services." },
      { title: "Partnership Working in Care", description: "Developing effective multi-agency partnerships for improved service delivery." },
      { title: "Safeguarding in Health and Social Care", description: "Advanced safeguarding practices and risk management in care environments." },
      { title: "Leadership in Health and Social Care", description: "Developing leadership capabilities specific to the health and social care sector." },
      { title: "Managing Resources in Care Settings", description: "Effective resource planning, allocation, and management in care organisations." },
    ],
    faqs: [
      { question: "Is this suitable for current care managers?", answer: "Yes, this qualification is perfect for existing care managers looking to enhance their management skills and gain formal recognition." },
      { question: "What career opportunities does this open?", answer: "Graduates can pursue roles such as Care Home Manager, Service Manager, or Health and Social Care Coordinator." },
      { question: "How is the course delivered?", answer: "Through a blend of online learning resources, assignments, and supported study sessions." },
    ],
    relatedSlugs: ["qualifi-level-3-diploma-in-health-and-social-care", "othm-level-7-diploma-in-healthcare-management", "othm-level-7-diploma-in-strategic-management-and-leadership"],
  },
  "othm-level-7-diploma-in-healthcare-management": {
    title: "OTHM Level 7 Diploma in Healthcare Management",
    category: "Care",
    level: "Level 7",
    duration: "12 months",
    price: "£1,500",
    description: "The OTHM Level 7 Diploma in Healthcare Management is a specialist qualification designed for healthcare professionals aspiring to senior management positions. This programme develops advanced strategic management and leadership skills within the context of healthcare, preparing learners for director-level roles and providing a pathway to postgraduate study including MBA Healthcare top-up programmes.",
    image: "care",
    courseStructure: [
      { title: "Strategic Healthcare Management", description: "Developing and implementing strategic plans for healthcare organisations and services." },
      { title: "Healthcare Quality and Patient Safety", description: "Advanced quality improvement methodologies and patient safety frameworks." },
      { title: "Healthcare Leadership", description: "Transformational leadership approaches tailored to healthcare environments." },
      { title: "Health Policy and Systems", description: "Critical analysis of health policy, systems, and their impact on service delivery." },
      { title: "Research Methods for Healthcare", description: "Evidence-based research methodologies specific to healthcare management." },
      { title: "Financial Management in Healthcare", description: "Strategic financial management and resource allocation in healthcare organisations." },
    ],
    faqs: [
      { question: "Can this lead to an MBA in Healthcare?", answer: "Yes, this qualification provides direct entry to MBA Healthcare Management top-up programmes with our university partners." },
      { question: "Who should take this qualification?", answer: "Senior healthcare professionals, clinical managers, and those aspiring to director-level positions in healthcare organisations." },
      { question: "Is the qualification internationally recognised?", answer: "Yes, OTHM Level 7 qualifications are recognised globally, making it valuable for international healthcare careers." },
    ],
    relatedSlugs: ["othm-level-5-diploma-in-health-and-social-care-management", "othm-level-7-diploma-in-strategic-management-and-leadership", "qualifi-level-3-diploma-in-health-and-social-care"],
  },
  "paediatric-first-aid-training-level-3": {
    title: "Paediatric First Aid Training (Level 3)",
    category: "First Aid",
    level: "Level 3",
    duration: "2 days",
    price: "£120",
    description: "This comprehensive paediatric first aid qualification is designed for anyone working with or caring for infants and children. The course covers a wide range of emergency procedures specific to babies and young children, including CPR, choking, seizures, and allergic reactions. Ideal for childcare professionals, nursery workers, childminders, teachers, and parents who want to feel confident responding to childhood emergencies.",
    image: "care",
    courseStructure: [
      { title: "Paediatric CPR & Resuscitation", description: "Hands-on training in infant and child CPR techniques, including the use of AEDs adapted for paediatric use." },
      { title: "Choking in Infants and Children", description: "Recognising and treating choking episodes in babies and young children with age-appropriate techniques." },
      { title: "Managing Childhood Illnesses", description: "Identifying symptoms of common childhood illnesses such as meningitis, asthma attacks, and febrile convulsions." },
      { title: "Bleeding, Burns & Fractures", description: "Treating wounds, burns, scalds, and suspected fractures in infants and children." },
      { title: "Allergic Reactions & Anaphylaxis", description: "Recognising severe allergic reactions and administering emergency treatment including auto-injectors." },
      { title: "Record Keeping & Reporting", description: "Understanding legal requirements for recording incidents and reporting to relevant authorities." },
    ],
    faqs: [
      { question: "Who should take this course?", answer: "Anyone working with children, including nursery staff, childminders, teachers, teaching assistants, and parents." },
      { question: "Is this qualification Ofsted recognised?", answer: "Yes, this Level 3 Paediatric First Aid qualification meets Ofsted and Early Years Foundation Stage (EYFS) requirements." },
      { question: "How long is the certificate valid?", answer: "The certificate is valid for 3 years, after which a refresher course is recommended." },
    ],
    relatedSlugs: ["first-aid-at-work-course-level-3", "emergency-first-aid-at-work-course-level-3", "basic-life-support-training-course"],
  },
  "first-aid-at-work-course-level-3": {
    title: "First Aid at Work Course (Level 3)",
    category: "First Aid",
    level: "Level 3",
    duration: "3 days",
    price: "£180",
    description: "This HSE-approved First Aid at Work qualification provides comprehensive training in workplace first aid procedures and emergency response. Covering a wide range of injuries and medical emergencies, this course equips learners with the skills and confidence to act as designated first aiders in any workplace. Suitable for all industries and mandatory for higher-risk work environments.",
    image: "care",
    courseStructure: [
      { title: "Roles & Responsibilities of a First Aider", description: "Understanding the legal framework, duty of care, and responsibilities when acting as a workplace first aider." },
      { title: "CPR & AED Use", description: "Practical training in adult cardiopulmonary resuscitation and automated external defibrillator use." },
      { title: "Managing Unconsciousness", description: "Assessing and managing unconscious casualties, including the recovery position and airway management." },
      { title: "Wound Management & Bleeding Control", description: "Treating cuts, lacerations, and managing severe bleeding including tourniquet application." },
      { title: "Burns, Scalds & Eye Injuries", description: "Appropriate first aid treatment for thermal, chemical, and electrical burns, as well as eye injuries." },
      { title: "Medical Emergencies", description: "Recognising and responding to heart attacks, strokes, diabetic emergencies, seizures, and anaphylaxis." },
    ],
    faqs: [
      { question: "Is this course HSE approved?", answer: "Yes, this course meets the Health and Safety Executive (HSE) requirements for workplace first aid training." },
      { question: "How many first aiders does my workplace need?", answer: "This depends on your workplace risk assessment. Generally, higher-risk environments require more trained first aiders." },
      { question: "Can I renew my certificate?", answer: "Yes, a 2-day requalification course is available before your 3-year certificate expires." },
    ],
    relatedSlugs: ["emergency-first-aid-at-work-course-level-3", "paediatric-first-aid-training-level-3", "basic-life-support-training-course"],
  },
  "basic-life-support-training-course": {
    title: "Basic Life Support Training Course",
    category: "First Aid",
    level: "Level 2",
    duration: "1 day",
    price: "£75",
    description: "This essential Basic Life Support (BLS) training course provides learners with the fundamental skills needed to respond to life-threatening emergencies. Covering adult, child, and infant resuscitation techniques, this course is ideal for healthcare workers, carers, dental staff, and anyone who wants to learn how to save a life. The practical, hands-on approach ensures confidence in real-world emergency situations.",
    image: "care",
    courseStructure: [
      { title: "Chain of Survival", description: "Understanding the critical steps from early recognition to emergency services handover that maximise survival chances." },
      { title: "Adult CPR Techniques", description: "Practical training in performing effective chest compressions and rescue breaths on adults." },
      { title: "Child & Infant CPR", description: "Adapting resuscitation techniques for children and infants with age-appropriate methods." },
      { title: "AED Familiarisation", description: "Learning to confidently use an automated external defibrillator in cardiac arrest emergencies." },
      { title: "Recovery Position", description: "Safely placing an unconscious breathing casualty into the recovery position to maintain their airway." },
      { title: "Choking Management", description: "Recognising and treating choking in adults, children, and infants using appropriate techniques." },
    ],
    faqs: [
      { question: "Who is this course suitable for?", answer: "Anyone who may need to perform CPR, including healthcare professionals, care workers, dental staff, gym instructors, and members of the public." },
      { question: "Do I need any prior training?", answer: "No prior first aid training is required. This course is suitable for complete beginners." },
      { question: "Is this course accredited?", answer: "Yes, this course is accredited and meets UK Resuscitation Council guidelines." },
    ],
    relatedSlugs: ["first-aid-at-work-course-level-3", "emergency-first-aid-at-work-course-level-3", "paediatric-first-aid-training-level-3"],
  },
  "emergency-first-aid-at-work-course-level-3": {
    title: "Emergency First Aid at Work Course (Level 3)",
    category: "First Aid",
    level: "Level 3",
    duration: "1 day",
    price: "£95",
    description: "This one-day Emergency First Aid at Work (EFAW) course is designed for lower-risk workplaces where a basic level of first aid provision is required. It covers essential life-saving skills including CPR, treating wounds, and managing common workplace injuries. This qualification meets HSE requirements and is ideal for offices, shops, and other low-hazard environments.",
    image: "care",
    courseStructure: [
      { title: "First Aid Priorities & Procedures", description: "Understanding the role of the emergency first aider and how to assess an incident scene safely." },
      { title: "CPR & Basic Resuscitation", description: "Performing effective CPR on adults and understanding when to use an AED." },
      { title: "Managing Bleeding & Wounds", description: "Controlling minor and severe bleeding, applying dressings, and managing wound infections." },
      { title: "Shock Recognition & Treatment", description: "Identifying the signs of shock and providing appropriate first aid treatment." },
      { title: "Minor Injuries", description: "Treating common workplace injuries such as sprains, strains, minor burns, and small cuts." },
      { title: "Calling Emergency Services", description: "Understanding when and how to contact emergency services and what information to provide." },
    ],
    faqs: [
      { question: "What is the difference between EFAW and FAW?", answer: "EFAW is a 1-day course for low-risk workplaces, while FAW is a 3-day course providing more comprehensive training for higher-risk environments." },
      { question: "Is this sufficient for my workplace?", answer: "If your workplace risk assessment identifies it as low-risk, EFAW certification is typically sufficient. Higher-risk workplaces may require the full 3-day FAW course." },
      { question: "How long is the certificate valid?", answer: "The certificate is valid for 3 years. We recommend booking a refresher course before it expires." },
    ],
    relatedSlugs: ["first-aid-at-work-course-level-3", "basic-life-support-training-course", "paediatric-first-aid-training-level-3"],
  },
};

const imageMap: Record<string, string> = {
  business: heroBusiness,
  leadership: heroClassroom,
  care: heroCare,
};

const QualificationDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showUpsell, setShowUpsell] = useState(false);
  const { addItem } = useCart();
  const qual = slug ? qualificationsData[slug] : null;

  if (!qual) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-3xl font-bold text-foreground mb-4">Qualification Not Found</h1>
        <p className="text-muted-foreground mb-6">The qualification you're looking for doesn't exist.</p>
        <Link to="/qualifications" className="bg-primary text-primary-foreground px-6 py-3 rounded font-semibold hover:opacity-90">
          View All Qualifications
        </Link>
      </div>
    );
  }

  const relatedQuals = qual.relatedSlugs
    .map((s) => ({ slug: s, ...qualificationsData[s] }))
    .filter((r) => r.title);

  return (
    <div>
      {/* Hero Section - Dark overlay on image */}
      <section className="relative h-[400px] md:h-[480px] overflow-hidden">
        <img
          src={imageMap[qual.image] || heroBusiness}
          alt={qual.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/75 to-primary/20" />
        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-4 leading-tight">
                {qual.title}
              </h1>
              <p className="text-primary-foreground/85 leading-relaxed text-base md:text-lg mb-6 max-w-2xl">
                {qual.description}
              </p>
              <div className="flex flex-wrap gap-3">
                <span className="bg-secondary text-secondary-foreground text-xs font-bold px-4 py-2 rounded uppercase">
                  {qual.category}
                </span>
                <span className="bg-primary-foreground/20 text-primary-foreground text-xs font-bold px-4 py-2 rounded">
                  {qual.level}
                </span>
                <span className="bg-primary-foreground/20 text-primary-foreground text-xs font-bold px-4 py-2 rounded">
                  {qual.duration}
                </span>
                <span className="bg-primary-foreground/20 text-primary-foreground text-xs font-bold px-4 py-2 rounded">
                  {qual.price}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Enroll Bar */}
      <section className="bg-secondary py-4">
        <div className="container mx-auto px-4 flex flex-wrap items-center justify-between gap-4">
          <p className="text-secondary-foreground font-semibold text-sm md:text-base">
            Ready to start your journey? Enroll today and transform your career.
          </p>
          <button
            onClick={() => {
              addItem({
                slug: slug!,
                title: qual.title,
                level: qual.level,
                duration: qual.duration,
                price: qual.price,
                category: qual.category,
              });
              setShowUpsell(true);
            }}
            className="bg-primary text-primary-foreground px-8 py-2.5 font-semibold rounded text-sm hover:opacity-90 transition-opacity whitespace-nowrap"
          >
            Enroll Now – {qual.price}
          </button>
        </div>
      </section>

      {/* Two-column: Why This Qualification + Image */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-secondary mb-2 block">
                Why Choose This Qualification
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                Build Confidence & Advance Your Career
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                {qual.description}
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Our expert tutors are industry leaders with over 20 years of experience in coaching and mentoring learners. We provide live sessions with ongoing support and resources to ensure our learners succeed.
              </p>
            </div>
            <div className="rounded-lg overflow-hidden shadow-lg">
              <img
                src={imageMap[qual.image] || heroBusiness}
                alt={qual.title}
                className="w-full h-[320px] object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Course Structure */}
      <section className="py-16 px-4 bg-accent/30">
        <div className="container mx-auto">
          <div className="text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-secondary">
              Flexible Learning
            </span>
            <h2 className="text-3xl font-bold text-foreground mt-2">Qualification Structure</h2>
            <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
              This qualification covers a comprehensive range of topics to provide learners with the knowledge and skills needed for success.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {qual.courseStructure.map((module, index) => (
              <div
                key={index}
                className="bg-card border border-border rounded-lg p-6 hover:border-secondary hover:shadow-md transition-all"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <span className="text-primary font-bold text-sm">{String(index + 1).padStart(2, '0')}</span>
                </div>
                <h3 className="text-base font-semibold text-foreground mb-2">{module.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{module.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Certification & Validity Banner */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={qualificationsBanner}
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-primary/90" />
        </div>
        <div className="relative container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-primary-foreground mb-4">
            Certification & Validity
          </h2>
          <p className="text-primary-foreground/85 max-w-2xl mx-auto leading-relaxed mb-6">
            Upon successful completion, you will receive an internationally recognised qualification regulated by Ofqual. This certification is valued by employers across the UK and worldwide, opening doors to career advancement and further study.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <span className="bg-primary-foreground/15 text-primary-foreground text-xs font-bold px-5 py-2.5 rounded border border-primary-foreground/20">
              Ofqual Regulated
            </span>
            <span className="bg-primary-foreground/15 text-primary-foreground text-xs font-bold px-5 py-2.5 rounded border border-primary-foreground/20">
              Internationally Recognised
            </span>
            <span className="bg-primary-foreground/15 text-primary-foreground text-xs font-bold px-5 py-2.5 rounded border border-primary-foreground/20">
              Employer Approved
            </span>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-3xl">
          <div className="text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-secondary">
              Have Questions?
            </span>
            <h2 className="text-3xl font-bold text-foreground mt-2">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-0 border-t border-border">
            {qual.faqs.map((faq, index) => (
              <div key={index} className="border-b border-border">
                <button
                  className="w-full flex items-center justify-between py-5 text-left"
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                >
                  <span className="font-medium text-foreground pr-4">{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-secondary shrink-0 transition-transform duration-200 ${
                      openFaq === index ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openFaq === index && (
                  <p className="text-muted-foreground pb-5 leading-relaxed">{faq.answer}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Related Qualifications */}
      {relatedQuals.length > 0 && (
        <section className="py-16 px-4 bg-accent/30">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold text-foreground mb-8 text-center">Related Qualifications</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedQuals.map((related) => (
                <Link
                  key={related.slug}
                  to={`/qualifications/${related.slug}`}
                  className="group relative rounded-lg overflow-hidden block h-[220px]"
                >
                  <img
                    src={imageMap[related.image] || heroBusiness}
                    alt={related.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-primary/60 group-hover:bg-primary/70 transition-colors" />
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <h3 className="text-sm font-semibold text-primary-foreground">{related.title}</h3>
                    <span className="text-xs text-primary-foreground/70 mt-1 block">{related.level} · {related.duration}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* More Than One Qualification */}
      <section className="py-16 md:py-20 px-4">
        <div className="container mx-auto text-center max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            More Than One Qualification?
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-8">
            If you are looking to upskill your team in management and leadership, we will offer you
            comprehensive and flexible solutions. We are excited to discuss how we can support your
            training objectives by providing customised qualification packages.
          </p>
          <Link
            to="/contact"
            className="inline-block bg-secondary text-secondary-foreground px-8 py-3 rounded font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            Contact Us
          </Link>
        </div>
      </section>

      {/* CTA */}
      <CTASection />

      {/* Upsell Modal */}
      {showUpsell && slug && (
        <UpsellModal currentSlug={slug} onClose={() => setShowUpsell(false)} />
      )}
    </div>
  );
};

export default QualificationDetail;
