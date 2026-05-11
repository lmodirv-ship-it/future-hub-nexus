import { useState } from "react";
import { Copy, Check } from "lucide-react";

export function CopySnippet({ value, label }: { value: string; label?: string }) {
  const [ok, setOk] = useState(false);
  async function copy() {
    await navigator.clipboard.writeText(value);
    setOk(true);
    setTimeout(() => setOk(false), 1800);
  }
  return (
    <div className="relative">
      {label && <div className="mb-1.5 text-[11px] font-semibold text-muted-foreground">{label}</div>}
      <div className="group relative overflow-hidden rounded-xl border border-white/10 bg-black/40">
        <pre className="overflow-x-auto p-3.5 pr-12 text-[12px] leading-relaxed text-emerald-300/90 font-mono whitespace-pre-wrap break-all">{value}</pre>
        <button
          onClick={copy}
          className="absolute top-2 left-2 flex items-center gap-1 rounded-lg border border-white/10 bg-background/80 px-2.5 py-1.5 text-[11px] font-medium text-foreground transition-colors hover:bg-white/10"
        >
          {ok ? <><Check className="h-3.5 w-3.5 text-emerald-400" /> تم النسخ</> : <><Copy className="h-3.5 w-3.5" /> نسخ</>}
        </button>
      </div>
    </div>
  );
}
