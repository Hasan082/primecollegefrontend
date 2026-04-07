import { Link } from "react-router-dom";
import { Users, Clock, Award, Target, CheckCircle } from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";
import CTASection from "@/components/CTASection";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useGetPageQuery } from "@/redux/apis/pageBuilderApi";
import { safeParseBlocks } from "@/utils/pageBuilder";
import { ContentBlock } from "@/types/pageBuilder";

import aboutHero from "@/assets/about-hero.jpg";
import aboutMission from "@/assets/about-mission.jpg";

const iconMap: Record<string, React.ElementType> = {
  Users, Clock, Award, Target, CheckCircle
};

const About = () => {
  const { data: pageResponse, isLoading } = useGetPageQuery("about");
  const blocks = safeParseBlocks(pageResponse?.data?.blocks || []);

  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      {blocks.length > 0 ? (
        blocks.map((block) => <AboutBlockRenderer key={block.id} block={block} />)
      ) : (
        <div className="py-20 text-center text-muted-foreground">
          No content available for this page yet.
        </div>
      )}
    </div>
  );
};

const AboutBlockRenderer = ({ block }: { block: ContentBlock }) => {
  const d = block.data as any;

  switch (block.type) {
    case "hero":
      return (
        <div className="relative h-[400px] overflow-hidden">
          <img 
            src={d.image || aboutHero} 
            alt={d.title} 
            className="w-full h-full object-cover" 
          />
          <div className="absolute inset-0 bg-foreground/70" />
          <div className="absolute inset-0 flex items-center justify-center text-center px-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-background">{d.title}</h1>
              {d.subtitle && <p className="mt-4 text-background/80 max-w-2xl mx-auto text-lg">{d.subtitle}</p>}
            </div>
          </div>
          <div className="absolute bottom-0 w-full">
             <Breadcrumb items={[{ label: "About Us" }]} />
          </div>
        </div>
      );

    case "about-split":
      return (
        <section className="py-16 px-4">
          <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="text-3xl font-bold text-foreground leading-snug">{d.headline}</h2>
              {d.ctaLabel && (
                <Link
                  to={d.ctaHref || "/about"}
                  className="mt-6 inline-block bg-secondary text-secondary-foreground px-6 py-2 rounded text-sm font-semibold hover:opacity-90"
                >
                  {d.ctaLabel}
                </Link>
              )}
            </div>
            <div className="space-y-4">
              {Array.isArray(d.paragraphs) && d.paragraphs.map((p: string, i: number) => (
                <div key={i} className="text-muted-foreground leading-relaxed prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: p }} />
              ))}
            </div>
          </div>
        </section>
      );

    case "image-text":
      return (
        <section className="bg-muted py-16 px-4">
          <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className={`bg-card rounded-xl p-8 border border-border ${d.imagePosition === "right" ? "order-1" : "order-2"}`}>
              <h2 className="text-2xl font-bold text-foreground mb-6">{d.headline}</h2>
              <div className="space-y-4 text-sm text-muted-foreground leading-relaxed prose prose-sm max-w-none">
                {Array.isArray(d.paragraphs) && d.paragraphs.map((p: string, i: number) => (
                   <div key={i} dangerouslySetInnerHTML={{ __html: p }} />
                ))}
              </div>
            </div>
            <div className={`rounded-xl overflow-hidden ${d.imagePosition === "right" ? "order-2" : "order-1"}`}>
              <img src={d.image || aboutHero} alt={d.headline} className="w-full h-[400px] object-cover rounded-xl" />
            </div>
          </div>
        </section>
      );

    case "why-us":
      return (
        <section className="bg-muted py-16 px-4">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">{d.title}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-12">{d.content}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {Array.isArray(d.items) && d.items.map((item: any) => {
                const Icon = iconMap[item.icon] || Users;
                return (
                  <div key={item.title} className="bg-card border border-border rounded-xl p-6 text-left shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-secondary" strokeWidth={2} />
                      </div>
                      <h3 className="font-semibold text-foreground">{item.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      );

    case "features":
      return (
        <section className="py-16 px-4">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">{d.title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {Array.isArray(d.items) && d.items.map((item: any) => (
                <div key={item.title} className="bg-card border border-border rounded-xl p-6 text-center shadow-sm">
                  <h3 className="font-bold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      );

    case "cta":
      return (
        <section className="relative py-20 px-4 overflow-hidden bg-primary text-primary-foreground text-center">
          {d.bgImage && <img src={d.bgImage} className="absolute inset-0 w-full h-full object-cover opacity-20" alt="" />}
          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">{d.title}</h2>
            <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto leading-relaxed">{d.content}</p>
            {d.ctaLabel && (
              <Link
                to={d.ctaHref || "/qualifications"}
                className="inline-block bg-secondary text-secondary-foreground px-8 py-3 font-semibold rounded hover:opacity-90 transition shadow-lg"
              >
                {d.ctaLabel}
              </Link>
            )}
          </div>
        </section>
      );

    default:
      return null;
  }
};

export default About;
