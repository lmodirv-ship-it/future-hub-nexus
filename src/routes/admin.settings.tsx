import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Settings as SettingsIcon, Database, Shield, Zap, Save, Mail, Clock, Activity } from "lucide-react";
import { AdminGuard } from "@/components/nexus/AdminGuard";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAuth } from "@/hooks/use-auth";
import { useProjects } from "@/hooks/use-projects";
import { useSettings } from "@/hooks/use-settings";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({ meta: [{ title: "الإعدادات — نكسس" }] }),
  component: () => (<AdminGuard><Page /></AdminGuard>),
});

function Page() {
  const { user } = useAuth();
  const { projects } = useProjects();
  const { settings, loading, update } = useSettings();

  const [interval, setInterval_] = useState("15");
  const [threshold, setThreshold] = useState("5000");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    setInterval_(String(settings.check_interval_minutes ?? 15));
    setThreshold(String(settings.slow_threshold_ms ?? 5000));
    setEmail(typeof settings.alert_email === "string" ? settings.alert_email : "");
  }, [loading, settings]);

  async function save() {
    setBusy(true);
    const i = Number(interval); const t = Number(threshold);
    const errs: string[] = [];
    if (!Number.isFinite(i) || i < 1) errs.push("مدة الفحص يجب أن تكون رقماً موجباً");
    if (!Number.isFinite(t) || t < 100) errs.push("عتبة البطء يجب أن تكون 100ms على الأقل");
    if (errs.length) { setMsg(errs.join(" · ")); setBusy(false); setTimeout(() => setMsg(null), 4000); return; }
    await update("check_interval_minutes", i);
    await update("slow_threshold_ms", t);
    await update("alert_email", email);
    setMsg("✓ تم الحفظ");
    setBusy(false);
    setTimeout(() => setMsg(null), 2500);
  }

  return (
    <AdminLayout
      title="الإعدادات"
      subtitle="إعدادات النظام والمراقبة"
      actions={<button onClick={save} disabled={busy} className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[oklch(0.75_0.2_295)] to-[oklch(0.7_0.28_330)] px-4 py-2 text-sm font-medium text-background neon-glow disabled:opacity-50"><Save className="h-4 w-4" /> {busy ? "..." : "حفظ"}</button>}
    >
      {msg && <div className="glass mb-4 rounded-xl px-4 py-2.5 text-sm">{msg}</div>}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card icon={Activity} title="إعدادات المراقبة">
          <Field label="مدة الفحص الدوري (دقائق)" icon={Clock}>
            <input type="number" min={1} value={interval} onChange={(e) => setInterval_(e.target.value)} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-[oklch(0.75_0.2_295)]" />
          </Field>
          <Field label="عتبة البطء (ms)" icon={Zap}>
            <input type="number" min={100} value={threshold} onChange={(e) => setThreshold(e.target.value)} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-[oklch(0.75_0.2_295)]" />
          </Field>
          <Field label="بريد التنبيهات" icon={Mail}>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-[oklch(0.75_0.2_295)]" />
          </Field>
        </Card>

        <Card icon={Shield} title="الحساب الحالي">
          <Row label="البريد" value={user?.email ?? "—"} />
          <Row label="المعرّف" value={user?.id?.slice(0, 12) ?? "—"} mono />
          <Row label="الصلاحية" value="مدير" badge="emerald" />
        </Card>

        <Card icon={Database} title="قاعدة البيانات">
          <Row label="عدد المشاريع" value={String(projects.length)} />
          <Row label="مشاريع تعمل" value={String(projects.filter(p => p.is_up).length)} badge="emerald" />
          <Row label="مشاريع معطلة" value={String(projects.filter(p => p.is_up === false).length)} badge="pink" />
          <Row label="المزامنة" value="فورية" badge="cyan" />
        </Card>

        <Card icon={SettingsIcon} title="النظام">
          <Row label="الإصدار" value="نكسس v1.0" />
          <Row label="المنصة" value="TanStack + Lovable Cloud" />
          <Row label="الفحص التلقائي" value={`كل ${interval} دقيقة`} badge="cyan" />
        </Card>
      </div>
    </AdminLayout>
  );
}

function Card({ icon: Icon, title, children }: { icon: typeof Database; title: string; children: React.ReactNode }) {
  return (
    <div className="glass rounded-2xl p-5">
      <h2 className="mb-3 flex items-center gap-2 font-display text-base font-bold"><Icon className="h-4 w-4 text-[oklch(0.85_0.18_200)]" /> {title}</h2>
      <div className="space-y-3">{children}</div>
    </div>
  );
}
function Field({ label, icon: Icon, children }: { label: string; icon: typeof Database; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 flex items-center gap-1.5 text-xs text-muted-foreground"><Icon className="h-3 w-3" /> {label}</label>
      {children}
    </div>
  );
}
function Row({ label, value, mono, badge }: { label: string; value: string; mono?: boolean; badge?: "emerald" | "cyan" | "pink" }) {
  const colors = { emerald: "bg-emerald-500/10 text-emerald-400", cyan: "bg-cyan-500/10 text-cyan-400", pink: "bg-pink-500/10 text-pink-400" } as const;
  return (
    <div className="flex items-center justify-between border-b border-white/5 py-2 text-xs last:border-0">
      <span className="text-muted-foreground">{label}</span>
      {badge ? (
        <span className={`rounded-full px-2 py-0.5 ${colors[badge]}`}>{value}</span>
      ) : (
        <span className={`text-foreground ${mono ? "font-mono" : ""}`}>{value}</span>
      )}
    </div>
  );
}