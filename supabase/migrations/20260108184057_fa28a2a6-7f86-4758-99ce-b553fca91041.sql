-- Create table for time study sessions
CREATE TABLE public.study_time_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  block_id UUID NOT NULL REFERENCES public.study_blocks(id) ON DELETE CASCADE,
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.study_time_sessions ENABLE ROW LEVEL SECURITY;

-- Create policy for all operations
CREATE POLICY "Allow all operations on study_time_sessions" 
ON public.study_time_sessions 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Add index for performance
CREATE INDEX idx_study_time_sessions_block_id ON public.study_time_sessions(block_id);
CREATE INDEX idx_study_time_sessions_date ON public.study_time_sessions(session_date);