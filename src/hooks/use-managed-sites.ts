import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type ManagedSite = {
  id: string;
  name: string;
  domain: string;
  github_repo: string | null;
  github_branch: string;
  origin_server: string | null;
  mirror_path: string | null;
  notes: string | null;
  enabled: boolean;
  last_sync_at: string | null;
  last_commit_sha: string | null;
  last_sync_status: string | null;
  last_health_status: string | null;
  last_response_time_ms: number | null;
  last_status_code: number | null;
  last_checked_at: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type NewManagedSite = Omit<
  ManagedSite,
  | "id"
  | "created_at"
  | "updated_at"
  | "last_sync_at"
  | "last_commit_sha"
  | "last_sync_status"
  | "last_health_status"
  | "last_response_time_ms"
  | "last_status_code"
  | "last_checked_at"
>;

export function useManagedSites() {
  const [sites, setSites] = useState<ManagedSite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("managed_sites")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
    if (error) setError(error.message);
    else setSites((data ?? []) as ManagedSite[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  async function addSite(input: Partial<NewManagedSite> & { name: string; domain: string }) {
    const { data, error } = await supabase
      .from("managed_sites")
      .insert({
        name: input.name,
        domain: input.domain,
        github_repo: input.github_repo ?? null,
        github_branch: input.github_branch ?? "main",
        origin_server: input.origin_server ?? null,
        mirror_path: input.mirror_path ?? null,
        notes: input.notes ?? null,
        enabled: input.enabled ?? true,
        sort_order: input.sort_order ?? 0,
      })
      .select()
      .single();
    if (!error) await refetch();
    return { data, error };
  }

  async function updateSite(id: string, patch: Partial<ManagedSite>) {
    const { error } = await supabase.from("managed_sites").update(patch).eq("id", id);
    if (!error) await refetch();
    return { error };
  }

  async function deleteSite(id: string) {
    const { error } = await supabase.from("managed_sites").delete().eq("id", id);
    if (!error) await refetch();
    return { error };
  }

  return { sites, loading, error, refetch, addSite, updateSite, deleteSite };
}

export async function fetchSyncLog(siteId: string, limit = 20) {
  const { data, error } = await supabase
    .from("site_sync_log")
    .select("*")
    .eq("site_id", siteId)
    .order("created_at", { ascending: false })
    .limit(limit);
  return { data: data ?? [], error };
}

export async function fetchHealthHistory(siteId: string, limit = 50) {
  const { data, error } = await supabase
    .from("site_health_history")
    .select("*")
    .eq("site_id", siteId)
    .order("checked_at", { ascending: false })
    .limit(limit);
  return { data: data ?? [], error };
}