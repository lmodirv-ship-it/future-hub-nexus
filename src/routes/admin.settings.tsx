import { createFileRoute } from "@tanstack/react-router";
import { Settings as SettingsIcon, Database, Shield, Zap, ExternalLink } from "lucide-react";
import { AdminGuard } from "@/components/nexus/AdminGuard";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAuth } from "@/hooks/use-auth";
import { useProjects } from "@/hooks/use-projects";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({ meta: [{ title: "الإعدادات — نكسس" }] }),
  component: () => (<AdminGuard><Page /></AdminGuard>),
});

function Page() {
  const { user } = useAuth();
  const { projects } = useProjects();

  return (
    <AdminLayout title="الإعدادات" subtitle="معلومات النظام والحساب">
      <div className="grid gap-4 lg:grid-cols-2">
        <Card icon={Shield} title="الحساب">
          <Row label="البريد" value={user?.email ?? "—"} />
          <Row label="المعرّف" value={user?.id?.slice(0, 12) ?? "—"} mono />
          <Row label="الصلاحية" value="مدير كامل" badge="emerald" />
        </Card>
        <Card icon={Database} title="قاعدة البيانات">
          <Row label="المشاريع" value={String(projects.length)} />
          <Row label="الحد الأقصى" value="غير محدود" />
          <Row label="المزامنة" value="فورية (Realtime)" badge="cyan" />
        </Card>
        <Card icon={Zap} title="الفحص">
          <Row label="الطريقة" value="HTTP GET (8s timeout)" />
          <Row label="التشغيل" value="يدوي من اللوحة" />
          <Row label="السجل" value="كامل في project_checks" />
        </Card>
        <Card icon={SettingsIcon} title="النظام">
          <Row label="الإصدار" value="نكسس v1.0" />
          <Row label="الواجهة" value="TanStack Start + Supabase" />
          <Row label="التخزين" value="Lovable Cloud" />
        </Card>
      </div>

      <div className="glass mt-5 rounded-2xl p-5">
        <h2 className="mb-3 flex items-center gap-2 font-display text-base font-bold"><ExternalLink className="h-4 w-4 text-[oklch(0.85_0.18_200)]" /> روابط مفيدة</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          <a href="https://lovable.dev" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-3 text-sm hover:bg-white/5"><span>Lovable Dashboard</span><ExternalLink className="h-3.5 w-3.5" /></a>
          <a href="https://docs.lovable.dev" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-3 text-sm hover:bg-white/5"><span>التوثيق</span><ExternalLink className="h-3.5 w-3.5" /></a>
        </div>
      </div>
    </AdminLayout>
  );
}

function Card({ icon: Icon, title, children }: { icon: typeof Database; title: string; children: React.ReactNode }) {
  return (
    <div className="glass rounded-2xl p-5">
      <h2 className="mb-3 flex items-center gap-2 font-display text-base font-bold"><Icon className="h-4 w-4 text-[oklch(0.85_0.18_200)]" /> {title}</h2>
      <div className="space-y-2">{children}</div>
    </div>
  );
}
function Row({ label, value, mono, badge }: { label: string; value: string; mono?: boolean; badge?: "emerald" | "cyan" }) {
  return (
    <div className="flex items-center justify-between border-b border-white/5 py-2 text-xs last:border-0">
      <span className="text-muted-foreground">{label}</span>
      {badge ? (
        <span className={`rounded-full px-2 py-0.5 ${badge === "emerald" ? "bg-emerald-500/10 text-emerald-400" : "bg-cyan-500/10 text-cyan-400"}`}>{value}</span>
      ) : (
        <span className={`text-foreground ${mono ? "font-mono" : ""}`}>{value}</span>
      )}
    </div>
  );
}