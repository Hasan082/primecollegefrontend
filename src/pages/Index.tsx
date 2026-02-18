import { useEffect, useState } from "react";
import { fetchContent } from "@/lib/api";
import HeroSlider from "@/components/HeroSlider";
import Section from "@/components/Section";

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
    items?: Array<{ title: string; description: string }>;
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
        <Section
          key={section.id}
          title={section.title}
          className={section.id === "why-us" ? "bg-muted" : ""}
        >
          {section.type === "text" && (
            <p className="text-center text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              {section.content}
            </p>
          )}
          {section.type === "features" && section.items && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {section.items.map((item) => (
                <div key={item.title} className="bg-card p-6 rounded border border-border">
                  <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
          )}
        </Section>
      ))}
    </div>
  );
};

export default Index;
