import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AlertTriangle, ExternalLink, Activity, CheckCircle2, XCircle, Clock } from "lucide-react";
import { AdminGuard } from "@/components/nexus/AdminGuard";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useProjects } from "@/hooks/use-projects";
import { checkAllProjects } from "@/server/check-projects";

export const Route = createFileRoute("/admin/alerts")({
  head: () => ({ meta: [{ title: "التنبيهات — نكسس" }] }),
  component: () => (<AdminGuard><Page /></AdminGuard>),
});

function Page() {
  const { projects, refresh } = useProjects();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const checkFn = useServerFn(checkAllProjects);

  const down = projects.filter(p => p.is_up === false);
  const slow = projects.filter(p => p.is_up === true && (p.last_response_time_ms ?? 0) > 3000);
  const stale = projects.filter(p => {
    if (!p.last_checked_at) return true;
    const ageHr = (Date.now() - new Date(p.last_checked_at).getTime()) / 36e5;
    return ageHr > 24;
  });

  async function run() {
    setBusy(true); setMsg("فحص...");
    try { const r = await checkFn(); setMsg(`✓ ${r.checked}`); refresh(); }
    catch (e) { setMsg(`خطأ: ${e instanceof Error ? e.message : "?"}`); }
    setBusy(false); setTimeout(() => setMsg(null), 3000);
  }

  const sections = [
    { title: "مواقع معطلة", icon: XCircle, color: "pink", items: down, empty: "لا توجد مواقع معطلة 🎉", desc: (p: typeof down[0]) => `حالة: ${p.last_status_code ?? "خطأ شبكة"}` },
    { title: "استجابة بطيئة (>3s)", icon: Clock, color: "amber", items: slow, empty: "كل المواقع سريعة ⚡", desc: (p: typeof slow[0]) => `${p.last_response_time_ms}ms` },
    { title: "لم تُفحص منذ 24 ساعة", icon: AlertTriangle, color: "violet", items: stale, empty: "كل المواقع حديثة الفحص", desc: (p: typeof stale[0]) => p.last_checked_at ? `آخر فحص: ${new Date(p.last_checked_at).toLocaleString("ar")}` : "لم تُفحص بعد" },
  ] as const;

  return (
    <AdminLayout
      title="التنبيهات"
      subtitle={`${down.length + slow.length} تنبيه نشط · ${stale.length} يحتاج فحصاً`}
      actions={<button onClick={run} disabled={busy} className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[oklch(0.75_0.2_295)] to-[oklch(0.7_0.28_330)] px-4 py-2 text-sm font-medium text-background neon-glow disabled:opacity-50"><Activity className="h-4 w-4" /> فحص الكل</button>}
    >
      {msg && <div className="glass mb-4 rounded-xl px-4 py-2.5 text-sm">{msg}</div>}
      <div className="space-y-5">
        {sections.map(s => (
          <div key={s.title} className="glass rounded-2xl p-5">
            <h2 className="mb-3 flex items-center gap-2 font-display text-base font-bold">
              <s.icon className={`h-4 w-4 ${s.color === "pink" ? "text-pink-400" : s.color === "amber" ? "text-amber-400" : "text-[oklch(0.75_0.2_295)]"}`} /> {s.title} ({s.items.length})
            </h2>
            {s.items.length === 0 ? (
              <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 text-sm text-emerald-400"><CheckCircle2 className="h-4 w-4" /> {s.empty}</div>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                {s.items.map(p => (
                  <div key={p.id} className={`flex items-center gap-3 rounded-lg border p-3 ${s.color === "pink" ? "border-pink-500/20 bg-pink-500/5" : s.color === "amber" ? "border-amber-500/20 bg-amber-500/5" : "border-white/10 bg-white/[0.02]"}`}>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold">{p.name_ar}</div>
                      <div className="text-[11px] text-muted-foreground">{s.desc(p)}</div>
                    </div>
                    {p.url !== "#" && <a href={p.url} target="_blank" rel="noopener noreferrer" className="rounded p-1.5 hover:bg-white/5"><ExternalLink className="h-3.5 w-3.5" /></a>}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}