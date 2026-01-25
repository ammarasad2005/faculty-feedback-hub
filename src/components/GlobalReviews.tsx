import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { Bell } from 'lucide-react';
import { useAllReviews } from '@/hooks/useReviews';
import { ProcessedFaculty } from '@/hooks/useFacultyData';
import { StarRating } from './StarRating';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface GlobalReviewsProps {
  faculty: ProcessedFaculty[];
  onFacultyClick: (faculty: ProcessedFaculty) => void;
}

export function GlobalReviews({ faculty, onFacultyClick }: GlobalReviewsProps) {
  const { data: reviews, isLoading } = useAllReviews();
  const [open, setOpen] = useState(false);

  const facultyMap = useMemo(() => {
    const map: Record<string, ProcessedFaculty> = {};
    faculty.forEach((f) => {
      map[f.id] = f;
    });
    return map;
  }, [faculty]);

  const recentReviews = useMemo(() => {
    if (!reviews) return [];
    return [...reviews]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);
  }, [reviews]);

  const handleFacultyClick = (facultyMember: ProcessedFaculty | undefined) => {
    if (facultyMember) {
      setOpen(false);
      onFacultyClick(facultyMember);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="fixed top-4 right-4 z-40 border-2"
          aria-label="View recent reviews"
        >
          <Bell className="h-5 w-5" />
          {reviews && reviews.length > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">
              {Math.min(reviews.length, 5)}
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Recent Reviews</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border-2 border-border p-3 space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        ) : !reviews || reviews.length === 0 ? (
          <div className="border-2 border-dashed border-border p-6 text-center">
            <p className="text-muted-foreground">No reviews submitted yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentReviews.map((review) => {
              const facultyMember = facultyMap[review.faculty_id];
              return (
                <div
                  key={review.id}
                  className="border-2 border-border p-3 bg-background hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <button
                      onClick={() => handleFacultyClick(facultyMember)}
                      className="text-sm font-medium text-primary hover:underline text-left"
                    >
                      {facultyMember?.name || 'Unknown Faculty'}
                    </button>
                    <span className="text-xs text-muted-foreground font-mono">
                      {format(new Date(review.created_at), 'MMM d, yyyy')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <StarRating rating={review.rating} size="sm" />
                  </div>
                  <p className="text-sm text-foreground line-clamp-2">{review.comment}</p>
                </div>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
