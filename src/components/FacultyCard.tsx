import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { StarRating } from './StarRating';
import { ProcessedFaculty } from '@/hooks/useFacultyData';
import { cn } from '@/lib/utils';

interface FacultyCardProps {
  faculty: ProcessedFaculty;
  stats?: { total: number; avg: number };
  onClick: () => void;
}

export const FacultyCard = React.forwardRef<HTMLDivElement, FacultyCardProps>(
  ({ faculty, stats, onClick }, ref) => {
    return (
      <Card
        ref={ref}
        className={cn(
          'group cursor-pointer transition-all duration-200',
          'hover:shadow-md hover:-translate-y-0.5',
          'border-2 border-border'
        )}
        onClick={onClick}
      >
      <CardContent className="p-4">
        <div className="flex gap-4">
          <div className="relative w-20 h-20 shrink-0 overflow-hidden border-2 border-border bg-muted">
            <img
              src={faculty.image}
              alt={faculty.name}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.src = '/placeholder.svg';
              }}
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-foreground truncate">
                {faculty.name}
              </h3>
              {faculty.isHOD && (
                <Badge variant="secondary" className="shrink-0 text-xs">
                  HOD
                </Badge>
              )}
            </div>
            
            <p className="text-sm text-muted-foreground truncate mt-1">
              {faculty.department}
            </p>
            
            <div className="flex items-center gap-2 mt-2">
              {stats && stats.total > 0 ? (
                <>
                  <StarRating rating={Math.round(stats.avg)} size="sm" />
                  <span className="text-sm text-muted-foreground">
                    ({stats.total})
                  </span>
                </>
              ) : (
                <span className="text-sm text-muted-foreground">
                  No reviews yet
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
      </Card>
    );
  }
);

FacultyCard.displayName = 'FacultyCard';
