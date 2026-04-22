-- helper function for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- admin check function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT (auth.jwt() ->> 'email') = 'lmodirv@gmail.com'),
    false
  );
$$;

-- main projects table
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  url TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'other',
  category_label TEXT NOT NULL DEFAULT 'أخرى',
  description TEXT,
  description_ar TEXT,
  icon TEXT DEFAULT 'Sparkles',
  glow TEXT DEFAULT 'violet',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','offline','maintenance','draft')),
  is_featured BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  owner_email TEXT,
  lovable_project_id TEXT,
  last_checked_at TIMESTAMPTZ,
  last_status_code INTEGER,
  last_response_time_ms INTEGER,
  is_up BOOLEAN,
  visit_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- check history
CREATE TABLE public.project_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  status_code INTEGER,
  response_time_ms INTEGER,
  is_up BOOLEAN NOT NULL,
  error_message TEXT,
  checked_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_project_checks_project ON public.project_checks(project_id, checked_at DESC);

-- daily visits
CREATE TABLE public.project_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  visit_date DATE NOT NULL DEFAULT CURRENT_DATE,
  count INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(project_id, visit_date)
);

CREATE INDEX idx_project_visits_date ON public.project_visits(visit_date DESC);

-- enable RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_visits ENABLE ROW LEVEL SECURITY;

-- projects policies: public read, admin write
CREATE POLICY "Anyone can view projects"
  ON public.projects FOR SELECT
  USING (true);

CREATE POLICY "Admin can insert projects"
  ON public.projects FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin can update projects"
  ON public.projects FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin can delete projects"
  ON public.projects FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- checks: admin read only, server inserts via service role (bypasses RLS)
CREATE POLICY "Admin can view checks"
  ON public.project_checks FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- visits: admin read only
CREATE POLICY "Admin can view visits"
  ON public.project_visits FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- updated_at trigger
CREATE TRIGGER trg_projects_updated
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- seed existing 14 projects
INSERT INTO public.projects (slug, name, name_ar, url, category, category_label, icon, glow, lovable_project_id, sort_order) VALUES
('smart-solutions-hub', 'HN Smart Solutions Hub', 'HN منصة الحلول الذكية', 'https://hn-gr.lovable.app', 'platform', 'منصة', 'Sparkles', 'violet', '2a233446-6738-4e46-bd41-fbdeaaea2da6', 1),
('souk-hn-express', 'HN Souk Express', 'HN سوق إكسبرس', 'https://souk-hn.lovable.app', 'ecommerce', 'تجارة', 'ShoppingBag', 'cyan', 'bea980b6-030a-4281-aa75-e998ca192f51', 2),
('hn-driver', 'HN Driver', 'HN درايفر', 'https://smooth-route-guide.lovable.app', 'mobile', 'موبايل', 'Car', 'magenta', '871f3759-73ef-4579-8f08-9a7c52b1611d', 3),
('agency-hub-pro', 'HN Agency Hub Pro', 'HN وكالة العقارات', 'https://hn-immobiler.lovable.app', 'realestate', 'عقارات', 'Building2', 'pink', '53e16637-8160-4c7f-9e95-2273bcec7dd4', 4),
('carwash-manager', 'HN CarWash Manager', 'HN إدارة غسيل السيارات', 'https://hn-carwash.lovable.app', 'service', 'خدمات', 'Droplets', 'cyan', '683bd4a0-cd56-403f-b980-de2d8d04f1c0', 5),
('profitable-ventures', 'HN Profitable Ventures', 'HN مشاريع مربحة', 'https://income-igniter-ide.lovable.app', 'finance', 'مالية', 'TrendingUp', 'violet', '720726ed-483f-4f93-b843-3aa7fbb81fc7', 6),
('wash-pal', 'HN Wash Pal', 'HN رفيق الغسيل', 'https://wash-pal-app.lovable.app', 'service', 'خدمات', 'Sparkles', 'magenta', '9d3a6024-bd11-4b98-bde6-37a746ecd49e', 7),
('studio-hn', 'HN Studio', 'HN استوديو', 'https://studio-hn.lovable.app', 'creative', 'إبداع', 'Palette', 'pink', '8e186f3c-4065-4d45-b42e-10a974474ce0', 8),
('hn-cima', 'HN Cima', 'HN سينما', 'https://hn-vi.lovable.app', 'media', 'وسائط', 'Film', 'violet', '5ed13228-772d-4d41-b209-44cfdfa3944c', 9),
('ai-studio-vision', 'HN AI Studio Vision', 'HN استوديو الرؤية الذكية', 'https://hn-videoai.lovable.app', 'ai', 'ذكاء اصطناعي', 'Brain', 'cyan', 'f6a51c18-9e84-45a7-adbe-b35a8bfa2124', 10),
('grand-tanger-print', 'HN Tangier Print Studio', 'HN استوديو طباعة طنجة', 'https://tangier-print-hub.lovable.app', 'creative', 'إبداع', 'Printer', 'magenta', '6b31bfc5-1033-48e6-bf4e-2c9686d30371', 11),
('ai-scene-studio', 'HN AI Scene Studio', 'HN استوديو المشاهد الذكية', 'https://hn-aivideo.lovable.app', 'ai', 'ذكاء اصطناعي', 'Video', 'pink', '03590440-68a5-4d4a-a3fc-ae4a1d1a950e', 12),
('domain-monitor', 'HN Domain Monitor', 'HN مراقب النطاقات', '#', 'tools', 'أدوات', 'Globe', 'violet', 'b82b767e-7431-4182-bc20-298bed57c367', 13),
('cloud-harmony', 'HN Cloud Harmony', 'HN انسجام السحابة', '#', 'cloud', 'سحابة', 'Cloud', 'cyan', '5b978f82-a2d0-4c1c-b6d6-9a112f403064', 14);