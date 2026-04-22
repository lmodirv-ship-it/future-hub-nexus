
-- 1. user_roles + has_role
CREATE TYPE public.app_role AS ENUM ('admin', 'viewer');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- Replace is_admin to use user_roles
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin');
$$;

CREATE POLICY "Admin manages roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Users see own roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Seed: existing admin email -> admin role
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role FROM auth.users
WHERE email = 'lmodirv@gmail.com'
ON CONFLICT DO NOTHING;

-- 2. alerts
CREATE TABLE public.alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'down',
  severity text NOT NULL DEFAULT 'high',
  message text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_alerts_created ON public.alerts(created_at DESC);
CREATE INDEX idx_alerts_unread ON public.alerts(is_read) WHERE is_read = false;

ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin reads alerts" ON public.alerts
  FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Admin updates alerts" ON public.alerts
  FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admin deletes alerts" ON public.alerts
  FOR DELETE TO authenticated USING (public.is_admin());

-- Trigger: create alert on failed check
CREATE OR REPLACE FUNCTION public.create_alert_on_failure()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  proj_name text;
BEGIN
  IF NEW.is_up = false THEN
    SELECT name_ar INTO proj_name FROM public.projects WHERE id = NEW.project_id;
    INSERT INTO public.alerts (project_id, type, severity, message)
    VALUES (
      NEW.project_id,
      'down',
      'high',
      COALESCE(proj_name, 'مشروع') || ' غير متاح — '
        || COALESCE('كود: ' || NEW.status_code::text, NEW.error_message, 'خطأ غير معروف')
    );
  ELSIF NEW.response_time_ms > 5000 THEN
    SELECT name_ar INTO proj_name FROM public.projects WHERE id = NEW.project_id;
    INSERT INTO public.alerts (project_id, type, severity, message)
    VALUES (
      NEW.project_id,
      'slow',
      'medium',
      COALESCE(proj_name, 'مشروع') || ' بطيء (' || NEW.response_time_ms || 'ms)'
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_alert_on_check
AFTER INSERT ON public.project_checks
FOR EACH ROW EXECUTE FUNCTION public.create_alert_on_failure();

-- 3. admin_settings
CREATE TABLE public.admin_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin manages settings" ON public.admin_settings
  FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE TRIGGER trg_settings_updated
BEFORE UPDATE ON public.admin_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.admin_settings (key, value) VALUES
  ('check_interval_minutes', '15'::jsonb),
  ('slow_threshold_ms', '5000'::jsonb),
  ('alert_email', '"lmodirv@gmail.com"'::jsonb)
ON CONFLICT DO NOTHING;

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.project_checks;
