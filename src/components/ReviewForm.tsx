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
  const isValidLength = charCount >= 50 && charCount <= 500;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    if (!isValidLength) {
      toast.error('Comment must be between 50 and 500 characters');
      return;
    }

    submitReview(
      { facultyId, rating, comment },
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
          placeholder="Share your experience with this faculty member (minimum 50 characters)..."
          className="min-h-[120px] resize-none border-2"
          maxLength={500}
        />
        <div className="flex justify-between mt-2 text-sm">
          <span
            className={
              charCount < 50
                ? 'text-destructive'
                : charCount > 500
                ? 'text-destructive'
                : 'text-muted-foreground'
            }
          >
            {charCount}/500 characters
          </span>
          {charCount < 50 && (
            <span className="text-muted-foreground">
              {50 - charCount} more needed
            </span>
          )}
        </div>
      </div>

      <Button
        type="submit"
        disabled={isPending || rating === 0 || !isValidLength}
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
