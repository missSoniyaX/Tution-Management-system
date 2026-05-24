
-- 1. Fix RLS policies: Change RESTRICTIVE to PERMISSIVE for all tables
-- This fixes the infinite loading issue caused by RESTRICTIVE policies requiring ALL to match

-- attendance: Drop and recreate as PERMISSIVE
DROP POLICY IF EXISTS "Admins can view all attendance" ON public.attendance;
DROP POLICY IF EXISTS "Students can view own attendance" ON public.attendance;
DROP POLICY IF EXISTS "Teachers can manage attendance" ON public.attendance;

CREATE POLICY "Admins can view all attendance" ON public.attendance
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Students can view own attendance" ON public.attendance
  FOR SELECT TO authenticated USING (student_id IN (SELECT s.id FROM students s WHERE s.user_id = auth.uid()));

CREATE POLICY "Teachers can manage attendance" ON public.attendance
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'teacher'));

-- feedback: Drop and recreate as PERMISSIVE
DROP POLICY IF EXISTS "Admins can read all feedback" ON public.feedback;
DROP POLICY IF EXISTS "Students can insert feedback" ON public.feedback;
DROP POLICY IF EXISTS "Students can read own feedback" ON public.feedback;
DROP POLICY IF EXISTS "Teachers can read all feedback" ON public.feedback;

CREATE POLICY "Admins can read all feedback" ON public.feedback
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Students can insert feedback" ON public.feedback
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'student'));

CREATE POLICY "Students can read own feedback" ON public.feedback
  FOR SELECT TO authenticated USING (student_id IN (SELECT s.id FROM students s WHERE s.user_id = auth.uid()));

CREATE POLICY "Teachers can read all feedback" ON public.feedback
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'teacher'));

-- notes: Drop and recreate as PERMISSIVE
DROP POLICY IF EXISTS "Admins can manage notes" ON public.notes;
DROP POLICY IF EXISTS "Anyone authenticated can read notes" ON public.notes;
DROP POLICY IF EXISTS "Teachers can manage notes" ON public.notes;

CREATE POLICY "Admins can manage notes" ON public.notes
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone authenticated can read notes" ON public.notes
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Teachers can manage notes" ON public.notes
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'teacher'));

-- notices: Drop and recreate as PERMISSIVE
DROP POLICY IF EXISTS "Admins can manage notices" ON public.notices;
DROP POLICY IF EXISTS "Anyone authenticated can read notices" ON public.notices;
DROP POLICY IF EXISTS "Teachers can manage notices" ON public.notices;

CREATE POLICY "Admins can manage notices" ON public.notices
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone authenticated can read notices" ON public.notices
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Teachers can manage notices" ON public.notices
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'teacher'));

-- profiles: Drop and recreate as PERMISSIVE + add INSERT policy
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT TO authenticated USING (id = auth.uid());

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (id = auth.uid());

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (id = auth.uid());

-- students: Drop and recreate as PERMISSIVE
DROP POLICY IF EXISTS "Admins can do everything with students" ON public.students;
DROP POLICY IF EXISTS "Students can insert own record" ON public.students;
DROP POLICY IF EXISTS "Students can view own record" ON public.students;
DROP POLICY IF EXISTS "Teachers can view students" ON public.students;

CREATE POLICY "Admins can do everything with students" ON public.students
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Students can insert own record" ON public.students
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "Students can view own record" ON public.students
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Teachers can view students" ON public.students
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'teacher'));

-- study_materials: Drop and recreate as PERMISSIVE
DROP POLICY IF EXISTS "Admins can manage study materials" ON public.study_materials;
DROP POLICY IF EXISTS "Students can view study materials" ON public.study_materials;
DROP POLICY IF EXISTS "Teachers can manage study materials" ON public.study_materials;

CREATE POLICY "Admins can manage study materials" ON public.study_materials
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Students can view study materials" ON public.study_materials
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'student'));

CREATE POLICY "Teachers can manage study materials" ON public.study_materials
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'teacher'));

-- teachers: Drop and recreate as PERMISSIVE
DROP POLICY IF EXISTS "Admins can do everything with teachers" ON public.teachers;
DROP POLICY IF EXISTS "Teachers can update own record" ON public.teachers;
DROP POLICY IF EXISTS "Teachers can view and update own record" ON public.teachers;

CREATE POLICY "Admins can do everything with teachers" ON public.teachers
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Teachers can update own record" ON public.teachers
  FOR UPDATE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Teachers can view all teachers" ON public.teachers
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'teacher'));

-- user_roles: Drop and recreate as PERMISSIVE, REMOVE unrestricted insert
DROP POLICY IF EXISTS "Admins can read all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can insert own role" ON public.user_roles;
DROP POLICY IF EXISTS "Users can read own role" ON public.user_roles;

CREATE POLICY "Admins can read all roles" ON public.user_roles
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can read own role" ON public.user_roles
  FOR SELECT TO authenticated USING (user_id = auth.uid());

-- Only allow student role self-insert (no admin/teacher self-assignment)
CREATE POLICY "Users can insert student role only" ON public.user_roles
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() AND role = 'student');

-- Admin can manage all roles
CREATE POLICY "Admins can manage all roles" ON public.user_roles
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
