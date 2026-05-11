-- Project development commands hub
CREATE TABLE public.project_commands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  scope TEXT NOT NULL DEFAULT 'selected', -- 'all' | 'selected'
  status TEXT NOT NULL DEFAULT 'draft',   -- 'draft' | 'approved' | 'in_progress' | 'done' | 'archived'
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.project_commands ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin manages project_commands"
  ON public.project_commands FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE TRIGGER trg_project_commands_updated
  BEFORE UPDATE ON public.project_commands
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Targets: which projects each command applies to
CREATE TABLE public.project_command_targets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  command_id UUID NOT NULL REFERENCES public.project_commands(id) ON DELETE CASCADE,
  -- Reference either a managed_sites row OR a lovable_projects row OR a free-text label
  managed_site_id UUID REFERENCES public.managed_sites(id) ON DELETE SET NULL,
  lovable_project_id UUID REFERENCES public.lovable_projects(id) ON DELETE SET NULL,
  label TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'sent' | 'done' | 'skipped'
  notes TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.project_command_targets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin manages project_command_targets"
  ON public.project_command_targets FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE TRIGGER trg_project_command_targets_updated
  BEFORE UPDATE ON public.project_command_targets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_pct_command ON public.project_command_targets(command_id);
