import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { useAllReviews } from '@/hooks/useReviews';
import { ProcessedFaculty } from '@/hooks/useFacultyData';
import { StarRating } from './StarRating';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type SortOption = 'recent' | 'top' | 'least';

interface GlobalReviewsProps {
  faculty: ProcessedFaculty[];
  onFacultyClick: (faculty: ProcessedFaculty) => void;
}

export function GlobalReviews({ faculty, onFacultyClick }: GlobalReviewsProps) {
  const { data: reviews, isLoading } = useAllReviews();
  const [sortOption, setSortOption] = useState<SortOption>('recent');

  const facultyMap = useMemo(() => {
    const map: Record<string, ProcessedFaculty> = {};
    faculty.forEach((f) => {
      map[f.id] = f;
    });
    return map;
  }, [faculty]);

  const sortedReviews = useMemo(() => {
    if (!reviews) return [];

    let sorted = [...reviews];

    switch (sortOption) {
      case 'recent':
        sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'top':
        sorted.sort((a, b) => b.rating - a.rating || new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'least':
        sorted.sort((a, b) => a.rating - b.rating || new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
    }

    return sorted.slice(0, 5);
  }, [reviews, sortOption]);

  const getDropdownLabel = () => {
    switch (sortOption) {
      case 'recent':
        return 'Recent 5 Reviews';
      case 'top':
        return 'Top 5 Reviews';
      case 'least':
        return 'Least 5 Reviews';
    }
  };

  if (isLoading) {
    return (
      <div className="border-2 border-border p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border-2 border-border p-3 space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div className="border-2 border-dashed border-border p-6 mb-6 text-center">
        <p className="text-muted-foreground">No reviews submitted yet.</p>
      </div>
    );
  }

  return (
    <div className="border-2 border-border p-4 mb-6 bg-card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-foreground">All Reviews</h2>
        <Select value={sortOption} onValueChange={(v) => setSortOption(v as SortOption)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={getDropdownLabel()} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Recent 5 Reviews</SelectItem>
            <SelectItem value="top">Top 5 Reviews</SelectItem>
            <SelectItem value="least">Least 5 Reviews</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {sortedReviews.map((review) => {
          const facultyMember = facultyMap[review.faculty_id];
          return (
            <div
              key={review.id}
              className="border-2 border-border p-3 bg-background hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <button
                  onClick={() => facultyMember && onFacultyClick(facultyMember)}
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
    </div>
  );
}
