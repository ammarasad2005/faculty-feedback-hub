import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { StarRating } from './StarRating';
import { ReviewForm } from './ReviewForm';
import { ReviewList } from './ReviewList';
import { useReviews } from '@/hooks/useReviews';
import { ProcessedFaculty } from '@/hooks/useFacultyData';
import { ExternalLink, Mail } from 'lucide-react';

interface FacultyModalProps {
  faculty: ProcessedFaculty | null;
  onClose: () => void;
}

export function FacultyModal({ faculty, onClose }: FacultyModalProps) {
  const { data: reviews, isLoading } = useReviews(faculty?.id || '');

  if (!faculty) return null;

  const totalReviews = reviews?.length || 0;
  const avgRating = totalReviews > 0
    ? reviews!.reduce((sum, r) => sum + r.rating, 0) / totalReviews
    : 0;

  return (
    <Dialog open={!!faculty} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 border-2 border-border">
        <DialogHeader className="p-6 pb-0">
          <div className="flex gap-4">
            <div className="w-24 h-24 shrink-0 overflow-hidden border-2 border-border bg-muted">
              <img
                src={faculty.image}
                alt={faculty.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder.svg';
                }}
              />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-2 flex-wrap">
                <DialogTitle className="text-xl font-bold">
                  {faculty.name}
                </DialogTitle>
                {faculty.isHOD && (
                  <Badge variant="secondary">Head of Department</Badge>
                )}
              </div>
              
              <p className="text-muted-foreground mt-1">{faculty.department}</p>
              <p className="text-sm text-muted-foreground">{faculty.school}</p>
              
              <div className="flex items-center gap-4 mt-3 flex-wrap">
                {totalReviews > 0 && (
                  <div className="flex items-center gap-2">
                    <StarRating rating={Math.round(avgRating)} size="md" />
                    <span className="font-semibold">{avgRating.toFixed(1)}</span>
                    <span className="text-muted-foreground">({totalReviews} reviews)</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex gap-4 mt-4 text-sm">
            <a
              href={`mailto:${faculty.email}`}
              className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Mail className="w-4 h-4" />
              {faculty.email}
            </a>
            <a
              href={faculty.profile}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              View Profile
            </a>
          </div>
        </DialogHeader>

        <Separator className="my-4" />

        <ScrollArea className="max-h-[50vh] px-6 pb-6">
          <div className="space-y-6">
            <ReviewForm facultyId={faculty.id} facultyName={faculty.name} />
            
            <div>
              <h3 className="font-semibold text-lg mb-4">
                Reviews {totalReviews > 0 && `(${totalReviews})`}
              </h3>
              <ReviewList reviews={reviews} isLoading={isLoading} />
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
