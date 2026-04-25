import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { Eye, RefreshCw, TrendingUp } from "lucide-react";
import { AdminGuard } from "@/components/nexus/AdminGuard";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { useProjects } from "@/hooks/use-projects";

export const Route = createFileRoute("/admin/visits")({
  head: () => ({ meta: [{ title: "الزيارات — HN-Dev" }] }),
  component: () => (<AdminGuard><Page /></AdminGuard>),
});

type VisitRow = { id: string; visit_date: string; count: number; project: { name_ar: string; slug: string } | null };

function Page() {
  const { projects } = useProjects();
  const [rows, setRows] = useState<VisitRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("project_visits")
      .select("id, visit_date, count, project:projects(name_ar, slug)")
      .order("visit_date", { ascending: false })
      .limit(300);
    setRows((data as unknown as VisitRow[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const ch = supabase.channel("visits-rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "project_visits" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [load]);

  // Aggregate per day
  const byDay = new Map<string, number>();
  rows.forEach(r => byDay.set(r.visit_date, (byDay.get(r.visit_date) ?? 0) + r.count));
  const days = [...byDay.entries()].sort((a, b) => a[0].localeCompare(b[0])).slice(-30);
  const max = Math.max(1, ...days.map(([, v]) => v));

  const total = projects.reduce((a, p) => a + p.visit_count, 0);
  const today = byDay.get(new Date().toISOString().slice(0, 10)) ?? 0;

  const sortedProjects = [...projects].sort((a, b) => b.visit_count - a.visit_count);

  return (
    <AdminLayout
      title="الزيارات"
      subtitle={`${total} زيارة إجمالية · ${today} اليوم`}
      actions={<button onClick={load} className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"><RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> تحديث</button>}
    >
      <div className="glass mb-5 rounded-2xl p-5">
        <h2 className="mb-4 flex items-center gap-2 font-display text-base font-bold"><TrendingUp className="h-4 w-4 text-[oklch(0.85_0.18_200)]" /> الزيارات اليومية (آخر 30 يوم)</h2>
        {days.length > 0 ? (
          <div className="flex h-56 items-end gap-1">
            {days.map(([day, v]) => (
              <div key={day} className="group relative flex flex-1 flex-col items-center justify-end">
                <div className="absolute -top-6 hidden rounded bg-background/90 px-1.5 py-0.5 text-[10px] group-hover:block">{v}</div>
                <div className="w-full rounded-t bg-gradient-to-t from-[oklch(0.65_0.25_290)] to-[oklch(0.85_0.18_200)] hover:opacity-80" style={{ height: `${(v / max) * 100}%`, minHeight: 2 }} />
                <div className="mt-1 text-[8px] text-muted-foreground/60 rotate-45 origin-top-left">{day.slice(5)}</div>
              </div>
            ))}
          </div>
        ) : <div className="flex h-56 items-center justify-center text-sm text-muted-foreground">لا توجد زيارات بعد.</div>}
      </div>

      <div className="glass overflow-hidden rounded-2xl">
        <div className="border-b border-white/10 px-5 py-3 text-sm font-bold flex items-center gap-2"><Eye className="h-4 w-4" /> ترتيب المشاريع</div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-white/5 text-xs uppercase text-muted-foreground"><tr>
              <th className="px-4 py-2.5 text-start">#</th>
              <th className="px-4 py-2.5 text-start">المشروع</th>
              <th className="px-4 py-2.5 text-start">الزيارات</th>
              <th className="px-4 py-2.5 text-start">النسبة</th>
            </tr></thead>
            <tbody>
              {sortedProjects.map((p, i) => {
                const pct = total > 0 ? (p.visit_count / total) * 100 : 0;
                return (
                  <tr key={p.id} className="border-b border-white/5">
                    <td className="px-4 py-2.5 text-muted-foreground">{i + 1}</td>
                    <td className="px-4 py-2.5 font-medium">{p.name_ar}</td>
                    <td className="px-4 py-2.5 font-mono">{p.visit_count}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-32 overflow-hidden rounded-full bg-white/5"><div className="h-full bg-gradient-to-r from-[oklch(0.65_0.25_290)] to-[oklch(0.85_0.18_200)]" style={{ width: `${pct}%` }} /></div>
                        <span className="text-xs text-muted-foreground">{pct.toFixed(1)}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}