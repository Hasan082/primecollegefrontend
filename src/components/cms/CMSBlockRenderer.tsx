/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { useSubmitContactFormMutation } from "@/redux/apis/contactApi";
import { useGetBlogsQuery } from "@/redux/apis/blogs/blogApi";
import { useGetQualificationsQuery } from "@/redux/apis/qualificationApi";
import { Image } from "@/components/Image";
import {
  Users,
  Award,
  CheckCircle,
  Clock,
  Target,
  GraduationCap,
} from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";
import HeroSlider from "@/components/HeroSlider";
import Section from "@/components/Section";
import CTASection from "@/components/CTASection";
import LogoCarousel from "@/components/LogoCarousel";
import QualificationSlider from "@/components/QualificationSlider";
import QualificationCard from "@/components/QualificationCard";
import { DynamicIcon } from "@/components/admin/page-builder/MediaPicker";
import { sanitizeRichHtml } from "@/utils/sanitizeRichHtml";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
import qualificationsBanner from "@/assets/qualifications-banner.jpg";

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

const renderRichText = (content?: string, className = "", key?: any) => {
  if (!content) return null;
  return (
    <div
      key={key}
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(content) }}
    />
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
      <Image
        image={imageSrc}
        alt={d.title}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-foreground/70" />
      <div className="absolute inset-0 flex items-center justify-center text-center px-4">
        <div>
          {d.title && renderRichText(d.title, "text-4xl md:text-5xl font-bold text-background")}
          {d.subtitle ? renderRichText(d.subtitle, "mt-4 text-background/80 max-w-2xl mx-auto text-lg") : null}
          <div className="flex flex-wrap justify-center gap-4 mt-6">
            {Array.isArray(d.ctas) && d.ctas.length > 0 ? (
              d.ctas.map((cta: any, i: number) => (
                <Link
                  key={i}
                  to={cta.href || "/qualifications"}
                  className="inline-block bg-secondary text-secondary-foreground px-8 py-3 font-semibold rounded hover:opacity-90 text-sm"
                >
                  {cta.label}
                </Link>
              ))
            ) : d.ctaLabel ? (
              <Link
                to={d.ctaHref || "/qualifications"}
                className="inline-block bg-secondary text-secondary-foreground px-8 py-3 font-semibold rounded hover:opacity-90 text-sm"
              >
                {d.ctaLabel}
              </Link>
            ) : null}
          </div>
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

