-- 1) Drop overly-permissive public read policy on projects
DROP POLICY IF EXISTS "Anyone can view projects" ON public.projects;

-- 2) Admin-only read policy on the raw projects table
CREATE POLICY "Admin reads full projects"
ON public.projects FOR SELECT
TO authenticated
USING (public.is_admin());

-- 3) Public-safe view (excludes owner_email and lovable_project_id)
DROP VIEW IF EXISTS public.projects_public;
CREATE VIEW public.projects_public
WITH (security_invoker = true) AS
SELECT
  id, slug, name, name_ar, url,
  category, category_label,
  description, description_ar,
  icon, glow, status, is_featured, sort_order,
  last_checked_at, last_status_code, last_response_time_ms, is_up,
  visit_count, created_at, updated_at
FROM public.projects;

GRANT SELECT ON public.projects_public TO anon, authenticated;

-- 4) Harden log_project_visit: reject unknown project ids
CREATE OR REPLACE FUNCTION public.log_project_visit(_project_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.projects WHERE id = _project_id) THEN
    RETURN;
  END IF;

  INSERT INTO public.project_visits (project_id, visit_date, count)
  VALUES (_project_id, CURRENT_DATE, 1)
  ON CONFLICT (project_id, visit_date)
  DO UPDATE SET count = public.project_visits.count + 1;

  UPDATE public.projects
  SET visit_count = visit_count + 1
  WHERE id = _project_id;
END;
$function$;