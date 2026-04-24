import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

function getAdminClient() {
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) throw new Error("Missing service credentials");
  return createClient<Database>(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function probe(url: string) {
  if (!url || url === "#") return { ok: false, status: null as number | null, ms: 0, err: "no url" };
  const start = Date.now();
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 8000);
    const res = await fetch(url, { method: "GET", signal: ctrl.signal, redirect: "follow" });
    clearTimeout(t);
    return { ok: res.ok, status: res.status, ms: Date.now() - start, err: null as string | null };
  } catch (e) {
    return { ok: false, status: null, ms: Date.now() - start, err: e instanceof Error ? e.message : String(e) };
  }
}

async function runCheck() {
  const admin = getAdminClient();
  const { data: projects, error } = await admin.from("projects").select("id, url");
  if (error) throw new Error(error.message);

  const results = await Promise.all(
    (projects ?? []).map(async (p) => {
      const r = await probe(p.url);
      await admin.from("project_checks").insert({
        project_id: p.id, status_code: r.status, response_time_ms: r.ms,
        is_up: r.ok, error_message: r.err,
      });
      await admin.from("projects").update({
        last_checked_at: new Date().toISOString(),
        last_status_code: r.status,
        last_response_time_ms: r.ms,
        is_up: r.ok,
      }).eq("id", p.id);
      return { id: p.id, ok: r.ok };
    }),
  );
  return results;
}

export const Route = createFileRoute("/api/public/cron/check-projects")({
  server: {
    handlers: {
      POST: async () => {
        try {
          const expected = process.env.CRON_SECRET;
          if (!expected) {
            console.error("CRON_SECRET not configured");
            return new Response(JSON.stringify({ ok: false, error: "Internal error" }), {
              status: 500, headers: { "Content-Type": "application/json" },
            });
          }
          const results = await runCheck();
          return new Response(JSON.stringify({ ok: true, checked: results.length }), {
            status: 200, headers: { "Content-Type": "application/json" },
          });
        } catch (e) {
          console.error("cron check-projects error:", e);
          return new Response(JSON.stringify({ ok: false, error: "Internal error" }), {
            status: 500, headers: { "Content-Type": "application/json" },
          });
        }
      },
      GET: async () => {
        try {
          const expected = process.env.CRON_SECRET;
          if (!expected) {
            console.error("CRON_SECRET not configured");
            return new Response(JSON.stringify({ ok: false, error: "Internal error" }), {
              status: 500, headers: { "Content-Type": "application/json" },
            });
          }
          const results = await runCheck();
          return new Response(JSON.stringify({ ok: true, checked: results.length }), {
            status: 200, headers: { "Content-Type": "application/json" },
          });
        } catch (e) {
          console.error("cron check-projects error:", e);
          return new Response(JSON.stringify({ ok: false, error: "Internal error" }), {
            status: 500, headers: { "Content-Type": "application/json" },
          });
        }
      },
    },
  },
});