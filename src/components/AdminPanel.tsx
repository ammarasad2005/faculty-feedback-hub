import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { StarRating } from './StarRating';
import { format } from 'date-fns';
import { Trash2, Loader2, Search, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { useFacultyData, ProcessedFaculty } from '@/hooks/useFacultyData';

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

type DeleteMode = 'single' | 'faculty' | 'department' | 'all';

interface DeleteConfirmation {
  mode: DeleteMode;
  reviewId?: string;
  facultyId?: string;
  facultyName?: string;
  department?: string;
}

export function AdminPanel({ open, onClose }: AdminPanelProps) {
  const queryClient = useQueryClient();
  const { faculty, departments } = useFacultyData();
  const [deleteConfirmation, setDeleteConfirmation] = useState<DeleteConfirmation | null>(null);
  const [facultySearch, setFacultySearch] = useState('');

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

  // Create a map of faculty_id to review count
  const reviewCountByFaculty = useMemo(() => {
    const counts: Record<string, number> = {};
    reviews?.forEach((review) => {
      counts[review.faculty_id] = (counts[review.faculty_id] || 0) + 1;
    });
    return counts;
  }, [reviews]);

  // Create a map of department to review count
  const reviewCountByDepartment = useMemo(() => {
    const counts: Record<string, number> = {};
    faculty.forEach((f) => {
      const count = reviewCountByFaculty[f.id] || 0;
      if (count > 0) {
        counts[f.department] = (counts[f.department] || 0) + count;
      }
    });
    return counts;
  }, [faculty, reviewCountByFaculty]);

  // Filter faculty with reviews
  const facultyWithReviews = useMemo(() => {
    return faculty
      .filter((f) => reviewCountByFaculty[f.id] > 0)
      .filter((f) => 
        f.name.toLowerCase().includes(facultySearch.toLowerCase()) ||
        f.department.toLowerCase().includes(facultySearch.toLowerCase())
      );
  }, [faculty, reviewCountByFaculty, facultySearch]);

  // Departments with reviews
  const departmentsWithReviews = useMemo(() => {
    return departments.filter((d) => reviewCountByDepartment[d] > 0);
  }, [departments, reviewCountByDepartment]);

  // Delete single review mutation
  const deleteSingleMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Review deleted successfully');
      invalidateQueries();
    },
    onError: () => {
      toast.error('Failed to delete review');
    },
  });

  // Delete all reviews for a faculty member
  const deleteFacultyReviewsMutation = useMutation({
    mutationFn: async (facultyId: string) => {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('faculty_id', facultyId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('All reviews for this faculty member deleted');
      invalidateQueries();
    },
    onError: () => {
      toast.error('Failed to delete reviews');
    },
  });

  // Delete all reviews for a department
  const deleteDepartmentReviewsMutation = useMutation({
    mutationFn: async (department: string) => {
      const facultyIds = faculty
        .filter((f) => f.department === department)
        .map((f) => f.id);

      const { error } = await supabase
        .from('reviews')
        .delete()
        .in('faculty_id', facultyIds);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('All reviews for this department deleted');
      invalidateQueries();
    },
    onError: () => {
      toast.error('Failed to delete reviews');
    },
  });

  // Delete all reviews
  const deleteAllReviewsMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('All reviews deleted');
      invalidateQueries();
    },
    onError: () => {
      toast.error('Failed to delete all reviews');
    },
  });

  const invalidateQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
    queryClient.invalidateQueries({ queryKey: ['reviews'] });
    queryClient.invalidateQueries({ queryKey: ['all-reviews'] });
    queryClient.invalidateQueries({ queryKey: ['review-stats'] });
    setDeleteConfirmation(null);
  };

  const handleConfirmDelete = () => {
    if (!deleteConfirmation) return;

    switch (deleteConfirmation.mode) {
      case 'single':
        if (deleteConfirmation.reviewId) {
          deleteSingleMutation.mutate(deleteConfirmation.reviewId);
        }
        break;
      case 'faculty':
        if (deleteConfirmation.facultyId) {
          deleteFacultyReviewsMutation.mutate(deleteConfirmation.facultyId);
        }
        break;
      case 'department':
        if (deleteConfirmation.department) {
          deleteDepartmentReviewsMutation.mutate(deleteConfirmation.department);
        }
        break;
      case 'all':
        deleteAllReviewsMutation.mutate();
        break;
    }
  };

  const isPending = 
    deleteSingleMutation.isPending || 
    deleteFacultyReviewsMutation.isPending || 
    deleteDepartmentReviewsMutation.isPending ||
    deleteAllReviewsMutation.isPending;

  const getConfirmationMessage = () => {
    if (!deleteConfirmation) return '';
    
    switch (deleteConfirmation.mode) {
      case 'single':
        return 'Are you sure you want to delete this review?';
      case 'faculty':
        return `Are you sure you want to delete all reviews for ${deleteConfirmation.facultyName}?`;
      case 'department':
        return `Are you sure you want to delete all reviews for the ${deleteConfirmation.department} department?`;
      case 'all':
        return 'Are you sure you want to delete ALL reviews from the entire campus? This action cannot be undone.';
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={() => onClose()}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0 border-2 border-border">
          <DialogHeader className="p-6 pb-0">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-xl font-bold">
                  Admin Panel - Manage Reviews
                </DialogTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {reviews?.length || 0} total reviews
                </p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setDeleteConfirmation({ mode: 'all' })}
                disabled={!reviews?.length}
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete All Reviews
              </Button>
            </div>
          </DialogHeader>

          <Tabs defaultValue="reviews" className="px-6 pb-6">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="reviews">Individual Reviews</TabsTrigger>
              <TabsTrigger value="faculty">By Faculty</TabsTrigger>
              <TabsTrigger value="department">By Department</TabsTrigger>
            </TabsList>

            <TabsContent value="reviews">
              <ScrollArea className="max-h-[55vh]">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : reviews?.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-border">
                    <p className="text-muted-foreground">No reviews yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reviews?.map((review) => {
                      const facultyMember = faculty.find((f) => f.id === review.faculty_id);
                      return (
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
                              <p className="text-sm font-medium mb-1">
                                {facultyMember?.name || 'Unknown Faculty'}
                              </p>
                              <p className="text-xs text-muted-foreground mb-2">
                                {facultyMember?.department || review.faculty_id}
                              </p>
                              <p className="text-foreground leading-relaxed">
                                {review.comment}
                              </p>
                            </div>
                            <Button
                              variant="destructive"
                              size="icon"
                              onClick={() => setDeleteConfirmation({ 
                                mode: 'single', 
                                reviewId: review.id 
                              })}
                              disabled={isPending}
                              className="shrink-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="faculty">
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search faculty by name or department..."
                    value={facultySearch}
                    onChange={(e) => setFacultySearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <ScrollArea className="max-h-[50vh]">
                {facultyWithReviews.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-border">
                    <p className="text-muted-foreground">
                      {facultySearch ? 'No matching faculty with reviews.' : 'No faculty with reviews.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {facultyWithReviews.map((f) => (
                      <div
                        key={f.id}
                        className="flex items-center justify-between p-3 border-2 border-border bg-card"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{f.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {f.department} • {reviewCountByFaculty[f.id]} review{reviewCountByFaculty[f.id] !== 1 ? 's' : ''}
                          </p>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setDeleteConfirmation({ 
                            mode: 'faculty', 
                            facultyId: f.id,
                            facultyName: f.name
                          })}
                          disabled={isPending}
                          className="gap-2 shrink-0"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete All
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="department">
              <ScrollArea className="max-h-[55vh]">
                {departmentsWithReviews.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-border">
                    <p className="text-muted-foreground">No departments with reviews.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {departmentsWithReviews.map((dept) => (
                      <div
                        key={dept}
                        className="flex items-center justify-between p-3 border-2 border-border bg-card"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium">{dept}</p>
                          <p className="text-sm text-muted-foreground">
                            {reviewCountByDepartment[dept]} review{reviewCountByDepartment[dept] !== 1 ? 's' : ''}
                          </p>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setDeleteConfirmation({ 
                            mode: 'department', 
                            department: dept
                          })}
                          disabled={isPending}
                          className="gap-2 shrink-0"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete All
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteConfirmation} onOpenChange={() => setDeleteConfirmation(null)}>
        <AlertDialogContent className="border-2 border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              {deleteConfirmation?.mode === 'all' && (
                <AlertTriangle className="h-5 w-5 text-destructive" />
              )}
              {deleteConfirmation?.mode === 'all' ? 'Delete All Campus Reviews' : 'Delete Reviews'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {getConfirmationMessage()}
              {deleteConfirmation?.mode !== 'single' && (
                <span className="block mt-2 font-medium text-destructive">
                  This action cannot be undone.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isPending}
            >
              {isPending ? (
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
