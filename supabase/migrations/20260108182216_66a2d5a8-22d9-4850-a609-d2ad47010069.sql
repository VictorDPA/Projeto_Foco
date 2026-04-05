-- Add new PDF progress tracking fields to study_blocks
ALTER TABLE public.study_blocks
ADD COLUMN IF NOT EXISTS total_pages integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS pdf_questions_done integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS pdf_questions_total integer DEFAULT 0;