import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  LayoutGrid, Globe, ExternalLink, RefreshCw, Activity, CheckCircle2, XCircle,
  Settings2, DollarSign, FileCheck2, Search,
} from "lucide-react";
import { AdminGuard } from "@/components/nexus/AdminGuard";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { DomainManagerModal } from "@/components/admin/DomainManagerModal";
import { checkAllLovableProjects, pingLovableProject } from "@/lib/control-hub.functions";

export const Route = createFileRoute("/admin/control-hub")({
  head: () => ({
    meta: [
      { title: "Control Hub — HN-Dev" },
      { name: "description", content: "لوحة التحكم المركزية لكل مشاريع Lovable." },
    ],
  }),
  component: () => (<AdminGuard><ControlHub /></AdminGuard>),
});

type Domain = { domain: string; primary?: boolean; ssl_ok?: boolean };
type Row = {
  id: string;
  lovable_project_id: string;
  name: string;
  description: string | null;
  lovable_url: string | null;
  published_url: string | null;
  custom_domains: Domain[];
  category: string;
  adsense_installed: boolean;
  adstxt_installed: boolean;
  last_health_check: string | null;
  last_status_code: number | null;
  last_response_time_ms: number | null;
  is_up: boolean | null;
  sort_order: number;
};

const CATEGORY_COLORS: Record<string, string> = {
  ai: "from-purple-500/30 to-fuchsia-500/20",
  saas: "from-cyan-500/30 to-blue-500/20",
  store: "from-emerald-500/30 to-teal-500/20",
  business: "from-amber-500/30 to-orange-500/20",
  tool: "from-slate-500/30 to-zinc-500/20",
  portfolio: "from-pink-500/30 to-rose-500/20",
  chat: "from-indigo-500/30 to-violet-500/20",
  mobile: "from-lime-500/30 to-green-500/20",
  other: "from-white/10 to-white/5",
};

