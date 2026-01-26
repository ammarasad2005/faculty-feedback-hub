import { useState, useCallback, useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { FacultyCard } from './FacultyCard';
import { ProcessedFaculty } from '@/hooks/useFacultyData';
import { cn } from '@/lib/utils';

interface FacultyCarouselProps {
  faculty: ProcessedFaculty[];
  reviewStats?: Record<string, { total: number; avg: number }>;
  onFacultyClick: (faculty: ProcessedFaculty) => void;
}

export const FacultyCarousel = ({
  faculty,
  reviewStats,
  onFacultyClick,
}: FacultyCarouselProps) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'center',
    containScroll: 'trimSnaps',
    loop: false,
  });

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on('select', onSelect);
    onSelect();
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onSelect]);

  const scrollTo = useCallback(
    (index: number) => emblaApi?.scrollTo(index),
    [emblaApi]
  );

  return (
    <div className="w-full">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex touch-pan-y">
          {faculty.map((member, index) => (
            <div
              key={member.id}
              className="flex-none w-[85%] min-w-0 pl-3 first:pl-0"
            >
              <FacultyCard
                faculty={member}
                stats={reviewStats?.[member.id]}
                onClick={() => onFacultyClick(member)}
                index={0}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Pagination dots */}
      {faculty.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-4">
          {scrollSnaps.map((_, index) => {
            const isActive = index === selectedIndex;
            const isNearby = Math.abs(index - selectedIndex) <= 2;
            
            // Show dots for: active, nearby, first, last
            const shouldShow = isNearby || index === 0 || index === scrollSnaps.length - 1;
            
            if (!shouldShow && scrollSnaps.length > 7) {
              // Show ellipsis indicator
              if (index === selectedIndex - 3 || index === selectedIndex + 3) {
                return (
                  <span key={index} className="w-1 h-2 flex items-center text-muted-foreground text-xs">
                    ·
                  </span>
                );
              }
              return null;
            }

            return (
              <button
                key={index}
                onClick={() => scrollTo(index)}
                className={cn(
                  'rounded-full transition-all duration-200',
                  isActive
                    ? 'w-6 h-2 bg-primary'
                    : 'w-2 h-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                )}
                aria-label={`Go to slide ${index + 1}`}
              />
            );
          })}
        </div>
      )}

      {/* Swipe hint */}
      <p className="text-center text-xs text-muted-foreground/60 mt-2">
        Swipe to browse • {selectedIndex + 1} of {faculty.length}
      </p>
    </div>
  );
};
