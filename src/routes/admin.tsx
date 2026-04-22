import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  Layers, CheckCircle2, XCircle, Eye, Zap, Clock, TrendingUp, Globe,
  RefreshCw, Activity, Settings, ExternalLink, AlertTriangle,
} from "lucide-react";
import { AdminGuard } from "@/components/nexus/AdminGuard";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { useProjects } from "@/hooks/use-projects";
import { checkAllProjects } from "@/server/check-projects";
import { GLOW_MAP, getIcon, type GlowKey } from "@/lib/icon-map";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "لوحة الإدارة — نكسس" },
      { name: "description", content: "مركز قيادة متقدم لإدارة كل مشاريعك مع إحصائيات حية وتتبع الحالة." },
    ],
  }),
  component: () => (
    <AdminGuard>
      <AdminOverview />
    </AdminGuard>
  ),
});

type Stats = {
  total_projects: number; up_count: number; down_count: number; unchecked_count: number;
  total_visits: number; visits_today: number; visits_7d: number; avg_response_ms: number;
  last_check: string | null;
  top_visited: { id: string; name_ar: string; slug: string; visit_count: number; is_up: boolean | null; url: string }[];
  recent_checks: { id: string; checked_at: string; is_up: boolean; status_code: number | null; response_time_ms: number | null; name_ar: string; slug: string }[];
  visits_chart: { day: string; visits: number }[];
};

