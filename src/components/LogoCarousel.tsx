import { useEffect, useRef } from "react";

interface LogoItem {
  title: string;
  abbreviation: string;
}

const logos: LogoItem[] = [
  { title: "VTCT Approved", abbreviation: "VTCT" },
  { title: "Investors In People", abbreviation: "IIP" },
  { title: "ISO 9001 Quality Management", abbreviation: "ISO 9001" },
  { title: "CMI Centre", abbreviation: "CMI" },
  { title: "OTHM Qualifications", abbreviation: "OTHM" },
  { title: "QUALIFI", abbreviation: "QUALIFI" },
  { title: "REC Corporate Member", abbreviation: "REC" },
  { title: "Cyber Essentials Certified", abbreviation: "CE" },
  { title: "CPD Member", abbreviation: "CPD" },
];

const LogoCarousel = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let animationId: number;
    let position = 0;

    const scroll = () => {
      position += 0.5;
      if (position >= el.scrollWidth / 2) {
        position = 0;
      }
      el.scrollLeft = position;
      animationId = requestAnimationFrame(scroll);
    };

    animationId = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(animationId);
  }, []);

  const allLogos = [...logos, ...logos];

  return (
    <section className="bg-muted py-16 px-4">
      <div className="container mx-auto text-center mb-12">
        <h2 className="text-3xl font-bold text-foreground italic">
          Awarding Bodies, Awards and Accreditations
        </h2>
      </div>
      <div
        ref={scrollRef}
        className="overflow-hidden whitespace-nowrap"
        style={{ scrollBehavior: "auto" }}
      >
        <div className="inline-flex gap-8 px-4">
          {allLogos.map((logo, i) => (
            <div
              key={`${logo.abbreviation}-${i}`}
              className="inline-flex flex-col items-center justify-center bg-card border border-border rounded-lg min-w-[180px] h-[120px] px-6 flex-shrink-0 shadow-sm"
            >
              <span className="text-2xl font-bold text-primary mb-1">
                {logo.abbreviation}
              </span>
              <span className="text-xs text-muted-foreground text-center whitespace-normal max-w-[150px]">
                {logo.title}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LogoCarousel;
