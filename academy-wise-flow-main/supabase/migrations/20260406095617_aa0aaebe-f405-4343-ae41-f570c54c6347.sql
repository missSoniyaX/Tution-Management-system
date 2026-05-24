
-- Fix security definer view by recreating with security_invoker
DROP VIEW IF EXISTS public.students_teacher_view;
CREATE VIEW public.students_teacher_view
  WITH (security_invoker = true)
  AS SELECT id, name, class, subjects, joining_date, school_name, user_id, created_at
  FROM public.students;
