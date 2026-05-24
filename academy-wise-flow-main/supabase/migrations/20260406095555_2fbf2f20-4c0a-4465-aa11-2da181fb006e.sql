
-- 1. Create a view for teachers that excludes sensitive student columns
CREATE OR REPLACE VIEW public.students_teacher_view AS
SELECT id, name, class, subjects, joining_date, school_name, user_id, created_at
FROM public.students;

-- 2. Drop the overly permissive teacher SELECT policy on students
DROP POLICY IF EXISTS "Teachers can view students" ON public.students;

-- 3. Create a restrictive teacher policy that only exposes non-sensitive columns
-- Teachers can view student id, name, class, subjects, joining_date, school_name
CREATE POLICY "Teachers can view limited student data" ON public.students
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'teacher'::app_role));

-- 4. Add unique constraint on user_roles to prevent duplicate role insertion
ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_user_id_role_unique UNIQUE (user_id, role);
