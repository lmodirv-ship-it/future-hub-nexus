CREATE TABLE IF NOT EXISTS public.cross_project_visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lovable_project_id text NOT NULL,
  path text NOT NULL DEFAULT '/',
  referrer text,
  country text,
  visit_date date NOT NULL DEFAULT CURRENT_DATE,
  count integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (lovable_project_id, path, visit_date)
);

CREATE INDEX IF NOT EXISTS idx_cpv_project_date
  ON public.cross_project_visits (lovable_project_id, visit_date DESC);
CREATE INDEX IF NOT EXISTS idx_cpv_date
  ON public.cross_project_visits (visit_date DESC);

ALTER TABLE public.cross_project_visits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin reads cross_project_visits"
ON public.cross_project_visits
FOR SELECT TO authenticated
USING (public.is_admin());

CREATE TRIGGER cross_project_visits_updated_at
BEFORE UPDATE ON public.cross_project_visits
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RPC for ingestion (bypasses RLS via SECURITY DEFINER, called from server route only)
CREATE OR REPLACE FUNCTION public.track_cross_visit(
  _project_id text,
  _path text,
  _referrer text DEFAULT NULL,
  _country text DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF _project_id IS NULL OR length(btrim(_project_id)) = 0 THEN RETURN; END IF;
  INSERT INTO public.cross_project_visits (lovable_project_id, path, referrer, country, visit_date, count)
  VALUES (_project_id, COALESCE(NULLIF(btrim(_path),''),'/'), _referrer, _country, CURRENT_DATE, 1)
  ON CONFLICT (lovable_project_id, path, visit_date)
  DO UPDATE SET count = public.cross_project_visits.count + 1, updated_at = now();
END;
$$;

REVOKE EXECUTE ON FUNCTION public.track_cross_visit(text, text, text, text) FROM PUBLIC, anon, authenticated;