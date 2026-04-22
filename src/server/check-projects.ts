import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

function getAdminClient() {
  const url = process.env.SUPABASE_URL ?? import.meta.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }
  return createClient<Database>(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function probe(url: string): Promise<{ ok: boolean; status: number | null; ms: number; err: string | null }> {
  if (!url || url === "#") return { ok: false, status: null, ms: 0, err: "no url" };
  const start = Date.now();
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 8000);
    const res = await fetch(url, { method: "GET", signal: ctrl.signal, redirect: "follow" });
    clearTimeout(t);
    return { ok: res.ok, status: res.status, ms: Date.now() - start, err: null };
  } catch (e) {
    return { ok: false, status: null, ms: Date.now() - start, err: e instanceof Error ? e.message : String(e) };
  }
}

export const checkAllProjects = createServerFn({ method: "POST" }).handler(async () => {
  const admin = getAdminClient();
  const { data: projects, error } = await admin.from("projects").select("id, url");
  if (error) throw new Error(error.message);

  const results = await Promise.all(
    (projects ?? []).map(async (p) => {
      const r = await probe(p.url);
      await admin.from("project_checks").insert({
        project_id: p.id,
        status_code: r.status,
        response_time_ms: r.ms,
        is_up: r.ok,
        error_message: r.err,
      });
      await admin
        .from("projects")
        .update({
          last_checked_at: new Date().toISOString(),
          last_status_code: r.status,
          last_response_time_ms: r.ms,
          is_up: r.ok,
        })
        .eq("id", p.id);
      return { id: p.id, ok: r.ok, status: r.status, ms: r.ms };
    }),
  );

  return { checked: results.length, results };
});