
-- 1) plans: خطط الاشتراك
CREATE TABLE public.plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name_ar text NOT NULL,
  name_en text NOT NULL,
  description_ar text,
  description_en text,
  price_usd_cents integer NOT NULL DEFAULT 0,
  price_mad_cents integer NOT NULL DEFAULT 0,
  interval text NOT NULL DEFAULT 'month',
  max_sites integer NOT NULL DEFAULT 1,
  check_interval_minutes integer NOT NULL DEFAULT 60,
  features jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_featured boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  paddle_price_id text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active plans" ON public.plans FOR SELECT USING (is_active = true);
CREATE POLICY "Admin manages plans" ON public.plans FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER plans_updated_at BEFORE UPDATE ON public.plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2) subscriptions
CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  plan_id uuid NOT NULL REFERENCES public.plans(id) ON DELETE RESTRICT,
  status text NOT NULL DEFAULT 'active',
  paddle_subscription_id text UNIQUE,
  paddle_customer_id text,
  current_period_end timestamptz,
  cancel_at_period_end boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own subscriptions" ON public.subscriptions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admin manages subscriptions" ON public.subscriptions FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER subscriptions_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_subscriptions_user ON public.subscriptions(user_id);

-- 3) monitored_sites: المواقع التي يراقبها المشترك
CREATE TABLE public.monitored_sites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  url text NOT NULL,
  name text NOT NULL,
  is_up boolean,
  last_status_code integer,
  last_response_time_ms integer,
  last_checked_at timestamptz,
  alert_email text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.monitored_sites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own sites" ON public.monitored_sites FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admin sees all sites" ON public.monitored_sites FOR SELECT TO authenticated USING (public.is_admin());
CREATE TRIGGER monitored_sites_updated_at BEFORE UPDATE ON public.monitored_sites FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_monitored_sites_user ON public.monitored_sites(user_id);

-- 4) templates: القوالب المعروضة في السوق
CREATE TABLE public.templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title_ar text NOT NULL,
  title_en text NOT NULL,
  description_ar text,
  description_en text,
  category text NOT NULL DEFAULT 'web',
  price_usd_cents integer NOT NULL DEFAULT 0,
  price_mad_cents integer NOT NULL DEFAULT 0,
  demo_url text,
  cover_image text,
  tech_stack jsonb NOT NULL DEFAULT '[]'::jsonb,
  features jsonb NOT NULL DEFAULT '[]'::jsonb,
  source_project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  paddle_price_id text,
  download_count integer NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view published templates" ON public.templates FOR SELECT USING (is_published = true);
CREATE POLICY "Admin manages templates" ON public.templates FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER templates_updated_at BEFORE UPDATE ON public.templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5) template_purchases
CREATE TABLE public.template_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  template_id uuid NOT NULL REFERENCES public.templates(id) ON DELETE RESTRICT,
  paddle_transaction_id text UNIQUE,
  amount_cents integer NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  status text NOT NULL DEFAULT 'pending',
  download_token text UNIQUE,
  download_expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.template_purchases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own purchases" ON public.template_purchases FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admin sees all purchases" ON public.template_purchases FOR SELECT TO authenticated USING (public.is_admin());
CREATE INDEX idx_template_purchases_user ON public.template_purchases(user_id);

-- 6) service_requests: طلبات الخدمات الاحترافية (Leads)
CREATE TABLE public.service_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  service_type text NOT NULL,
  budget_range text,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'new',
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit a request" ON public.service_requests FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admin manages requests" ON public.service_requests FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER service_requests_updated_at BEFORE UPDATE ON public.service_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 7) Seed plans
INSERT INTO public.plans (slug, name_ar, name_en, description_ar, description_en, price_usd_cents, price_mad_cents, max_sites, check_interval_minutes, features, sort_order, is_featured) VALUES
('free', 'مجاني', 'Free', 'للبدء والتجربة', 'To get started', 0, 0, 1, 60, '["موقع واحد","فحص كل ساعة","تنبيهات بريد"]'::jsonb, 1, false),
('pro', 'احترافي', 'Pro', 'للمستقلين والشركات الناشئة', 'For freelancers and startups', 900, 9000, 10, 5, '["10 مواقع","فحص كل 5 دقائق","تنبيهات بريد فورية","لوحة تحليلات","سجل 30 يوم"]'::jsonb, 2, true),
('business', 'الأعمال', 'Business', 'للوكالات والشركات', 'For agencies and businesses', 2900, 29000, 50, 1, '["50 موقع","فحص كل دقيقة","تنبيهات بريد + WhatsApp","تقارير PDF شهرية","API كامل","سجل 1 سنة","دعم أولوية"]'::jsonb, 3, false);

-- 8) Seed templates من المشاريع الموجودة
INSERT INTO public.templates (slug, title_ar, title_en, description_ar, description_en, category, price_usd_cents, price_mad_cents, demo_url, tech_stack, features, source_project_id, sort_order)
SELECT
  p.slug,
  p.name_ar,
  p.name,
  COALESCE(p.description_ar, p.description),
  COALESCE(p.description, p.description_ar),
  p.category,
  CASE
    WHEN p.is_featured THEN 4900
    ELSE 1900
  END,
  CASE
    WHEN p.is_featured THEN 49000
    ELSE 19000
  END,
  p.url,
  '["React","TanStack Start","Tailwind","Supabase"]'::jsonb,
  '["كود مصدر كامل","تصميم متجاوب","جاهز للنشر","تحديثات مجانية لمدة سنة"]'::jsonb,
  p.id,
  p.sort_order
FROM public.projects p
WHERE p.status = 'active';
