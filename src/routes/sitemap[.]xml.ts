import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

const SITE_URL = process.env.SITE_URL || "https://future-hub-nexus.lovable.app";

const STATIC_PATHS: Array<{ path: string; priority: number; changefreq: string }> = [
  { path: "/", priority: 1.0, changefreq: "weekly" },
  { path: "/projects", priority: 0.9, changefreq: "weekly" },
  { path: "/marketplace", priority: 0.9, changefreq: "weekly" },
  { path: "/pricing", priority: 0.8, changefreq: "monthly" },
  { path: "/services", priority: 0.8, changefreq: "monthly" },
  { path: "/monitor", priority: 0.6, changefreq: "monthly" },
  { path: "/about", priority: 0.6, changefreq: "monthly" },
  { path: "/contact", priority: 0.7, changefreq: "monthly" },
  { path: "/privacy", priority: 0.3, changefreq: "yearly" },
  { path: "/terms", priority: 0.3, changefreq: "yearly" },
  { path: "/refund", priority: 0.3, changefreq: "yearly" },
];

function escapeXml(s: string) {
  return s.replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[c]!));
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

        for (const s of STATIC_PATHS) {
          urls.push(
            `<url><loc>${SITE_URL}${s.path}</loc><changefreq>${s.changefreq}</changefreq><priority>${s.priority}</priority></url>`
          );
        }
        for (const p of projects ?? []) {
          if (!p.slug) continue;
          const lastmod = p.updated_at ? new Date(p.updated_at).toISOString() : "";
          urls.push(
            `<url><loc>${SITE_URL}/projects/${escapeXml(p.slug)}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ""}<changefreq>weekly</changefreq><priority>0.7</priority></url>`
          );
        }
        for (const t of templates ?? []) {
          if (!t.slug) continue;
          const lastmod = t.updated_at ? new Date(t.updated_at).toISOString() : "";
          urls.push(
            `<url><loc>${SITE_URL}/marketplace/${escapeXml(t.slug)}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ""}<changefreq>weekly</changefreq><priority>0.7</priority></url>`
          );
        }

        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>`;

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