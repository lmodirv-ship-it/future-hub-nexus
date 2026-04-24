import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

/**
 * Health check endpoint for managed sites.
 * - Reads enabled sites from `managed_sites`
 * - Performs HTTP GET to each domain (HEAD with timeout fallback)
 * - Records result in `site_health_history`
 * - Updates summary fields on `managed_sites`
 *
 * Called manually from the Control Center UI or by pg_cron every 10 minutes.
 * Public route — does not return PII; only aggregate counts.
 */

const TIMEOUT_MS = 10_000;

async function checkSite(domain: string): Promise<{
  is_up: boolean;
  status_code: number | null;
  response_time_ms: number;
  error_message: string | null;
}> {
  const url = domain.startsWith("http") ? domain : `https://${domain}`;
  const start = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: { "User-Agent": "NexusControlCenter/1.0" },
    });
    clearTimeout(timer);
    const ms = Date.now() - start;
    return {
      is_up: res.ok,
      status_code: res.status,
      response_time_ms: ms,
      error_message: res.ok ? null : res.statusText,
    };
  } catch (e) {
    clearTimeout(timer);
    const ms = Date.now() - start;
    return {
      is_up: false,
      status_code: null,
      response_time_ms: ms,
      error_message: e instanceof Error ? e.message : "unknown error",
    };
  }
}

async function runChecks() {
  const { data: sites, error } = await supabaseAdmin
    .from("managed_sites")
    .select("id, domain")
    .eq("enabled", true);

  if (error) throw new Error(`db read failed: ${error.message}`);
  if (!sites || sites.length === 0) return { checked: 0, up: 0, down: 0 };

  let up = 0;
  let down = 0;
  const now = new Date().toISOString();

  await Promise.all(
    sites.map(async (s) => {
      const r = await checkSite(s.domain);
      if (r.is_up) up++;
      else down++;

      await supabaseAdmin.from("site_health_history").insert({
        site_id: s.id,
        is_up: r.is_up,
        status_code: r.status_code,
        response_time_ms: r.response_time_ms,
        error_message: r.error_message,
      });

      await supabaseAdmin
        .from("managed_sites")
        .update({
          last_health_status: r.is_up ? "up" : "down",
          last_response_time_ms: r.response_time_ms,
          last_status_code: r.status_code,
          last_checked_at: now,
        })
        .eq("id", s.id);
    }),
  );

  return { checked: sites.length, up, down };
}

export const Route = createFileRoute("/api/public/control/health-check")({
  server: {
    handlers: {
      POST: async () => {
        try {
          const result = await runChecks();
          return Response.json({ ok: true, ...result });
        } catch (e) {
          return Response.json(
            { ok: false, error: e instanceof Error ? e.message : "unknown" },
            { status: 500 },
          );
        }
      },
      GET: async () => {
        try {
          const result = await runChecks();
          return Response.json({ ok: true, ...result });
        } catch (e) {
          return Response.json(
            { ok: false, error: e instanceof Error ? e.message : "unknown" },
            { status: 500 },
          );
        }
      },
    },
  },
});