import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { DollarSign, FileCheck2, Sparkles, ExternalLink, CheckCircle2, Circle, Wand2 } from "lucide-react";
import { AdminGuard } from "@/components/nexus/AdminGuard";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { CopySnippet } from "@/components/admin/CopySnippet";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/adsense-kit")({
  head: () => ({
    meta: [
      { title: "AdSense Kit — HN-Dev" },
      { name: "description", content: "علبة أدوات Google AdSense جاهزة للنسخ لكل مشاريعك." },
    ],
  }),
  component: () => (<AdminGuard><AdsenseKit /></AdminGuard>),
});

const PUB_ID = "ca-pub-3443455318197857";

const SCRIPT_SNIPPET = `<script async
  src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${PUB_ID}"
  crossorigin="anonymous"></script>`;

const ADSTXT_SNIPPET = `google.com, pub-3443455318197857, DIRECT, f08c47fec0942fa0`;

const LOVABLE_PROMPT = `أضف Google AdSense إلى هذا المشروع:

1) أضف هذا السكريبت في <head> داخل src/routes/__root.tsx ضمن مصفوفة scripts:
${SCRIPT_SNIPPET}

2) أنشئ ملف public/ads.txt يحتوي بالضبط السطر التالي:
${ADSTXT_SNIPPET}

تحقّق من أن الملف يُخدَم على /ads.txt بعد النشر.`;

type Row = {
  id: string; name: string; lovable_project_id: string;
  lovable_url: string | null; published_url: string | null;
  adsense_installed: boolean; adstxt_installed: boolean; sort_order: number;
};

function AdsenseKit() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("lovable_projects")
      .select("id, name, lovable_project_id, lovable_url, published_url, adsense_installed, adstxt_installed, sort_order")
      .order("sort_order");
    setRows((data ?? []) as Row[]);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function toggle(id: string, field: "adsense_installed" | "adstxt_installed", value: boolean) {
    await supabase.from("lovable_projects").update({ [field]: value }).eq("id", id);
    setRows((prev) => prev.map((r) => r.id === id ? { ...r, [field]: value } : r));
  }

  const adsenseDone = rows.filter((r) => r.adsense_installed).length;
  const adstxtDone = rows.filter((r) => r.adstxt_installed).length;

  return (
    <AdminLayout
      title="AdSense Kit"
      subtitle={`Publisher: ${PUB_ID} · انسخ والصق لتفعيل AdSense على كل مشاريعك.${loading ? " · تحميل..." : ""}`}
    >
      {/* Snippets */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="glass rounded-2xl p-5">
          <h2 className="mb-3 font-display text-base font-bold flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-amber-300" /> سكريبت AdSense
          </h2>
          <p className="mb-3 text-xs text-muted-foreground">يُلصق داخل وسم <code className="font-mono text-amber-300">&lt;head&gt;</code> في كل صفحات الموقع.</p>
          <CopySnippet value={SCRIPT_SNIPPET} />
        </div>

        <div className="glass rounded-2xl p-5">
          <h2 className="mb-3 font-display text-base font-bold flex items-center gap-2">
            <FileCheck2 className="h-4 w-4 text-emerald-300" /> ملف ads.txt
          </h2>
          <p className="mb-3 text-xs text-muted-foreground">أنشئ ملف <code className="font-mono">public/ads.txt</code> يحتوي السطر التالي بالضبط:</p>
          <CopySnippet value={ADSTXT_SNIPPET} />
        </div>
      </div>

      {/* Lovable prompt */}
      <div className="glass mt-4 rounded-2xl p-5">
        <h2 className="mb-2 font-display text-base font-bold flex items-center gap-2">
          <Wand2 className="h-4 w-4 text-fuchsia-300" /> Prompt جاهز للصق في أي مشروع Lovable
        </h2>
        <p className="mb-3 text-xs text-muted-foreground">
          افتح أي مشروع → الصق هذا الـ prompt في الشات → سيُضيف AdSense تلقائياً (السكريبت + ads.txt) في ثوانٍ.
        </p>
        <CopySnippet value={LOVABLE_PROMPT} />
      </div>

      {/* Status table */}
      <div className="glass mt-5 rounded-2xl p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-base font-bold flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[oklch(0.85_0.18_200)]" /> حالة التفعيل ({rows.length} مشروع)
          </h2>
          <div className="flex gap-3 text-[11px]">
            <span className="rounded-full bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 text-amber-300">
              AdSense: {adsenseDone}/{rows.length}
            </span>
            <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 text-emerald-300">
              ads.txt: {adstxtDone}/{rows.length}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto -mx-2">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[11px] text-muted-foreground border-b border-white/5">
                <th className="px-2 py-2 text-start font-medium">المشروع</th>
                <th className="px-2 py-2 text-center font-medium">AdSense</th>
                <th className="px-2 py-2 text-center font-medium">ads.txt</th>
                <th className="px-2 py-2 text-end font-medium">روابط</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="px-2 py-2.5">
                    <div className="font-semibold text-sm">{r.name}</div>
                    <div className="text-[10px] text-muted-foreground font-mono" dir="ltr">
                      {r.lovable_url?.replace("https://", "") ?? "—"}
                    </div>
                  </td>
                  <td className="px-2 py-2.5 text-center">
                    <button
                      onClick={() => toggle(r.id, "adsense_installed", !r.adsense_installed)}
                      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] transition-colors ${r.adsense_installed ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300" : "border-white/10 bg-white/5 text-muted-foreground hover:text-foreground"}`}
                    >
                      {r.adsense_installed ? <CheckCircle2 className="h-3 w-3" /> : <Circle className="h-3 w-3" />}
                      {r.adsense_installed ? "مُفعّل" : "غير مُفعّل"}
                    </button>
                  </td>
                  <td className="px-2 py-2.5 text-center">
                    <button
                      onClick={() => toggle(r.id, "adstxt_installed", !r.adstxt_installed)}
                      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] transition-colors ${r.adstxt_installed ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300" : "border-white/10 bg-white/5 text-muted-foreground hover:text-foreground"}`}
                    >
                      {r.adstxt_installed ? <CheckCircle2 className="h-3 w-3" /> : <Circle className="h-3 w-3" />}
                      {r.adstxt_installed ? "موجود" : "غير موجود"}
                    </button>
                  </td>
                  <td className="px-2 py-2.5 text-end">
                    <div className="inline-flex gap-1">
                      <a
                        href={`https://lovable.dev/projects/${r.lovable_project_id}`}
                        target="_blank" rel="noopener noreferrer"
                        className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[10px] hover:bg-white/10 inline-flex items-center gap-1"
                        title="فتح المشروع في Lovable"
                      >
                        <ExternalLink className="h-3 w-3" /> Lovable
                      </a>
                      {(r.published_url || r.lovable_url) && (
                        <a
                          href={r.published_url || r.lovable_url || "#"}
                          target="_blank" rel="noopener noreferrer"
                          className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[10px] hover:bg-white/10 inline-flex items-center gap-1"
                          title="فتح الموقع المنشور"
                        >
                          <ExternalLink className="h-3 w-3" /> Live
                        </a>
                      )}
                      {(r.published_url || r.lovable_url) && (
                        <a
                          href={`${(r.published_url || r.lovable_url || "").replace(/\/$/, "")}/ads.txt`}
                          target="_blank" rel="noopener noreferrer"
                          className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[10px] hover:bg-white/10 inline-flex items-center gap-1"
                          title="فحص ads.txt"
                        >
                          ads.txt
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
