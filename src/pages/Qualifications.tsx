import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import Breadcrumb from "@/components/Breadcrumb";
import { fetchContent } from "@/lib/api";
import Section from "@/components/Section";
import QualificationCard from "@/components/QualificationCard";
import CTASection from "@/components/CTASection";
import LoadingSpinner from "@/components/LoadingSpinner";
import qualificationsBanner from "@/assets/qualifications-banner.jpg";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";

interface Qualification {
  id: string;
  title: string;
  category: string;
  level: string;
  duration: string;
  price: string;
  description: string;
}

interface CategoryInfo {
  headline: string;
  description: string;
  progressionTitle: string;
}

interface QualData {
  title: string;
  intro: string;
  categories: string[];
  categoryInfo: Record<string, CategoryInfo>;
  qualifications: Qualification[];
}

const Qualifications = () => {
  const [data, setData] = useState<QualData | null>(null);
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get("category") || "All";
  const [activeCategory, setActiveCategory] = useState(categoryParam);
  const [activeLevel, setActiveLevel] = useState("All");

  useEffect(() => {
    fetchContent<QualData>("qualifications").then(setData);
  }, []);

  // Sync category from URL params
  useEffect(() => {
    setActiveCategory(categoryParam);
  }, [categoryParam]);

  if (!data) return <LoadingSpinner />;

  const levels = ["All", ...Array.from(new Set(data.qualifications.map((q) => q.level))).sort()];

  const filtered = data.qualifications.filter((q) => {
    const catMatch = activeCategory === "All" || q.category === activeCategory;
    const lvlMatch = activeLevel === "All" || q.level === activeLevel;
    return catMatch && lvlMatch;
  });

  const pageTitle = activeCategory !== "All" ? `${activeCategory} Courses` : data.title;
  const pageIntro = activeCategory !== "All"
    ? `Browse our ${activeCategory.toLowerCase()} courses and find the right qualification for your career.`
    : data.intro;

  return (
    <div>
      <div className="relative">
        <img src={qualificationsBanner} alt={pageTitle} className="w-full h-[300px] md:h-[400px] object-cover" />
        <div className="absolute inset-0 bg-primary/75" />
        <div className="absolute inset-0 flex items-end pb-10">
          <div className="container mx-auto px-4">
            <Breadcrumb items={activeCategory !== "All" ? [{ label: "Qualifications", href: "/qualifications" }, { label: activeCategory }] : [{ label: "Qualifications" }]} />
            <h1 className="text-4xl font-bold text-primary-foreground mb-4 text-center mt-4">{pageTitle}</h1>
            <p className="text-primary-foreground/80 max-w-2xl mx-auto text-center">{pageIntro}</p>
          </div>
        </div>
      </div>

      {/* Category Info Section */}
      {activeCategory !== "All" && data.categoryInfo[activeCategory] && (
        <section className="bg-primary text-primary-foreground py-16 px-4">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-3xl font-bold text-center mb-8">
              What is a Training Programme?
            </h2>
            <div className="bg-primary-foreground/10 border border-primary-foreground/20 rounded-xl p-6 mb-6">
              <p className="text-primary-foreground text-lg leading-relaxed">
                {data.categoryInfo[activeCategory].headline}
              </p>
            </div>
            <p className="text-primary-foreground/80 text-center leading-relaxed">
              {data.categoryInfo[activeCategory].description}
            </p>
          </div>
        </section>
      )}

      <Section title={activeCategory !== "All" && data.categoryInfo[activeCategory] ? data.categoryInfo[activeCategory].progressionTitle : ""}>
        {/* Dropdown Filters */}
        <div className="flex flex-wrap justify-end gap-3 mb-8">
          <select
            value={activeCategory}
            onChange={(e) => setActiveCategory(e.target.value)}
            className="bg-card border border-border text-foreground text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
          >
            {data.categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === "All" ? "All Categories" : cat}
              </option>
            ))}
          </select>

          <select
            value={activeLevel}
            onChange={(e) => setActiveLevel(e.target.value)}
            className="bg-card border border-border text-foreground text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
          >
            {levels.map((lvl) => (
              <option key={lvl} value={lvl}>
                {lvl === "All" ? "All Levels" : lvl}
              </option>
            ))}
          </select>
        </div>

        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((q) => (
              <QualificationCard key={q.id} {...q} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">No courses found matching your filters.</p>
            <Link to="/qualifications" className="text-primary font-medium mt-2 inline-block hover:underline">
              View all qualifications
            </Link>
          </div>
        )}

        {/* Brochure Button */}
        <div className="text-center mt-10">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="default" size="lg" className="gap-2">
                <BookOpen className="w-5 h-5" />
                View Our Brochure
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-5xl w-[95vw] h-[85vh] p-0">
              <iframe
                src="https://online.fliphtml5.com/nghfk/fkpv/"
                className="w-full h-full rounded-lg"
                allowFullScreen
                title="The Prime College Brochure"
              />
            </DialogContent>
          </Dialog>
        </div>
      </Section>

      {/* More Than One Course Section */}
      <section className="bg-primary/5 py-16 px-4">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-6">
            More Than One Qualification?
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-8">
            If you are looking to upskill your team in management and leadership, we will offer you comprehensive and flexible solutions. We are excited to discuss how we can support your training objectives by providing customised course packages.
          </p>
          <Link
            to="/contact"
            className="inline-block bg-secondary text-secondary-foreground px-8 py-3 font-semibold rounded-full hover:opacity-90 text-sm"
          >
            Get A Quote
          </Link>
        </div>
      </section>

      <CTASection />
    </div>
  );
};

export default Qualifications;
