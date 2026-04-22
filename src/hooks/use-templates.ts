import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Template = Tables<"templates">;

export function useTemplates() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await supabase
        .from("templates")
        .select("*")
        .eq("is_published", true)
        .order("sort_order", { ascending: true });
      if (active) {
        setTemplates(data ?? []);
        setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  return { templates, loading };
}

export function useTemplate(slug: string) {
  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await supabase
        .from("templates")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      if (active) {
        setTemplate(data);
        setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [slug]);

  return { template, loading };
}