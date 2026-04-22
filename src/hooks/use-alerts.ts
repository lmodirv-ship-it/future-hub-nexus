import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type AlertRow = {
  id: string;
  project_id: string;
  type: string;
  severity: string;
  message: string;
  is_read: boolean;
  created_at: string;
  project?: { name_ar: string; slug: string; url: string } | null;
};

export function useAlerts() {
  const [alerts, setAlerts] = useState<AlertRow[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("alerts")
      .select("id, project_id, type, severity, message, is_read, created_at, project:projects(name_ar, slug, url)")
      .order("created_at", { ascending: false })
      .limit(200);
    setAlerts((data as unknown as AlertRow[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
    const ch = supabase.channel(`alerts-rt-${Math.random().toString(36).slice(2, 8)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "alerts" }, () => refresh())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [refresh]);

  const markRead = async (id: string) => {
    await supabase.from("alerts").update({ is_read: true }).eq("id", id);
  };
  const markAllRead = async () => {
    await supabase.from("alerts").update({ is_read: true }).eq("is_read", false);
  };
  const remove = async (id: string) => {
    await supabase.from("alerts").delete().eq("id", id);
  };

  return { alerts, loading, refresh, markRead, markAllRead, remove };
}