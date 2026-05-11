import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { Globe, Plus, Trash2, Star, ExternalLink, Loader2 } from "lucide-react";

type Domain = { domain: string; primary?: boolean; ssl_ok?: boolean };

export function DomainManagerModal({
  open, onOpenChange, projectId, projectName, lovableProjectId, initialDomains, onSaved,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  projectId: string;
  projectName: string;
  lovableProjectId: string;
  initialDomains: Domain[];
  onSaved: () => void;
}) {
  const [domains, setDomains] = useState<Domain[]>(initialDomains);
  const [input, setInput] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => { setDomains(initialDomains); }, [initialDomains, open]);

  function add() {
    const d = input.trim().replace(/^https?:\/\//, "").replace(/\/$/, "");
    if (!d) return;
    if (domains.some((x) => x.domain === d)) return;
    setDomains([...domains, { domain: d, primary: domains.length === 0 }]);
    setInput("");
  }
  function remove(d: string) {
    const next = domains.filter((x) => x.domain !== d);
    if (!next.some((x) => x.primary) && next.length > 0) next[0].primary = true;
    setDomains(next);
  }
  function setPrimary(d: string) {
    setDomains(domains.map((x) => ({ ...x, primary: x.domain === d })));
  }

  async function save() {
    setSaving(true);
    await supabase.from("lovable_projects").update({ custom_domains: domains as never }).eq("id", projectId);
    setSaving(false);
    onSaved();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg border-white/10 bg-background/95 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <Globe className="h-4 w-4 text-[oklch(0.85_0.18_200)]" /> نطاقات {projectName}
          </DialogTitle>
          <DialogDescription className="text-xs">أضف نطاقاتك المخصّصة (مثل yoursite.com). الأساسي يُستخدم في الفحص.</DialogDescription>
        </DialogHeader>

        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())}
            placeholder="example.com"
            className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm focus:border-[oklch(0.65_0.25_290)] focus:outline-none"
            dir="ltr"
          />
          <button onClick={add} className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[oklch(0.75_0.2_295)] to-[oklch(0.7_0.28_330)] px-3 py-2 text-sm font-medium text-background">
            <Plus className="h-4 w-4" /> إضافة
          </button>
        </div>

        <div className="space-y-1.5 max-h-64 overflow-y-auto">
          {domains.length === 0 && (
            <div className="rounded-lg border border-dashed border-white/10 p-4 text-center text-xs text-muted-foreground">
              لا توجد نطاقات بعد.
            </div>
          )}
          {domains.map((d) => (
            <div key={d.domain} className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] p-2.5">
              <button onClick={() => setPrimary(d.domain)} className={`shrink-0 rounded p-1 ${d.primary ? "text-yellow-400" : "text-muted-foreground hover:text-foreground"}`} title="جعله الأساسي">
                <Star className={`h-3.5 w-3.5 ${d.primary ? "fill-current" : ""}`} />
              </button>
              <span className="flex-1 truncate text-xs font-mono" dir="ltr">{d.domain}</span>
              <a href={`https://${d.domain}`} target="_blank" rel="noopener noreferrer" className="shrink-0 rounded p-1 text-muted-foreground hover:text-foreground">
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
              <button onClick={() => remove(d.domain)} className="shrink-0 rounded p-1 text-muted-foreground hover:text-pink-400">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-2">
          <a
            href={`https://lovable.dev/projects/${lovableProjectId}/settings/domains`}
            target="_blank" rel="noopener noreferrer"
            className="text-[11px] text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
          >
            <ExternalLink className="h-3 w-3" /> فتح إعدادات Lovable
          </a>
          <button onClick={save} disabled={saving} className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[oklch(0.75_0.2_295)] to-[oklch(0.7_0.28_330)] px-4 py-2 text-sm font-semibold text-background neon-glow disabled:opacity-50">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />} حفظ
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
