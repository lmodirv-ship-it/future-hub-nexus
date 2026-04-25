import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  Users, Shield, ShieldOff, Trash2, Bell, BellOff, CheckCheck, Mail,
  Briefcase, CreditCard, Package, RefreshCw, AlertCircle, Crown,
  ChevronRight, ChevronLeft,
} from "lucide-react";
import { AdminGuard } from "@/components/nexus/AdminGuard";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { listUsers, setUserRole, deleteUser, bulkAlerts } from "@/server/admin-actions";

export const Route = createFileRoute("/admin/manage")({
  head: () => ({
    meta: [
      { title: "الإدارة الشاملة — HN-Dev" },
      { name: "description", content: "مركز إدارة موحد: المستخدمون والأدوار والاشتراكات وطلبات الخدمة." },
    ],
  }),
  component: () => (
    <AdminGuard>
      <ManagePage />
    </AdminGuard>
  ),
});

type Tab = "users" | "requests" | "subscriptions" | "alerts" | "templates";

function ManagePage() {
  const [tab, setTab] = useState<Tab>("users");
  const [msg, setMsg] = useState<string | null>(null);

  function flash(m: string) {
    setMsg(m);
    setTimeout(() => setMsg(null), 3000);
  }

  const tabs: { id: Tab; label: string; icon: typeof Users }[] = [
    { id: "users", label: "المستخدمون", icon: Users },
    { id: "requests", label: "طلبات الخدمة", icon: Briefcase },
    { id: "subscriptions", label: "الاشتراكات", icon: CreditCard },
    { id: "alerts", label: "التنبيهات (جماعي)", icon: Bell },
    { id: "templates", label: "القوالب", icon: Package },
  ];

  return (
    <AdminLayout
      title="الإدارة الشاملة"
      subtitle="مركز موحد لإدارة كل جوانب المنصة"
    >
      {msg && (
        <div className="glass mb-4 rounded-xl px-4 py-2.5 text-sm flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-[oklch(0.85_0.18_200)]" /> {msg}
        </div>
      )}

      <div className="mb-5 flex flex-wrap gap-2">
        {tabs.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
                active
                  ? "border-[oklch(0.65_0.25_290)]/50 bg-gradient-to-r from-[oklch(0.65_0.25_290)]/20 to-[oklch(0.7_0.28_330)]/10 text-foreground"
                  : "border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground"
              }`}
            >
              <t.icon className="h-4 w-4" /> {t.label}
            </button>
          );
        })}
      </div>

      {tab === "users" && <UsersPanel onMessage={flash} />}
      {tab === "requests" && <RequestsPanel onMessage={flash} />}
      {tab === "subscriptions" && <SubscriptionsPanel />}
      {tab === "alerts" && <AlertsBulkPanel onMessage={flash} />}
      {tab === "templates" && <TemplatesPanel onMessage={flash} />}
    </AdminLayout>
  );
}

/* =================== Users panel =================== */
type UserRow = {
  id: string; email: string; created_at: string;
  last_sign_in_at: string | null; roles: string[];
};

function UsersPanel({ onMessage }: { onMessage: (m: string) => void }) {
  const { user: me } = useAuth();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage] = useState(20);
  const [total, setTotal] = useState(0);
  const listFn = useServerFn(listUsers);
  const setRoleFn = useServerFn(setUserRole);
  const delFn = useServerFn(deleteUser);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await listFn({ data: { page, perPage } });
      setUsers(r.users);
      setTotal(r.total);
    } catch (e) {
      onMessage(`خطأ: ${e instanceof Error ? e.message : "فشل التحميل"}`);
    } finally {
      setLoading(false);
    }
  }, [listFn, onMessage, page, perPage]);

  useEffect(() => { load(); }, [load]);

  async function toggleRole(u: UserRow, role: "admin" | "viewer", has: boolean) {
    setBusy(u.id);
    try {
      await setRoleFn({ data: { user_id: u.id, role, action: has ? "remove" : "add" } });
      onMessage(`✓ ${has ? "أُزيلت" : "أُضيفت"} صلاحية ${role}`);
      load();
    } catch (e) {
      onMessage(`خطأ: ${e instanceof Error ? e.message : "فشل"}`);
    } finally {
      setBusy(null);
    }
  }

  async function removeUser(u: UserRow) {
    if (!confirm(`حذف نهائي للمستخدم ${u.email}؟`)) return;
    setBusy(u.id);
    try {
      await delFn({ data: { user_id: u.id } });
      onMessage("✓ حُذف المستخدم");
      load();
    } catch (e) {
      onMessage(`خطأ: ${e instanceof Error ? e.message : "فشل"}`);
    } finally {
      setBusy(null);
    }
  }

  const filtered = users.filter((u) => u.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="glass rounded-2xl p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-base font-bold flex items-center gap-2">
          <Users className="h-4 w-4 text-[oklch(0.85_0.18_200)]" />
          المستخدمون ({total})
        </h2>
        <div className="flex gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث بالبريد..."
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[oklch(0.65_0.25_290)]"
          />
          <button onClick={load} className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm hover:bg-white/10">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> تحديث
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-right text-[11px] uppercase text-muted-foreground">
              <th className="py-2 px-2 font-medium">البريد</th>
              <th className="py-2 px-2 font-medium">الأدوار</th>
              <th className="py-2 px-2 font-medium">آخر دخول</th>
              <th className="py-2 px-2 font-medium">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => {
              const isAdmin = u.roles.includes("admin");
              const isViewer = u.roles.includes("viewer");
              const isMe = me?.id === u.id;
              return (
                <tr key={u.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="py-2.5 px-2">
                    <div className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="font-medium">{u.email}</span>
                      {isMe && <span className="rounded bg-[oklch(0.65_0.25_290)]/20 px-1.5 py-0.5 text-[10px] text-[oklch(0.85_0.18_200)]">أنت</span>}
                    </div>
                  </td>
                  <td className="py-2.5 px-2">
                    <div className="flex flex-wrap gap-1">
                      {isAdmin && <span className="flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-300"><Crown className="h-3 w-3" />admin</span>}
                      {isViewer && <span className="rounded-full bg-cyan-500/15 px-2 py-0.5 text-[10px] text-cyan-300">viewer</span>}
                      {!isAdmin && !isViewer && <span className="text-[10px] text-muted-foreground">—</span>}
                    </div>
                  </td>
                  <td className="py-2.5 px-2 text-[11px] text-muted-foreground">
                    {u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleString("ar") : "أبداً"}
                  </td>
                  <td className="py-2.5 px-2">
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        onClick={() => toggleRole(u, "admin", isAdmin)}
                        disabled={busy === u.id || (isAdmin && isMe)}
                        title={isAdmin ? "إزالة admin" : "تعيين admin"}
                        className={`rounded p-1.5 transition-colors disabled:opacity-30 ${
                          isAdmin ? "bg-amber-500/15 text-amber-300 hover:bg-amber-500/25" : "bg-white/5 text-muted-foreground hover:bg-white/10"
                        }`}
                      >
                        {isAdmin ? <ShieldOff className="h-3.5 w-3.5" /> : <Shield className="h-3.5 w-3.5" />}
                      </button>
                      <button
                        onClick={() => toggleRole(u, "viewer", isViewer)}
                        disabled={busy === u.id}
                        title={isViewer ? "إزالة viewer" : "تعيين viewer"}
                        className={`rounded p-1.5 transition-colors disabled:opacity-30 ${
                          isViewer ? "bg-cyan-500/15 text-cyan-300 hover:bg-cyan-500/25" : "bg-white/5 text-muted-foreground hover:bg-white/10"
                        }`}
                      >
                        {isViewer ? <BellOff className="h-3.5 w-3.5" /> : <Bell className="h-3.5 w-3.5" />}
                      </button>
                      <button
                        onClick={() => removeUser(u)}
                        disabled={busy === u.id || isMe}
                        title="حذف نهائي"
                        className="rounded bg-pink-500/10 p-1.5 text-pink-400 transition-colors hover:bg-pink-500/20 disabled:opacity-30"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && !loading && (
              <tr><td colSpan={4} className="py-8 text-center text-sm text-muted-foreground">لا يوجد مستخدمون.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <Pagination page={page} perPage={perPage} total={total} onChange={setPage} />
    </div>
  );
}

/* =================== Service requests panel =================== */
type ReqRow = {
  id: string; name: string; email: string; phone: string | null;
  service_type: string; budget_range: string | null; message: string;
  status: string; admin_notes: string | null; created_at: string;
};

const STATUSES = ["new", "contacted", "in_progress", "won", "lost"];

function RequestsPanel({ onMessage }: { onMessage: (m: string) => void }) {
  const [rows, setRows] = useState<ReqRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [total, setTotal] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;
    const { data, error, count } = await supabase
      .from("service_requests")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);
    if (!error && data) setRows(data as ReqRow[]);
    setTotal(count ?? 0);
    setLoading(false);
  }, [page, perPage]);

  useEffect(() => { load(); }, [load]);

  async function updateStatus(id: string, status: string) {
    const { error } = await supabase.from("service_requests").update({ status }).eq("id", id);
    if (error) onMessage(`خطأ: ${error.message}`);
    else { onMessage("✓ تم التحديث"); load(); }
  }

  async function remove(id: string) {
    if (!confirm("حذف الطلب؟")) return;
    const { error } = await supabase.from("service_requests").delete().eq("id", id);
    if (error) onMessage(`خطأ: ${error.message}`);
    else { onMessage("✓ حُذف"); load(); }
  }

  return (
    <div className="glass rounded-2xl p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-base font-bold flex items-center gap-2">
          <Briefcase className="h-4 w-4 text-[oklch(0.85_0.18_200)]" />
          طلبات الخدمة ({total})
        </h2>
        <button onClick={load} className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm hover:bg-white/10">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> تحديث
        </button>
      </div>
      <div className="space-y-2">
        {rows.map((r) => (
          <div key={r.id} className="rounded-xl border border-white/10 bg-white/[0.02] p-3 text-sm">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="font-semibold">{r.name} <span className="text-muted-foreground font-normal">· {r.email}</span></div>
                <div className="text-[11px] text-muted-foreground">
                  {r.service_type} {r.budget_range ? `· ${r.budget_range}` : ""} · {new Date(r.created_at).toLocaleDateString("ar")}
                </div>
              </div>
              <div className="flex gap-1.5">
                <select
                  value={r.status}
                  onChange={(e) => updateStatus(r.id, e.target.value)}
                  className="rounded border border-white/10 bg-white/5 px-2 py-1 text-xs"
                >
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <button onClick={() => remove(r.id)} className="rounded bg-pink-500/10 p-1.5 text-pink-400 hover:bg-pink-500/20">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <div className="text-xs text-muted-foreground whitespace-pre-wrap">{r.message}</div>
          </div>
        ))}
        {rows.length === 0 && !loading && (
          <div className="py-8 text-center text-sm text-muted-foreground">لا توجد طلبات.</div>
        )}
      </div>
      <Pagination page={page} perPage={perPage} total={total} onChange={setPage} />
    </div>
  );
}

/* =================== Subscriptions panel =================== */
type SubRow = {
  id: string; user_id: string; status: string; created_at: string;
  current_period_end: string | null; cancel_at_period_end: boolean;
  plans: { name_ar: string; slug: string } | null;
};

function SubscriptionsPanel() {
  const [rows, setRows] = useState<SubRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [perPage] = useState(20);
  const [total, setTotal] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;
    const { data, count } = await supabase
      .from("subscriptions")
      .select(
        "id, user_id, status, created_at, current_period_end, cancel_at_period_end, plans(name_ar, slug)",
        { count: "exact" },
      )
      .order("created_at", { ascending: false })
      .range(from, to);
    if (data) setRows(data as unknown as SubRow[]);
    setTotal(count ?? 0);
    setLoading(false);
  }, [page, perPage]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="glass rounded-2xl p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-base font-bold flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-[oklch(0.85_0.18_200)]" />
          الاشتراكات ({total})
        </h2>
        <button onClick={load} className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm hover:bg-white/10">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> تحديث
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-right text-[11px] uppercase text-muted-foreground">
              <th className="py-2 px-2 font-medium">المستخدم</th>
              <th className="py-2 px-2 font-medium">الخطة</th>
              <th className="py-2 px-2 font-medium">الحالة</th>
              <th className="py-2 px-2 font-medium">انتهاء الفترة</th>
              <th className="py-2 px-2 font-medium">إلغاء آخر فترة</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => (
              <tr key={s.id} className="border-b border-white/5">
                <td className="py-2.5 px-2 font-mono text-[10px]">{s.user_id.slice(0, 8)}…</td>
                <td className="py-2.5 px-2">{s.plans?.name_ar ?? "—"}</td>
                <td className="py-2.5 px-2">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] ${
                    s.status === "active" ? "bg-emerald-500/15 text-emerald-300" : "bg-muted/30 text-muted-foreground"
                  }`}>{s.status}</span>
                </td>
                <td className="py-2.5 px-2 text-[11px] text-muted-foreground">
                  {s.current_period_end ? new Date(s.current_period_end).toLocaleDateString("ar") : "—"}
                </td>
                <td className="py-2.5 px-2 text-[11px]">{s.cancel_at_period_end ? "نعم" : "لا"}</td>
              </tr>
            ))}
            {rows.length === 0 && !loading && (
              <tr><td colSpan={5} className="py-8 text-center text-sm text-muted-foreground">لا توجد اشتراكات.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <Pagination page={page} perPage={perPage} total={total} onChange={setPage} />
    </div>
  );
}

