import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type SettingsMap = Record<string, unknown>;

export function useSettings() {
  const [settings, setSettings] = useState<SettingsMap>({});
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("admin_settings").select("key, value");
    const map: SettingsMap = {};
    (data ?? []).forEach((r) => { map[r.key] = r.value; });
    setSettings(map);
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const update = async (key: string, value: unknown) => {
    const { error } = await supabase
      .from("admin_settings")
      .upsert({ key, value: value as never }, { onConflict: "key" });
    if (!error) await refresh();
    return { error };
  };

  return { settings, loading, update, refresh };
}