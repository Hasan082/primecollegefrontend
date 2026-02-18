import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import heroClassroom from "@/assets/hero-classroom.jpg";
import heroBusiness from "@/assets/hero-business.jpg";
import heroLeadership from "@/assets/hero-leadership.jpg";
import heroExecutive from "@/assets/hero-executive.jpg";
import heroCare from "@/assets/hero-care.jpg";

const imageMap: Record<string, string> = {
  classroom: heroClassroom,
  business: heroBusiness,
  leadership: heroLeadership,
  executive: heroExecutive,
  care: heroCare,
};

interface Slide {
  category: string;
  title: string;
  price: string;
  cta: string;
  image: string;
}

interface HeroSliderProps {
  slides: Slide[];
}

const HeroSlider = ({ slides }: HeroSliderProps) => {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  if (!slides.length) return null;

  const slide = slides[current];

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${imageMap[slide.image] || heroClassroom})` }}
      />
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-foreground/60" />

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center h-full">
        <div className="text-center max-w-3xl px-6">
          <span className="inline-block bg-secondary text-secondary-foreground text-xs font-bold px-4 py-1 rounded mb-4 uppercase tracking-wider">
            {slide.category}
          </span>
          <h1 className="text-3xl md:text-5xl font-bold text-background mb-4 leading-tight">
            {slide.title}
          </h1>
          <p className="text-2xl font-semibold text-secondary mb-6">{slide.price}</p>
          <a
            href="/qualifications"
            className="inline-block bg-secondary text-secondary-foreground px-8 py-3 font-semibold rounded hover:opacity-90 text-sm"
          >
            {slide.cta}
          </a>
        </div>
      </div>

      {/* Arrows */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-background/20 hover:bg-background/40 p-2 rounded-full"
      >
        <ChevronLeft className="w-6 h-6 text-background" />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-background/20 hover:bg-background/40 p-2 rounded-full"
      >
        <ChevronRight className="w-6 h-6 text-background" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-3 h-3 rounded-full ${
              i === current ? "bg-secondary" : "bg-background/50"
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSlider;
