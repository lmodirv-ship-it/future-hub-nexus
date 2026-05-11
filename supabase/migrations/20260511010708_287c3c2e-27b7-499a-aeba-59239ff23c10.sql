ALTER TABLE public.lovable_projects
  ADD COLUMN IF NOT EXISTS has_blog boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS hnchat_kit_installed boolean NOT NULL DEFAULT false;