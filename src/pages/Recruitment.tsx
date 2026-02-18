import { useEffect, useState } from "react";
import { fetchContent } from "@/lib/api";
import Section from "@/components/Section";

interface Opening {
  id: string;
  title: string;
  department: string;
  type: string;
  location: string;
  description: string;
}

interface RecruitmentData {
  title: string;
  intro: string;
  openings: Opening[];
}

const Recruitment = () => {
  const [data, setData] = useState<RecruitmentData | null>(null);

  useEffect(() => {
    fetchContent<RecruitmentData>("recruitment").then(setData);
  }, []);

  if (!data) return <div className="flex items-center justify-center h-96 text-muted-foreground">Loading...</div>;

  return (
    <div>
      <div className="bg-primary py-16 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl font-bold text-primary-foreground mb-4">{data.title}</h1>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto">{data.intro}</p>
        </div>
      </div>

      <Section title="Current Openings">
        <div className="space-y-6 max-w-3xl mx-auto">
          {data.openings.map((job) => (
            <div key={job.id} className="bg-card border border-border rounded p-6">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold text-foreground">{job.title}</h3>
                <span className="bg-secondary text-secondary-foreground text-xs font-bold px-3 py-1 rounded uppercase">
                  {job.type}
                </span>
              </div>
              <div className="text-sm text-muted-foreground mb-3">
                {job.department} · {job.location}
              </div>
              <p className="text-sm text-muted-foreground">{job.description}</p>
              <a
                href="/contact"
                className="inline-block mt-4 bg-primary text-primary-foreground px-6 py-2 rounded text-sm font-semibold hover:opacity-90"
              >
                Apply Now
              </a>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
};

export default Recruitment;
