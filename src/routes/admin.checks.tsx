import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Activity, RefreshCw, CheckCircle2, XCircle, Clock } from "lucide-react";
import { AdminGuard } from "@/components/nexus/AdminGuard";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { checkAllProjects } from "@/server/check-projects";

export const Route = createFileRoute("/admin/checks")({
  head: () => ({ meta: [{ title: "الفحوصات — HN-Dev" }] }),
  component: () => (<AdminGuard><Page /></AdminGuard>),
});

type CheckRow = {
  id: string; checked_at: string; is_up: boolean; status_code: number | null;
  response_time_ms: number | null; error_message: string | null;
  project: { name_ar: string; slug: string } | null;
};

function Page() {
  const [rows, setRows] = useState<CheckRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const checkFn = useServerFn(checkAllProjects);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("project_checks")
      .select("id, checked_at, is_up, status_code, response_time_ms, error_message, project:projects(name_ar, slug)")
      .order("checked_at", { ascending: false })
      .limit(200);
    setRows((data as unknown as CheckRow[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const ch = supabase.channel("checks-rt")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "project_checks" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [load]);

  async function run() {
    setBusy(true); setMsg("جارِ الفحص...");
    try { const r = await checkFn(); setMsg(`✓ فُحص ${r.checked}`); load(); }
    catch (e) { setMsg(`خطأ: ${e instanceof Error ? e.message : "?"}`); }
    setBusy(false); setTimeout(() => setMsg(null), 3000);
  }

  const upCount = rows.filter(r => r.is_up).length;
  const downCount = rows.filter(r => !r.is_up).length;
  const avgMs = rows.filter(r => r.response_time_ms).reduce((a, r) => a + (r.response_time_ms ?? 0), 0) / Math.max(1, rows.filter(r => r.response_time_ms).length);

  return (
    <AdminLayout
      title="سجل الفحوصات"
      subtitle={`${rows.length} فحص مسجّل (آخر 200)`}
      actions={<>
        <button onClick={run} disabled={busy} className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[oklch(0.75_0.2_295)] to-[oklch(0.7_0.28_330)] px-4 py-2 text-sm font-medium text-background neon-glow disabled:opacity-50"><Activity className="h-4 w-4" /> فحص الآن</button>
        <button onClick={load} className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"><RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /></button>
      </>}
    >
      {msg && <div className="glass mb-4 rounded-xl px-4 py-2.5 text-sm">{msg}</div>}
      <div className="mb-4 grid grid-cols-3 gap-3">
        <Stat icon={CheckCircle2} label="نجح" value={upCount} color="text-emerald-400" />
        <Stat icon={XCircle} label="فشل" value={downCount} color="text-pink-400" />
        <Stat icon={Clock} label="متوسط" value={`${Math.round(avgMs) || 0}ms`} color="text-[oklch(0.85_0.18_200)]" />
      </div>
      <div className="glass overflow-hidden rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-white/10 bg-white/5 text-xs uppercase text-muted-foreground"><tr>
              <th className="px-4 py-3 text-start">الوقت</th>
              <th className="px-4 py-3 text-start">المشروع</th>
              <th className="px-4 py-3 text-start">الحالة</th>
              <th className="px-4 py-3 text-start">الكود</th>
              <th className="px-4 py-3 text-start">الاستجابة</th>
              <th className="px-4 py-3 text-start">خطأ</th>
            </tr></thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="px-4 py-2.5 text-xs text-muted-foreground whitespace-nowrap">{new Date(r.checked_at).toLocaleString("ar", { dateStyle: "short", timeStyle: "medium" })}</td>
                  <td className="px-4 py-2.5 text-xs font-medium">{r.project?.name_ar ?? "—"}</td>
                  <td className="px-4 py-2.5">{r.is_up ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <XCircle className="h-4 w-4 text-pink-400" />}</td>
                  <td className="px-4 py-2.5 text-xs"><span className={`rounded px-1.5 py-0.5 ${r.status_code && r.status_code < 400 ? "bg-emerald-500/10 text-emerald-400" : "bg-pink-500/10 text-pink-400"}`}>{r.status_code ?? "—"}</span></td>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground">{r.response_time_ms ? `${r.response_time_ms}ms` : "—"}</td>
                  <td className="px-4 py-2.5 text-xs text-pink-400/70 max-w-xs truncate">{r.error_message ?? ""}</td>
                </tr>
              ))}
              {rows.length === 0 && !loading && <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">لا توجد فحوصات. اضغط "فحص الآن".</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
function Stat({ icon: Icon, label, value, color }: { icon: typeof Activity; label: string; value: string | number; color: string }) {
  return (
    <div className="glass rounded-xl p-4">
      <Icon className={`h-5 w-5 ${color}`} />
      <div className="mt-2 font-display text-2xl font-bold neon-text">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}