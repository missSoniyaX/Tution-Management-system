
-- Study materials table
CREATE TABLE public.study_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subject TEXT NOT NULL DEFAULT '',
  class TEXT NOT NULL DEFAULT '',
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL DEFAULT '',
  uploaded_by UUID REFERENCES auth.users(id),
  uploaded_by_name TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.study_materials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can manage study materials"
  ON public.study_materials FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'teacher'::app_role));

CREATE POLICY "Admins can manage study materials"
  ON public.study_materials FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Students can view study materials"
  ON public.study_materials FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'student'::app_role));

-- Attendance table
CREATE TABLE public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent')),
  progress_note TEXT DEFAULT '',
  marked_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(student_id, date)
);

ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can manage attendance"
  ON public.attendance FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'teacher'::app_role));

CREATE POLICY "Admins can view all attendance"
  ON public.attendance FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Students can view own attendance"
  ON public.attendance FOR SELECT TO authenticated
  USING (student_id IN (SELECT s.id FROM students s WHERE s.user_id = auth.uid()));

-- Storage bucket for study materials
INSERT INTO storage.buckets (id, name, public) VALUES ('study-materials', 'study-materials', true);

CREATE POLICY "Teachers can upload study materials"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'study-materials' AND has_role(auth.uid(), 'teacher'::app_role));

CREATE POLICY "Teachers can delete study materials"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'study-materials' AND has_role(auth.uid(), 'teacher'::app_role));

CREATE POLICY "Anyone can view study materials"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'study-materials');
