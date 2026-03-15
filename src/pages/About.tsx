import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { GraduationCap, Clock, TrendingUp, Heart, RefreshCw, Users, Target, BarChart3, Shield, Lightbulb } from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";
import { fetchContent } from "@/lib/api";
import CTASection from "@/components/CTASection";
import LoadingSpinner from "@/components/LoadingSpinner";
import aboutHero from "@/assets/about-hero.jpg";
import aboutMission from "@/assets/about-mission.jpg";

const iconMap: Record<string, React.ElementType> = {
  GraduationCap, Clock, TrendingUp, Heart, RefreshCw, Users, Target, BarChart: BarChart3, Shield, Lightbulb,
};

interface AboutData {
  title: string;
  intro: string;
  about: {
    label: string;
    headline: string;
    paragraphs: string[];
  };
  vision: {
    title: string;
    items: Array<{ label: string; content: string }>;
  };
  mission: {
    title: string;
    content: string;
  };
  approach: {
    title: string;
    intro: string;
    items: Array<{ title: string; description: string; icon: string }>;
  };
  values: {
    title: string;
    intro: string;
    items: Array<{ title: string; description: string; icon: string }>;
    footer: string;
  };
  stats: Array<{ label: string; value: string }>;
}

const About = () => {
  const [data, setData] = useState<AboutData | null>(null);

  useEffect(() => {
    fetchContent<AboutData>("about").then(setData);
  }, []);

  if (!data) return <LoadingSpinner />;

  return (
    <div>
      {/* Hero Banner with Image */}
      <div className="relative h-[400px] overflow-hidden">
        <img src={aboutHero} alt="About Prime College" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-foreground/70" />
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-4xl md:text-5xl font-bold text-background">{data.title}</h1>
        </div>
      </div>
      <Breadcrumb items={[{ label: "About Us" }]} />

      {/* About Section - two column */}
      <section className="py-16 px-4">
        <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-secondary mb-2 block">{data.about.label}</span>
            <h2 className="text-3xl font-bold text-foreground leading-snug">{data.about.headline}</h2>
          </div>
          <div className="space-y-4">
            {data.about.paragraphs.map((p, i) => (
              <p key={i} className="text-muted-foreground leading-relaxed">{p}</p>
            ))}
          </div>
        </div>
      </section>

      {/* Vision Section - text left, image right */}
      <section className="bg-muted py-16 px-4">
        <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="bg-card rounded-xl p-8 border border-border">
            <h2 className="text-2xl font-bold text-foreground mb-6">{data.vision.title}</h2>
            <div className="space-y-5">
              {data.vision.items.map((item) => (
                <div key={item.label}>
                  <h3 className="font-semibold text-primary mb-1">{item.label}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.content}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl overflow-hidden">
            <img src={aboutHero} alt="Our Vision" className="w-full h-[400px] object-cover rounded-xl" />
          </div>
        </div>
      </section>

      {/* Mission Section - image strip + text overlay */}
      <section className="relative">
        <div className="h-[400px] overflow-hidden">
          <img src={aboutMission} alt="Our Mission" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-foreground/65" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center px-4">
          <div className="bg-card border border-border rounded-xl p-8 max-w-xl text-center shadow-lg">
            <h2 className="text-2xl font-bold text-foreground mb-4">{data.mission.title}</h2>
            <p className="text-muted-foreground leading-relaxed">{data.mission.content}</p>
          </div>
        </div>
      </section>

      {/* Smart Approach */}
      <section className="bg-muted py-16 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">{data.approach.title}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-12">{data.approach.intro}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {data.approach.items.map((item) => {
              const Icon = iconMap[item.icon] || Users;
              return (
                <div key={item.title} className="bg-card border border-border rounded-xl p-6 text-left">
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

      {/* Team Photo Strip */}
      <div className="grid grid-cols-4 h-[200px]">
        <img src={aboutHero} alt="Team" className="w-full h-full object-cover" />
        <img src={aboutMission} alt="Team" className="w-full h-full object-cover" />
        <img src={aboutHero} alt="Team" className="w-full h-full object-cover object-left" />
        <img src={aboutMission} alt="Team" className="w-full h-full object-cover object-right" />
      </div>

      {/* Values */}
      <section className="py-16 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">{data.values.title}</h2>
          <p className="text-muted-foreground max-w-3xl mx-auto mb-12">{data.values.intro}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto mb-10">
            {data.values.items.map((item) => {
              const Icon = iconMap[item.icon] || Target;
              return (
                <div key={item.title} className="bg-card border border-border rounded-xl p-6 text-center shadow-sm">
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
                      <Icon className="w-8 h-8 text-primary-foreground" strokeWidth={1.5} />
                    </div>
                  </div>
                  <h3 className="font-bold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                </div>
              );
            })}
          </div>
          <p className="text-sm text-muted-foreground max-w-3xl mx-auto italic">{data.values.footer}</p>
        </div>
      </section>

      {/* CTA */}
      <CTASection />
    </div>
  );
};

export default About;
