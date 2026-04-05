-- Add questoes_url and favoritos_url fields to study_blocks table
ALTER TABLE public.study_blocks 
ADD COLUMN questoes_url text DEFAULT NULL,
ADD COLUMN favoritos_url text DEFAULT NULL;