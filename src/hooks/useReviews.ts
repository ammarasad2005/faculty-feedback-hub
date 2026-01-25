import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Review } from '@/types/faculty';

export function useReviews(facultyId: string) {
  return useQuery({
    queryKey: ['reviews', facultyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('faculty_id', facultyId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Review[];
    },
    enabled: !!facultyId,
  });
}

export function useAllReviewStats() {
  return useQuery({
    queryKey: ['review-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('faculty_id, rating');

      if (error) throw error;

      const stats: Record<string, { total: number; sum: number; avg: number }> = {};
      
      (data as Review[]).forEach((review) => {
        if (!stats[review.faculty_id]) {
          stats[review.faculty_id] = { total: 0, sum: 0, avg: 0 };
        }
        stats[review.faculty_id].total++;
        stats[review.faculty_id].sum += review.rating;
        stats[review.faculty_id].avg = stats[review.faculty_id].sum / stats[review.faculty_id].total;
      });

      return stats;
    },
  });
}

export function useSubmitReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ facultyId, rating, comment }: { facultyId: string; rating: number; comment: string }) => {
      const { data, error } = await supabase
        .from('reviews')
        .insert({
          faculty_id: facultyId,
          rating,
          comment,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', variables.facultyId] });
      queryClient.invalidateQueries({ queryKey: ['review-stats'] });
    },
  });
}
