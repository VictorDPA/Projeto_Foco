-- Create table for daily cycle agenda configuration and slots
CREATE TABLE public.daily_agenda (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  day_of_week integer NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  available_hours numeric NOT NULL DEFAULT 4,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(day_of_week)
);

-- Create table for scheduled slots
CREATE TABLE public.agenda_slots (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  day_of_week integer NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  block_id uuid NOT NULL REFERENCES public.study_blocks(id) ON DELETE CASCADE,
  slot_order integer NOT NULL DEFAULT 0,
  duration_minutes integer NOT NULL DEFAULT 60,
  slot_type text NOT NULL DEFAULT 'theory' CHECK (slot_type IN ('theory', 'practice', 'reinforcement')),
  is_completed boolean NOT NULL DEFAULT false,
  completed_at timestamp with time zone,
  actual_duration_minutes integer,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.daily_agenda ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agenda_slots ENABLE ROW LEVEL SECURITY;

-- Create policies for daily_agenda
CREATE POLICY "Allow all operations on daily_agenda"
ON public.daily_agenda
FOR ALL
USING (true)
WITH CHECK (true);

-- Create policies for agenda_slots
CREATE POLICY "Allow all operations on agenda_slots"
ON public.agenda_slots
FOR ALL
USING (true)
WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_agenda_slots_day ON public.agenda_slots(day_of_week);
CREATE INDEX idx_agenda_slots_block ON public.agenda_slots(block_id);
CREATE INDEX idx_agenda_slots_order ON public.agenda_slots(day_of_week, slot_order);

-- Add trigger for updated_at on daily_agenda
CREATE TRIGGER update_daily_agenda_updated_at
BEFORE UPDATE ON public.daily_agenda
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add trigger for updated_at on agenda_slots
CREATE TRIGGER update_agenda_slots_updated_at
BEFORE UPDATE ON public.agenda_slots
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default configuration for each day
INSERT INTO public.daily_agenda (day_of_week, available_hours) VALUES
  (0, 4), (1, 4), (2, 4), (3, 4), (4, 4), (5, 6), (6, 6);