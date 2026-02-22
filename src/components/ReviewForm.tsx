import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { StarRating } from './StarRating';
import { useSubmitReview } from '@/hooks/useReviews';
import { toast } from 'sonner';

interface ReviewFormProps {
  facultyId: string;
  facultyName: string;
}

export function ReviewForm({ facultyId, facultyName }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const { mutate: submitReview, isPending } = useSubmitReview();

  const charCount = comment.length;
  // Valid if empty OR at most 500 characters
  const isValidComment = charCount === 0 || charCount <= 500;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    if (charCount > 0 && charCount > 500) {
      toast.error('Comment must be at most 500 characters');
      return;
    }

    submitReview(
      { facultyId, rating, comment: comment.trim() || '' },
      {
        onSuccess: () => {
          toast.success('Review submitted successfully!');
          setRating(0);
          setComment('');
        },
        onError: () => {
          toast.error('Failed to submit review. Please try again.');
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 border-2 border-border p-4 bg-card">
      <div>
        <h3 className="font-semibold text-lg mb-2">Rate {facultyName}</h3>
        <StarRating
          rating={rating}
          size="lg"
          interactive
          onRatingChange={setRating}
        />
      </div>

      <div>
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="(Optional) Share your experience with this faculty member..."
          className="min-h-[120px] resize-none border-2"
          maxLength={500}
        />
        <div className="flex justify-between mt-2 text-sm">
          <span
            className={
              charCount > 500 ? 'text-destructive' : 'text-muted-foreground'
            }
          >
            {charCount}/500 characters
          </span>
        </div>
      </div>

      <Button
        type="submit"
        disabled={isPending || rating === 0 || !isValidComment}
        className="w-full"
      >
        {isPending ? 'Submitting...' : 'Submit Anonymous Review'}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        Your review is completely anonymous and cannot be edited or deleted once submitted.
      </p>
    </form>
  );
}
