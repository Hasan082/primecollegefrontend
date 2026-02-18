import { useEffect, useState } from "react";
import { fetchContent } from "@/lib/api";
import Section from "@/components/Section";

interface AboutData {
  title: string;
  intro: string;
  sections: Array<{ title: string; content: string }>;
  stats: Array<{ label: string; value: string }>;
}

const About = () => {
  const [data, setData] = useState<AboutData | null>(null);

  useEffect(() => {
    fetchContent<AboutData>("about").then(setData);
  }, []);

  if (!data) return <div className="flex items-center justify-center h-96 text-muted-foreground">Loading...</div>;

  return (
    <div>
      {/* Hero Banner */}
      <div className="bg-primary py-16 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl font-bold text-primary-foreground mb-4">{data.title}</h1>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto">{data.intro}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-secondary py-8">
        <div className="container mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 px-4">
          {data.stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-bold text-secondary-foreground">{stat.value}</div>
              <div className="text-sm text-secondary-foreground/80">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Sections */}
      {data.sections.map((section, i) => (
        <Section key={i} title={section.title} className={i % 2 === 1 ? "bg-muted" : ""}>
          <p className="text-center text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            {section.content}
          </p>
        </Section>
      ))}
    </div>
  );
};

export default About;
