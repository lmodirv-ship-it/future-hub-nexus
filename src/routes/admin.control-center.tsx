import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  Radar, Plus, RefreshCw, ExternalLink, Github, Globe2,
  CheckCircle2, XCircle, Clock, Trash2, Power, PowerOff, Activity, GitBranch,
} from "lucide-react";
import { AdminGuard } from "@/components/nexus/AdminGuard";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useManagedSites, type ManagedSite } from "@/hooks/use-managed-sites";
import { AddSiteModal, type AddSitePayload } from "@/components/admin/AddSiteModal";

export const Route = createFileRoute("/admin/control-center")({
  head: () => ({
    meta: [
      { title: "مركز التحكم — نكسس" },
      { name: "description", content: "إدارة مركزية لكل مواقعك من مكان واحد." },
    ],
  }),
  component: () => (
    <AdminGuard>
      <ControlCenterPage />
    </AdminGuard>
  ),
});

function ControlCenterPage() {
  const { sites, loading, refetch, addSite, updateSite, deleteSite } = useManagedSites();
  const [openAdd, setOpenAdd] = useState(false);
  const [filter, setFilter] = useState<"all" | "up" | "down" | "disabled">("all");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const counts = useMemo(() => {
    return {
      total: sites.length,
      up: sites.filter((s) => s.last_health_status === "up").length,
      down: sites.filter((s) => s.last_health_status === "down").length,
      disabled: sites.filter((s) => !s.enabled).length,
    };
  }, [sites]);

  const filtered = useMemo(() => {
    return sites.filter((s) => {
      if (filter === "up") return s.last_health_status === "up";
      if (filter === "down") return s.last_health_status === "down";
      if (filter === "disabled") return !s.enabled;
      return true;
    });
  }, [sites, filter]);

  async function handleAdd(payload: AddSitePayload) {
    const { error } = await addSite({
      ...payload,
      github_repo: payload.github_repo || null,
      origin_server: payload.origin_server || null,
      notes: payload.notes || null,
    });
    if (error) flash(`خطأ: ${error.message}`);
    else flash(`✓ تمت إضافة "${payload.name}"`);
  }

  async function runHealthCheck() {
    setBusy(true);
    flash("جارِ فحص كل المواقع...");
    try {
      const res = await fetch("/api/public/control/health-check", { method: "POST" });
      const json = await res.json();
      if (res.ok) {
        flash(`✓ تم فحص ${json.checked ?? 0} موقع`);
        await refetch();
      } else {
        flash(`خطأ: ${json.error ?? res.statusText}`);
      }
    } catch (e) {
      flash(`خطأ: ${e instanceof Error ? e.message : "?"}`);
    } finally {
      setBusy(false);
    }
  }

  function flash(m: string) {
    setMsg(m);
    setTimeout(() => setMsg(null), 4000);
  }

  return (
    <AdminLayout
      title="مركز التحكم"
      subtitle="إدارة مركزية لكل مواقعك — مراقبة وحدها بدون المساس بالنشر."
      actions={
        <>
          <button
            onClick={runHealthCheck}
            disabled={busy || sites.length === 0}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10 disabled:opacity-50"
          >
            <Activity className={`h-4 w-4 ${busy ? "animate-pulse" : ""}`} /> فحص الكل
          </button>
          <button
            onClick={refetch}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> تحديث
          </button>
          <button
            onClick={() => setOpenAdd(true)}
            className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[oklch(0.75_0.2_295)] to-[oklch(0.7_0.28_330)] px-4 py-2 text-sm font-bold text-background neon-glow"
          >
            <Plus className="h-4 w-4" /> إضافة موقع
          </button>
        </>
      }
    >
      {msg && <div className="glass mb-4 rounded-xl px-4 py-2.5 text-sm">{msg}</div>}

      {/* Stats */}
      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard icon={Radar} label="إجمالي المواقع" value={counts.total} />
        <StatCard icon={CheckCircle2} label="متاح" value={counts.up} accent="emerald" />
        <StatCard icon={XCircle} label="غير متاح" value={counts.down} accent="pink" />
        <StatCard icon={PowerOff} label="معطّل" value={counts.disabled} accent="muted" />
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-2">
        {(["all", "up", "down", "disabled"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-lg border px-3 py-1.5 text-xs transition-colors ${
              filter === f
                ? "border-[oklch(0.65_0.25_290)]/50 bg-[oklch(0.65_0.25_290)]/15 text-foreground"
                : "border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10"
            }`}
          >
            {f === "all" ? "الكل" : f === "up" ? "متاح" : f === "down" ? "غير متاح" : "معطّل"}
          </button>
        ))}
      </div>

      {/* Sites grid */}
      {loading ? (
        <div className="glass rounded-2xl p-8 text-center text-sm text-muted-foreground">
          جارِ تحميل المواقع...
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass rounded-2xl p-8 text-center">
          <Radar className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">
            {sites.length === 0 ? "لم تُضف أي مواقع بعد. ابدأ بإضافة موقعك الأول." : "لا توجد نتائج للفلتر الحالي."}
          </p>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((site) => (
            <SiteCard
              key={site.id}
              site={site}
              onToggleEnabled={() => updateSite(site.id, { enabled: !site.enabled })}
              onDelete={async () => {
                if (confirm(`حذف "${site.name}" نهائياً؟`)) {
                  const { error } = await deleteSite(site.id);
                  if (error) flash(`خطأ: ${error.message}`);
                  else flash(`✓ تم الحذف`);
                }
              }}
              onSync={async () => {
                flash(`جارِ مزامنة "${site.name}"...`);
                try {
                  const res = await fetch("/api/public/control/sync-site", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ siteId: site.id }),
                  });
                  const json = await res.json();
                  if (res.ok && json.ok) {
                    flash(`✓ مزامنة "${site.name}" — ${(json.commit ?? "").slice(0, 7)}`);
                    await refetch();
                  } else {
                    flash(`خطأ مزامنة: ${json.error ?? res.statusText}`);
                  }
                } catch (e) {
                  flash(`خطأ: ${e instanceof Error ? e.message : "?"}`);
                }
              }}
            />
          ))}
        </div>
      )}

      <AddSiteModal open={openAdd} onClose={() => setOpenAdd(false)} onSubmit={handleAdd} />
    </AdminLayout>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: typeof Radar;
  label: string;
  value: number;
  accent?: "emerald" | "pink" | "muted";
}) {
  const color =
    accent === "emerald"
      ? "text-emerald-400"
      : accent === "pink"
        ? "text-pink-400"
        : accent === "muted"
          ? "text-muted-foreground"
          : "text-[oklch(0.85_0.18_200)]";
  return (
    <div className="glass rounded-2xl p-4">
      <Icon className={`h-5 w-5 ${color}`} />
      <div className="mt-2 font-display text-2xl font-bold neon-text">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function SiteCard({
  site,
  onToggleEnabled,
  onDelete,
  onSync,
}: {
  site: ManagedSite;
  onToggleEnabled: () => void;
  onDelete: () => void;
  onSync: () => void;
}) {
  const status = site.last_health_status;
  const statusColor =
    status === "up"
      ? "bg-emerald-400 animate-pulse"
      : status === "down"
        ? "bg-pink-400"
        : "bg-muted-foreground/40";
  const statusLabel =
    status === "up" ? "متاح" : status === "down" ? "غير متاح" : "لم يُفحص بعد";

  return (
    <div className={`glass rounded-2xl p-4 transition-opacity ${!site.enabled ? "opacity-50" : ""}`}>
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full shrink-0 ${statusColor}`} />
            <h3 className="truncate font-display text-base font-bold">{site.name}</h3>
          </div>
          <a
            href={`https://${site.domain}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            dir="ltr"
          >
            <Globe2 className="h-3 w-3" />
            {site.domain}
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
        <div className="flex shrink-0 gap-1">
          {site.github_repo && (
            <button
              onClick={onSync}
              title="مزامنة من GitHub"
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-[oklch(0.65_0.25_290)]/15 hover:text-foreground"
            >
              <GitBranch className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            onClick={onToggleEnabled}
            title={site.enabled ? "تعطيل" : "تفعيل"}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-white/10 hover:text-foreground"
          >
            {site.enabled ? <Power className="h-3.5 w-3.5" /> : <PowerOff className="h-3.5 w-3.5" />}
          </button>
          <button
            onClick={onDelete}
            title="حذف"
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-pink-500/15 hover:text-pink-400"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="mb-3 grid grid-cols-2 gap-2 text-[11px]">
        <InfoLine label="الحالة" value={statusLabel} />
        <InfoLine
          label="الاستجابة"
          value={site.last_response_time_ms ? `${site.last_response_time_ms}ms` : "—"}
        />
        <InfoLine label="كود HTTP" value={site.last_status_code?.toString() ?? "—"} />
        <InfoLine
          label="آخر فحص"
          value={
            site.last_checked_at
              ? new Date(site.last_checked_at).toLocaleTimeString("ar", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "—"
          }
        />
      </div>

      {site.github_repo && (
        <a
          href={site.github_repo}
          target="_blank"
          rel="noopener noreferrer"
          className="mb-2 flex items-center gap-1.5 truncate rounded-lg border border-white/5 bg-white/[0.02] px-2 py-1.5 text-[11px] text-muted-foreground hover:text-foreground"
          dir="ltr"
        >
          <Github className="h-3 w-3 shrink-0" />
          <span className="truncate">{site.github_repo.replace("https://github.com/", "")}</span>
          <span className="ms-auto rounded bg-white/5 px-1.5 py-0.5 text-[9px]">{site.github_branch}</span>
        </a>
      )}

      {site.origin_server && (
        <div className="text-[10px] text-muted-foreground/70">
          سيرفر: {site.origin_server}
        </div>
      )}

      <div className="mt-2 flex items-center justify-between border-t border-white/5 pt-2 text-[10px] text-muted-foreground/70">
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {site.last_sync_at
            ? `مزامنة: ${new Date(site.last_sync_at).toLocaleDateString("ar")}`
            : "لم تتم مزامنة"}
        </span>
        {site.last_sync_status && <span>{site.last_sync_status}</span>}
      </div>
    </div>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-white/[0.02] px-2 py-1">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono">{value}</span>
    </div>
  );
}