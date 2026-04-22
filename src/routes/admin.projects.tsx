import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AdminGuard } from "@/components/nexus/AdminGuard";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useProjects, type ProjectRow } from "@/hooks/use-projects";
import { supabase } from "@/integrations/supabase/client";
import { checkAllProjects } from "@/server/check-projects";
import { getIcon, GLOW_MAP, type GlowKey } from "@/lib/icon-map";
import { Pencil, Trash2, Plus, RefreshCw, ExternalLink, Activity, X, Save, Search } from "lucide-react";

export const Route = createFileRoute("/admin/projects")({
  head: () => ({ meta: [{ title: "إدارة المشاريع — نكسس" }] }),
  component: () => (<AdminGuard><AdminProjectsPage /></AdminGuard>),
});

const empty: Partial<ProjectRow> = {
  slug: "", name: "", name_ar: "", url: "", category: "other",
  category_label: "أخرى", icon: "Sparkles", glow: "violet", status: "active", sort_order: 99,
};

function AdminProjectsPage() {
  const { projects, loading, refresh } = useProjects();
  const [editing, setEditing] = useState<Partial<ProjectRow> | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "up" | "down" | "unchecked">("all");
  const checkFn = useServerFn(checkAllProjects);

  const filtered = projects.filter((p) => {
    if (q && !`${p.name} ${p.name_ar} ${p.url}`.toLowerCase().includes(q.toLowerCase())) return false;
    if (filter === "up" && p.is_up !== true) return false;
    if (filter === "down" && p.is_up !== false) return false;
    if (filter === "unchecked" && p.is_up !== null) return false;
    return true;
  });

  async function save() {
    if (!editing) return;
    setBusy(true);
    const { id, created_at, updated_at, ...payload } = editing as ProjectRow;
    const { error } = id
      ? await supabase.from("projects").update(payload).eq("id", id)
      : await supabase.from("projects").insert(payload as ProjectRow);
    setMsg(error ? `خطأ: ${error.message}` : id ? "✓ حُفظ" : "✓ أُضيف");
    setBusy(false); setEditing(null); refresh();
    setTimeout(() => setMsg(null), 2500);
  }
  async function remove(id: string) {
    if (!confirm("حذف نهائي؟")) return;
    const { error } = await supabase.from("projects").delete().eq("id", id);
    setMsg(error ? `خطأ: ${error.message}` : "✓ حُذف"); refresh();
    setTimeout(() => setMsg(null), 2500);
  }
  async function runCheck() {
    setBusy(true); setMsg("جارِ الفحص...");
    try { const r = await checkFn(); setMsg(`✓ فُحص ${r.checked}`); refresh(); }
    catch (e) { setMsg(`خطأ: ${e instanceof Error ? e.message : "?"}`); }
    setBusy(false); setTimeout(() => setMsg(null), 3500);
  }

  return (
    <AdminLayout
      title="المشاريع"
      subtitle={`${filtered.length} من ${projects.length} مشروع`}
      actions={
        <>
          <button onClick={runCheck} disabled={busy} className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10 disabled:opacity-50">
            <Activity className="h-4 w-4" /> فحص
          </button>
          <button onClick={refresh} disabled={loading} className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> تحديث
          </button>
          <button onClick={() => setEditing({ ...empty })} className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[oklch(0.75_0.2_295)] to-[oklch(0.7_0.28_330)] px-4 py-2 text-sm font-medium text-background neon-glow">
            <Plus className="h-4 w-4" /> جديد
          </button>
        </>
      }
    >
      {msg && <div className="glass mb-4 rounded-xl px-4 py-2.5 text-sm">{msg}</div>}

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="بحث..." className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 pr-9 text-sm outline-none focus:border-[oklch(0.65_0.25_290)]" />
        </div>
        <div className="flex gap-1">
          {(["all", "up", "down", "unchecked"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`rounded-lg px-3 py-2 text-xs font-medium ${filter === f ? "bg-[oklch(0.65_0.25_290)]/20 text-foreground border border-[oklch(0.65_0.25_290)]/30" : "border border-white/10 bg-white/5 text-muted-foreground hover:text-foreground"}`}>
              {f === "all" ? "الكل" : f === "up" ? "متصل" : f === "down" ? "معطل" : "غير مفحوص"}
            </button>
          ))}
        </div>
      </div>

      <div className="glass overflow-hidden rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-white/10 bg-white/5 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-start">المشروع</th>
                <th className="px-4 py-3 text-start">الحالة</th>
                <th className="px-4 py-3 text-start">الفئة</th>
                <th className="px-4 py-3 text-start">زيارات</th>
                <th className="px-4 py-3 text-start">الاستجابة</th>
                <th className="px-4 py-3 text-start">آخر فحص</th>
                <th className="px-4 py-3 text-end">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const Icon = getIcon(p.icon);
                const glow: GlowKey = (p.glow as GlowKey) in GLOW_MAP ? (p.glow as GlowKey) : "violet";
                return (
                  <tr key={p.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ${GLOW_MAP[glow]}`}>
                          <Icon className="h-4 w-4 text-background" />
                        </div>
                        <div className="min-w-0">
                          <div className="truncate font-semibold">{p.name_ar}</div>
                          <div className="truncate text-xs text-muted-foreground">{p.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3"><StatusBadge isUp={p.is_up} status={p.status} /></td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{p.category_label}</td>
                    <td className="px-4 py-3 text-xs">{p.visit_count}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{p.last_response_time_ms ? `${p.last_response_time_ms}ms` : "—"}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{p.last_checked_at ? new Date(p.last_checked_at).toLocaleString("ar", { dateStyle: "short", timeStyle: "short" }) : "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {p.url !== "#" && <a href={p.url} target="_blank" rel="noopener noreferrer" className="rounded-md p-1.5 text-muted-foreground hover:bg-white/5 hover:text-foreground"><ExternalLink className="h-4 w-4" /></a>}
                        <button onClick={() => setEditing(p)} className="rounded-md p-1.5 text-muted-foreground hover:bg-white/5 hover:text-foreground"><Pencil className="h-4 w-4" /></button>
                        <button onClick={() => remove(p.id)} className="rounded-md p-1.5 text-muted-foreground hover:bg-pink-500/10 hover:text-pink-400"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && !loading && (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">لا توجد نتائج.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editing && <EditModal value={editing} onChange={setEditing} onClose={() => setEditing(null)} onSave={save} busy={busy} />}
    </AdminLayout>
  );
}

function StatusBadge({ isUp, status }: { isUp: boolean | null; status: string }) {
  if (status === "draft") return <span className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-muted-foreground">مسودة</span>;
  if (status === "maintenance") return <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-xs text-amber-400">صيانة</span>;
  if (isUp === true) return <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-400"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />متصل</span>;
  if (isUp === false) return <span className="inline-flex items-center gap-1 rounded-full bg-pink-500/10 px-2 py-0.5 text-xs text-pink-400"><span className="h-1.5 w-1.5 rounded-full bg-pink-400" />معطل</span>;
  return <span className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-muted-foreground">—</span>;
}

function EditModal({ value, onChange, onClose, onSave, busy }: { value: Partial<ProjectRow>; onChange: (v: Partial<ProjectRow>) => void; onClose: () => void; onSave: () => void; busy: boolean }) {
  const set = <K extends keyof ProjectRow>(k: K, v: ProjectRow[K]) => onChange({ ...value, [k]: v });
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="glass-strong relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl p-6" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 left-4 rounded-md p-1 text-muted-foreground hover:bg-white/5"><X className="h-4 w-4" /></button>
        <h2 className="mb-5 font-display text-xl font-bold">{value.id ? "تعديل" : "مشروع جديد"}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="الاسم بالعربية" value={value.name_ar ?? ""} onChange={(v) => set("name_ar", v)} />
          <Field label="الاسم بالإنجليزية" value={value.name ?? ""} onChange={(v) => set("name", v)} />
          <Field label="المعرّف (slug)" value={value.slug ?? ""} onChange={(v) => set("slug", v)} />
          <Field label="الرابط" value={value.url ?? ""} onChange={(v) => set("url", v)} />
          <Field label="الفئة (en)" value={value.category ?? ""} onChange={(v) => set("category", v)} />
          <Field label="الفئة (عربي)" value={value.category_label ?? ""} onChange={(v) => set("category_label", v)} />
          <Field label="الأيقونة" value={value.icon ?? ""} onChange={(v) => set("icon", v)} />
          <SelectField label="اللون" value={value.glow ?? "violet"} onChange={(v) => set("glow", v)} options={["violet", "cyan", "magenta", "pink"]} />
          <SelectField label="الحالة" value={value.status ?? "active"} onChange={(v) => set("status", v)} options={["active", "offline", "maintenance", "draft"]} />
          <Field label="ترتيب" type="number" value={String(value.sort_order ?? 99)} onChange={(v) => set("sort_order", Number(v))} />
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs text-muted-foreground">وصف</label>
            <textarea value={value.description_ar ?? ""} onChange={(e) => set("description_ar", e.target.value)} rows={3} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-[oklch(0.65_0.25_290)]" />
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10">إلغاء</button>
          <button onClick={onSave} disabled={busy} className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[oklch(0.75_0.2_295)] to-[oklch(0.7_0.28_330)] px-4 py-2 text-sm font-medium text-background neon-glow disabled:opacity-50">
            <Save className="h-4 w-4" /> حفظ
          </button>
        </div>
      </div>
    </div>
  );
}
function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (<div><label className="mb-1 block text-xs text-muted-foreground">{label}</label><input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-[oklch(0.65_0.25_290)]" /></div>);
}
function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (<div><label className="mb-1 block text-xs text-muted-foreground">{label}</label><select value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-[oklch(0.65_0.25_290)]">{options.map((o) => <option key={o} value={o} className="bg-background">{o}</option>)}</select></div>);
}