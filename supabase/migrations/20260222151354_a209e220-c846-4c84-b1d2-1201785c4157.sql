ALTER TABLE public.reviews DROP CONSTRAINT IF EXISTS reviews_comment_check;

ALTER TABLE public.reviews ADD CONSTRAINT reviews_comment_check 
  CHECK (comment IS NULL OR (char_length(comment) >= 1 AND char_length(comment) <= 500));