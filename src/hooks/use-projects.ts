import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];
export type ProjectInsert = Database["public"]["Tables"]["projects"]["Insert"];
export type ProjectUpdate = Database["public"]["Tables"]["projects"]["Update"];

// Public-safe shape: excludes owner_email and lovable_project_id.
// Server-side view `projects_public` enforces this at the DB layer.
export type PublicProjectRow = Omit<ProjectRow, "owner_email" | "lovable_project_id">;

export function useProjects() {
  const [projects, setProjects] = useState<PublicProjectRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("projects_public" as "projects")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) setError(error.message);
    else setProjects((data ?? []) as PublicProjectRow[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
    const channelName = `projects-rt-${Math.random().toString(36).slice(2, 10)}`;
    const channel = supabase.channel(channelName);
    channel
      .on("postgres_changes", { event: "*", schema: "public", table: "projects" }, () => refresh())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [refresh]);

  return { projects, loading, error, refresh };
}