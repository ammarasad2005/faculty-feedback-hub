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

export function useAllReviews() {
  return useQuery({
    queryKey: ['all-reviews'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Review[];
    },
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
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/submit-review`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({ facultyId, rating, comment }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit review');
      }

      return data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', variables.facultyId] });
      queryClient.invalidateQueries({ queryKey: ['all-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['review-stats'] });
    },
  });
}
