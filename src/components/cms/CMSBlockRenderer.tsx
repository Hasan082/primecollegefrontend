import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useSubmitContactFormMutation } from "@/redux/apis/contactApi";
import { Image } from "@/components/Image";
import { Users, Award, CheckCircle, Clock, Target } from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";
import HeroSlider from "@/components/HeroSlider";
import Section from "@/components/Section";
import CTASection from "@/components/CTASection";
import LogoCarousel from "@/components/LogoCarousel";
import QualificationSlider from "@/components/QualificationSlider";
import type {
  ContentBlock,
  QualificationSliderBlock,
} from "@/types/pageBuilder";

import heroClassroom from "@/assets/hero-classroom.jpg";
import heroBusiness from "@/assets/hero-business.jpg";
import heroLeadership from "@/assets/hero-leadership.jpg";
import heroExecutive from "@/assets/hero-executive.jpg";
import heroCare from "@/assets/hero-care.jpg";
import aboutHero from "@/assets/about-hero.jpg";
import contactBanner from "@/assets/contact-banner.jpg";

const heroImageMap: Record<string, string> = {
  classroom: heroClassroom,
  business: heroBusiness,
  leadership: heroLeadership,
  executive: heroExecutive,
  care: heroCare,
};

const resolveCmsImage = (image: unknown): unknown =>
  typeof image === "string" ? heroImageMap[image] || image : image;

const iconMap: Record<string, React.ElementType> = {
  Users,
  Award,
  CheckCircle,
  Clock,
  Target,
};

const pageLabelMap: Record<string, string> = {
  about: "About Us",
  contact: "Contact Us",
};

const renderRichText = (content?: string, className = "") => {
  if (!content) return null;
  return (
    <div className={className} dangerouslySetInnerHTML={{ __html: content }} />
  );
};

const renderHero = (block: ContentBlock, pageSlug?: string) => {
  const d = block.data as any;

  if (Array.isArray(d.slides) && d.slides.length > 0) {
    return (
      <HeroSlider
        slides={d.slides.map((slide: any) => ({
          category: slide.category,
          title: slide.title,
          level: slide.level,
          price: slide.price,
          cta: slide.cta,
          image: slide.image,
          slug: slide.slug,
        }))}
      />
    );
  }

  const fallbackImage =
    pageSlug === "about"
      ? aboutHero
      : pageSlug === "contact"
        ? contactBanner
        : heroClassroom;
  const imageSrc = heroImageMap[d.image] || d.image || fallbackImage;
  const breadcrumbLabel = pageSlug ? pageLabelMap[pageSlug] : undefined;

  return (
    <div className="relative h-[400px] overflow-hidden">
      <Image image={imageSrc} alt={d.title} className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-foreground/70" />
      <div className="absolute inset-0 flex items-center justify-center text-center px-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold text-background">
            {d.title}
          </h1>
          {d.subtitle ? (
            <p className="mt-4 text-background/80 max-w-2xl mx-auto text-lg">
              {d.subtitle}
            </p>
          ) : null}
          {d.ctaLabel ? (
            <Link
              to={d.ctaHref || "/qualifications"}
              className="inline-block mt-6 bg-secondary text-secondary-foreground px-8 py-3 font-semibold rounded hover:opacity-90 text-sm"
            >
              {d.ctaLabel}
            </Link>
          ) : null}
        </div>
      </div>
      {breadcrumbLabel ? (
        <div className="absolute bottom-0 w-full">
          <Breadcrumb items={[{ label: breadcrumbLabel }]} />
        </div>
      ) : null}
    </div>
  );
};

