
-- Function to log a public visit (anyone can call)
CREATE OR REPLACE FUNCTION public.log_project_visit(_project_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.project_visits (project_id, visit_date, count)
  VALUES (_project_id, CURRENT_DATE, 1)
  ON CONFLICT (project_id, visit_date)
  DO UPDATE SET count = public.project_visits.count + 1;

  UPDATE public.projects
  SET visit_count = visit_count + 1
  WHERE id = _project_id;
END;
$$;

-- Need unique constraint for ON CONFLICT
ALTER TABLE public.project_visits
  DROP CONSTRAINT IF EXISTS project_visits_project_date_unique;
ALTER TABLE public.project_visits
  ADD CONSTRAINT project_visits_project_date_unique UNIQUE (project_id, visit_date);

-- Aggregate stats function for the dashboard (admin only)
CREATE OR REPLACE FUNCTION public.get_dashboard_stats()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  SELECT jsonb_build_object(
    'total_projects', (SELECT COUNT(*) FROM projects),
    'up_count', (SELECT COUNT(*) FROM projects WHERE is_up = true),
    'down_count', (SELECT COUNT(*) FROM projects WHERE is_up = false),
    'unchecked_count', (SELECT COUNT(*) FROM projects WHERE is_up IS NULL),
    'total_visits', (SELECT COALESCE(SUM(visit_count),0) FROM projects),
    'visits_today', (SELECT COALESCE(SUM(count),0) FROM project_visits WHERE visit_date = CURRENT_DATE),
    'visits_7d', (SELECT COALESCE(SUM(count),0) FROM project_visits WHERE visit_date >= CURRENT_DATE - INTERVAL '7 days'),
    'avg_response_ms', (SELECT COALESCE(ROUND(AVG(last_response_time_ms))::int, 0) FROM projects WHERE last_response_time_ms IS NOT NULL),
    'last_check', (SELECT MAX(last_checked_at) FROM projects),
    'top_visited', (
      SELECT COALESCE(jsonb_agg(t), '[]'::jsonb) FROM (
        SELECT id, name_ar, slug, visit_count, is_up, url
        FROM projects
        ORDER BY visit_count DESC
        LIMIT 5
      ) t
    ),
    'recent_checks', (
      SELECT COALESCE(jsonb_agg(c), '[]'::jsonb) FROM (
        SELECT pc.id, pc.checked_at, pc.is_up, pc.status_code, pc.response_time_ms,
               p.name_ar, p.slug
        FROM project_checks pc
        JOIN projects p ON p.id = pc.project_id
        ORDER BY pc.checked_at DESC
        LIMIT 10
      ) c
    ),
    'visits_chart', (
      SELECT COALESCE(jsonb_agg(d ORDER BY day), '[]'::jsonb) FROM (
        SELECT visit_date::text AS day, SUM(count)::int AS visits
        FROM project_visits
        WHERE visit_date >= CURRENT_DATE - INTERVAL '14 days'
        GROUP BY visit_date
        ORDER BY visit_date
      ) d
    )
  ) INTO result;

  RETURN result;
END;
$$;

-- Allow public to call log_project_visit
GRANT EXECUTE ON FUNCTION public.log_project_visit(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_dashboard_stats() TO authenticated;
