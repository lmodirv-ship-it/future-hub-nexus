import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import {
  Megaphone, Plus, RefreshCw, Copy, CheckCircle2, Archive, X, Save, Send,
  ListChecks, FolderKanban,
} from "lucide-react";
import { AdminGuard } from "@/components/nexus/AdminGuard";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/project-commands")({
  head: () => ({
    meta: [
      { title: "أوامر التطوير — HN-Dev" },
      { name: "description", content: "إصدار أوامر تطوير منظمة لكل مشاريعك من مكان واحد." },
    ],
  }),
  component: () => (<AdminGuard><CommandsPage /></AdminGuard>),
});

type Command = {
  id: string;
  title: string;
  body: string;
  scope: "all" | "selected";
  status: "draft" | "approved" | "in_progress" | "done" | "archived";
  created_at: string;
  updated_at: string;
};

type Target = {
  id: string;
  command_id: string;
  managed_site_id: string | null;
  lovable_project_id: string | null;
  label: string | null;
  status: "pending" | "sent" | "done" | "skipped";
  notes: string | null;
};

type SiteOption = { id: string; name: string; kind: "managed" | "lovable"; url: string | null };

const STATUS_LABEL: Record<Command["status"], string> = {
  draft: "مسودة",
  approved: "معتمد",
  in_progress: "قيد التنفيذ",
  done: "تم",
  archived: "مؤرشف",
};

const STATUS_COLOR: Record<Command["status"], string> = {
  draft: "bg-white/10 text-muted-foreground",
  approved: "bg-cyan-500/15 text-cyan-300",
  in_progress: "bg-amber-500/15 text-amber-300",
  done: "bg-emerald-500/15 text-emerald-300",
  archived: "bg-white/5 text-muted-foreground/60",
};

const TARGET_STATUS_LABEL: Record<Target["status"], string> = {
  pending: "بانتظار",
  sent: "أُرسل",
  done: "تم",
  skipped: "تخطّي",
};

