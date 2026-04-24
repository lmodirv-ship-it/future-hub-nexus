-- =========================================
-- Control Center: managed_sites
-- =========================================
CREATE TABLE public.managed_sites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  domain text NOT NULL UNIQUE,
  github_repo text,
  github_branch text NOT NULL DEFAULT 'main',
  origin_server text,
  mirror_path text,
  notes text,
  enabled boolean NOT NULL DEFAULT true,
  last_sync_at timestamptz,
  last_commit_sha text,
  last_sync_status text,
  last_health_status text,
  last_response_time_ms integer,
  last_status_code integer,
  last_checked_at timestamptz,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.managed_sites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin manages managed_sites"
  ON public.managed_sites
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE TRIGGER trg_managed_sites_updated_at
  BEFORE UPDATE ON public.managed_sites
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================
-- Control Center: site_sync_log
-- =========================================
CREATE TABLE public.site_sync_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL REFERENCES public.managed_sites(id) ON DELETE CASCADE,
  status text NOT NULL,
  commit_sha text,
  message text,
  duration_ms integer,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_site_sync_log_site_created
  ON public.site_sync_log(site_id, created_at DESC);

ALTER TABLE public.site_sync_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin manages site_sync_log"
  ON public.site_sync_log
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- =========================================
-- Control Center: site_health_history
-- =========================================
CREATE TABLE public.site_health_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL REFERENCES public.managed_sites(id) ON DELETE CASCADE,
  is_up boolean NOT NULL,
  status_code integer,
  response_time_ms integer,
  error_message text,
  checked_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_site_health_history_site_checked
  ON public.site_health_history(site_id, checked_at DESC);

ALTER TABLE public.site_health_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin manages site_health_history"
  ON public.site_health_history
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- =========================================
-- Trigger: alert on managed site failure
-- =========================================
CREATE OR REPLACE FUNCTION public.create_managed_site_alert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  site_name text;
  site_domain text;
BEGIN
  IF NEW.is_up = false THEN
    SELECT name, domain INTO site_name, site_domain
    FROM public.managed_sites WHERE id = NEW.site_id;

    -- We piggyback on existing alerts table, but project_id requires projects.
    -- So we only insert when a matching project exists for this domain; otherwise skip.
    INSERT INTO public.alerts (project_id, type, severity, message)
    SELECT p.id, 'down', 'high',
      COALESCE(site_name, site_domain, 'موقع مُدار') || ' غير متاح — '
        || COALESCE('كود: ' || NEW.status_code::text, NEW.error_message, 'خطأ')
    FROM public.projects p
    WHERE p.url ILIKE '%' || site_domain || '%'
    LIMIT 1;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_managed_site_alert
  AFTER INSERT ON public.site_health_history
  FOR EACH ROW
  EXECUTE FUNCTION public.create_managed_site_alert();