const renderPopularQualifications = (block: ContentBlock) => {
  const d = block.data as any;
  const items = Array.isArray(d.items) ? d.items : [];
  const visibleItems = items.slice(0, Math.max(1, Number(d.show_count) || 4));

  return (
    <Section title="">
      {d.title && renderRichText(d.title, "text-3xl font-bold mb-8 text-center")}
      {visibleItems.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {visibleItems.map((item: any, i: number) => {
            const slug =
              item.slug ||
              item.id ||
              item.title
                ?.toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/(^-|-$)/g, "");
            return (
              <QualificationCard
                key={item.id || slug || i}
                id={item.id || slug || String(i)}
                slug={slug}
                title={item.title || "Qualification"}
                category={item.category || null}
                level={item.level || null}
                duration={
                  item.duration || item.qualification_type || "Qualification"
                }
                price={
                  item.price ||
                  (item.current_price
                    ? `${item.currency || "£"}${item.current_price}`
                    : "Contact us")
                }
                description={
                  item.description ||
                  item.short_description ||
                  item.blog_excerpt ||
                  ""
                }
                imageUrl={
                  resolveCmsImage(
                    item.image ||
                      item.featured_image?.card ||
                      item.featured_image?.original ||
                      "",
                  ) as string
                }
              />
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-8 text-center text-sm text-muted-foreground">
          No qualifications available yet.
        </div>
      )}
    </Section>
  );
};


const RelatedQualificationsSection = ({ block }: { block: ContentBlock }) => {
  const d = block.data as any;
  const isLatest = d.selection_mode === "latest";
  
  // Only fetch if selection mode is latest OR if we have no items
  const shouldFetch = isLatest && (!Array.isArray(d.items) || d.items.length === 0);
  
  const { data: latestData, isLoading } = useGetQualificationsQuery(
    { page_size: d.show_count || 3 },
    { skip: !shouldFetch }
  );

  const rawItems = Array.isArray(d.items) && d.items.length > 0 
    ? d.items 
    : (latestData?.data?.results || []);
    
  const visibleItems = rawItems.slice(0, Math.max(1, Number(d.show_count) || 3));

  if (isLoading && shouldFetch) {
    return (
      <Section title="">
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Section>
    );
  }

  return (
    <Section title="">
      {d.title && renderRichText(d.title, "text-3xl font-bold mb-8 text-center")}
      {visibleItems.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 max-w-7xl mx-auto px-4">
          {visibleItems.map((item: any, i: number) => {
            const title = item.title || "";
            const level = item.level 
              ? (typeof item.level === 'object' ? `(Level ${item.level.name})` : `(Level ${item.level})`) 
              : "";
            const slug = item.slug || item.blog_slug || "";
            const image = resolveCmsImage(
              item.featured_image?.original || 
              item.featured_image?.card || 
              item.featured_image || 
              item.image || 
              ""
            );

            return (
              <Link
                key={i}
                to={`/qualifications/${slug}`}
                className="group relative h-[250px] overflow-hidden rounded-xl shadow-md block"
              >
                <Image
                  image={image as any}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  alt={title}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute bottom-0 left-0 p-6 w-full text-white">
                  <h3 className="font-bold text-lg leading-tight mb-1">
                    {title} {level}
                  </h3>
                  <div className="text-xs text-white/70 font-medium">
                    Level {typeof item.level === 'object' ? item.level.name : item.level} • {item.course_duration || item.duration || "Flexible"}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground italic">
          No related qualifications found.
        </div>
      )}
    </Section>
  );
};

const renderInfoCards = (block: ContentBlock) => {
  const d = block.data as any;
  const items = Array.isArray(d.items) ? d.items : [];
  const columns = d.columns || 3;

  const gridCols =
    {
      1: "grid-cols-1",
      2: "grid-cols-1 md:grid-cols-2",
      3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
      4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
    }[columns as number] || "grid-cols-1 md:grid-cols-3";

  return (
    <Section title="">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          {d.title && renderRichText(d.title, "text-3xl font-bold")}
        </div>

        <div className={`grid gap-6 ${gridCols}`}>
          {items.map((item: any, i: number) => {
            const IconComponent =
              item.mediaType === "icon" ? iconMap[item.icon] : null;
            const imageUrl =
              item.mediaType === "image" ? resolveCmsImage(item.image) : null;

            return (
              <div
                key={i}
                className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 flex flex-col items-start text-left group hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between w-full mb-6">
                  {/* Circle with Text, Icon, or Image */}
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-primary font-bold text-sm">
                    {item.mediaType === "icon" && IconComponent ? (
                      <IconComponent className="h-5 w-5" />
                    ) : item.mediaType === "image" && imageUrl ? (
                      <img
                        src={imageUrl as string}
                        className="h-5 w-5 object-contain"
                        alt=""
                      />
                    ) : (
                      <span>
                        {item.circleText || (i + 1).toString().padStart(2, "0")}
                      </span>
                    )}
                  </div>
                </div>

                {item.title &&
                  renderRichText(item.title, "text-xl font-bold text-slate-900 mb-3")}
                {item.description &&
                  renderRichText(
                    item.description,
                    "text-slate-600 leading-relaxed",
                  )}
              </div>
            );
          })}
        </div>
      </div>
    </Section>
  );
};

const renderPricing = (block: ContentBlock) => {
  const d = block.data as any;
  const features = Array.isArray(d.features) ? d.features.filter(Boolean) : [];

  return (
    <section className="bg-muted/20 py-16 px-4">
      <div className="container mx-auto max-w-5xl">
        <div className="mx-auto mb-10 max-w-3xl text-center">
          {d.title ? (
            <h2 className="text-3xl font-bold text-foreground">{d.title}</h2>
          ) : null}
          {d.content ? (
            <p className="mt-3 text-muted-foreground leading-relaxed">
              {d.content}
            </p>
          ) : null}
        </div>

        <div className="mx-auto max-w-2xl overflow-hidden rounded-3xl border border-border bg-card shadow-lg">
          <div className="border-b border-border bg-primary px-6 py-5 text-primary-foreground">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-primary-foreground/80">
                  {d.duration || "Course Duration"}
                </p>
                <p className="mt-2 text-4xl font-bold">
                  {d.price || "Contact us"}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                {Array.isArray(d.ctas) && d.ctas.length > 0 ? (
                  d.ctas.map((cta: any, i: number) => (
                    <Link
                      key={i}
                      to={cta.href || "/contact"}
                      className="inline-flex rounded bg-secondary px-5 py-2.5 text-sm font-semibold text-secondary-foreground hover:opacity-90"
                    >
                      {cta.label}
                    </Link>
                  ))
                ) : d.ctaLabel ? (
                  <Link
                    to={d.ctaHref || "/contact"}
                    className="inline-flex rounded bg-secondary px-5 py-2.5 text-sm font-semibold text-secondary-foreground hover:opacity-90"
                  >
                    {d.ctaLabel}
                  </Link>
                ) : null}
              </div>
            </div>
          </div>

          {features.length > 0 ? (
            <div className="grid gap-3 p-6 sm:grid-cols-2">
              {features.map((feature: string, index: number) => (
                <div
                  key={`${feature}-${index}`}
                  className="rounded-xl border border-border/70 bg-muted/20 px-4 py-3 text-sm text-foreground"
                >
                  {feature}
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
};

const getCardsGridClass = (columns?: number) => {
  if (columns === 2) return "grid grid-cols-1 gap-6 md:grid-cols-2";
  if (columns === 3) return "grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3";
  return "grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4";
};

const getCardLink = (item: any) => {
  if (!item?.slug) return null;
  return String(item.slug).startsWith("/") ? String(item.slug) : `/qualifications/${item.slug}`;
};

const renderCardMedia = (item: any, showMedia: boolean) => {
  if (!showMedia) return null;

  const mediaType = item.mediaType || (item.image ? "image" : item.icon ? "icon" : item.circleText ? "text" : null);
  if (!mediaType) return null;

  if (mediaType === "image" && item.image) {
    const isFull = item.imageSize === "full";
    return (
      <div className={isFull ? "overflow-hidden rounded-lg" : "flex justify-center"}>
        <Image
          image={resolveCmsImage(item.image) as any}
          alt={item.title || "Card image"}
          className={isFull ? "h-48 w-full object-cover" : "h-16 w-16 rounded-full object-cover"}
        />
      </div>
    );
  }

  if (mediaType === "text" && item.circleText) {
    return (
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
        {item.circleText}
      </div>
    );
  }

  return (
    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
      <DynamicIcon iconKey={item.icon || "Star"} size={22} />
    </div>
  );
};

const renderCardsGrid = (block: ContentBlock, pageSlug?: string) => {
  const d = block.data as any;
  const columns = [2, 3, 4].includes(Number(d.columns)) ? Number(d.columns) : 4;
  const mediaPosition = ["left", "right", "top"].includes(d.mediaPosition) ? d.mediaPosition : "top";
  const textAlign = ["left", "center", "right"].includes(d.textAlign) ? d.textAlign : "left";
  const showSectionTitle = d.showSectionTitle !== false;
  const showMedia = d.showMedia !== false;
  const showTitle = d.showTitle !== false;
  const showCategory = d.showCategory !== false;
  const showLevel = d.showLevel !== false;
  const showPrice = d.showPrice !== false;
  const showDescription = d.showDescription === true;
  const showButton = d.showButton !== false;
  const buttonLabel = d.buttonLabel || (pageSlug === "home" ? "Enroll Now" : "View Details");
  const textAlignClass =
    textAlign === "center" ? "text-center items-center" : textAlign === "right" ? "text-right items-end" : "text-left items-start";
  const mediaTop = mediaPosition === "top";
  const mediaRight = mediaPosition === "right";

  return (
    <Section title="">
      {showSectionTitle && d.title ? renderRichText(d.title, "mb-8 text-center text-3xl font-bold") : null}
      <div className={getCardsGridClass(columns)}>
        {Array.isArray(d.items) &&
          d.items.map((item: any, i: number) => {
            const href = getCardLink(item);
            const media = renderCardMedia(item, showMedia);

            return (
              <div
                key={item.id || item.slug || item.title || i}
                className={`group flex h-full flex-col rounded-xl border border-border bg-card p-5 ${mediaTop ? "" : "md:flex-row"} ${mediaRight ? "md:flex-row-reverse" : ""}`}
              >
                {media ? (
                  <div className={`${mediaTop ? "mb-4" : "md:w-28 md:shrink-0"} ${mediaTop ? "" : "md:flex md:items-start"} ${textAlign === "center" ? "justify-center" : textAlign === "right" ? "justify-end" : "justify-start"}`}>
                    {media}
                  </div>
                ) : null}

                <div className={`flex flex-1 flex-col ${mediaTop ? "" : "md:px-4"} ${textAlignClass}`}>
                  {(showCategory && item.category) || (showLevel && item.level) ? (
                    <div className={`mb-2 flex flex-wrap gap-2 ${textAlign === "center" ? "justify-center" : textAlign === "right" ? "justify-end" : "justify-start"}`}>
                      {showCategory && item.category ? (
                        <span className="rounded bg-secondary px-3 py-1 text-xs font-bold uppercase text-secondary-foreground">
                          {item.category}
                        </span>
                      ) : null}
                      {showLevel && item.level ? (
                        <span className="text-xs text-muted-foreground">
                          {item.level}
                        </span>
                      ) : null}
                    </div>
                  ) : null}

                  {showTitle && item.title ? (
                    href ? (
                      <Link to={href} className="mb-3 text-sm font-semibold leading-snug text-foreground hover:text-primary">
                        {renderRichText(item.title)}
                      </Link>
                    ) : (
                      <div className="mb-3 text-sm font-semibold leading-snug text-foreground">
                        {renderRichText(item.title)}
                      </div>
                    )
                  ) : null}

                  {showDescription && item.description ? (
                    <div className="mb-4 text-sm text-muted-foreground">
                      {renderRichText(item.description)}
                    </div>
                  ) : null}

                  {showPrice && item.price ? (
                    <div className="mb-4 text-lg font-bold text-primary">
                      {item.price}
                    </div>
                  ) : null}

                  {showButton && href ? (
                    <Link
                      to={href}
                      className="mt-auto inline-flex rounded bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
                    >
                      {buttonLabel}
                    </Link>
                  ) : null}
                </div>
              </div>
            );
          })}
      </div>

      {pageSlug === "home" ? (
        <div className="mt-8 text-center">
          <Link
            to="/qualifications"
            className="inline-block rounded bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            View All Qualifications
          </Link>
        </div>
      ) : null}
    </Section>
  );
};

const getFeatureGridClass = (columns?: number) => {
  if (columns === 2) return "grid grid-cols-1 gap-6 md:grid-cols-2";
  if (columns === 3) return "grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3";
  return "grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4";
};

const renderFeatureMedia = (item: any, showMedia: boolean, homeStyle: boolean) => {
  if (!showMedia) return null;
  const mediaType = item.mediaType || (item.image ? "image" : item.circleText ? "text" : "icon");

  if (mediaType === "image" && item.image) {
    const imgSrc =
      item.image?.medium ||
      item.image?.small ||
      item.image?.large ||
      item.image?.original ||
      item.image;
    const isFull = item.imageSize === "full";
    return (
      <div className={isFull ? "overflow-hidden rounded-lg" : "flex justify-center"}>
        <img
          src={imgSrc}
          alt={item.title}
          className={isFull ? "h-24 w-full object-cover rounded-lg" : homeStyle ? "h-16 w-16 rounded-full object-cover" : "h-12 w-12 rounded-full object-cover"}
        />
      </div>
    );
  }

  if (mediaType === "text" && item.circleText) {
    return (
      <div className={`${homeStyle ? "h-20 w-20 text-base" : "h-12 w-12 text-sm"} flex items-center justify-center rounded-full bg-primary/10 font-bold text-primary`}>
        {item.circleText}
      </div>
    );
  }

  return homeStyle ? (
    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-primary-foreground">
      <DynamicIcon iconKey={item.icon || "Users"} size={40} />
    </div>
  ) : (
    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary/20 text-secondary">
      <DynamicIcon iconKey={item.icon || "Users"} size={20} />
    </div>
  );
};

const renderWhyUsOrFeatures = (block: ContentBlock, pageSlug?: string) => {
  const d = block.data as any;
  const isWhyUs = block.type === "why-us";
  const isHomeStyle = isWhyUs && pageSlug === "home";
  const columns = [2, 3, 4].includes(Number(d.columns)) ? Number(d.columns) : isWhyUs ? 3 : 4;
  const widthMode = d.widthMode === "full" ? "full" : "container";
  const bgMode = d.bgMode || (isHomeStyle ? "color" : "transparent");
  const textAlign = ["left", "center", "right"].includes(d.textAlign) ? d.textAlign : "center";
  const mediaPosition = ["left", "right", "top"].includes(d.mediaPosition) ? d.mediaPosition : "top";
  const showSectionTitle = d.showSectionTitle !== false;
  const showSectionDescription = d.showSectionDescription !== false;
  const showItemTitle = d.showItemTitle !== false;
  const showItemDescription = d.showItemDescription !== false;
  const showMedia = d.showMedia !== false;
  const sectionTextClass = textAlign === "left" ? "text-left" : textAlign === "right" ? "text-right" : "text-center";
  const itemTextClass =
    textAlign === "left" ? "text-left items-start" : textAlign === "right" ? "text-right items-end" : "text-center items-center";
  const titleWidthClass =
    textAlign === "center" ? "mx-auto max-w-3xl" : textAlign === "right" ? "ml-auto max-w-3xl" : "max-w-3xl";

  return (
    <section className={`relative overflow-hidden py-16 px-4 ${sectionTextClass}`}>
      {bgMode === "image" && d.bgImage ? (
        <div className="absolute inset-0">
          <Image image={resolveCmsImage(d.bgImage) as any} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0" style={{ backgroundColor: d.overlayColor || "rgba(15,23,42,0.35)" }} />
        </div>
      ) : bgMode === "color" ? (
        <div className="absolute inset-0" style={{ backgroundColor: d.bgColor || (isHomeStyle ? "#f8fafc" : "#ffffff") }} />
      ) : null}

      <div className={`relative mx-auto ${widthMode === "container" ? "container" : "w-full max-w-7xl"}`}>
        {showSectionTitle && d.title ? (
          renderRichText(d.title, `${isHomeStyle ? "mb-2" : "mb-4"} text-3xl font-bold text-foreground`)
        ) : null}
        {isHomeStyle && showSectionTitle ? <div className="mx-auto mb-8 h-1 w-12 bg-secondary" /> : null}
        {showSectionDescription && d.content ? (
          renderRichText(d.content, `${titleWidthClass} mb-12 text-muted-foreground leading-relaxed prose prose-sm max-w-none`)
        ) : null}
        <div className={`${getFeatureGridClass(columns)} ${isHomeStyle ? "mt-8" : ""}`}>
          {Array.isArray(d.items) &&
            d.items.map((item: any, i: number) => {
              const media = renderFeatureMedia(item, showMedia, isHomeStyle);
              const mediaTop = mediaPosition === "top";
              const mediaRight = mediaPosition === "right";
              return (
                <div
                  key={item.title || i}
                  className={`${isHomeStyle ? "text-center" : "bg-card border border-border rounded-xl p-6 shadow-sm"} ${mediaTop ? "flex flex-col" : `flex ${mediaRight ? "md:flex-row-reverse" : "md:flex-row"} gap-4`} ${itemTextClass}`}
                >
                  {media ? (
                    <div className={`${mediaTop ? (isHomeStyle ? "mb-4 flex justify-center" : "mb-3 flex justify-center") : "shrink-0"} ${!mediaTop && textAlign === "center" ? "justify-center" : !mediaTop && textAlign === "right" ? "justify-end" : ""}`}>
                      {media}
                    </div>
                  ) : null}
                  <div className={`flex flex-1 flex-col ${itemTextClass}`}>
                    {showItemTitle && item.title ? (
                      <div className={`${isHomeStyle ? "mb-3 text-xl font-bold" : "mb-2 font-semibold"} text-foreground`}>
                        {renderRichText(item.title)}
                      </div>
                    ) : null}
                    {showItemDescription && item.description ? (
                      <div className={`${isHomeStyle ? "max-w-xs text-sm text-muted-foreground" : "text-sm leading-relaxed text-muted-foreground"}`}>
                        {renderRichText(item.description)}
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </section>
  );
};

const renderQualificationWhy = (block: ContentBlock) => {
  const d = block.data as any;
  const imageSrc = resolveCmsImage(d.image) || heroBusiness;
  const paragraphs = Array.isArray(d.paragraphs) ? d.paragraphs : [];

  return (
    <section className="py-16 px-4">
      <div className="container mx-auto">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-secondary mb-2 block">
              {block.label || "Why Choose This Qualification"}
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              {d.headline || "Build Confidence & Advance Your Career"}
            </h2>
            {paragraphs.length > 0 ? (
              paragraphs.map((paragraph: string, index: number) => (
                <p
                  key={index}
                  className="text-muted-foreground leading-relaxed mb-4"
                >
                  {paragraph}
                </p>
              ))
            ) : (
              <p className="text-muted-foreground leading-relaxed">
                {d.description || ""}
              </p>
            )}
          </div>
          <div className="rounded-lg overflow-hidden shadow-lg">
            <img
              src={typeof imageSrc === "string" ? imageSrc : heroBusiness}
              alt={d.headline || block.label}
              className="w-full h-[320px] object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

const renderQualificationStructure = (block: ContentBlock) => {
  const d = block.data as any;
  const items = Array.isArray(d.items) ? d.items : [];

  return (
    <section className="py-16 px-4 bg-accent/30">
      <div className="container mx-auto">
        <div className="text-center mb-10">
          <span className="text-xs font-bold uppercase tracking-widest text-secondary">
            Flexible Learning
          </span>
          <h2 className="text-3xl font-bold text-foreground mt-2">
            {d.title || "Qualification Structure"}
          </h2>
          {d.content ? (
            <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
              {d.content}
            </p>
          ) : null}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((module: any, index: number) => (
            <div
              key={module.title || index}
              className="bg-card border border-border rounded-lg p-6 hover:border-secondary hover:shadow-md transition-all"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <span className="text-primary font-bold text-sm">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>
              <h3 className="text-base font-semibold text-foreground mb-2">
                {module.title}
              </h3>
              {module.description ? (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {module.description}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const renderQualificationCertification = (block: ContentBlock) => {
  const d = block.data as any;
  const bgImage = resolveCmsImage(d.bgImage) || qualificationsBanner;

  return (
    <section className="relative py-16 overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={typeof bgImage === "string" ? bgImage : qualificationsBanner}
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-primary/90" />
      </div>
      <div className="relative container mx-auto px-4 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-primary-foreground mb-4">
          {d.title || "Certification & Validity"}
        </h2>
        {d.content ? (
          <p className="text-primary-foreground/85 max-w-2xl mx-auto leading-relaxed mb-6">
            {d.content}
          </p>
        ) : null}
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
  );
};

const renderQualificationFaq = (block: ContentBlock) => {
  const d = block.data as any;
  const items = Array.isArray(d.items) ? d.items : [];

  return (
    <section className="py-16 px-4">
      <div className="container mx-auto max-w-3xl">
        <div className="text-center mb-10">
          <span className="text-xs font-bold uppercase tracking-widest text-secondary">
            Have Questions?
          </span>
          <h2 className="text-3xl font-bold text-foreground mt-2">
            {d.title || "Frequently Asked Questions"}
          </h2>
        </div>
        <Accordion type="single" collapsible className="border-t border-border">
          {items.map((faq: any, index: number) => (
            <AccordionItem key={faq.question || index} value={`faq-${index}`}>
              <AccordionTrigger className="py-5 text-left no-underline hover:no-underline">
                <span className="font-medium text-foreground pr-4">
                  {faq.question}
                </span>
              </AccordionTrigger>
              <AccordionContent>
                  {renderRichText(faq.answer, "text-muted-foreground leading-relaxed")}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

const renderQualificationCards = (block: ContentBlock) => {
  const d = block.data as any;
  const items = Array.isArray(d.items) ? d.items : [];

  return (
    <section className="py-16 px-4 bg-accent/30">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
          {d.title || "Related Qualifications"}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.length > 0 ? (
            items.map((item: any, index: number) => (
              <Link
                key={item.slug || item.title || index}
                to={
                  item.slug ? `/qualifications/${item.slug}` : "/qualifications"
                }
                className="group relative rounded-lg overflow-hidden block h-[220px]"
              >
                <img
                  src={resolveCmsImage(item.image) || heroBusiness}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-primary/60 group-hover:bg-primary/70 transition-colors" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <h3 className="text-sm font-semibold text-primary-foreground">
                    {item.title}
                  </h3>
                  <span className="text-xs text-primary-foreground/70 mt-1 block">
                    {[item.level, item.duration || item.qualification_type]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                </div>
              </Link>
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-8 text-center text-sm text-muted-foreground md:col-span-3">
              No related qualifications available yet.
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

const renderQualificationFinalCta = (block: ContentBlock) => {
  const d = block.data as any;

  return (
    <section className="py-16 md:py-20 px-4">
      <div className="container mx-auto text-center max-w-3xl">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
          {d.title || "More Than One Qualification?"}
        </h2>
        {d.content ? (
          <p className="text-muted-foreground leading-relaxed mb-8">
            {d.content}
          </p>
        ) : null}
        {d.ctaLabel ? (
          <Link
            to={d.ctaHref || "/contact"}
            className="inline-block bg-secondary text-secondary-foreground px-8 py-3 rounded font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            {d.ctaLabel}
          </Link>
        ) : null}
      </div>
    </section>
  );
};

const renderQualificationHero = (block: ContentBlock) => {
  return (
    <div className="relative h-[300px] overflow-hidden bg-primary/10 border-b border-border flex items-center justify-center">
      <div className="text-center">
        <GraduationCap className="w-12 h-12 text-primary mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Qualification Header
        </h1>
        <p className="text-muted-foreground italic">
          Dynamic Qualification Content
        </p>
        <div className="mt-4 flex gap-2 justify-center">
          <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-xs font-bold uppercase">
            Dynamic Category
          </span>
          <span className="px-3 py-1 bg-secondary/20 text-secondary-foreground rounded-full text-xs font-bold uppercase">
            Level X
          </span>
        </div>
      </div>
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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
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
        description:
          err?.data?.message || "Failed to send message. Please try again.",
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
                      value={
                        formData[
                          (field.name === "name"
                            ? "full_name"
                            : field.name) as keyof typeof formData
                        ] || ""
                      }
                      onChange={handleChange}
                      className="w-full border border-input rounded px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  ) : (
                    <input
                      type={field.type}
                      name={field.name}
                      required={field.required}
                      value={
                        formData[
                          (field.name === "name"
                            ? "full_name"
                            : field.name) as keyof typeof formData
                        ] || ""
                      }
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

const BlogBlock = ({ d }: { d: any }) => {
  const { data: blogsResponse, isLoading } = useGetBlogsQuery({
    page_size: 3,
    is_active: true,
  });
  const blogs = blogsResponse?.data?.results || [];

  if (isLoading)
    return (
      <Section title={d.title || "Latest Blogs"}>
        <div className="text-center py-12 text-muted-foreground animate-pulse">
          Loading latest blogs...
        </div>
      </Section>
    );

  if (blogs.length === 0) return null;

  return (
    <Section title={d.title || "Latest Blogs"}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {blogs.map((blog: any) => (
          <Link
            key={blog.id}
            to={`/blogs/${blog.blog_slug}`}
            className="bg-card border border-border rounded-xl overflow-hidden group flex h-full flex-col"
          >
            <div className="aspect-[16/9] overflow-hidden">
              <Image
                image={blog.feature_image?.src}
                srcSet={blog.feature_image?.srcset}
                sizes="(min-width: 768px) 33vw, 100vw"
                alt={blog.blog_title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="flex flex-1 flex-col p-5">
              <div className="flex items-center gap-3 mb-3">
                {blog.category_name ? (
                  <span className="bg-secondary text-secondary-foreground text-xs font-bold px-3 py-1 rounded uppercase">
                    {blog.category_name}
                  </span>
                ) : null}
                <span className="text-xs text-muted-foreground">
                  {new Date(blog.created_at).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
              <h3 className="text-base font-semibold text-foreground leading-snug mb-2 group-hover:text-primary transition-colors">
                {blog.blog_title}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                {blog.blog_excerpt}
              </p>
              <span className="mt-auto text-sm font-semibold text-primary">
                Read More →
              </span>
            </div>
          </Link>
        ))}
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
      if (
        pageSlug === "home" ||
        pageSlug === "about" ||
        pageSlug === "contact" ||
        pageSlug?.startsWith("qualification-")
      ) {
        return null;
      }
      return renderHero(block, pageSlug);
    case "text":
      {
        const widthMode = d.widthMode === "full" ? "full" : "container";
        const bgMode = d.bgMode || "transparent";
        const alignment = ["left", "center", "right"].includes(d.alignment) ? d.alignment : "center";
        const showTitle = d.showTitle !== false;
        const showDescription = d.showDescription !== false;
        const wrapperClass =
          alignment === "left" ? "text-left" : alignment === "right" ? "text-right" : "text-center";
        const bodyWidthClass =
          alignment === "center" ? "mx-auto max-w-3xl" : alignment === "right" ? "ml-auto max-w-3xl" : "max-w-3xl";

        return (
          <section className={`relative overflow-hidden py-16 px-4 ${wrapperClass}`}>
            {bgMode === "image" && d.bgImage ? (
              <div className="absolute inset-0">
                <Image
                  image={resolveCmsImage(d.bgImage) as any}
                  alt=""
                  className="h-full w-full object-cover"
                />
                <div
                  className="absolute inset-0"
                  style={{ backgroundColor: d.overlayColor || "rgba(15,23,42,0.3)" }}
                />
              </div>
            ) : bgMode === "color" ? (
              <div
                className="absolute inset-0"
                style={{ backgroundColor: d.bgColor || "#f8fafc" }}
              />
            ) : null}

            <div className={`relative mx-auto ${widthMode === "container" ? "container" : "w-full max-w-7xl"}`}>
              {showTitle && d.title ? renderRichText(d.title, "mb-4 text-2xl font-bold") : null}
              {showDescription && d.content ? (
                <div className={`${bodyWidthClass} leading-relaxed text-muted-foreground`}>
                  {renderRichText(d.content)}
                </div>
              ) : null}
            </div>
          </section>
        );
      }
    case "full-width-text-image": {
      const bgMode = d.bgMode || (d.bgImage ? "image" : "color");
      const minHeight = Math.max(280, Number(d.minHeight) || 420);
      const shouldShowTitle = d.showTitle !== false;
      const shouldShowDescription = d.showDescription !== false;
      const shouldShowButton = d.showButton !== false;
      const hasCtas = Array.isArray(d.ctas) && d.ctas.length > 0;

      return (
        <section
          className="relative overflow-hidden px-4"
          style={{ minHeight: `${minHeight}px` }}
        >
          {bgMode === "image" && d.bgImage ? (
            <div className="absolute inset-0">
              <Image
                image={resolveCmsImage(d.bgImage) as any}
                alt={d.title || "Section background"}
                className="h-full w-full object-cover"
              />
              <div
                className="absolute inset-0"
                style={{ backgroundColor: d.overlayColor || "rgba(15,23,42,0.55)" }}
              />
            </div>
          ) : (
            <div
              className="absolute inset-0"
              style={{ backgroundColor: d.bgColor || "#0c2d6b" }}
            />
          )}

          <div
            className="relative mx-auto flex max-w-7xl items-center justify-center py-16 text-center"
            style={{ minHeight: `${minHeight}px` }}
          >
            <div className="max-w-3xl text-white">
              {shouldShowTitle && d.title
                ? renderRichText(d.title, "text-4xl font-bold text-white md:text-5xl")
                : null}
              {shouldShowDescription && d.content ? (
                <div className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-white/85 md:text-lg">
                  {renderRichText(d.content)}
                </div>
              ) : null}
              {shouldShowButton ? (
                <div className="mt-8 flex flex-wrap justify-center gap-4">
                  {hasCtas ? (
                    d.ctas.map((cta: any, i: number) => (
                      <Link
                        key={i}
                        to={cta.href || "/"}
                        className="inline-flex rounded bg-secondary px-8 py-3 text-sm font-semibold text-secondary-foreground hover:opacity-90"
                      >
                        {cta.label}
                      </Link>
                    ))
                  ) : d.ctaLabel ? (
                    <Link
                      to={d.ctaHref || "/"}
                      className="inline-flex rounded bg-secondary px-8 py-3 text-sm font-semibold text-secondary-foreground hover:opacity-90"
                    >
                      {d.ctaLabel}
                    </Link>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        </section>
      );
    }
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
      if (block.label === "Why Choose This Qualification") {
        return renderQualificationWhy(block);
      }
      {
        const widthMode = d.widthMode === "full" ? "full" : "container";
        const bgMode = d.bgMode || "transparent";
        const textAlign = ["left", "center", "right"].includes(d.textAlign) ? d.textAlign : "left";
        const showTitle = d.showTitle !== false;
        const showDescription = d.showDescription !== false;
        const showButton = d.showButton !== false;
        const showImage = d.showImage !== false;
        const textAlignClass =
          textAlign === "center" ? "text-center items-center" : textAlign === "right" ? "text-right items-end" : "text-left items-start";
        const buttonJustifyClass =
          textAlign === "center" ? "justify-center" : textAlign === "right" ? "justify-end" : "justify-start";

        return (
          <section className="relative overflow-hidden py-16 px-4">
            {bgMode === "image" && d.bgImage ? (
              <div className="absolute inset-0">
                <Image
                  image={resolveCmsImage(d.bgImage) as any}
                  alt=""
                  className="h-full w-full object-cover"
                />
                <div
                  className="absolute inset-0"
                  style={{ backgroundColor: d.overlayColor || "rgba(15,23,42,0.35)" }}
                />
              </div>
            ) : bgMode === "color" ? (
              <div
                className="absolute inset-0"
                style={{ backgroundColor: d.bgColor || "#f8fafc" }}
              />
            ) : null}

            <div className={`relative mx-auto ${widthMode === "container" ? "container" : "w-full max-w-7xl"}`}>
              <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
                {showImage ? (
                  <div
                    className={`rounded-xl overflow-hidden ${d.imagePosition === "right" ? "order-2" : "order-1"}`}
                  >
                    <Image
                      image={resolveCmsImage(d.image) || aboutHero}
                      alt={d.headline}
                      className="h-[400px] w-full rounded-xl object-cover"
                    />
                  </div>
                ) : null}
                <div
                  className={`rounded-xl border border-border bg-card p-8 ${showImage ? (d.imagePosition === "right" ? "order-1" : "order-2") : "lg:col-span-2"} flex flex-col ${textAlignClass}`}
                >
                  {showTitle && d.headline
                    ? renderRichText(d.headline, "mb-6 text-2xl font-bold text-foreground")
                    : null}
                  {showDescription ? (
                    <div className="space-y-4 text-sm leading-relaxed text-muted-foreground prose prose-sm max-w-none">
                      {Array.isArray(d.paragraphs) && d.paragraphs.length > 0
                        ? d.paragraphs.map((p: string, i: number) => renderRichText(p, "", i))
                        : renderRichText(d.description)}
                    </div>
                  ) : null}
                  {showButton ? (
                    <div className={`mt-6 flex flex-wrap gap-4 ${buttonJustifyClass}`}>
                      {Array.isArray(d.ctas) && d.ctas.length > 0 ? (
                        d.ctas.map((cta: any, i: number) => (
                          <Link
                            key={i}
                            to={cta.href || "/about"}
                            className="inline-block rounded bg-secondary px-6 py-2 text-sm font-semibold text-secondary-foreground hover:opacity-90"
                          >
                            {cta.label}
                          </Link>
                        ))
                      ) : d.ctaLabel ? (
                        <Link
                          to={d.ctaHref || "/about"}
                          className="inline-block rounded bg-secondary px-6 py-2 text-sm font-semibold text-secondary-foreground hover:opacity-90"
                        >
                          {d.ctaLabel}
                        </Link>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </section>
        );
      }
    case "about-split":
      return (
        <section
          className={
            pageSlug === "home" ? "bg-primary py-20 px-4" : "py-16 px-4"
          }
        >
          <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              {d.headline && renderRichText(d.headline, `text-3xl md:text-4xl font-bold leading-snug ${pageSlug === "home" ? "text-primary-foreground mb-6" : "text-foreground mb-6"}`)}
              <div className="flex flex-wrap gap-4">
                {Array.isArray(d.ctas) && d.ctas.length > 0 ? (
                  d.ctas.map((cta: any, i: number) => (
                    <Link
                      key={i}
                      to={cta.href || "/about"}
                      className={`${pageSlug === "home" ? "mt-0" : "mt-0"} inline-block px-6 py-3 rounded text-sm font-semibold hover:opacity-90 bg-secondary text-secondary-foreground`}
                    >
                      {cta.label}
                    </Link>
                  ))
                ) : d.ctaLabel ? (
                  <Link
                    to={d.ctaHref || "/about"}
                    className={`${pageSlug === "home" ? "mt-0" : "mt-6"} inline-block px-6 py-3 rounded text-sm font-semibold hover:opacity-90 bg-secondary text-secondary-foreground`}
                  >
                    {d.ctaLabel}
                  </Link>
                ) : null}
              </div>
            </div>
            <div
              className={`space-y-4 ${pageSlug === "home" ? "text-primary-foreground/80" : "text-muted-foreground"}`}
            >
              {Array.isArray(d.paragraphs) && d.paragraphs.length > 0
                ? d.paragraphs.map((p: string, i: number) => renderRichText(p, "leading-relaxed prose prose-sm max-w-none", i))
                : renderRichText(d.description)}
            </div>
          </div>
        </section>
      );
    case "faq":
      if (
        block.label === "Frequently Asked Questions" ||
        block.label === "FAQs"
      ) {
        return renderQualificationFaq(block);
      }
      return (
        <Section title="">
          {d.title && renderRichText(d.title, "text-3xl font-bold mb-8 text-center")}
          <div className="max-w-4xl mx-auto">
            <Accordion
              type="single"
              collapsible
              className="border-t border-border"
            >
              {Array.isArray(d.items) &&
                d.items.map((item: any, i: number) => (
                  <AccordionItem key={i} value={`faq-${i}`}>
                    <AccordionTrigger className="py-5 text-left no-underline hover:no-underline">
                      <span className="font-semibold text-foreground pr-4">
                        {renderRichText(item.question)}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent>
                        {renderRichText(item.answer, "text-sm text-muted-foreground leading-7")}
                    </AccordionContent>
                  </AccordionItem>
                ))}
            </Accordion>
          </div>
        </Section>
      );
    case "stats":
      return (
        <section className="bg-primary py-16 px-4">
          <div className="container mx-auto text-center">
            {d.title && renderRichText(d.title, "text-3xl font-bold text-primary-foreground mb-4")}
            {d.content ? 
                renderRichText(d.content, "text-primary-foreground/80 max-w-3xl mx-auto mb-12 prose prose-sm prose-invert max-w-none")
             : null}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {Array.isArray(d.items) &&
                d.items.map((item: any) => (
                  <div key={item.title} className="text-center">
                    <div className="text-5xl md:text-6xl font-bold text-primary-foreground mb-3">
                      {item.value}
                    </div>
                    <div className="text-lg font-semibold text-secondary mb-2">
                      {renderRichText(item.title)}
                    </div>
                    {item.description ? (
                      <div className="text-primary-foreground/70 text-sm max-w-xs mx-auto">
                        {renderRichText(item.description)}
                      </div>
                    ) : null}
                  </div>
                ))}
            </div>
          </div>
        </section>
      );
    case "cta":
      if (block.label === "Certification Banner") {
        return renderQualificationCertification(block);
      }
      if (block.label === "More Than One Qualification") {
        return renderQualificationFinalCta(block);
      }

      // Render dynamically from block data on all pages; fall back to CTASection if no data.
      const bgMode = d.bgMode || "color";
      const bgColor = d.bgColor || "#0c2d6b";
      const bgImage = d.bgImage;
      const overlayColor = d.overlayColor || "rgba(0,0,0,0.5)";
      const widthMode = d.widthMode === "full" ? "full" : "container";
      const textAlign = ["left", "center", "right"].includes(d.textAlign) ? d.textAlign : "center";
      const showTitle = d.showTitle !== false;
      const showDescription = d.showDescription !== false;
      const showButton = d.showButton !== false;
      const textAlignClass = textAlign === "left" ? "text-left" : textAlign === "right" ? "text-right" : "text-center";
      const buttonJustifyClass = textAlign === "left" ? "justify-start" : textAlign === "right" ? "justify-end" : "justify-center";

      return d.bgImage || d.title || d.content || d.ctaLabel || (Array.isArray(d.ctas) && d.ctas.length > 0) ? (
        <section className={`relative overflow-hidden py-20 px-4 text-white ${textAlignClass}`}>
          {bgMode === "image" && bgImage ? (
            <div className="absolute inset-0">
              <Image
                image={resolveCmsImage(bgImage) as any}
                className="w-full h-full object-cover"
                alt=""
              />
              <div className="absolute inset-0" style={{ backgroundColor: overlayColor }} />
            </div>
          ) : (
            <div className="absolute inset-0" style={{ backgroundColor: bgColor }} />
          )}

          <div className={`relative z-10 ${widthMode === "container" ? "container mx-auto" : "mx-auto w-full max-w-7xl"}`}>
            <div className={`mx-auto ${widthMode === "container" ? "max-w-3xl" : "max-w-5xl"}`}>
            {showTitle && d.title ? renderRichText(d.title, "text-3xl font-bold mb-4") : null}
            {showDescription && d.content ? (
              <div className={`text-white/80 mb-8 leading-relaxed prose prose-sm prose-invert max-w-none ${textAlign === "center" ? "mx-auto max-w-xl" : textAlign === "right" ? "ml-auto max-w-xl" : "max-w-xl"}`}>
                {renderRichText(d.content)}
              </div>
            ) : null}
            <div className={`flex flex-wrap gap-4 ${buttonJustifyClass}`}>
              {showButton ? (
                Array.isArray(d.ctas) && d.ctas.length > 0 ? (
                  d.ctas.map((cta: any, i: number) => (
                    <Link
                      key={i}
                      to={cta.href || "/qualifications"}
                      className="inline-block bg-secondary text-secondary-foreground px-8 py-3 font-semibold rounded hover:opacity-90 transition shadow-lg"
                    >
                      {cta.label}
                    </Link>
                  ))
                ) : d.ctaLabel ? (
                  <Link
                    to={d.ctaHref || "/qualifications"}
                    className="inline-block bg-secondary text-secondary-foreground px-8 py-3 font-semibold rounded hover:opacity-90 transition shadow-lg"
                  >
                    {d.ctaLabel}
                  </Link>
                ) : null
              ) : null}
            </div>
            </div>
          </div>
        </section>
      ) : (
        <CTASection />
      );

    case "logos":
      return Array.isArray(d.items) && d.items.length > 0 ? (
        <section className="bg-muted py-16 px-4">
          <div className="container mx-auto text-center mb-12">
            {d.title && renderRichText(d.title, "text-3xl font-bold text-foreground")}
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
      if (block.label === "Related Qualifications") {
        return renderQualificationCards(block);
      }
      return renderCardsGrid(block, pageSlug);
    case "popular-qualifications":
      return renderPopularQualifications(block);
    case "pricing":
      return renderPricing(block);
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
      return <BlogBlock d={d} />;
    case "why-us":
      return renderWhyUsOrFeatures(block, pageSlug);
    case "features":
    case "modules":
      if (block.label === "Course Structure") {
        return renderQualificationStructure(block);
      }
      return renderWhyUsOrFeatures(block, pageSlug);
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
      return renderQualificationHero(block);
    case "custom":
      if (!d.html) return null;
      {
        const widthMode = d.widthMode === "full" ? "full" : "container";
        const bgMode = d.bgMode || "transparent";
        const bgColor = d.bgColor || "#ffffff";
        const bgImage = d.bgImage;
        const overlayColor = d.overlayColor || "rgba(0,0,0,0.45)";

        return (
          <section className="relative overflow-hidden py-16 px-4">
            {bgMode === "image" && bgImage ? (
              <div className="absolute inset-0">
                <Image
                  image={resolveCmsImage(bgImage) as any}
                  className="h-full w-full object-cover"
                  alt=""
                />
                <div className="absolute inset-0" style={{ backgroundColor: overlayColor }} />
              </div>
            ) : bgMode === "color" ? (
              <div className="absolute inset-0" style={{ backgroundColor: bgColor }} />
            ) : null}

            <div className={`relative mx-auto ${widthMode === "container" ? "container" : "w-full"}`}>
              {renderRichText(d.html)}
            </div>
          </section>
        );
      }
    case "related-qualifications":
      return <RelatedQualificationsSection block={block} />;
    case "info-cards":
      return renderInfoCards(block);
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
