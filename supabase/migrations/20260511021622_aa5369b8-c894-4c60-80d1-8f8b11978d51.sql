
CREATE TABLE public.blog_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title_ar TEXT NOT NULL,
  title_en TEXT,
  title_fr TEXT,
  excerpt_ar TEXT,
  excerpt_en TEXT,
  excerpt_fr TEXT,
  body_ar TEXT,
  body_en TEXT,
  body_fr TEXT,
  cover_image TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  is_published BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ,
  view_count INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.blog_articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published articles"
ON public.blog_articles FOR SELECT
TO public
USING (is_published = true);

CREATE POLICY "Admin manages blog_articles"
ON public.blog_articles FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE TRIGGER update_blog_articles_updated_at
BEFORE UPDATE ON public.blog_articles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_blog_articles_published ON public.blog_articles(is_published, published_at DESC);
CREATE INDEX idx_blog_articles_category ON public.blog_articles(category);

CREATE OR REPLACE FUNCTION public.increment_article_view(_slug TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.blog_articles
  SET view_count = view_count + 1
  WHERE slug = _slug AND is_published = true;
END;
$$;
