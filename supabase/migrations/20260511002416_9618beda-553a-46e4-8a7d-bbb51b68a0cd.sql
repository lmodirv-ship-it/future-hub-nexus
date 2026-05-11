
CREATE TABLE public.lovable_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lovable_project_id text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  lovable_url text,
  published_url text,
  custom_domains jsonb NOT NULL DEFAULT '[]'::jsonb,
  category text NOT NULL DEFAULT 'other',
  adsense_installed boolean NOT NULL DEFAULT false,
  adstxt_installed boolean NOT NULL DEFAULT false,
  last_health_check timestamptz,
  last_status_code int,
  last_response_time_ms int,
  is_up boolean,
  notes text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.lovable_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin manages lovable_projects"
ON public.lovable_projects
FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE TRIGGER update_lovable_projects_updated_at
BEFORE UPDATE ON public.lovable_projects
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.lovable_projects (lovable_project_id, name, description, lovable_url, published_url, category, sort_order) VALUES
('777f4d7a-9f75-4e4f-8a78-8e27897ee934','HN Chat Hub','منصة محادثة hnChat','https://hnchat.lovable.app','https://hnchat.lovable.app','chat',1),
('871f3759-73ef-4579-8f08-9a7c52b1611d','HN Driver','منصة سائقي HN للهواتف','https://smooth-route-guide.lovable.app','https://smooth-route-guide.lovable.app','mobile',2),
('2cdff6b5-5590-41a4-b848-56b3d3e2aacf','AI Client Connect','منصة B2B SaaS ذكية','https://clinic-flowai.lovable.app','https://clinic-flowai.lovable.app','saas',3),
('87c3ee9e-c67d-4a59-b34b-3f35bd34379b','AI Resume Genius','صانع سير ذاتية AI','https://hire-me-genius.lovable.app','https://hire-me-genius.lovable.app','tool',4),
('2a233446-6738-4e46-bd41-fbdeaaea2da6','Smart Solutions Hub','HN-Groupe — حلول ذكية','https://hn-gr.lovable.app','https://hn-gr.lovable.app','portfolio',5),
('6b31bfc5-1033-48e6-bf4e-2c9686d30371','Grand Tanger Print Studio','مطبعة طنجة الكبرى','https://tangier-print-hub.lovable.app','https://tangier-print-hub.lovable.app','business',6),
('9d3a6024-bd11-4b98-bde6-37a746ecd49e','Remix CarWashManager','إدارة محال غسل السيارات','https://wash-pal-app.lovable.app','https://wash-pal-app.lovable.app','tool',7),
('bea980b6-030a-4281-aa75-e998ca192f51','Souk-HN Express','متجر إلكتروني','https://souk-hn.lovable.app','https://souk-hn.lovable.app','store',8),
('720726ed-483f-4f93-b843-3aa7fbb81fc7','Profitable Ventures Hub','مشاريع مربحة','https://income-igniter-ide.lovable.app','https://income-igniter-ide.lovable.app','business',9),
('53e16637-8160-4c7f-9e95-2273bcec7dd4','Agency Hub Pro','وكالة عقارية','https://hn-immobiler.lovable.app','https://hn-immobiler.lovable.app','business',10),
('03590440-68a5-4d4a-a3fc-ae4a1d1a950e','AI Scene Studio','HN Video AI استوديو','https://hn-aivideo.lovable.app','https://hn-aivideo.lovable.app','ai',11),
('8e186f3c-4065-4d45-b42e-10a974474ce0','Studio HN','تطبيق Studio','https://studio-hn.lovable.app','https://studio-hn.lovable.app','tool',12),
('683bd4a0-cd56-403f-b980-de2d8d04f1c0','CarWashManager','إدارة غسل السيارات','https://hn-carwash.lovable.app','https://hn-carwash.lovable.app','tool',13),
('2cfb5022-ac69-4e36-9ad5-27a7a719081f','Database Foundation','hn-base قواعد بيانات','https://db-guard.lovable.app','https://db-guard.lovable.app','tool',14),
('f6a51c18-9e84-45a7-adbe-b35a8bfa2124','AI Studio Vision','HN Video AI رؤية','https://hn-videoai.lovable.app','https://hn-videoai.lovable.app','ai',15),
('5ed13228-772d-4d41-b209-44cfdfa3944c','hn-cima','Text to video احترافي','https://hn-vi.lovable.app','https://hn-vi.lovable.app','ai',16),
('6c0d65e5-805e-4e64-8a3b-4a6f2c47f81f','HN-Dev (الحالي)','لوحة التحكم المركزية','https://future-hub-nexus.lovable.app','https://www.slavacall-hiba.online','portfolio',17),
('2eb7f39d-c64f-487a-b432-08bd4e863233','My Site Manager','مدير المواقع','https://my-site-manager.lovable.app',NULL,'tool',18),
('4a5c9e2c-fbc2-4dee-9234-1bb926ae315e','Vigilant Guardian','مراقبة الأنظمة','https://vigilant-guardian.lovable.app',NULL,'tool',19),
('b82b767e-7431-4182-bc20-298bed57c367','Domain Monitor','مراقبة النطاقات','https://domain-monitor.lovable.app',NULL,'tool',20),
('5b978f82-a2d0-4c1c-b6d6-9a112f403064','Cloud Harmony','تنسيق سحابي','https://cloud-harmony.lovable.app',NULL,'tool',21);

UPDATE public.lovable_projects SET custom_domains = '[{"domain":"www.slavacall-hiba.online","primary":true,"ssl_ok":true}]'::jsonb, adsense_installed = true, adstxt_installed = true WHERE lovable_project_id = '6c0d65e5-805e-4e64-8a3b-4a6f2c47f81f';
