import { useEffect, useState } from "react";
import { fetchContent } from "@/lib/api";
import Section from "@/components/Section";
import QualificationCard from "@/components/QualificationCard";
import CTASection from "@/components/CTASection";

interface Qualification {
  id: string;
  title: string;
  category: string;
  level: string;
  duration: string;
  price: string;
  description: string;
}

interface QualData {
  title: string;
  intro: string;
  categories: string[];
  qualifications: Qualification[];
}

const Qualifications = () => {
  const [data, setData] = useState<QualData | null>(null);
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    fetchContent<QualData>("qualifications").then(setData);
  }, []);

  if (!data) return <div className="flex items-center justify-center h-96 text-muted-foreground">Loading...</div>;

  const filtered =
    activeCategory === "All"
      ? data.qualifications
      : data.qualifications.filter((q) => q.category === activeCategory);

  return (
    <div>
      <div className="bg-primary py-16 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl font-bold text-primary-foreground mb-4">{data.title}</h1>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto">{data.intro}</p>
        </div>
      </div>

      <Section title="">
        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {data.categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 text-sm font-medium rounded ${
                activeCategory === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-border"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((q) => (
            <QualificationCard key={q.id} {...q} />
          ))}
        </div>
      </Section>
      <CTASection />
    </div>
  );
};

export default Qualifications;
