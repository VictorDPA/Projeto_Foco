
-- Add user_id column to all 9 tables
ALTER TABLE public.subjects ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.study_blocks ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.question_sessions ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.error_log ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.law_articles ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.study_materials ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.study_time_sessions ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.daily_agenda ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.agenda_slots ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Drop all permissive policies
DROP POLICY IF EXISTS "Allow all operations on subjects" ON public.subjects;
DROP POLICY IF EXISTS "Allow all operations on study_blocks" ON public.study_blocks;
DROP POLICY IF EXISTS "Allow all operations on question_sessions" ON public.question_sessions;
DROP POLICY IF EXISTS "Allow all operations on error_log" ON public.error_log;
DROP POLICY IF EXISTS "Allow all operations on law_articles" ON public.law_articles;
DROP POLICY IF EXISTS "Allow all operations on study_materials" ON public.study_materials;
DROP POLICY IF EXISTS "Allow all operations on study_time_sessions" ON public.study_time_sessions;
DROP POLICY IF EXISTS "Allow all operations on daily_agenda" ON public.daily_agenda;
DROP POLICY IF EXISTS "Allow all operations on agenda_slots" ON public.agenda_slots;

-- Create user-scoped RLS policies for all tables
CREATE POLICY "Users manage own subjects" ON public.subjects FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own study_blocks" ON public.study_blocks FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own question_sessions" ON public.question_sessions FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own error_log" ON public.error_log FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own law_articles" ON public.law_articles FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own study_materials" ON public.study_materials FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own study_time_sessions" ON public.study_time_sessions FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own daily_agenda" ON public.daily_agenda FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own agenda_slots" ON public.agenda_slots FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
