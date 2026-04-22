import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AlertTriangle, ExternalLink, Activity, CheckCircle2, XCircle, Clock, Trash2, Check, CheckCheck } from "lucide-react";
import { AdminGuard } from "@/components/nexus/AdminGuard";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAlerts, type AlertRow } from "@/hooks/use-alerts";
import { checkAllProjects } from "@/server/check-projects";

export const Route = createFileRoute("/admin/alerts")({
  head: () => ({ meta: [{ title: "التنبيهات — نكسس" }] }),
  component: () => (<AdminGuard><Page /></AdminGuard>),
});

function Page() {
  const { alerts, loading, markRead, markAllRead, remove } = useAlerts();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "unread" | "down" | "slow">("unread");
  const checkFn = useServerFn(checkAllProjects);

  async function run() {
    setBusy(true); setMsg("جارِ الفحص...");
    try { const r = await checkFn(); setMsg(`✓ فُحص ${r.checked} مشروع`); }
    catch (e) { setMsg(`خطأ: ${e instanceof Error ? e.message : "?"}`); }
    setBusy(false); setTimeout(() => setMsg(null), 3000);
  }

  const filtered = alerts.filter((a) => {
    if (filter === "unread") return !a.is_read;
    if (filter === "down") return a.type === "down";
    if (filter === "slow") return a.type === "slow";
    return true;
  });

  const unreadCount = alerts.filter((a) => !a.is_read).length;
  const downCount = alerts.filter((a) => a.type === "down" && !a.is_read).length;

  return (
    <AdminLayout
      title="التنبيهات"
      subtitle={`${unreadCount} غير مقروء · ${downCount} عطل · ${alerts.length} إجمالي`}
      actions={<>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"><CheckCheck className="h-4 w-4" /> تعليم الكل مقروء</button>
        )}
        <button onClick={run} disabled={busy} className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[oklch(0.75_0.2_295)] to-[oklch(0.7_0.28_330)] px-4 py-2 text-sm font-medium text-background neon-glow disabled:opacity-50"><Activity className="h-4 w-4" /> فحص الكل</button>
      </>}
    >
      {msg && <div className="glass mb-4 rounded-xl px-4 py-2.5 text-sm">{msg}</div>}

      <div className="mb-4 flex flex-wrap gap-2">
        {([
          { v: "unread", l: `غير مقروء (${unreadCount})` },
          { v: "all", l: `الكل (${alerts.length})` },
          { v: "down", l: "أعطال" },
          { v: "slow", l: "بطء" },
        ] as const).map((f) => (
          <button
            key={f.v}
            onClick={() => setFilter(f.v)}
            className={`rounded-full border px-4 py-1.5 text-xs font-medium transition-all ${filter === f.v ? "border-transparent bg-gradient-to-r from-[oklch(0.75_0.2_295)] to-[oklch(0.7_0.28_330)] text-background" : "border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10"}`}
          >{f.l}</button>
        ))}
      </div>

      {filtered.length === 0 && !loading ? (
        <div className="glass flex items-center gap-2 rounded-2xl p-10 text-center">
          <div className="mx-auto flex flex-col items-center gap-2 text-emerald-400">
            <CheckCircle2 className="h-10 w-10" />
            <p>لا توجد تنبيهات. كل شيء يعمل بشكل سليم 🎉</p>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((a) => <AlertItem key={a.id} alert={a} onRead={markRead} onDelete={remove} />)}
        </div>
      )}
    </AdminLayout>
  );
}

function AlertItem({ alert, onRead, onDelete }: { alert: AlertRow; onRead: (id: string) => void; onDelete: (id: string) => void }) {
  const Icon = alert.type === "down" ? XCircle : alert.type === "slow" ? Clock : AlertTriangle;
  const color = alert.severity === "high" ? "pink" : alert.severity === "medium" ? "amber" : "violet";
  const colorClass = color === "pink" ? "border-pink-500/30 bg-pink-500/5 text-pink-400" : color === "amber" ? "border-amber-500/30 bg-amber-500/5 text-amber-400" : "border-violet-500/30 bg-violet-500/5 text-violet-400";

  return (
    <div className={`glass flex items-center gap-3 rounded-xl border-l-4 p-4 ${colorClass} ${alert.is_read ? "opacity-60" : ""}`}>
      <Icon className="h-5 w-5 shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          {alert.project?.name_ar ?? "—"}
          {!alert.is_read && <span className="h-1.5 w-1.5 rounded-full bg-pink-400" />}
        </div>
        <div className="mt-0.5 text-xs text-muted-foreground">{alert.message}</div>
        <div className="mt-1 text-[10px] text-muted-foreground/60">{new Date(alert.created_at).toLocaleString("ar")}</div>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        {alert.project?.url && alert.project.url !== "#" && (
          <a href={alert.project.url} target="_blank" rel="noopener noreferrer" className="rounded p-2 hover:bg-white/10"><ExternalLink className="h-3.5 w-3.5" /></a>
        )}
        {!alert.is_read && (
          <button onClick={() => onRead(alert.id)} className="rounded p-2 hover:bg-white/10" title="تعليم كمقروء"><Check className="h-3.5 w-3.5" /></button>
        )}
        <button onClick={() => onDelete(alert.id)} className="rounded p-2 hover:bg-pink-500/20" title="حذف"><Trash2 className="h-3.5 w-3.5" /></button>
      </div>
    </div>
  );
}