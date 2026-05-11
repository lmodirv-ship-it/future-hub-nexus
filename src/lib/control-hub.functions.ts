import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

function getAdminClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing SUPABASE env");
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function ensureAdmin(supabase: ReturnType<typeof getAdminClient>, userId: string) {
  const { data, error } = await supabase
    .from("user_roles").select("role")
    .eq("user_id", userId).eq("role", "admin").maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("forbidden");
}

async function pingUrl(url: string): Promise<{ status: number | null; ms: number | null; up: boolean }> {
  const t0 = Date.now();
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 8000);
    const res = await fetch(url, { method: "GET", signal: ctrl.signal, redirect: "follow" });
    clearTimeout(timer);
    return { status: res.status, ms: Date.now() - t0, up: res.status >= 200 && res.status < 500 };
  } catch {
    return { status: null, ms: null, up: false };
  }
}

/* ========== Bulk health check ========== */
export const checkAllLovableProjects = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const admin = getAdminClient();
    await ensureAdmin(admin, context.userId);

    const { data: rows, error } = await admin
      .from("lovable_projects")
      .select("id, lovable_project_id, published_url, lovable_url, custom_domains");
    if (error) throw new Error(error.message);

    let checked = 0;
    await Promise.all(
      (rows ?? []).map(async (r) => {
        const customs = (r.custom_domains as Array<{ domain: string; primary?: boolean }> | null) ?? [];
        const primary = customs.find((c) => c.primary)?.domain ?? customs[0]?.domain;
        const url = primary
          ? (primary.startsWith("http") ? primary : `https://${primary}`)
          : r.published_url || r.lovable_url;
        if (!url) return;
        const res = await pingUrl(url);
        await admin
          .from("lovable_projects")
          .update({
            last_health_check: new Date().toISOString(),
            last_status_code: res.status,
            last_response_time_ms: res.ms,
            is_up: res.up,
          })
          .eq("id", r.id);
        checked++;
      })
    );
    return { checked };
  });

/* ========== Single project health ========== */
const pingSchema = z.object({ id: z.string().uuid() });
export const pingLovableProject = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => pingSchema.parse(input))
  .handler(async ({ data, context }) => {
    const admin = getAdminClient();
    await ensureAdmin(admin, context.userId);
    const { data: row, error } = await admin
      .from("lovable_projects")
      .select("custom_domains, published_url, lovable_url")
      .eq("id", data.id).maybeSingle();
    if (error || !row) throw new Error(error?.message ?? "not found");
    const customs = (row.custom_domains as Array<{ domain: string; primary?: boolean }> | null) ?? [];
    const primary = customs.find((c) => c.primary)?.domain ?? customs[0]?.domain;
    const url = primary
      ? (primary.startsWith("http") ? primary : `https://${primary}`)
      : row.published_url || row.lovable_url;
    if (!url) throw new Error("no url");
    const res = await pingUrl(url);
    await admin.from("lovable_projects").update({
      last_health_check: new Date().toISOString(),
      last_status_code: res.status,
      last_response_time_ms: res.ms,
      is_up: res.up,
    }).eq("id", data.id);
    return res;
  });
