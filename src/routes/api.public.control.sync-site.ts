import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { authorizeAdminOrCron } from "@/server/control-auth";

/**
 * يستدعي سيرفر المرايا لمزامنة موقع واحد (git pull/clone).
 * يحمل التوكن السرّي على الخادم فقط — لا يصل أبداً للمتصفح.
 * يجب أن يستدعى من لوحة التحكم بمعرف موقع موجود في managed_sites.
 */
export const Route = createFileRoute("/api/public/control/sync-site")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const denied = await authorizeAdminOrCron(request);
        if (denied) return denied;
        const MIRROR_URL = process.env.MIRROR_SERVER_URL;
        const TOKEN = process.env.CONTROL_API_TOKEN;
        if (!MIRROR_URL || !TOKEN) {
          return Response.json(
            { error: "Service not configured" },
            { status: 500 },
          );
        }

        let body: { siteId?: string };
        try {
          body = (await request.json()) as { siteId?: string };
        } catch {
          return Response.json({ error: "JSON غير صالح" }, { status: 400 });
        }
        if (!body.siteId || typeof body.siteId !== "string") {
          return Response.json({ error: "siteId مطلوب" }, { status: 400 });
        }

        // اجلب الموقع
        const { data: site, error: siteErr } = await supabaseAdmin
          .from("managed_sites")
          .select("*")
          .eq("id", body.siteId)
          .maybeSingle();
        if (siteErr || !site) {
          if (siteErr) console.error("[sync-site] db error:", siteErr);
          return Response.json(
            { error: "Site not found" },
            { status: 404 },
          );
        }
        if (!site.github_repo) {
          return Response.json(
            { error: "هذا الموقع لا يحتوي على رابط GitHub repo" },
            { status: 400 },
          );
        }

        // اسم آمن من اسم الموقع (a-zA-Z0-9_.-)
        const safe = site.name.replace(/[^a-zA-Z0-9_.-]/g, "_");

        const started = Date.now();
        let syncRes: {
          ok?: boolean;
          commit?: string;
          duration_ms?: number;
          error?: string;
          output?: string;
        } = {};
        let httpOk = false;
        try {
          const r = await fetch(`${MIRROR_URL.replace(/\/$/, "")}/sync`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${TOKEN}`,
            },
            body: JSON.stringify({
              name: safe,
              repo: site.github_repo,
              branch: site.github_branch || "main",
            }),
          });
          httpOk = r.ok;
          syncRes = (await r.json().catch(() => ({}))) as typeof syncRes;
        } catch (e) {
          console.error("[sync-site] mirror fetch failed:", e);
          syncRes = { ok: false, error: "Sync request failed" };
        }

        const status = httpOk && syncRes.ok ? "success" : "failed";
        const duration = syncRes.duration_ms ?? Date.now() - started;

        // سجّل في site_sync_log
        await supabaseAdmin.from("site_sync_log").insert({
          site_id: site.id,
          status,
          commit_sha: syncRes.commit ?? null,
          duration_ms: duration,
          message: syncRes.error ?? syncRes.output ?? null,
        });

        // حدّث managed_sites
        await supabaseAdmin
          .from("managed_sites")
          .update({
            last_sync_at: new Date().toISOString(),
            last_sync_status: status,
            last_commit_sha: syncRes.commit ?? site.last_commit_sha,
            mirror_path: `/srv/mirrors/${safe}`,
          })
          .eq("id", site.id);

        return Response.json(
          {
            ok: status === "success",
            status,
            commit: syncRes.commit,
            duration_ms: duration,
            error: status === "success" ? undefined : "Sync failed",
          },
          { status: status === "success" ? 200 : 502 },
        );
      },
    },
  },
});