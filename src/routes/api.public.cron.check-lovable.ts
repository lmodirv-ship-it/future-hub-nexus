import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

function admin() {
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient<Database>(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let m = 0;
  for (let i = 0; i < a.length; i++) m |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return m === 0;
}

async function probe(url: string) {
  const t0 = Date.now();
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 8000);
    const res = await fetch(url, { signal: ctrl.signal, redirect: "follow" });
    clearTimeout(t);
    return { status: res.status, ms: Date.now() - t0, up: res.status >= 200 && res.status < 500 };
  } catch {
    return { status: null, ms: Date.now() - t0, up: false };
  }
}

async function handle(request: Request): Promise<Response> {
  const expected = process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.SUPABASE_ANON_KEY;
  if (!expected) {
    console.error("anon key not configured");
    return new Response(JSON.stringify({ ok: false, error: "Internal error" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
  const apikey = request.headers.get("apikey") ?? "";
  if (!apikey || !safeEqual(apikey, expected)) {
    return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });
  }
  try {
    const sb = admin();
    const { data: rows, error } = await sb.from("lovable_projects").select("id, custom_domains, published_url, lovable_url");
    if (error) throw new Error(error.message);
    let checked = 0;
    await Promise.all((rows ?? []).map(async (r) => {
      const customs = (r.custom_domains as Array<{ domain: string; primary?: boolean }> | null) ?? [];
      const primary = customs.find((c) => c.primary)?.domain ?? customs[0]?.domain;
      const url = primary ? (primary.startsWith("http") ? primary : `https://${primary}`) : r.published_url || r.lovable_url;
      if (!url) return;
      const res = await probe(url);
      await sb.from("lovable_projects").update({
        last_health_check: new Date().toISOString(),
        last_status_code: res.status,
        last_response_time_ms: res.ms,
        is_up: res.up,
      }).eq("id", r.id);
      checked++;
    }));
    return new Response(JSON.stringify({ ok: true, checked }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (e) {
    console.error("cron check-lovable error:", e);
    return new Response(JSON.stringify({ ok: false, error: "Internal error" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}

export const Route = createFileRoute("/api/public/cron/check-lovable")({
  server: {
    handlers: {
      GET: async ({ request }) => handle(request),
      POST: async ({ request }) => handle(request),
    },
  },
});