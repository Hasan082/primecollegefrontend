import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Users, Award, CheckCircle } from "lucide-react";
import { fetchContent } from "@/lib/api";
import HeroSlider from "@/components/HeroSlider";
import Section from "@/components/Section";
import CTASection from "@/components/CTASection";

const iconMap: Record<string, React.ElementType> = {
  Users,
  Award,
  CheckCircle,
};

interface HomeData {
  hero: Array<{
    category: string;
    title: string;
    price: string;
    cta: string;
    image: string;
  }>;
  sections: Array<{
    id: string;
    title: string;
    content?: string;
    type: string;
    headline?: string;
    paragraphs?: string[];
    ctaLabel?: string;
    ctaHref?: string;
    items?: Array<{ title: string; description?: string; value?: string; icon?: string }>;
  }>;
}

const Index = () => {
  const [data, setData] = useState<HomeData | null>(null);

  useEffect(() => {
    fetchContent<HomeData>("home").then(setData);
  }, []);

  if (!data) return <div className="flex items-center justify-center h-screen text-muted-foreground">Loading...</div>;

  return (
    <div>
      <HeroSlider slides={data.hero} />
      {data.sections.map((section) => (
        <div key={section.id}>
          {/* About split section */}
          {section.type === "about-split" && (
            <section className="bg-primary py-20 px-4">
              <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground leading-snug mb-6">
                    {section.headline}
                  </h2>
                  <Link
                    to={section.ctaHref || "/about"}
                    className="inline-block bg-secondary text-secondary-foreground px-6 py-3 font-semibold rounded text-sm hover:opacity-90"
                  >
                    {section.ctaLabel}
                  </Link>
                </div>
                <div className="space-y-4">
                  {section.paragraphs?.map((p, i) => (
                    <p key={i} className="text-primary-foreground/80 leading-relaxed">{p}</p>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Why Choose Us - dark section with icons */}
          {section.type === "why-us" && (
            <section className="bg-primary py-16 px-4">
              <div className="container mx-auto text-center">
                <h2 className="text-3xl font-bold text-primary-foreground mb-2">{section.title}</h2>
                <div className="w-12 h-1 bg-secondary mx-auto mb-8" />
                {section.content && (
                  <div className="max-w-3xl mx-auto mb-12">
                    {section.content.split("\n\n").map((p, i) => (
                      <p key={i} className="text-primary-foreground/80 leading-relaxed mb-4">{p}</p>
                    ))}
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-8">
                  {section.items?.map((item) => {
                    const Icon = iconMap[item.icon || ""] || Users;
                    return (
                      <div key={item.title} className="text-center">
                        <div className="flex justify-center mb-4">
                          <Icon className="w-16 h-16 text-primary-foreground/60" strokeWidth={1} />
                        </div>
                        <h3 className="text-xl font-bold text-primary-foreground mb-3">{item.title}</h3>
                        <p className="text-primary-foreground/70 text-sm max-w-xs mx-auto">{item.description}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          )}

          {/* Stats / Counter */}
          {section.type === "stats" && (
            <section className="bg-primary py-16 px-4">
              <div className="container mx-auto text-center">
                <h2 className="text-3xl font-bold text-primary-foreground mb-4">{section.title}</h2>
                <p className="text-primary-foreground/80 max-w-3xl mx-auto mb-12">{section.content}</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                  {section.items?.map((item) => (
                    <div key={item.title} className="text-center">
                      <div className="text-5xl md:text-6xl font-bold text-primary-foreground mb-3">{item.value}</div>
                      <div className="text-lg font-semibold text-secondary mb-2">{item.title}</div>
                      <p className="text-primary-foreground/70 text-sm max-w-xs mx-auto">{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Accreditation logos */}
          {section.type === "accreditation-logos" && (
            <section className="bg-primary py-16 px-4">
              <div className="container mx-auto text-center">
                <h2 className="text-3xl font-bold text-primary-foreground italic mb-12">{section.title}</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
                  {section.items?.map((item) => (
                    <div
                      key={item.title}
                      className="bg-primary-foreground/10 border border-primary-foreground/20 rounded p-6 flex items-center justify-center min-h-[100px]"
                    >
                      <span className="text-primary-foreground/80 text-sm font-semibold text-center">{item.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Plain text */}
          {section.type === "text" && (
            <Section title={section.title}>
              <p className="text-center text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                {section.content}
              </p>
            </Section>
          )}

          {/* Features grid */}
          {section.type === "features" && (
            <Section title={section.title} className={section.id === "why-us" ? "bg-muted" : ""}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {section.items?.map((item) => (
                  <div key={item.title} className="bg-card p-6 rounded border border-border">
                    <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {section.type === "cta" && <CTASection />}
        </div>
      ))}
    </div>
  );
};

export default Index;
