import { useEffect, useState } from "react";
import { fetchContent } from "@/lib/api";
import HeroSlider from "@/components/HeroSlider";
import Section from "@/components/Section";
import CTASection from "@/components/CTASection";

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
    items?: Array<{ title: string; description: string; value?: string }>;
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

          {section.type === "text" && (
            <Section title={section.title}>
              <p className="text-center text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                {section.content}
              </p>
            </Section>
          )}

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
