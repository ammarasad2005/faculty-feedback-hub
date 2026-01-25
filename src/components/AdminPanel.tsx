import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { StarRating } from './StarRating';
import { format } from 'date-fns';
import { Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface AdminPanelProps {
  open: boolean;
  onClose: () => void;
}

interface Review {
  id: string;
  faculty_id: string;
  rating: number;
  comment: string;
  created_at: string;
}

export function AdminPanel({ open, onClose }: AdminPanelProps) {
  const queryClient = useQueryClient();
  const [reviewToDelete, setReviewToDelete] = useState<Review | null>(null);

  const { data: reviews, isLoading } = useQuery({
    queryKey: ['admin-reviews'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Review[];
    },
    enabled: open,
  });

  const deleteMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Review deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['review-stats'] });
      setReviewToDelete(null);
    },
    onError: () => {
      toast.error('Failed to delete review');
    },
  });

  const handleDeleteClick = (review: Review) => {
    setReviewToDelete(review);
  };

  const confirmDelete = () => {
    if (reviewToDelete) {
      deleteMutation.mutate(reviewToDelete.id);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={() => onClose()}>
        <DialogContent className="max-w-3xl max-h-[90vh] p-0 border-2 border-border">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="text-xl font-bold">
              Admin Panel - Manage Reviews
            </DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {reviews?.length || 0} total reviews
            </p>
          </DialogHeader>

          <ScrollArea className="max-h-[70vh] px-6 pb-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : reviews?.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-border">
                <p className="text-muted-foreground">No reviews yet.</p>
              </div>
            ) : (
              <div className="space-y-4 mt-4">
                {reviews?.map((review) => (
                  <div
                    key={review.id}
                    className="border-2 border-border p-4 bg-card group"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <StarRating rating={review.rating} size="sm" />
                          <span className="text-xs text-muted-foreground font-mono">
                            {format(new Date(review.created_at), 'MMM d, yyyy HH:mm')}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2 font-mono truncate">
                          Faculty: {review.faculty_id}
                        </p>
                        <p className="text-foreground leading-relaxed">
                          {review.comment}
                        </p>
                      </div>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleDeleteClick(review)}
                        disabled={deleteMutation.isPending}
                        className="shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!reviewToDelete} onOpenChange={() => setReviewToDelete(null)}>
        <AlertDialogContent className="border-2 border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Review</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this review? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
