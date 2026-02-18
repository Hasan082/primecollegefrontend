import { useState, useEffect, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { HEADER_HEIGHT } from "./Header";
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
  const [prevIndex, setPrevIndex] = useState<number | null>(null);
  const [direction, setDirection] = useState<"left" | "right">("right");
  const [isAnimating, setIsAnimating] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const goTo = useCallback(
    (index: number, dir: "left" | "right") => {
      if (isAnimating || index === current) return;
      setDirection(dir);
      setPrevIndex(current);
      setCurrent(index);
      setIsAnimating(true);
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setPrevIndex(null);
        setIsAnimating(false);
      }, 600);
    },
    [current, isAnimating]
  );

  const next = useCallback(() => {
    goTo((current + 1) % slides.length, "right");
  }, [current, slides.length, goTo]);

  const prev = useCallback(() => {
    goTo((current - 1 + slides.length) % slides.length, "left");
  }, [current, slides.length, goTo]);

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  if (!slides.length) return null;

  const slideHeight = `calc(100vh - ${HEADER_HEIGHT}px)`;

  const renderSlide = (slide: Slide, key: string, animClass: string) => (
    <div
      key={key}
      className={`absolute inset-0 ${animClass}`}
      style={{ height: slideHeight }}
    >
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${imageMap[slide.image] || heroClassroom})` }}
      />
      <div className="absolute inset-0 bg-foreground/70" />
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
    </div>
  );

  const enterClass =
    direction === "right"
      ? "animate-[slideInRight_0.6s_ease-in-out_forwards]"
      : "animate-[slideInLeft_0.6s_ease-in-out_forwards]";

  const exitClass =
    direction === "right"
      ? "animate-[slideOutLeft_0.6s_ease-in-out_forwards]"
      : "animate-[slideOutRight_0.6s_ease-in-out_forwards]";

  return (
    <section className="relative w-full overflow-hidden" style={{ height: slideHeight }}>
      {/* Previous slide animating out */}
      {prevIndex !== null && renderSlide(slides[prevIndex], `prev-${prevIndex}`, exitClass)}

      {/* Current slide animating in (or static) */}
      {renderSlide(
        slides[current],
        `cur-${current}`,
        prevIndex !== null ? enterClass : ""
      )}

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
            onClick={() => goTo(i, i > current ? "right" : "left")}
            className={`h-3 rounded-full transition-all duration-300 ${
              i === current ? "w-8 bg-secondary" : "w-3 bg-background/50"
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSlider;