function ControlHub() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [filter, setFilter] = useState("");
  const [editing, setEditing] = useState<Row | null>(null);
  const checkAll = useServerFn(checkAllLovableProjects);
  const pingOne = useServerFn(pingLovableProject);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("lovable_projects").select("*").order("sort_order");
    setRows((data ?? []) as unknown as Row[]);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function runAll() {
    setBusy(true); setMsg("جارِ فحص كل المواقع...");
    try {
      const r = await checkAll();
      setMsg(`✓ تم فحص ${r.checked} مشروع`);
      await load();
    } catch (e) {
      setMsg(`خطأ: ${e instanceof Error ? e.message : "?"}`);
    }
    setBusy(false);
    setTimeout(() => setMsg(null), 3500);
  }

  async function pingRow(id: string) {
    try {
      await pingOne({ data: { id } });
      load();
    } catch { /* noop */ }
  }

  async function toggleFlag(id: string, field: "adsense_installed" | "adstxt_installed", value: boolean) {
    await supabase.from("lovable_projects").update({ [field]: value }).eq("id", id);
    setRows((prev) => prev.map((r) => r.id === id ? { ...r, [field]: value } : r));
  }

  const filtered = rows.filter((r) =>
    !filter || r.name.toLowerCase().includes(filter.toLowerCase()) ||
    r.lovable_project_id.includes(filter) ||
    r.custom_domains.some((d) => d.domain.includes(filter))
  );

  const stats = {
    total: rows.length,
    up: rows.filter((r) => r.is_up === true).length,
    down: rows.filter((r) => r.is_up === false).length,
    customs: rows.reduce((acc, r) => acc + r.custom_domains.length, 0),
    adsense: rows.filter((r) => r.adsense_installed).length,
    adstxt: rows.filter((r) => r.adstxt_installed).length,
  };

  return (
    <AdminLayout
      title="Control Hub"
      subtitle={`لوحة التحكم المركزية لـ ${rows.length} مشروع Lovable.${loading ? " · تحميل..." : ""}`}
      actions={
        <>
          <button onClick={runAll} disabled={busy} className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10 disabled:opacity-50">
            <Activity className={`h-4 w-4 ${busy ? "animate-pulse text-emerald-400" : ""}`} /> فحص الكل
          </button>
          <button onClick={load} className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> تحديث
          </button>
        </>
      }
    >
      {msg && <div className="glass mb-4 rounded-xl px-4 py-2.5 text-sm">{msg}</div>}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6 mb-5">
        {[
          { label: "إجمالي", value: stats.total, icon: LayoutGrid, c: "text-violet-300" },
          { label: "متصل", value: stats.up, icon: CheckCircle2, c: "text-emerald-400" },
          { label: "معطل", value: stats.down, icon: XCircle, c: "text-pink-400" },
          { label: "نطاقات مخصّصة", value: stats.customs, icon: Globe, c: "text-cyan-300" },
          { label: "AdSense", value: `${stats.adsense}/${stats.total}`, icon: DollarSign, c: "text-amber-300" },
          { label: "ads.txt", value: `${stats.adstxt}/${stats.total}`, icon: FileCheck2, c: "text-emerald-300" },
        ].map((s) => (
          <div key={s.label} className="glass rounded-2xl p-3.5">
            <s.icon className={`h-4 w-4 ${s.c}`} />
            <div className="mt-2 font-display text-xl font-bold neon-text">{s.value}</div>
            <div className="text-[11px] text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="glass mb-4 flex items-center gap-2 rounded-xl px-3 py-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="ابحث عن مشروع أو نطاق..."
          className="flex-1 bg-transparent text-sm focus:outline-none"
        />
      </div>

      {/* Grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {filtered.map((r) => {
          const primary = r.custom_domains.find((d) => d.primary)?.domain ?? r.custom_domains[0]?.domain;
          const liveUrl = primary
            ? (primary.startsWith("http") ? primary : `https://${primary}`)
            : r.published_url || r.lovable_url || "#";
          const statusColor = r.is_up === true ? "bg-emerald-400" : r.is_up === false ? "bg-pink-400" : "bg-muted-foreground/40";
          const gradient = CATEGORY_COLORS[r.category] ?? CATEGORY_COLORS.other;
          return (
            <div key={r.id} className="glass relative overflow-hidden rounded-2xl p-4 transition-colors hover:border-[oklch(0.65_0.25_290)]/40">
              <div className={`absolute -top-12 -left-12 h-32 w-32 rounded-full bg-gradient-to-br ${gradient} blur-2xl opacity-60 pointer-events-none`} />

              <div className="relative flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${statusColor} ${r.is_up ? "animate-pulse" : ""}`} />
                    <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{r.category}</span>
                  </div>
                  <h3 className="mt-1 truncate font-display text-base font-bold">{r.name}</h3>
                  {r.description && <p className="line-clamp-2 text-[11px] text-muted-foreground">{r.description}</p>}
                </div>
              </div>

              <div className="relative mt-3 space-y-1 text-[11px]">
                {r.lovable_url && (
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <span className="text-muted-foreground/60 shrink-0">L:</span>
                    <a href={r.lovable_url} target="_blank" rel="noopener noreferrer" className="truncate hover:text-foreground" dir="ltr">
                      {r.lovable_url.replace("https://", "")}
                    </a>
                  </div>
                )}
                {r.custom_domains.length > 0 && (
                  <div className="flex items-start gap-1.5">
                    <Globe className="h-3 w-3 mt-0.5 text-cyan-300 shrink-0" />
                    <div className="flex flex-wrap gap-1">
                      {r.custom_domains.map((d) => (
                        <span key={d.domain} className={`rounded px-1.5 py-0.5 text-[10px] font-mono ${d.primary ? "bg-cyan-500/20 text-cyan-200 border border-cyan-500/30" : "bg-white/5 text-muted-foreground"}`} dir="ltr">
                          {d.domain}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {r.last_status_code !== null && (
                  <div className="text-muted-foreground/70">
                    {r.last_status_code} · {r.last_response_time_ms ?? "—"}ms
                  </div>
                )}
              </div>

              <div className="relative mt-3 flex items-center gap-2 text-[10px]">
                <Toggle on={r.adsense_installed} onChange={(v) => toggleFlag(r.id, "adsense_installed", v)} icon={DollarSign} label="AdSense" />
                <Toggle on={r.adstxt_installed} onChange={(v) => toggleFlag(r.id, "adstxt_installed", v)} icon={FileCheck2} label="ads.txt" />
              </div>

              <div className="relative mt-3 flex items-center gap-1 border-t border-white/5 pt-3">
                <a href={liveUrl} target="_blank" rel="noopener noreferrer" className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-[11px] hover:bg-white/10">
                  <ExternalLink className="h-3 w-3" /> فتح
                </a>
                <button onClick={() => pingRow(r.id)} className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-[11px] hover:bg-white/10" title="فحص الحالة">
                  <Activity className="h-3 w-3" />
                </button>
                <button onClick={() => setEditing(r)} className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-[11px] hover:bg-white/10" title="إدارة النطاقات">
                  <Settings2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {editing && (
        <DomainManagerModal
          open={!!editing}
          onOpenChange={(o) => !o && setEditing(null)}
          projectId={editing.id}
          projectName={editing.name}
          lovableProjectId={editing.lovable_project_id}
          initialDomains={editing.custom_domains}
          onSaved={load}
        />
      )}
    </AdminLayout>
  );
}

function Toggle({ on, onChange, icon: Icon, label }: { on: boolean; onChange: (v: boolean) => void; icon: typeof DollarSign; label: string }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className={`flex flex-1 items-center justify-center gap-1 rounded-lg border px-2 py-1.5 transition-colors ${on ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300" : "border-white/10 bg-white/5 text-muted-foreground hover:text-foreground"}`}
    >
      <Icon className="h-3 w-3" />
      {label}
      {on && <span className="text-emerald-400">✓</span>}
    </button>
  );
}
