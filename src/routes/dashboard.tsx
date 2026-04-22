import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  Activity, Layers, Zap, Globe, TrendingUp, Clock, CheckCircle2, XCircle,
  RefreshCw, Eye, ArrowUpRight, Settings, ExternalLink,
} from "lucide-react";
import { AdminGuard } from "@/components/nexus/AdminGuard";
import { supabase } from "@/integrations/supabase/client";
import { useProjects } from "@/hooks/use-projects";
import { checkAllProjects } from "@/server/check-projects";
import { getIcon, GLOW_MAP, type GlowKey } from "@/lib/icon-map";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "لوحة التحكم — نكسس" },
      { name: "description", content: "مركز قيادة متقدم: إحصائيات حية، حالة المواقع، وتتبع الزيارات." },
      { property: "og:title", content: "لوحة التحكم — نكسس" },
      { property: "og:description", content: "مركز قيادة موحد لكل مشاريعك." },
    ],
  }),
  component: () => (
    <AdminGuard>
      <DashboardInner />
    </AdminGuard>
  ),
});

type Stats = {
  total_projects: number;
  up_count: number;
  down_count: number;
  unchecked_count: number;
  total_visits: number;
  visits_today: number;
  visits_7d: number;
  avg_response_ms: number;
  last_check: string | null;
  top_visited: { id: string; name_ar: string; slug: string; visit_count: number; is_up: boolean | null; url: string }[];
  recent_checks: { id: string; checked_at: string; is_up: boolean; status_code: number | null; response_time_ms: number | null; name_ar: string; slug: string }[];
  visits_chart: { day: string; visits: number }[];
};

