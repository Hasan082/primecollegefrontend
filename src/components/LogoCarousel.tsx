import { useEffect, useRef } from "react";

import vtctLogo from "@/assets/logos/vtct.png";
import iipLogo from "@/assets/logos/iip.png";
import iso9001Logo from "@/assets/logos/iso9001.png";
import cmiLogo from "@/assets/logos/cmi.png";
import cyberEssentialsLogo from "@/assets/logos/cyber-essentials.png";
import cpdLogo from "@/assets/logos/cpd.png";

interface LogoItem {
  title: string;
  src: string;
  hasBackground?: boolean;
}

const logos: LogoItem[] = [
  { title: "VTCT Approved", src: vtctLogo },
  { title: "Investors In People", src: iipLogo },
  { title: "ISO 9001 Quality Management", src: iso9001Logo },
  { title: "CMI Centre", src: cmiLogo },
  { title: "Cyber Essentials Certified", src: cyberEssentialsLogo, hasBackground: true },
  { title: "CPD Member", src: cpdLogo, hasBackground: true },
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
        <div className="inline-flex gap-16 px-8 items-center">
          {allLogos.map((logo, i) => (
            <div
              key={`${logo.title}-${i}`}
              className="inline-flex items-center justify-center flex-shrink-0 h-[120px] min-w-[160px]"
            >
              <img
                src={logo.src}
                alt={logo.title}
                className="max-h-[100px] max-w-[180px] w-auto object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LogoCarousel;
