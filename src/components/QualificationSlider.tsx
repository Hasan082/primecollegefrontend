import { useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import QualificationCard from "./QualificationCard";
import type { QualificationSliderBlock } from "@/types/pageBuilder";

interface QualificationSliderProps {
  block: QualificationSliderBlock;
}

const QualificationSlider = ({ block }: QualificationSliderProps) => {
  const { show_count, items = [] } = block.data;
  const resolvedItems = items.slice(0, show_count || 4);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: resolvedItems.length > 1,
    align: "start",
    slidesToScroll: 1,
  });

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  if (resolvedItems.length === 0) return null;

  return (
    <section className="py-16 px-4 bg-background">
      <div className="container mx-auto max-w-7xl">
        <div className="flex items-center justify-between mb-8 gap-4">
          <h2 className="text-3xl font-bold text-foreground">Featured Qualifications</h2>
          {resolvedItems.length > 1 && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={scrollPrev}
                className="rounded-full h-10 w-10 border-primary/20 text-primary hover:bg-primary hover:text-primary-foreground"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={scrollNext}
                className="rounded-full h-10 w-10 border-primary/20 text-primary hover:bg-primary hover:text-primary-foreground"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          )}
        </div>

        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex -ml-4">
            {resolvedItems.map((item) => (
              <div
                key={item.id}
                className="flex-[0_0_100%] min-w-0 pl-4 sm:flex-[0_0_50%] lg:flex-[0_0_33.333%] xl:flex-[0_0_25%]"
              >
                <QualificationCard
                  id={item.id}
                  slug={item.slug}
                  title={item.title}
                  category={item.category}
                  level={item.level}
                  duration={item.qualification_type || "Qualification"}
                  price={item.current_price ? `${item.currency || "£"}${item.current_price}` : "Contact us"}
                  description={item.short_description}
                  imageUrl={item.featured_image}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default QualificationSlider;
