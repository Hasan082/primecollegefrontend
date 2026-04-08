import { useCallback, useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import QualificationCard from "./QualificationCard";
import { useGetQualificationsQuery } from "@/redux/apis/qualificationApi";
import LoadingSpinner from "./LoadingSpinner";

interface QualificationSliderProps {
  block: {
    type: "qualification_slider";
    data: {
      title: string;
      selection_mode: "manual" | "auto";
      qualification_ids: string[];
      show_count: number;
      autoplay: boolean;
      delay_ms: number;
    };
  };
}

const QualificationSlider = ({ block }: QualificationSliderProps) => {
  const { title, selection_mode, qualification_ids, show_count, autoplay, delay_ms } = block.data;
  
  // To avoid circular dependency or complex filtering in API, we'll fetch a batch.
  // In a real app, you'd have a specific endpoint or use filtering.
  const { data: qualResponse, isLoading } = useGetQualificationsQuery();
  
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { 
      loop: true, 
      align: "start",
      slidesToScroll: 1,
    },
    autoplay ? [Autoplay({ delay: delay_ms || 5000, stopOnInteraction: false })] : []
  );

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  if (isLoading) return <LoadingSpinner />;

  const allQualifications = qualResponse?.data?.results || [];
  
  let featuredQualifications = [];
  if (selection_mode === "manual") {
    // Maintain the order of IDs from the block data
    featuredQualifications = qualification_ids
      .map(id => allQualifications.find(q => q.id === id))
      .filter(q => !!q);
  } else {
    // Just take the most recent ones
    featuredQualifications = allQualifications.slice(0, show_count || 4);
  }

  if (featuredQualifications.length === 0) return null;

  return (
    <section className="py-16 px-4 bg-background">
      <div className="container mx-auto max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-foreground">{title || "Featured Qualifications"}</h2>
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
        </div>

        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex -ml-4">
            {featuredQualifications.map((qual: any) => (
              <div 
                key={qual.id} 
                className="flex-[0_0_100%] min-w-0 pl-4 sm:flex-[0_0_50%] lg:flex-[0_0_33.333%] xl:flex-[0_0_25%]"
              >
                <QualificationCard qualification={qual} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default QualificationSlider;
