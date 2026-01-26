-- Make comment column nullable in reviews table
ALTER TABLE public.reviews ALTER COLUMN comment DROP NOT NULL;