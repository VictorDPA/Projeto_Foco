-- Create subjects table
CREATE TABLE public.subjects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#FFD700',
  weight INTEGER NOT NULL DEFAULT 2 CHECK (weight IN (1, 2, 3)),
  study_phase TEXT DEFAULT 'iniciante' CHECK (study_phase IN ('iniciante', 'intermediario', 'avancado')),
  tec_caderno_link TEXT,
  monthly_giro JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create study_blocks table
CREATE TABLE public.study_blocks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'reading_pdf', 'completed')),
  hours_studied NUMERIC DEFAULT 0,
  is_current BOOLEAN DEFAULT false,
  external_links JSONB DEFAULT '[]'::jsonb,
  redo_favorites BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create question_sessions table
CREATE TABLE public.question_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  block_id UUID NOT NULL REFERENCES public.study_blocks(id) ON DELETE CASCADE,
  session_date DATE NOT NULL,
  total_questions INTEGER NOT NULL,
  hits INTEGER NOT NULL,
  exam_board TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create error_log table
CREATE TABLE public.error_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  trap TEXT NOT NULL,
  error_type TEXT NOT NULL CHECK (error_type IN ('lack_attention', 'didnt_know_law', 'tricky_question', 'confused_concepts')),
  review_count INTEGER DEFAULT 0,
  exported BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create law_articles table
CREATE TABLE public.law_articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  law_name TEXT NOT NULL,
  article_number TEXT NOT NULL,
  description TEXT,
  heat_map_status TEXT DEFAULT 'low' CHECK (heat_map_status IN ('low', 'medium', 'high')),
  is_read BOOLEAN DEFAULT false,
  is_mastered BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create study_materials table
CREATE TABLE public.study_materials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('pdf', 'image', 'edital')),
  url TEXT NOT NULL,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  block_id UUID REFERENCES public.study_blocks(id) ON DELETE SET NULL,
  reading_progress INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.error_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.law_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_materials ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (no auth required for MVP)
CREATE POLICY "Allow all operations on subjects" ON public.subjects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on study_blocks" ON public.study_blocks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on question_sessions" ON public.question_sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on error_log" ON public.error_log FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on law_articles" ON public.law_articles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on study_materials" ON public.study_materials FOR ALL USING (true) WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_subjects_updated_at
  BEFORE UPDATE ON public.subjects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_study_blocks_updated_at
  BEFORE UPDATE ON public.study_blocks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_error_log_updated_at
  BEFORE UPDATE ON public.error_log
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_law_articles_updated_at
  BEFORE UPDATE ON public.law_articles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();