/* =================== Pagination control =================== */
function Pagination({
  page,
  perPage,
  total,
  onChange,
}: {
  page: number;
  perPage: number;
  total: number;
  onChange: (p: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  if (total <= perPage) return null;
  const from = (page - 1) * perPage + 1;
  const to = Math.min(page * perPage, total);
  return (
    <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3 text-xs text-muted-foreground">
      <div>عرض {from}–{to} من {total}</div>
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onChange(Math.max(1, page - 1))}
          disabled={page <= 1}
          className="rounded border border-white/10 bg-white/5 p-1.5 hover:bg-white/10 disabled:opacity-30"
          aria-label="السابق"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
        <span className="px-2 font-mono">{page} / {totalPages}</span>
        <button
          onClick={() => onChange(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages}
          className="rounded border border-white/10 bg-white/5 p-1.5 hover:bg-white/10 disabled:opacity-30"
          aria-label="التالي"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

/* =================== Bulk alerts panel =================== */
function AlertsBulkPanel({ onMessage }: { onMessage: (m: string) => void }) {
  const [busy, setBusy] = useState<string | null>(null);
  const [counts, setCounts] = useState({ total: 0, unread: 0, read: 0 });
  const bulkFn = useServerFn(bulkAlerts);

  const load = useCallback(async () => {
    const [{ count: total }, { count: unread }] = await Promise.all([
      supabase.from("alerts").select("*", { count: "exact", head: true }),
      supabase.from("alerts").select("*", { count: "exact", head: true }).eq("is_read", false),
    ]);
    setCounts({ total: total ?? 0, unread: unread ?? 0, read: (total ?? 0) - (unread ?? 0) });
  }, []);

  useEffect(() => { load(); }, [load]);

  async function run(action: "mark_read" | "delete_read" | "delete_all") {
    if (action === "delete_all" && !confirm("حذف كل التنبيهات؟")) return;
    setBusy(action);
    try {
      const r = await bulkFn({ data: { action } });
      onMessage(`✓ تأثّر ${r.affected} تنبيه`);
      load();
    } catch (e) {
      onMessage(`خطأ: ${e instanceof Error ? e.message : "فشل"}`);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="glass rounded-2xl p-5">
      <h2 className="mb-4 font-display text-base font-bold flex items-center gap-2">
        <Bell className="h-4 w-4 text-[oklch(0.85_0.18_200)]" />
        عمليات جماعية على التنبيهات
      </h2>
      <div className="mb-5 grid grid-cols-3 gap-3">
        <Stat label="الإجمالي" value={counts.total} />
        <Stat label="غير مقروءة" value={counts.unread} accent="amber" />
        <Stat label="مقروءة" value={counts.read} accent="emerald" />
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => run("mark_read")}
          disabled={busy !== null || counts.unread === 0}
          className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10 disabled:opacity-50"
        >
          <CheckCheck className="h-4 w-4" /> تعليم الكل كمقروء
        </button>
        <button
          onClick={() => run("delete_read")}
          disabled={busy !== null || counts.read === 0}
          className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10 disabled:opacity-50"
        >
          <Trash2 className="h-4 w-4" /> حذف المقروءة
        </button>
        <button
          onClick={() => run("delete_all")}
          disabled={busy !== null || counts.total === 0}
          className="flex items-center gap-1.5 rounded-lg border border-pink-500/30 bg-pink-500/10 px-3 py-2 text-sm text-pink-400 hover:bg-pink-500/20 disabled:opacity-50"
        >
          <Trash2 className="h-4 w-4" /> حذف الكل
        </button>
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent?: "amber" | "emerald" }) {
  const color = accent === "amber" ? "text-amber-300" : accent === "emerald" ? "text-emerald-300" : "neon-text";
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-center">
      <div className={`font-display text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-[11px] text-muted-foreground">{label}</div>
    </div>
  );
}

/* =================== Templates panel =================== */
type TemplateRow = {
  id: string; title_ar: string; slug: string; is_published: boolean;
  download_count: number; price_usd_cents: number; category: string;
};

function TemplatesPanel({ onMessage }: { onMessage: (m: string) => void }) {
  const [rows, setRows] = useState<TemplateRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("templates")
      .select("id, title_ar, slug, is_published, download_count, price_usd_cents, category")
      .order("sort_order");
    if (data) setRows(data as TemplateRow[]);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function togglePublish(t: TemplateRow) {
    const { error } = await supabase
      .from("templates")
      .update({ is_published: !t.is_published })
      .eq("id", t.id);
    if (error) onMessage(`خطأ: ${error.message}`);
    else { onMessage(t.is_published ? "تم الإخفاء" : "تم النشر"); load(); }
  }

  async function remove(t: TemplateRow) {
    if (!confirm(`حذف القالب "${t.title_ar}"؟`)) return;
    const { error } = await supabase.from("templates").delete().eq("id", t.id);
    if (error) onMessage(`خطأ: ${error.message}`);
    else { onMessage("✓ حُذف"); load(); }
  }

  return (
    <div className="glass rounded-2xl p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-base font-bold flex items-center gap-2">
          <Package className="h-4 w-4 text-[oklch(0.85_0.18_200)]" />
          القوالب ({rows.length})
        </h2>
        <button onClick={load} className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm hover:bg-white/10">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> تحديث
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-right text-[11px] uppercase text-muted-foreground">
              <th className="py-2 px-2 font-medium">العنوان</th>
              <th className="py-2 px-2 font-medium">الفئة</th>
              <th className="py-2 px-2 font-medium">السعر</th>
              <th className="py-2 px-2 font-medium">تنزيلات</th>
              <th className="py-2 px-2 font-medium">منشور</th>
              <th className="py-2 px-2 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((t) => (
              <tr key={t.id} className="border-b border-white/5">
                <td className="py-2.5 px-2 font-medium">{t.title_ar}</td>
                <td className="py-2.5 px-2 text-[11px] text-muted-foreground">{t.category}</td>
                <td className="py-2.5 px-2 font-mono text-[11px]">${(t.price_usd_cents / 100).toFixed(2)}</td>
                <td className="py-2.5 px-2 text-[11px]">{t.download_count}</td>
                <td className="py-2.5 px-2">
                  <button
                    onClick={() => togglePublish(t)}
                    className={`rounded-full px-2 py-0.5 text-[10px] ${
                      t.is_published ? "bg-emerald-500/15 text-emerald-300" : "bg-muted/30 text-muted-foreground"
                    }`}
                  >
                    {t.is_published ? "نعم" : "لا"}
                  </button>
                </td>
                <td className="py-2.5 px-2">
                  <button onClick={() => remove(t)} className="rounded bg-pink-500/10 p-1.5 text-pink-400 hover:bg-pink-500/20">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && !loading && (
              <tr><td colSpan={6} className="py-8 text-center text-sm text-muted-foreground">لا توجد قوالب.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}