function DashboardInner() {
  const { projects } = useProjects();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const checkFn = useServerFn(checkAllProjects);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.rpc("get_dashboard_stats");
    if (!error && data) setStats(data as unknown as Stats);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const ch = supabase
      .channel("dash-rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "projects" }, () => load())
      .on("postgres_changes", { event: "*", schema: "public", table: "project_checks" }, () => load())
      .on("postgres_changes", { event: "*", schema: "public", table: "project_visits" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [load]);

  async function runCheck() {
    setBusy(true);
    setMsg("جارِ فحص كل المواقع...");
    try {
      const r = await checkFn();
      setMsg(`تم فحص ${r.checked} موقع بنجاح`);
      load();
    } catch (e) {
      setMsg(`خطأ: ${e instanceof Error ? e.message : "غير معروف"}`);
    }
    setBusy(false);
    setTimeout(() => setMsg(null), 3500);
  }

  const cards = [
    { icon: Layers, label: "إجمالي المشاريع", value: stats?.total_projects ?? 0, color: "violet" as GlowKey, sub: `${projects.length} في القاعدة` },
    { icon: CheckCircle2, label: "متصل الآن", value: stats?.up_count ?? 0, color: "cyan" as GlowKey, sub: `${stats?.down_count ?? 0} معطل` },
    { icon: Eye, label: "زيارات اليوم", value: stats?.visits_today ?? 0, color: "magenta" as GlowKey, sub: `${stats?.visits_7d ?? 0} هذا الأسبوع` },
    { icon: Zap, label: "متوسط الاستجابة", value: stats?.avg_response_ms ? `${stats.avg_response_ms}ms` : "—", color: "pink" as GlowKey, sub: stats?.last_check ? `آخر فحص: ${new Date(stats.last_check).toLocaleTimeString("ar")}` : "لم يُفحص بعد" },
  ];

  const maxVisit = Math.max(1, ...(stats?.visits_chart?.map((d) => d.visits) ?? [0]));

  return (
    <section className="relative mx-auto max-w-7xl px-6 pb-20 pt-32">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-bold sm:text-5xl">
            <span className="neon-text">لوحة التحكم</span>
          </h1>
          <p className="mt-2 text-muted-foreground">
            نظرة بانورامية حية على منظومتك الرقمية بأكملها.
            {loading && <span className="ml-2 inline-flex items-center gap-1 text-xs"><RefreshCw className="h-3 w-3 animate-spin" /> تحميل...</span>}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={runCheck}
            disabled={busy}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium hover:bg-white/10 disabled:opacity-50"
          >
            <Activity className={`h-4 w-4 ${busy ? "animate-pulse" : ""}`} /> فحص الكل
          </button>
          <button
            onClick={load}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> تحديث
          </button>
          <Link to="/admin/projects" className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[oklch(0.75_0.2_295)] to-[oklch(0.7_0.28_330)] px-4 py-2 text-sm font-medium text-background neon-glow">
            <Settings className="h-4 w-4" /> إدارة المشاريع
          </Link>
        </div>
      </div>

      {msg && <div className="glass mb-6 rounded-xl px-4 py-3 text-sm">{msg}</div>}

      {/* Stat cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((s) => (
          <div key={s.label} className="glass card-hover relative overflow-hidden rounded-2xl p-6">
            <div className={`absolute -top-10 -left-10 h-32 w-32 rounded-full bg-gradient-to-br ${GLOW_MAP[s.color]} opacity-20 blur-2xl`} />
            <s.icon className="h-6 w-6 text-[oklch(0.85_0.18_200)]" />
            <div className="mt-4 font-display text-4xl font-bold neon-text">{s.value}</div>
            <div className="mt-1 text-sm text-muted-foreground">{s.label}</div>
            <div className="mt-1 text-[11px] text-muted-foreground/60">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Visits chart */}
        <div className="glass rounded-2xl p-6 lg:col-span-2">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-[oklch(0.85_0.18_200)]" /> الزيارات (آخر 14 يوم)
            </h2>
            <span className="text-xs text-muted-foreground">إجمالي: {stats?.total_visits ?? 0}</span>
          </div>
          {stats?.visits_chart && stats.visits_chart.length > 0 ? (
            <div className="flex h-48 items-end gap-1.5">
              {stats.visits_chart.map((d) => (
                <div key={d.day} className="group relative flex flex-1 flex-col items-center justify-end">
                  <div className="absolute -top-7 hidden rounded bg-background/90 px-1.5 py-0.5 text-[10px] font-medium group-hover:block">{d.visits}</div>
                  <div
                    className="w-full rounded-t bg-gradient-to-t from-[oklch(0.65_0.25_290)] to-[oklch(0.85_0.18_200)] transition-all hover:opacity-80"
                    style={{ height: `${(d.visits / maxVisit) * 100}%`, minHeight: 2 }}
                  />
                  <div className="mt-1 text-[9px] text-muted-foreground/60">{d.day.slice(5)}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
              لا توجد زيارات مسجّلة بعد. ستظهر عند زيارة المشاريع.
            </div>
          )}
        </div>

        {/* Status donut */}
        <div className="glass rounded-2xl p-6">
          <h2 className="mb-5 font-display text-lg font-bold flex items-center gap-2">
            <Globe className="h-5 w-5 text-[oklch(0.85_0.18_200)]" /> حالة المواقع
          </h2>
          <StatusBars
            up={stats?.up_count ?? 0}
            down={stats?.down_count ?? 0}
            unchecked={stats?.unchecked_count ?? 0}
          />
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Top visited */}
        <div className="glass rounded-2xl p-6">
          <h2 className="mb-4 font-display text-lg font-bold flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-[oklch(0.85_0.18_200)]" /> الأكثر زيارة
          </h2>
          <div className="space-y-2">
            {(stats?.top_visited ?? []).map((p, i) => (
              <div key={p.id} className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/[0.02] p-3">
                <span className="font-display text-2xl font-bold text-muted-foreground/40 w-6">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <Link to="/projects/$slug" params={{ slug: p.slug }} className="block truncate text-sm font-semibold hover:text-[oklch(0.85_0.18_200)]">
                    {p.name_ar}
                  </Link>
                  <div className="text-xs text-muted-foreground">{p.visit_count} زيارة</div>
                </div>
                <span className={`h-2 w-2 rounded-full ${p.is_up ? "bg-emerald-400 animate-pulse" : p.is_up === false ? "bg-pink-400" : "bg-muted"}`} />
                {p.url !== "#" && (
                  <a href={p.url} target="_blank" rel="noopener noreferrer" className="rounded p-1 text-muted-foreground hover:bg-white/5 hover:text-foreground">
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            ))}
            {(!stats?.top_visited || stats.top_visited.length === 0) && (
              <div className="py-6 text-center text-sm text-muted-foreground">لا توجد بيانات زيارات بعد.</div>
            )}
          </div>
        </div>

        {/* Recent checks log */}
        <div className="glass rounded-2xl p-6">
          <h2 className="mb-4 font-display text-lg font-bold flex items-center gap-2">
            <Clock className="h-5 w-5 text-[oklch(0.85_0.18_200)]" /> سجل الفحوصات
          </h2>
          <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
            {(stats?.recent_checks ?? []).map((c) => (
              <div key={c.id} className="flex items-center gap-2 rounded-lg border border-white/5 bg-white/[0.02] p-2.5 text-xs">
                {c.is_up ? <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" /> : <XCircle className="h-4 w-4 text-pink-400 shrink-0" />}
                <Link to="/projects/$slug" params={{ slug: c.slug }} className="min-w-0 flex-1 truncate font-medium hover:text-[oklch(0.85_0.18_200)]">{c.name_ar}</Link>
                <span className="text-muted-foreground/70">{c.status_code ?? "—"}</span>
                <span className="text-muted-foreground/70">{c.response_time_ms ? `${c.response_time_ms}ms` : "—"}</span>
                <span className="text-muted-foreground/50">{new Date(c.checked_at).toLocaleTimeString("ar", { hour: "2-digit", minute: "2-digit" })}</span>
              </div>
            ))}
            {(!stats?.recent_checks || stats.recent_checks.length === 0) && (
              <div className="py-6 text-center text-sm text-muted-foreground">لا توجد فحوصات بعد. اضغط "فحص الكل".</div>
            )}
          </div>
        </div>
      </div>

      {/* Quick links to all projects */}
      <div className="glass mt-6 rounded-2xl p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">روابط سريعة</h2>
          <Link to="/admin/projects" className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1">إدارة <ArrowUpRight className="h-3 w-3" /></Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => {
            const Icon = getIcon(p.icon);
            const glow: GlowKey = (p.glow as GlowKey) in GLOW_MAP ? (p.glow as GlowKey) : "violet";
            return (
              <Link
                key={p.id}
                to="/projects/$slug"
                params={{ slug: p.slug }}
                className="group flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3 hover:border-[oklch(0.65_0.25_290)] hover:bg-white/5"
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${GLOW_MAP[glow]}`}>
                  <Icon className="h-5 w-5 text-background" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold">{p.name_ar}</div>
                  <div className="truncate text-xs text-muted-foreground">{p.category_label} · {p.visit_count} زيارة</div>
                </div>
                <span className={`h-2 w-2 rounded-full ${p.is_up ? "bg-emerald-400 animate-pulse" : p.is_up === false ? "bg-pink-400" : "bg-muted"}`} />
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function StatusBars({ up, down, unchecked }: { up: number; down: number; unchecked: number }) {
  const total = Math.max(1, up + down + unchecked);
  const rows = [
    { label: "متصل", value: up, color: "bg-emerald-400", text: "text-emerald-400" },
    { label: "معطل", value: down, color: "bg-pink-400", text: "text-pink-400" },
    { label: "غير مفحوص", value: unchecked, color: "bg-muted-foreground/40", text: "text-muted-foreground" },
  ];
  return (
    <div className="space-y-4">
      {rows.map((r) => (
        <div key={r.label}>
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className={r.text}>{r.label}</span>
            <span className="text-muted-foreground">{r.value} / {total}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/5">
            <div className={`h-full ${r.color} transition-all`} style={{ width: `${(r.value / total) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}