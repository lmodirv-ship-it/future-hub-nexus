import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { BarChart3, Loader2 } from "lucide-react";

type Row = { lovable_project_id: string; total: number; today: number };

export const Route = createFileRoute("/admin/analytics-hub")({
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/login" });
  },
  component: AnalyticsHub,
});

function AnalyticsHub() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [names, setNames] = useState<Record<string, string>>({});

  useEffect(() => {
    (async () => {
      const today = new Date().toISOString().slice(0, 10);
      const [{ data: visits }, { data: projects }] = await Promise.all([
        supabase.from("cross_project_visits").select("lovable_project_id, count, visit_date"),
        supabase.from("lovable_projects").select("lovable_project_id, name"),
      ]);
      const map: Record<string, Row> = {};
      (visits ?? []).forEach((v) => {
        const k = v.lovable_project_id;
        map[k] ??= { lovable_project_id: k, total: 0, today: 0 };
        map[k].total += v.count;
        if (v.visit_date === today) map[k].today += v.count;
      });
      setRows(Object.values(map).sort((a, b) => b.total - a.total));
      const n: Record<string, string> = {};
      (projects ?? []).forEach((p) => { n[p.lovable_project_id] = p.name; });
      setNames(n);
      setLoading(false);
    })();
  }, []);

  const totalAll = rows.reduce((a, r) => a + r.total, 0);
  const todayAll = rows.reduce((a, r) => a + r.today, 0);

  return (
    <AdminLayout
      title="Analytics Hub"
      subtitle="إحصائيات زيارات موحّدة لكل المشاريع الـ20. يستقبل البيانات عبر POST /api/public/analytics/track."
    >
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <div className="glass rounded-xl p-4"><div className="text-xs text-muted-foreground">إجمالي الزيارات</div><div className="mt-1 font-display text-2xl font-bold neon-text">{totalAll.toLocaleString()}</div></div>
        <div className="glass rounded-xl p-4"><div className="text-xs text-muted-foreground">اليوم</div><div className="mt-1 font-display text-2xl font-bold text-emerald-400">{todayAll.toLocaleString()}</div></div>
        <div className="glass rounded-xl p-4"><div className="text-xs text-muted-foreground">المشاريع النشطة</div><div className="mt-1 font-display text-2xl font-bold">{rows.length}</div></div>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> تحميل...</div>
      ) : rows.length === 0 ? (
        <div className="glass rounded-xl p-8 text-center text-muted-foreground">
          <BarChart3 className="mx-auto mb-3 h-10 w-10 opacity-50" />
          لا توجد بيانات بعد. أضف هذا السكربت في كل مشروع لإرسال الزيارات:
          <pre className="mt-4 mx-auto max-w-2xl rounded-lg bg-black/40 p-3 text-left text-[11px]" dir="ltr">{`fetch('https://future-hub-nexus.lovable.app/api/public/analytics/track', {
  method: 'POST',
  headers: {'Content-Type':'application/json'},
  body: JSON.stringify({
    project_id: '<your-lovable-project-id>',
    path: location.pathname,
    referrer: document.referrer
  })
}).catch(()=>{});`}</pre>
        </div>
      ) : (
        <div className="glass overflow-x-auto rounded-xl">
          <table className="w-full text-sm">
            <thead className="bg-white/5 text-xs text-muted-foreground"><tr><th className="px-4 py-3 text-right">المشروع</th><th className="px-4 py-3 text-left">إجمالي</th><th className="px-4 py-3 text-left">اليوم</th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.lovable_project_id} className="border-t border-white/5">
                  <td className="px-4 py-3 font-medium">{names[r.lovable_project_id] ?? r.lovable_project_id}</td>
                  <td className="px-4 py-3 text-left tabular-nums">{r.total.toLocaleString()}</td>
                  <td className="px-4 py-3 text-left tabular-nums text-emerald-400">{r.today.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}