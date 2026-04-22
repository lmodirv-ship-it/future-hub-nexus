import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminGuard } from "@/components/nexus/AdminGuard";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Mail, Phone, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/leads")({
  component: () => (
    <AdminGuard>
      <AdminLayout title="طلبات الخدمات">
        <LeadsInner />
      </AdminLayout>
    </AdminGuard>
  ),
});

function LeadsInner() {
  const [leads, setLeads] = useState<Tables<"service_requests">[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    const { data } = await supabase.from("service_requests").select("*").order("created_at", { ascending: false });
    setLeads(data ?? []);
    setLoading(false);
  };

  useEffect(() => { refresh(); }, []);

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("service_requests").update({ status }).eq("id", id);
    refresh();
  };

  const remove = async (id: string) => {
    await supabase.from("service_requests").delete().eq("id", id);
    toast.success("تم الحذف");
    refresh();
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">طلبات الخدمات (Leads)</h1>
      <p className="mt-1 text-sm text-muted-foreground">{leads.length} طلب</p>
      <div className="mt-6 space-y-3">
        {loading ? <div className="glass h-40 rounded-2xl" /> : leads.length === 0 ? (
          <div className="glass rounded-2xl p-8 text-center text-muted-foreground">لا توجد طلبات بعد</div>
        ) : leads.map((l) => (
          <div key={l.id} className="glass rounded-2xl p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-display font-bold">{l.name}</h3>
                <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{l.email}</span>
                  {l.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{l.phone}</span>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <select value={l.status} onChange={(e) => updateStatus(l.id, e.target.value)} className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs">
                  <option value="new">جديد</option>
                  <option value="contacted">تم التواصل</option>
                  <option value="won">تم الإغلاق</option>
                  <option value="lost">مرفوض</option>
                </select>
                <button onClick={() => remove(l.id)} className="rounded-lg p-2 text-destructive hover:bg-white/5"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-white/5 px-2 py-1">نوع: {l.service_type}</span>
              {l.budget_range && <span className="rounded-full bg-white/5 px-2 py-1">ميزانية: {l.budget_range}</span>}
            </div>
            <p className="mt-3 rounded-lg bg-white/[0.03] p-3 text-sm text-muted-foreground">{l.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}