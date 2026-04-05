-- Add current_page column to study_blocks for tracking reading progress
ALTER TABLE public.study_blocks 
ADD COLUMN current_page integer DEFAULT 0;