function AdminOverview() {
  const { projects } = useProjects();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const checkFn = useServerFn(checkAllProjects);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.rpc("get_dashboard_stats");
    if (data) setStats(data as unknown as Stats);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const ch = supabase
      .channel("admin-rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "projects" }, () => load())
      .on("postgres_changes", { event: "*", schema: "public", table: "project_checks" }, () => load())
      .on("postgres_changes", { event: "*", schema: "public", table: "project_visits" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [load]);

  async function runCheck() {
    setBusy(true); setMsg("جارِ الفحص...");
    try { const r = await checkFn(); setMsg(`✓ تم فحص ${r.checked} موقع`); load(); }
    catch (e) { setMsg(`خطأ: ${e instanceof Error ? e.message : "?"}`); }
    setBusy(false);
    setTimeout(() => setMsg(null), 3500);
  }

  const downProjects = projects.filter((p) => p.is_up === false);
  const maxVisit = Math.max(1, ...(stats?.visits_chart?.map((d) => d.visits) ?? [0]));

  const cards = [
    { icon: Layers, label: "إجمالي المشاريع", value: stats?.total_projects ?? projects.length, color: "violet" as GlowKey, sub: "في القاعدة" },
    { icon: CheckCircle2, label: "متصل الآن", value: stats?.up_count ?? 0, color: "cyan" as GlowKey, sub: `${Math.round(((stats?.up_count ?? 0) / Math.max(1, projects.length)) * 100)}% Uptime` },
    { icon: XCircle, label: "معطل", value: stats?.down_count ?? 0, color: "pink" as GlowKey, sub: `${stats?.unchecked_count ?? 0} غير مفحوص` },
    { icon: Eye, label: "زيارات اليوم", value: stats?.visits_today ?? 0, color: "magenta" as GlowKey, sub: `${stats?.visits_7d ?? 0} هذا الأسبوع` },
    { icon: TrendingUp, label: "إجمالي الزيارات", value: stats?.total_visits ?? 0, color: "violet" as GlowKey, sub: "كل الوقت" },
    { icon: Zap, label: "متوسط الاستجابة", value: stats?.avg_response_ms ? `${stats.avg_response_ms}ms` : "—", color: "cyan" as GlowKey, sub: stats?.last_check ? `آخر فحص ${new Date(stats.last_check).toLocaleTimeString("ar", { hour: "2-digit", minute: "2-digit" })}` : "—" },
  ];

  return (
    <AdminLayout
      title="نظرة عامة"
      subtitle={`مرحباً بك في مركز التحكم. ${projects.length} مشروع تحت إدارتك.${loading ? " · تحميل..." : ""}`}
      actions={
        <>
          <button onClick={runCheck} disabled={busy} className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10 disabled:opacity-50">
            <Activity className={`h-4 w-4 ${busy ? "animate-pulse" : ""}`} /> فحص الكل
          </button>
          <button onClick={load} className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> تحديث
          </button>
          <Link to="/admin/projects" className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[oklch(0.75_0.2_295)] to-[oklch(0.7_0.28_330)] px-4 py-2 text-sm font-medium text-background neon-glow">
            <Settings className="h-4 w-4" /> إدارة
          </Link>
        </>
      }
    >
      {msg && <div className="glass mb-4 rounded-xl px-4 py-2.5 text-sm">{msg}</div>}

      {/* 6 stat cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {cards.map((s) => (
          <div key={s.label} className="glass relative overflow-hidden rounded-2xl p-4">
            <div className={`absolute -top-8 -left-8 h-24 w-24 rounded-full bg-gradient-to-br ${GLOW_MAP[s.color]} opacity-20 blur-2xl`} />
            <s.icon className="h-5 w-5 text-[oklch(0.85_0.18_200)]" />
            <div className="mt-3 font-display text-2xl font-bold neon-text">{s.value}</div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
            <div className="mt-0.5 text-[10px] text-muted-foreground/60">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <div className="glass rounded-2xl p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-base font-bold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-[oklch(0.85_0.18_200)]" /> الزيارات (آخر 14 يوم)
            </h2>
            <Link to="/admin/visits" className="text-[11px] text-muted-foreground hover:text-foreground">عرض التفاصيل ←</Link>
          </div>
          {stats?.visits_chart && stats.visits_chart.length > 0 ? (
            <div className="flex h-44 items-end gap-1.5">
              {stats.visits_chart.map((d) => (
                <div key={d.day} className="group relative flex flex-1 flex-col items-center justify-end">
                  <div className="absolute -top-6 hidden rounded bg-background/90 px-1.5 py-0.5 text-[10px] group-hover:block">{d.visits}</div>
                  <div className="w-full rounded-t bg-gradient-to-t from-[oklch(0.65_0.25_290)] to-[oklch(0.85_0.18_200)] hover:opacity-80" style={{ height: `${(d.visits / maxVisit) * 100}%`, minHeight: 2 }} />
                  <div className="mt-1 text-[9px] text-muted-foreground/60">{d.day.slice(5)}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-44 items-center justify-center text-xs text-muted-foreground">لا توجد زيارات بعد.</div>
          )}
        </div>

        <div className="glass rounded-2xl p-5">
          <h2 className="mb-4 font-display text-base font-bold flex items-center gap-2">
            <Globe className="h-4 w-4 text-[oklch(0.85_0.18_200)]" /> حالة المواقع
          </h2>
          <DonutChart up={stats?.up_count ?? 0} down={stats?.down_count ?? 0} unchecked={stats?.unchecked_count ?? 0} />
        </div>
      </div>

      {/* Alerts + Top + Recent */}
      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <div className="glass rounded-2xl p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-base font-bold flex items-center gap-2">
              <AlertTriangle className={`h-4 w-4 ${downProjects.length > 0 ? "text-pink-400" : "text-[oklch(0.85_0.18_200)]"}`} /> التنبيهات
            </h2>
            {downProjects.length > 0 && <span className="rounded-full bg-pink-500/20 px-2 py-0.5 text-[10px] font-bold text-pink-400">{downProjects.length}</span>}
          </div>
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {downProjects.map((p) => (
              <div key={p.id} className="flex items-center gap-2 rounded-lg border border-pink-500/20 bg-pink-500/5 p-2.5 text-xs">
                <XCircle className="h-4 w-4 text-pink-400 shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">{p.name_ar}</div>
                  <div className="text-[10px] text-muted-foreground">معطل · {p.last_status_code ?? "—"}</div>
                </div>
                {p.url !== "#" && <a href={p.url} target="_blank" rel="noopener noreferrer" className="rounded p-1 hover:bg-white/5"><ExternalLink className="h-3 w-3" /></a>}
              </div>
            ))}
            {downProjects.length === 0 && (
              <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4 text-center text-xs text-emerald-400">
                ✓ كل المواقع تعمل بشكل طبيعي
              </div>
            )}
          </div>
        </div>

        <div className="glass rounded-2xl p-5">
          <h2 className="mb-4 font-display text-base font-bold flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-[oklch(0.85_0.18_200)]" /> الأكثر زيارة
          </h2>
          <div className="space-y-2">
            {(stats?.top_visited ?? []).slice(0, 5).map((p, i) => (
              <div key={p.id} className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/[0.02] p-2.5 text-xs">
                <span className="font-display text-xl font-bold text-muted-foreground/40 w-5">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold">{p.name_ar}</div>
                  <div className="text-[10px] text-muted-foreground">{p.visit_count} زيارة</div>
                </div>
                <span className={`h-2 w-2 rounded-full ${p.is_up ? "bg-emerald-400 animate-pulse" : p.is_up === false ? "bg-pink-400" : "bg-muted"}`} />
              </div>
            ))}
            {(!stats?.top_visited || stats.top_visited.length === 0) && (
              <div className="py-4 text-center text-xs text-muted-foreground">لا توجد بيانات.</div>
            )}
          </div>
        </div>

        <div className="glass rounded-2xl p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-base font-bold flex items-center gap-2">
              <Clock className="h-4 w-4 text-[oklch(0.85_0.18_200)]" /> آخر الفحوصات
            </h2>
            <Link to="/admin/checks" className="text-[11px] text-muted-foreground hover:text-foreground">الكل ←</Link>
          </div>
          <div className="space-y-1.5 max-h-72 overflow-y-auto">
            {(stats?.recent_checks ?? []).slice(0, 8).map((c) => (
              <div key={c.id} className="flex items-center gap-2 rounded-lg border border-white/5 bg-white/[0.02] p-2 text-[11px]">
                {c.is_up ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" /> : <XCircle className="h-3.5 w-3.5 text-pink-400 shrink-0" />}
                <span className="min-w-0 flex-1 truncate">{c.name_ar}</span>
                <span className="text-muted-foreground/70">{c.response_time_ms ? `${c.response_time_ms}ms` : "—"}</span>
              </div>
            ))}
            {(!stats?.recent_checks || stats.recent_checks.length === 0) && (
              <div className="py-4 text-center text-xs text-muted-foreground">لا توجد فحوصات.</div>
            )}
          </div>
        </div>
      </div>

      {/* All projects grid */}
      <div className="glass mt-5 rounded-2xl p-5">
        <h2 className="mb-4 font-display text-base font-bold">كل المشاريع ({projects.length})</h2>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {projects.map((p) => {
            const Icon = getIcon(p.icon);
            const glow: GlowKey = (p.glow as GlowKey) in GLOW_MAP ? (p.glow as GlowKey) : "violet";
            return (
              <div key={p.id} className="group flex items-center gap-2.5 rounded-xl border border-white/5 bg-white/[0.02] p-2.5 hover:border-[oklch(0.65_0.25_290)]/50">
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ${GLOW_MAP[glow]} shrink-0`}>
                  <Icon className="h-4 w-4 text-background" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs font-semibold">{p.name_ar}</div>
                  <div className="truncate text-[10px] text-muted-foreground">{p.visit_count} زيارة · {p.last_response_time_ms ? `${p.last_response_time_ms}ms` : "—"}</div>
                </div>
                <span className={`h-2 w-2 rounded-full shrink-0 ${p.is_up ? "bg-emerald-400 animate-pulse" : p.is_up === false ? "bg-pink-400" : "bg-muted"}`} />
              </div>
            );
          })}
        </div>
      </div>
    </AdminLayout>
  );
}

function DonutChart({ up, down, unchecked }: { up: number; down: number; unchecked: number }) {
  const total = Math.max(1, up + down + unchecked);
  const upPct = (up / total) * 100;
  const downPct = (down / total) * 100;
  const uncheckedPct = (unchecked / total) * 100;
  const r = 60;
  const C = 2 * Math.PI * r;
  const upLen = (upPct / 100) * C;
  const downLen = (downPct / 100) * C;
  const unchLen = (uncheckedPct / 100) * C;
  return (
    <div className="flex items-center gap-4">
      <svg viewBox="0 0 160 160" className="h-36 w-36 -rotate-90">
        <circle cx="80" cy="80" r={r} fill="none" stroke="oklch(0.25 0.05 290 / 0.3)" strokeWidth="16" />
        {up > 0 && <circle cx="80" cy="80" r={r} fill="none" stroke="oklch(0.75 0.2 160)" strokeWidth="16" strokeDasharray={`${upLen} ${C}`} />}
        {down > 0 && <circle cx="80" cy="80" r={r} fill="none" stroke="oklch(0.7 0.25 0)" strokeWidth="16" strokeDasharray={`${downLen} ${C}`} strokeDashoffset={-upLen} />}
        {unchecked > 0 && <circle cx="80" cy="80" r={r} fill="none" stroke="oklch(0.5 0.05 290)" strokeWidth="16" strokeDasharray={`${unchLen} ${C}`} strokeDashoffset={-(upLen + downLen)} />}
      </svg>
      <div className="flex-1 space-y-2 text-xs">
        <Row color="bg-emerald-400" label="متصل" value={up} pct={upPct} />
        <Row color="bg-pink-400" label="معطل" value={down} pct={downPct} />
        <Row color="bg-muted-foreground/40" label="غير مفحوص" value={unchecked} pct={uncheckedPct} />
        <div className="mt-2 border-t border-white/5 pt-2 text-[11px] text-muted-foreground">
          نسبة التوفّر: <span className="font-bold neon-text">{upPct.toFixed(0)}%</span>
        </div>
      </div>
    </div>
  );
}
function Row({ color, label, value, pct }: { color: string; label: string; value: number; pct: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`h-2 w-2 rounded-full ${color}`} />
      <span className="flex-1">{label}</span>
      <span className="font-mono">{value}</span>
      <span className="text-muted-foreground/60 w-10 text-end">{pct.toFixed(0)}%</span>
    </div>
  );
}