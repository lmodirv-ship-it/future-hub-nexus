import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

const SITE_URL = process.env.SITE_URL || "https://www.slavacall-hiba.online";
const LANGS = ["ar", "en", "fr"] as const;
type Lang = (typeof LANGS)[number];

const STATIC_PATHS: Array<{ path: string; priority: number; changefreq: string }> = [
  { path: "/", priority: 1.0, changefreq: "weekly" },
  { path: "/projects", priority: 0.9, changefreq: "weekly" },
  { path: "/marketplace", priority: 0.9, changefreq: "weekly" },
  { path: "/pricing", priority: 0.8, changefreq: "monthly" },
  { path: "/services", priority: 0.8, changefreq: "monthly" },
  { path: "/about", priority: 0.6, changefreq: "monthly" },
  { path: "/contact", priority: 0.7, changefreq: "monthly" },
  { path: "/privacy", priority: 0.3, changefreq: "yearly" },
  { path: "/terms", priority: 0.3, changefreq: "yearly" },
  { path: "/refund", priority: 0.3, changefreq: "yearly" },
];

function escapeXml(s: string) {
  return s.replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[c]!));
}

function langPath(lang: Lang, p: string) {
  if (lang === "ar") return p;
  return p === "/" ? `/${lang}` : `/${lang}${p}`;
}

function alternates(p: string) {
  const links = LANGS.map((l) => `<xhtml:link rel="alternate" hreflang="${l}" href="${SITE_URL}${langPath(l, p)}"/>`);
  links.push(`<xhtml:link rel="alternate" hreflang="x-default" href="${SITE_URL}${langPath("ar", p)}"/>`);
  return links.join("");
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const [{ data: projects }, { data: templates }] = await Promise.all([
          supabase.from("projects_public" as "projects").select("slug, updated_at"),
          supabase.from("templates").select("slug, updated_at").eq("is_published", true),
        ]);

        const urls: string[] = [];

        // Static pages — emit one URL per language with hreflang alternates
        for (const s of STATIC_PATHS) {
          for (const l of LANGS) {
            urls.push(
              `<url><loc>${SITE_URL}${langPath(l, s.path)}</loc>${alternates(s.path)}<changefreq>${s.changefreq}</changefreq><priority>${s.priority}</priority></url>`,
            );
          }
        }

        // Dynamic project pages
        for (const p of projects ?? []) {
          if (!p.slug) continue;
          const slug = escapeXml(p.slug);
          const lastmod = p.updated_at ? `<lastmod>${new Date(p.updated_at).toISOString()}</lastmod>` : "";
          const path = `/projects/${slug}`;
          for (const l of LANGS) {
            urls.push(
              `<url><loc>${SITE_URL}${langPath(l, path)}</loc>${alternates(path)}${lastmod}<changefreq>weekly</changefreq><priority>0.7</priority></url>`,
            );
          }
        }

        // Dynamic marketplace pages
        for (const t of templates ?? []) {
          if (!t.slug) continue;
          const slug = escapeXml(t.slug);
          const lastmod = t.updated_at ? `<lastmod>${new Date(t.updated_at).toISOString()}</lastmod>` : "";
          const path = `/marketplace/${slug}`;
          for (const l of LANGS) {
            urls.push(
              `<url><loc>${SITE_URL}${langPath(l, path)}</loc>${alternates(path)}${lastmod}<changefreq>weekly</changefreq><priority>0.7</priority></url>`,
            );
          }
        }

        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join("\n")}\n</urlset>`;

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600, s-maxage=3600",
          },
        });
      },
    },
  },
});
