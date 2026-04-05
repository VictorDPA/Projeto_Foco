-- Add favoritos_url field to subjects table
ALTER TABLE public.subjects 
ADD COLUMN favoritos_url text DEFAULT NULL;