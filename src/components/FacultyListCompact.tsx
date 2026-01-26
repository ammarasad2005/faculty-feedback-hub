import { ProcessedFaculty } from '@/hooks/useFacultyData';
import { StarRating } from './StarRating';
import { Badge } from '@/components/ui/badge';
import { MapPin } from 'lucide-react';

interface FacultyListCompactProps {
  faculty: ProcessedFaculty[];
  reviewStats?: Record<string, { total: number; avg: number }>;
  onFacultyClick: (faculty: ProcessedFaculty) => void;
}

export const FacultyListCompact = ({
  faculty,
  reviewStats,
  onFacultyClick,
}: FacultyListCompactProps) => {
  return (
    <div className="divide-y divide-border border border-border rounded-md bg-card">
      {faculty.map((member, index) => (
        <button
          key={member.id}
          onClick={() => onFacultyClick(member)}
          className="w-full flex items-center gap-3 p-3 text-left hover:bg-accent/50 transition-colors opacity-0 animate-fade-in"
          style={{ animationDelay: `${Math.min(index * 30, 300)}ms`, animationFillMode: 'forwards' }}
        >
          <img
            src={member.image}
            alt={member.name}
            className="w-10 h-10 rounded-sm object-cover border border-border bg-muted shrink-0"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = '/placeholder.svg';
            }}
          />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm text-foreground truncate">
                {member.name}
              </span>
              {member.isHOD && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                  HOD
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="truncate">{member.department}</span>
              {member.office && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-0.5 shrink-0">
                    <MapPin className="w-3 h-3" />
                    {member.office}
                  </span>
                </>
              )}
            </div>
          </div>
          
          <div className="shrink-0 flex flex-col items-end gap-0.5">
            {reviewStats?.[member.id] && reviewStats[member.id].total > 0 ? (
              <>
                <StarRating rating={Math.round(reviewStats[member.id].avg)} size="sm" />
                <span className="text-[10px] text-muted-foreground">
                  {reviewStats[member.id].total} reviews
                </span>
              </>
            ) : (
              <span className="text-[10px] text-muted-foreground">No reviews</span>
            )}
          </div>
        </button>
      ))}
    </div>
  );
};
