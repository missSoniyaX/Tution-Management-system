
-- Allow authenticated users to insert their own role (for signup flow)
CREATE POLICY "Users can insert own role" ON public.user_roles
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- Allow students to insert their own student record
CREATE POLICY "Students can insert own record" ON public.students
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
