import { createFileRoute } from "@tanstack/react-router";

const SITE_URL = process.env.SITE_URL || "https://www.slavacall-hiba.online";

export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: async () => {
        const lines = [
          "User-agent: *",
          "Allow: /",
          "",
          "# Private / admin areas",
          "Disallow: /admin",
          "Disallow: /admin/",
          "Disallow: /login",
          "Disallow: /dashboard",
          "",
          "# API & internal endpoints",
          "Disallow: /api/",
          "Disallow: /api/public/",
          "",
          "# Dynamic query URLs (filters, sessions, tracking)",
          "Disallow: /*?*",
          "Disallow: /*&*",
          "Disallow: /*utm_*",
          "Disallow: /*ref=*",
          "Disallow: /*session=*",
          "",
          "# Allow common crawlers full access to public assets",
          "User-agent: Googlebot",
          "Allow: /",
          "Disallow: /admin",
          "Disallow: /login",
          "Disallow: /api/",
          "",
          "# Block known bad/aggressive bots",
          "User-agent: AhrefsBot",
          "Disallow: /",
          "User-agent: SemrushBot",
          "Disallow: /",
          "User-agent: MJ12bot",
          "Disallow: /",
          "User-agent: DotBot",
          "Disallow: /",
          "",
          `Sitemap: ${SITE_URL}/sitemap.xml`,
          "",
        ];
        const body = lines.join("\n");
        return new Response(body, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "public, max-age=86400",
          },
        });
      },
    },
  },
});