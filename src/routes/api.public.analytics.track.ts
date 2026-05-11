import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

function admin() {
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient<Database>(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  } as Record<string, string>;
}

export const Route = createFileRoute("/api/public/analytics/track")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: corsHeaders() }),
      POST: async ({ request }) => {
        try {
          const body = await request.json().catch(() => ({}));
          const project_id = String(body?.project_id ?? "").trim().slice(0, 100);
          const path = String(body?.path ?? "/").trim().slice(0, 500) || "/";
          const referrer = body?.referrer ? String(body.referrer).slice(0, 500) : null;
          const country =
            request.headers.get("cf-ipcountry")?.slice(0, 4) ??
            request.headers.get("x-vercel-ip-country")?.slice(0, 4) ??
            null;
          if (!project_id) {
            return new Response(JSON.stringify({ ok: false, error: "missing project_id" }), { status: 400, headers: corsHeaders() });
          }
          const sb = admin();
          const { error } = await sb.rpc("track_cross_visit", {
            _project_id: project_id, _path: path, _referrer: referrer, _country: country,
          });
          if (error) {
            console.error("track_cross_visit:", error.message);
            return new Response(JSON.stringify({ ok: false, error: "Internal error" }), { status: 500, headers: corsHeaders() });
          }
          return new Response(JSON.stringify({ ok: true }), { status: 200, headers: corsHeaders() });
        } catch (e) {
          console.error("analytics.track error:", e);
          return new Response(JSON.stringify({ ok: false, error: "Internal error" }), { status: 500, headers: corsHeaders() });
        }
      },
    },
  },
});