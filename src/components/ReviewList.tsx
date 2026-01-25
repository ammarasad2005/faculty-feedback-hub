import { format } from 'date-fns';
import { StarRating } from './StarRating';
import { Review } from '@/types/faculty';
import { Skeleton } from '@/components/ui/skeleton';

interface ReviewListProps {
  reviews: Review[] | undefined;
  isLoading: boolean;
}

export function ReviewList({ reviews, isLoading }: ReviewListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border-2 border-border p-4 space-y-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div className="border-2 border-dashed border-border p-8 text-center">
        <p className="text-muted-foreground">
          No reviews yet. Be the first to review!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div key={review.id} className="border-2 border-border p-4 bg-card">
          <div className="flex items-center justify-between mb-2">
            <StarRating rating={review.rating} size="sm" />
            <span className="text-xs text-muted-foreground font-mono">
              {format(new Date(review.created_at), 'MMM d, yyyy')}
            </span>
          </div>
          <p className="text-foreground leading-relaxed">{review.comment}</p>
        </div>
      ))}
    </div>
  );
}