const ContactFormBlock = ({ d }: { d: any }) => {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitContactForm, { isLoading }] = useSubmitContactFormMutation();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const fieldName = e.target.name === "name" ? "full_name" : e.target.name;
    setFormData({ ...formData, [fieldName]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await submitContactForm(formData).unwrap();
      toast.success("Success", {
        description: "Your message has been sent successfully.",
      });
      setFormData({
        full_name: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch (err: any) {
      toast.error("Error", {
        description: err?.data?.message || "Failed to send message. Please try again.",
      });
    }
  };

  return (
    <Section title="">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
        <div>
          <h3 className="text-xl font-semibold text-foreground mb-6">
            {d.title || "Get in Touch"}
          </h3>
          <div className="space-y-4 text-sm">
            <div>
              <div className="font-semibold text-foreground">Address</div>
              <div className="text-muted-foreground">{d.address}</div>
            </div>
            <div>
              <div className="font-semibold text-foreground">Email</div>
              <div className="text-muted-foreground">{d.email}</div>
            </div>
            <div>
              <div className="font-semibold text-foreground">Phone</div>
              <div className="text-muted-foreground">{d.phone}</div>
            </div>
            <div>
              <div className="font-semibold text-foreground">Office Hours</div>
              <div className="text-muted-foreground">{d.hours}</div>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-xl font-semibold text-foreground mb-6">
            Send a Message
          </h3>
          <form className="space-y-4" onSubmit={handleSubmit}>
            {Array.isArray(d.formFields) &&
              d.formFields.map((field: any) => (
                <div key={field.name}>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    {field.label}
                    {field.required ? (
                      <span className="text-destructive ml-1">*</span>
                    ) : null}
                  </label>
                  {field.type === "textarea" ? (
                    <textarea
                      name={field.name}
                      required={field.required}
                      rows={4}
                      value={formData[(field.name === "name" ? "full_name" : field.name) as keyof typeof formData] || ""}
                      onChange={handleChange}
                      className="w-full border border-input rounded px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  ) : (
                    <input
                      type={field.type}
                      name={field.name}
                      required={field.required}
                      value={formData[(field.name === "name" ? "full_name" : field.name) as keyof typeof formData] || ""}
                      onChange={handleChange}
                      className="w-full border border-input rounded px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  )}
                </div>
              ))}
            <button
              type="submit"
              disabled={isLoading}
              className="bg-primary text-primary-foreground px-8 py-2 rounded text-sm font-semibold hover:opacity-90 transition shadow-sm disabled:opacity-50"
            >
              {isLoading ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>
      </div>
    </Section>
  );
};

export const CMSBlockRenderer = ({
  block,
  pageSlug,
}: {
  block: ContentBlock;
  pageSlug?: string;
}) => {
  const d = block.data as any;

  switch (block.type) {
    case "hero":
      return renderHero(block, pageSlug);
    case "text":
      return (
        <Section title={d.title || ""}>
          {renderRichText(
            d.content,
            "text-center text-muted-foreground max-w-3xl mx-auto leading-relaxed prose prose-sm max-w-none",
          )}
        </Section>
      );
    case "image":
      return (
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-5xl">
            <Image
              image={resolveCmsImage(d.image) as any}
              alt={d.alt || d.caption || "CMS image"}
              className="w-full rounded-2xl border border-border object-cover"
            />
            {d.caption ? (
              <p className="mt-3 text-sm text-center text-muted-foreground">
                {d.caption}
              </p>
            ) : null}
          </div>
        </section>
      );
    case "image-text":
      return (
        <section className="bg-muted py-16 px-4">
          <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div
              className={`rounded-xl overflow-hidden ${d.imagePosition === "right" ? "order-2" : "order-1"}`}
            >
              <Image
                image={resolveCmsImage(d.image) || aboutHero}
                alt={d.headline}
                className="w-full h-[400px] object-cover rounded-xl"
              />
            </div>
            <div
              className={`bg-card rounded-xl p-8 border border-border ${d.imagePosition === "right" ? "order-1" : "order-2"}`}
            >
              <h2 className="text-2xl font-bold text-foreground mb-6">
                {d.headline}
              </h2>
              <div className="space-y-4 text-sm text-muted-foreground leading-relaxed prose prose-sm max-w-none">
                {Array.isArray(d.paragraphs) && d.paragraphs.length > 0
                  ? d.paragraphs.map((p: string, i: number) => (
                      <div key={i} dangerouslySetInnerHTML={{ __html: p }} />
                    ))
                  : renderRichText(d.description)}
              </div>
              {d.ctaLabel ? (
                <Link
                  to={d.ctaHref || "/about"}
                  className="mt-6 inline-block bg-secondary text-secondary-foreground px-6 py-2 rounded text-sm font-semibold hover:opacity-90"
                >
                  {d.ctaLabel}
                </Link>
              ) : null}
            </div>
          </div>
        </section>
      );
    case "about-split":
      return (
        <section
          className={
            pageSlug === "home" ? "bg-primary py-20 px-4" : "py-16 px-4"
          }
        >
          <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2
                className={`text-3xl md:text-4xl font-bold leading-snug ${pageSlug === "home" ? "text-primary-foreground mb-6" : "text-foreground"}`}
              >
                {d.headline}
              </h2>
              {d.ctaLabel ? (
                <Link
                  to={d.ctaHref || "/about"}
                  className={`${pageSlug === "home" ? "mt-0" : "mt-6"} inline-block px-6 py-3 rounded text-sm font-semibold hover:opacity-90 bg-secondary text-secondary-foreground`}
                >
                  {d.ctaLabel}
                </Link>
              ) : null}
            </div>
            <div
              className={`space-y-4 ${pageSlug === "home" ? "text-primary-foreground/80" : "text-muted-foreground"}`}
            >
              {Array.isArray(d.paragraphs) && d.paragraphs.length > 0
                ? d.paragraphs.map((p: string, i: number) => (
                    <p key={i} className="leading-relaxed">
                      {p}
                    </p>
                  ))
                : renderRichText(d.description)}
            </div>
          </div>
        </section>
      );
    case "faq":
      return (
        <Section title={d.title || "FAQs"}>
          <div className="max-w-4xl mx-auto space-y-4">
            {Array.isArray(d.items) &&
              d.items.map((item: any, i: number) => (
                <details
                  key={i}
                  className="rounded-xl border border-border bg-card p-5"
                >
                  <summary className="cursor-pointer font-semibold text-foreground">
                    {item.question}
                  </summary>
                  <div
                    className="mt-3 text-sm text-muted-foreground leading-7"
                    dangerouslySetInnerHTML={{ __html: item.answer }}
                  />
                </details>
              ))}
          </div>
        </Section>
      );
    case "stats":
      return (
        <section className="bg-primary py-16 px-4">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl font-bold text-primary-foreground mb-4">
              {d.title}
            </h2>
            {d.content ? (
              <p className="text-primary-foreground/80 max-w-3xl mx-auto mb-12">
                {d.content}
              </p>
            ) : null}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {Array.isArray(d.items) &&
                d.items.map((item: any) => (
                  <div key={item.title} className="text-center">
                    <div className="text-5xl md:text-6xl font-bold text-primary-foreground mb-3">
                      {item.value}
                    </div>
                    <div className="text-lg font-semibold text-secondary mb-2">
                      {item.title}
                    </div>
                    {item.description ? (
                      <p className="text-primary-foreground/70 text-sm max-w-xs mx-auto">
                        {item.description}
                      </p>
                    ) : null}
                  </div>
                ))}
            </div>
          </div>
        </section>
      );
    case "cta":
      // On the home page always use the original CTASection with background image.
      // On other pages use dynamic data if available, otherwise fall back to CTASection.
      if (pageSlug === "home") return <CTASection />;
      return d.bgImage || d.title || d.content ? (
        <section className="relative py-20 px-4 overflow-hidden bg-primary text-primary-foreground text-center">
          {d.bgImage ? (
            <Image
              image={resolveCmsImage(d.bgImage) as any}
              className="absolute inset-0 w-full h-full object-cover opacity-20"
              alt=""
            />
          ) : null}
          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">{d.title}</h2>
            {d.content ? (
              <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto leading-relaxed">
                {d.content}
              </p>
            ) : null}
            {d.ctaLabel ? (
              <Link
                to={d.ctaHref || "/qualifications"}
                className="inline-block bg-secondary text-secondary-foreground px-8 py-3 font-semibold rounded hover:opacity-90 transition shadow-lg"
              >
                {d.ctaLabel}
              </Link>
            ) : null}
          </div>
        </section>
      ) : (
        <CTASection />
      );
    case "logos":
      return Array.isArray(d.items) && d.items.length > 0 ? (
        <section className="bg-muted py-16 px-4">
          <div className="container mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground">
              {d.title || "Our Partners"}
            </h2>
          </div>
          <div className="container mx-auto grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 items-center">
            {d.items.map((item: any, i: number) => (
              <div
                key={item.title || i}
                className="bg-card rounded-xl border border-border p-4 h-24 flex items-center justify-center"
              >
                {item.image ? (
                  <Image
                    image={resolveCmsImage(item.image) as any}
                    alt={item.title}
                    className="max-h-14 w-auto object-contain"
                  />
                ) : (
                  <span className="text-sm font-medium text-muted-foreground">
                    {item.title}
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>
      ) : (
        <LogoCarousel />
      );
    case "cards":
    case "popular-qualifications":
      if (pageSlug === "home") {
        // Original home page styling: rounded top image with m-2 padding & hover-scale
        return (
          <Section title={d.title || "Featured Qualifications"}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.isArray(d.items) &&
                d.items.map((item: any, i: number) => {
                  const slug =
                    item.slug ||
                    item.title
                      ?.toLowerCase()
                      .replace(/[^a-z0-9]+/g, "-")
                      .replace(/(^-|-$)/g, "");
                  return (
                    <div
                      key={item.id || slug || i}
                      className="bg-card border border-border rounded-xl overflow-hidden group flex flex-col"
                    >
                      <Link to={`/qualifications/${slug}`}>
                        <div className="aspect-[4/3] overflow-hidden rounded-t-xl m-2">
                        <Image
                          image={resolveCmsImage(item.image) || heroClassroom}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        </div>
                      </Link>
                      <div className="px-4 pb-5 flex flex-col flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {item.category ? (
                            <span className="bg-secondary text-secondary-foreground text-xs font-bold px-3 py-1 rounded uppercase">
                              {item.category}
                            </span>
                          ) : null}
                          {item.level ? (
                            <span className="text-xs text-muted-foreground">
                              {item.level}
                            </span>
                          ) : null}
                        </div>
                        <Link to={`/qualifications/${slug}`}>
                          <h3 className="text-sm font-semibold text-foreground leading-snug mb-3 hover:text-primary">
                            {item.title}
                          </h3>
                        </Link>
                        {item.price ? (
                          <div className="text-lg font-bold text-primary mb-4">
                            {item.price}
                          </div>
                        ) : null}
                        <Link
                          to={`/qualifications/${slug}`}
                          className="mt-auto inline-block bg-primary text-primary-foreground text-center px-5 py-2 text-sm font-semibold rounded hover:opacity-90"
                        >
                          Enroll Now
                        </Link>
                      </div>
                    </div>
                  );
                })}
            </div>
            <div className="text-center mt-8">
              <Link
                to="/qualifications"
                className="inline-block bg-primary text-primary-foreground px-8 py-3 font-semibold rounded text-sm hover:opacity-90"
              >
                View All Qualifications
              </Link>
            </div>
          </Section>
        );
      }
      return (
        <Section title={d.title || "Featured Qualifications"}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.isArray(d.items) &&
              d.items.map((item: any, i: number) => (
                <div
                  key={item.id || item.slug || i}
                  className="bg-card border border-border rounded-xl overflow-hidden group flex flex-col"
                >
                  {item.image ? (
                    <Image
                      image={resolveCmsImage(item.image) as any}
                      alt={item.title}
                      className="w-full h-48 object-cover"
                    />
                  ) : null}
                  <div className="px-4 py-5 flex flex-col flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      {item.category ? (
                        <span className="bg-secondary text-secondary-foreground text-xs font-bold px-3 py-1 rounded uppercase">
                          {item.category}
                        </span>
                      ) : null}
                      {item.level ? (
                        <span className="text-xs text-muted-foreground">
                          {item.level}
                        </span>
                      ) : null}
                    </div>
                    <h3 className="text-sm font-semibold text-foreground leading-snug mb-3">
                      {item.title}
                    </h3>
                    {item.description ? (
                      <p className="text-sm text-muted-foreground mb-4">
                        {item.description}
                      </p>
                    ) : null}
                    {item.slug ? (
                      <Link
                        to={`/qualifications/${item.slug}`}
                        className="mt-auto inline-block bg-primary text-primary-foreground text-center px-5 py-2 text-sm font-semibold rounded hover:opacity-90"
                      >
                        View Details
                      </Link>
                    ) : null}
                  </div>
                </div>
              ))}
          </div>
        </Section>
      );
    case "contact-form":
      return <ContactFormBlock d={d} />;
    case "map":
      return (
        <section className="bg-muted py-16 px-4">
          <div className="container mx-auto max-w-5xl">
            <h2 className="text-2xl font-bold text-foreground text-center mb-8">
              {d.title || "Find Us"}
            </h2>
            <div className="rounded-xl overflow-hidden border border-border h-[400px] shadow-sm">
              <iframe
                title="Prime College Location"
                src={d.iframeUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </section>
      );
    case "blog":
      if (pageSlug === "home") {
        // Original home page blog styling: entire card is a Link with hover-scale image
        return (
          <Section title={d.title || "Latest Blogs"}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Array.isArray(d.items) &&
                d.items.map((item: any, i: number) => {
                  const blogSlug =
                    item.slug ||
                    item.title
                      ?.toLowerCase()
                      .replace(/[^a-z0-9]+/g, "-")
                      .replace(/(^-|-$)/g, "");
                  return (
                    <Link
                      key={blogSlug || i}
                      to={`/blogs/${blogSlug}`}
                      className="bg-card border border-border rounded-xl overflow-hidden group flex h-full flex-col"
                    >
                      <div className="aspect-[16/9] overflow-hidden">
                        <Image
                          image={resolveCmsImage(item.image) || heroClassroom}
                          srcSet={item.image_srcset}
                          sizes="(min-width: 768px) 33vw, 100vw"
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="flex flex-1 flex-col p-5">
                        <div className="flex items-center gap-3 mb-3">
                          {item.category ? (
                            <span className="bg-secondary text-secondary-foreground text-xs font-bold px-3 py-1 rounded uppercase">
                              {item.category}
                            </span>
                          ) : null}
                          {item.date ? (
                            <span className="text-xs text-muted-foreground">
                              {item.date}
                            </span>
                          ) : null}
                        </div>
                        <h3 className="text-base font-semibold text-foreground leading-snug mb-2">
                          {item.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                          {item.blog_excerpt}
                        </p>
                        <span className="mt-auto text-sm font-semibold text-primary">
                          Read More →
                        </span>
                      </div>
                    </Link>
                  );
                })}
            </div>
          </Section>
        );
      }
      return (
        <Section title={d.title || "Latest Blogs"}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.isArray(d.items) &&
              d.items.map((item: any, i: number) => (
                <article
                  key={item.slug || i}
                  className="bg-card border border-border rounded-xl overflow-hidden"
                >
                  {item.image ? (
                    <Image
                      image={resolveCmsImage(item.image) as any}
                      alt={item.title}
                      className="w-full h-48 object-cover"
                    />
                  ) : null}
                  <div className="p-5">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                      {item.category ? <span>{item.category}</span> : null}
                      {item.date ? <span>{item.date}</span> : null}
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {item.blog_excerpt}
                    </p>
                    {item.slug ? (
                      <Link
                        to={`/blogs/${item.slug}`}
                        className="text-sm font-semibold text-primary hover:underline"
                      >
                        Read More
                      </Link>
                    ) : null}
                  </div>
                </article>
              ))}
          </div>
        </Section>
      );
    case "why-us":
      if (pageSlug === "home") {
        // Original home page why-us: large round bg-primary circles, centered layout, 3-col grid
        return (
          <section className="bg-muted py-16 px-4">
            <div className="container mx-auto text-center">
              <h2 className="text-3xl font-bold text-foreground mb-2">
                {d.title}
              </h2>
              <div className="w-12 h-1 bg-secondary mx-auto mb-8" />
              {d.content && (
                <div className="max-w-3xl mx-auto mb-12">
                  {d.content.split("\n\n").map((p: string, i: number) => (
                    <p
                      key={i}
                      className="text-muted-foreground leading-relaxed mb-4"
                    >
                      {p}
                    </p>
                  ))}
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-8">
                {Array.isArray(d.items) &&
                  d.items.map((item: any) => {
                    const Icon = iconMap[item.icon] || Users;
                    return (
                      <div key={item.title} className="text-center">
                        <div className="flex justify-center mb-4">
                          <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center">
                            <Icon
                              className="w-10 h-10 text-primary-foreground"
                              strokeWidth={1.5}
                            />
                          </div>
                        </div>
                        <h3 className="text-xl font-bold text-foreground mb-3">
                          {item.title}
                        </h3>
                        <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                          {item.description}
                        </p>
                      </div>
                    );
                  })}
              </div>
            </div>
          </section>
        );
      }
      return (
        <section className="bg-muted py-16 px-4">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              {d.title}
            </h2>
            {d.content ? (
              <p className="text-muted-foreground max-w-2xl mx-auto mb-12">
                {d.content}
              </p>
            ) : null}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {Array.isArray(d.items) &&
                d.items.map((item: any) => {
                  const Icon = iconMap[item.icon] || Users;
                  return (
                    <div
                      key={item.title}
                      className="bg-card border border-border rounded-xl p-6 text-left shadow-sm"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center">
                          <Icon
                            className="w-5 h-5 text-secondary"
                            strokeWidth={2}
                          />
                        </div>
                        <h3 className="font-semibold text-foreground">
                          {item.title}
                        </h3>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  );
                })}
            </div>
          </div>
        </section>
      );
    case "features":
    case "modules":
      if (pageSlug === "home") {
        // Original home page features: bg-muted background on the section
        return (
          <Section title={d.title || "Highlights"} className="bg-muted">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.isArray(d.items) &&
                d.items.map((item: any, i: number) => (
                  <div
                    key={item.title || i}
                    className="bg-card p-6 rounded-xl border border-border"
                  >
                    <h3 className="font-semibold text-foreground mb-2">
                      {item.title}
                    </h3>
                    {item.description ? (
                      <p className="text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    ) : null}
                  </div>
                ))}
            </div>
          </Section>
        );
      }
      return (
        <Section title={d.title || "Highlights"}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.isArray(d.items) &&
              d.items.map((item: any, i: number) => (
                <div
                  key={item.title || i}
                  className="bg-card border border-border rounded-xl p-6 text-center shadow-sm"
                >
                  <h3 className="font-bold text-foreground mb-2">
                    {item.title}
                  </h3>
                  {item.description ? (
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                  ) : null}
                </div>
              ))}
          </div>
        </Section>
      );
    case "qualification_slider": {
      const sliderBlock = block as QualificationSliderBlock;
      // When this is the fixed hero block on the home page, render as the original HeroSlider
      if (pageSlug === "home" && block.isFixed) {
        const heroSlides = (sliderBlock.data.items || []).map((item) => ({
          category: item.category || "",
          title: item.title,
          level: item.level || "",
          price: item.current_price
            ? `${item.currency || "£"}${item.current_price}`
            : "",
          cta: "Enroll Now",
          image: item.featured_image || "",
          slug: item.slug,
        }));
        return heroSlides.length > 0 ? (
          <HeroSlider slides={heroSlides} />
        ) : null;
      }
      return <QualificationSlider block={sliderBlock} />;
    }
    case "qualification_hero":
      return null;
    default:
      return null;
  }
};

export const CMSPageRenderer = ({
  blocks,
  pageSlug,
}: {
  blocks: ContentBlock[];
  pageSlug?: string;
}) => (
  <div>
    {blocks.map((block) => (
      <CMSBlockRenderer key={block.id} block={block} pageSlug={pageSlug} />
    ))}
  </div>
);