function CommandsPage() {
  const [commands, setCommands] = useState<Command[]>([]);
  const [targets, setTargets] = useState<Record<string, Target[]>>({});
  const [sites, setSites] = useState<SiteOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Command> | null>(null);
  const [editingTargets, setEditingTargets] = useState<string[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(null), 3000); };

  const load = useCallback(async () => {
    setLoading(true);
    const [{ data: cmds }, { data: tgts }, { data: managed }, { data: lovs }] = await Promise.all([
      supabase.from("project_commands").select("*").order("created_at", { ascending: false }),
      supabase.from("project_command_targets").select("*"),
      supabase.from("managed_sites").select("id, name, domain").order("sort_order"),
      supabase.from("lovable_projects").select("id, name, published_url, lovable_url").order("sort_order"),
    ]);
    setCommands((cmds ?? []) as Command[]);
    const grouped: Record<string, Target[]> = {};
    for (const t of (tgts ?? []) as Target[]) {
      grouped[t.command_id] = grouped[t.command_id] || [];
      grouped[t.command_id].push(t);
    }
    setTargets(grouped);
    const opts: SiteOption[] = [];
    for (const s of managed ?? []) opts.push({ id: s.id as string, name: s.name as string, kind: "managed", url: (s.domain as string) ?? null });
    for (const l of lovs ?? []) opts.push({ id: l.id as string, name: l.name as string, kind: "lovable", url: (l.published_url as string) ?? (l.lovable_url as string) ?? null });
    setSites(opts);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  function openNew() {
    setEditing({ title: "", body: "", scope: "selected", status: "draft" });
    setEditingTargets([]);
  }

  function openEdit(c: Command) {
    setEditing(c);
    const ts = targets[c.id] ?? [];
    setEditingTargets(ts.map((t) => `${t.managed_site_id ? "m:" + t.managed_site_id : t.lovable_project_id ? "l:" + t.lovable_project_id : "x:" + (t.label ?? "")}`));
  }

  async function saveCommand() {
    if (!editing || !editing.title?.trim() || !editing.body?.trim()) {
      flash("العنوان والنص مطلوبان");
      return;
    }
    setBusy(true);
    const payload = {
      title: editing.title!.trim(),
      body: editing.body!.trim(),
      scope: editing.scope ?? "selected",
      status: editing.status ?? "draft",
    };
    let cmdId = editing.id;
    if (cmdId) {
      const { error } = await supabase.from("project_commands").update(payload).eq("id", cmdId);
      if (error) { flash("خطأ: " + error.message); setBusy(false); return; }
    } else {
      const { data, error } = await supabase.from("project_commands").insert(payload).select().single();
      if (error || !data) { flash("خطأ: " + (error?.message ?? "?")); setBusy(false); return; }
      cmdId = (data as { id: string }).id;
    }

    // Reset targets for this command
    if (cmdId) {
      await supabase.from("project_command_targets").delete().eq("command_id", cmdId);
      const scope = payload.scope;
      const finalKeys = scope === "all" ? sites.map((s) => `${s.kind === "managed" ? "m:" : "l:"}${s.id}`) : editingTargets;
      if (finalKeys.length > 0) {
        const rows = finalKeys.map((k) => {
          const [kind, id] = k.split(":");
          return {
            command_id: cmdId!,
            managed_site_id: kind === "m" ? id : null,
            lovable_project_id: kind === "l" ? id : null,
            label: kind === "x" ? id : null,
            status: "pending" as const,
          };
        });
        await supabase.from("project_command_targets").insert(rows);
      }
    }

    flash(editing.id ? "✓ حُفظ" : "✓ أُنشئ الأمر");
    setEditing(null);
    setBusy(false);
    load();
  }

  async function setStatus(c: Command, status: Command["status"]) {
    await supabase.from("project_commands").update({ status }).eq("id", c.id);
    flash("✓ حُدّثت الحالة");
    load();
  }

  async function setTargetStatus(t: Target, status: Target["status"]) {
    await supabase.from("project_command_targets").update({ status }).eq("id", t.id);
    load();
  }

  async function copyForTarget(c: Command, t: Target) {
    const site = sites.find((s) => (t.managed_site_id && s.kind === "managed" && s.id === t.managed_site_id) || (t.lovable_project_id && s.kind === "lovable" && s.id === t.lovable_project_id));
    const label = site?.name ?? t.label ?? "المشروع";
    const text = `# ${c.title}\n\nالمشروع المستهدف: ${label}\n\n${c.body}`;
    await navigator.clipboard.writeText(text);
    flash(`✓ نُسخ أمر "${label}"`);
    if (t.status === "pending") await setTargetStatus(t, "sent");
  }

  function toggleTarget(key: string) {
    setEditingTargets((prev) => prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]);
  }

  return (
    <AdminLayout
      title="أوامر التطوير"
      subtitle={`أصدر أوامر تطوير منظمة لمشاريعك. ${commands.length} أمر مسجّل.${loading ? " · تحميل..." : ""}`}
      actions={
        <>
          <button onClick={load} className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> تحديث
          </button>
          <button onClick={openNew} className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[oklch(0.75_0.2_295)] to-[oklch(0.7_0.28_330)] px-4 py-2 text-sm font-medium text-background neon-glow">
            <Plus className="h-4 w-4" /> أمر جديد
          </button>
        </>
      }
    >
      {msg && <div className="glass mb-4 rounded-xl px-4 py-2.5 text-sm">{msg}</div>}

      {commands.length === 0 && !loading && (
        <div className="glass rounded-2xl p-10 text-center">
          <Megaphone className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground mb-4">لم تُصدر أي أمر بعد. ابدأ بإنشاء أول أمر تطوير.</p>
          <button onClick={openNew} className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[oklch(0.75_0.2_295)] to-[oklch(0.7_0.28_330)] px-4 py-2 text-sm font-medium text-background neon-glow">
            <Plus className="h-4 w-4" /> أمر جديد
          </button>
        </div>
      )}

      <div className="space-y-3">
        {commands.map((c) => {
          const ts = targets[c.id] ?? [];
          const doneCount = ts.filter((t) => t.status === "done").length;
          return (
            <div key={c.id} className="glass rounded-2xl p-5">
              <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Megaphone className="h-4 w-4 text-[oklch(0.85_0.18_200)]" />
                    <h3 className="font-display text-base font-bold">{c.title}</h3>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_COLOR[c.status]}`}>{STATUS_LABEL[c.status]}</span>
                    <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-muted-foreground">
                      {c.scope === "all" ? "كل المشاريع" : `${ts.length} مشروع`}
                    </span>
                    {ts.length > 0 && (
                      <span className="text-[10px] text-muted-foreground">{doneCount}/{ts.length} منجز</span>
                    )}
                  </div>
                  <pre className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground/90 font-sans">{c.body}</pre>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <select
                    value={c.status}
                    onChange={(e) => setStatus(c, e.target.value as Command["status"])}
                    className="rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-xs"
                  >
                    {(Object.keys(STATUS_LABEL) as Command["status"][]).map((s) => (
                      <option key={s} value={s} className="bg-background">{STATUS_LABEL[s]}</option>
                    ))}
                  </select>
                  <button onClick={() => openEdit(c)} className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs hover:bg-white/10">تعديل</button>
                  <button
                    onClick={() => setStatus(c, c.status === "archived" ? "draft" : "archived")}
                    title={c.status === "archived" ? "إلغاء الأرشفة" : "أرشفة"}
                    className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs hover:bg-white/10"
                  >
                    <Archive className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {ts.length > 0 && (
                <div className="mt-3 grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
                  {ts.map((t) => {
                    const site = sites.find((s) => (t.managed_site_id && s.kind === "managed" && s.id === t.managed_site_id) || (t.lovable_project_id && s.kind === "lovable" && s.id === t.lovable_project_id));
                    const name = site?.name ?? t.label ?? "—";
                    const tColor = t.status === "done" ? "bg-emerald-500/15 text-emerald-300" : t.status === "sent" ? "bg-cyan-500/15 text-cyan-300" : t.status === "skipped" ? "bg-white/5 text-muted-foreground" : "bg-amber-500/15 text-amber-300";
                    return (
                      <div key={t.id} className="flex items-center gap-2 rounded-lg border border-white/5 bg-white/[0.02] p-2 text-xs">
                        <FolderKanban className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="min-w-0 flex-1 truncate">{name}</span>
                        <span className={`rounded px-1.5 py-0.5 text-[10px] ${tColor}`}>{TARGET_STATUS_LABEL[t.status]}</span>
                        <button onClick={() => copyForTarget(c, t)} title="نسخ الأمر" className="rounded p-1 hover:bg-white/10"><Copy className="h-3.5 w-3.5" /></button>
                        <button onClick={() => setTargetStatus(t, "done")} title="تم" className="rounded p-1 hover:bg-white/10"><CheckCircle2 className="h-3.5 w-3.5" /></button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {editing && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={() => setEditing(null)}>
          <div className="glass-strong relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl p-6" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setEditing(null)} className="absolute top-4 left-4 rounded-md p-1 text-muted-foreground hover:bg-white/5"><X className="h-4 w-4" /></button>
            <h2 className="mb-5 font-display text-xl font-bold flex items-center gap-2">
              <Send className="h-5 w-5 text-[oklch(0.85_0.18_200)]" />
              {editing.id ? "تعديل أمر" : "أمر جديد"}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">عنوان الأمر</label>
                <input
                  value={editing.title ?? ""}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                  placeholder="مثال: أضف زر واتساب لكل المشاريع"
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-[oklch(0.65_0.25_290)]"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">نص الأمر (تعليمات Lovable)</label>
                <textarea
                  value={editing.body ?? ""}
                  onChange={(e) => setEditing({ ...editing, body: e.target.value })}
                  rows={8}
                  placeholder="اكتب التعليمات بالتفصيل كما لو كنت ترسلها لـ Lovable..."
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-[oklch(0.65_0.25_290)] font-mono"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">النطاق</label>
                  <select
                    value={editing.scope ?? "selected"}
                    onChange={(e) => setEditing({ ...editing, scope: e.target.value as Command["scope"] })}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
                  >
                    <option value="selected" className="bg-background">مشاريع محددة</option>
                    <option value="all" className="bg-background">كل المشاريع</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">الحالة</label>
                  <select
                    value={editing.status ?? "draft"}
                    onChange={(e) => setEditing({ ...editing, status: e.target.value as Command["status"] })}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
                  >
                    {(Object.keys(STATUS_LABEL) as Command["status"][]).map((s) => (
                      <option key={s} value={s} className="bg-background">{STATUS_LABEL[s]}</option>
                    ))}
                  </select>
                </div>
              </div>

              {editing.scope !== "all" && (
                <div>
                  <label className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <ListChecks className="h-3.5 w-3.5" />
                    اختر المشاريع المستهدفة ({editingTargets.length} محدد)
                  </label>
                  <div className="max-h-64 overflow-y-auto rounded-lg border border-white/10 bg-white/[0.02] p-2">
                    {sites.length === 0 && (
                      <p className="p-3 text-center text-xs text-muted-foreground">لا توجد مشاريع. أضف مواقع من مركز التحكم أو Control Hub أولاً.</p>
                    )}
                    {sites.map((s) => {
                      const key = `${s.kind === "managed" ? "m:" : "l:"}${s.id}`;
                      const checked = editingTargets.includes(key);
                      return (
                        <label key={key} className={`flex cursor-pointer items-center gap-2 rounded-md p-2 text-sm hover:bg-white/5 ${checked ? "bg-[oklch(0.65_0.25_290)]/10" : ""}`}>
                          <input type="checkbox" checked={checked} onChange={() => toggleTarget(key)} className="h-3.5 w-3.5" />
                          <span className="flex-1 truncate">{s.name}</span>
                          <span className="text-[10px] text-muted-foreground">{s.kind === "managed" ? "موقع" : "Lovable"}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setEditing(null)} className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10">إلغاء</button>
              <button onClick={saveCommand} disabled={busy} className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[oklch(0.75_0.2_295)] to-[oklch(0.7_0.28_330)] px-4 py-2 text-sm font-medium text-background neon-glow disabled:opacity-50">
                <Save className="h-4 w-4" /> حفظ
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}