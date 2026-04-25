import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, ExternalLink, RefreshCw, Globe } from "lucide-react";
import { AdminGuard } from "@/components/nexus/AdminGuard";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { SUPPORTED_LANGS, buildLangPath, type Lang } from "@/lib/i18n";
import { SITE_URL, buildCanonical, buildHreflangLinks } from "@/lib/seo";

export const Route = createFileRoute("/admin/seo")({
  head: () => ({
    meta: [
      { title: "تحقق SEO — HN-Dev" },
      { name: "description", content: "تحقق من إعدادات hreflang وcanonical وsitemap لكل اللغات." },
    ],
  }),
  component: () => (
    <AdminGuard>
      <SeoValidation />
    </AdminGuard>
  ),
});

const PATHS = ["/", "/projects", "/marketplace", "/pricing", "/services", "/about", "/contact"] as const;

type SitemapStatus = {
  ok: boolean;
  status: number;
  urlCount: number;
  alternateCount: number;
  langCounts: Record<Lang, number>;
  fetchedAt: string;
};

function SeoValidation() {
  const [sitemap, setSitemap] = useState<SitemapStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function checkSitemap() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/sitemap.xml", { cache: "no-store" });
      const text = await res.text();
      const urlCount = (text.match(/<url>/g) || []).length;
      const alternateCount = (text.match(/rel="alternate"/g) || []).length;
      const langCounts: Record<Lang, number> = { ar: 0, en: 0, fr: 0 };
      for (const l of SUPPORTED_LANGS) {
        const re = new RegExp(`hreflang="${l}"`, "g");
        langCounts[l] = (text.match(re) || []).length;
      }
      setSitemap({
        ok: res.ok,
        status: res.status,
        urlCount,
        alternateCount,
        langCounts,
        fetchedAt: new Date().toISOString(),
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    checkSitemap();
  }, []);

  const balanced =
    sitemap &&
    sitemap.langCounts.ar === sitemap.langCounts.en &&
    sitemap.langCounts.en === sitemap.langCounts.fr;

  return (
    <AdminLayout
      title="تحقق SEO"
      subtitle="hreflang و canonical و sitemap لكل اللغات."
      actions={
        <button
          onClick={checkSitemap}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> إعادة الفحص
        </button>
      }
    >
      {/* Sitemap summary */}
      <section className="glass mb-6 rounded-2xl border border-white/10 p-5">
        <div className="mb-3 flex items-center gap-2">
          <Globe className="h-5 w-5 text-[oklch(0.85_0.18_200)]" />
          <h2 className="font-display text-lg font-semibold">Sitemap</h2>
          <a
            href="/sitemap.xml"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            فتح <ExternalLink className="h-3 w-3" />
          </a>
        </div>
        {error && <p className="text-sm text-pink-400">{error}</p>}
        {sitemap && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="HTTP" value={String(sitemap.status)} ok={sitemap.ok} />
            <Stat label="URLs" value={String(sitemap.urlCount)} ok={sitemap.urlCount > 0} />
            <Stat label="Alternates" value={String(sitemap.alternateCount)} ok={sitemap.alternateCount > 0} />
            <Stat label="توازن اللغات" value={balanced ? "OK" : "غير متوازن"} ok={!!balanced} />
            {SUPPORTED_LANGS.map((l) => (
              <Stat key={l} label={`hreflang="${l}"`} value={String(sitemap.langCounts[l])} ok={sitemap.langCounts[l] > 0} />
            ))}
          </div>
        )}
      </section>

      {/* Per-path table */}
      <section className="glass overflow-hidden rounded-2xl border border-white/10">
        <div className="border-b border-white/10 px-5 py-3">
          <h2 className="font-display text-lg font-semibold">Canonical & hreflang لكل صفحة</h2>
          <p className="mt-1 text-xs text-muted-foreground">يتم حساب الروابط من <code className="text-[oklch(0.85_0.18_200)]">{SITE_URL}</code></p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-white/[0.03] text-muted-foreground">
              <tr>
                <th className="px-4 py-2 text-start">المسار</th>
                <th className="px-4 py-2 text-start">Canonical (AR)</th>
                <th className="px-4 py-2 text-start">Alternates</th>
              </tr>
            </thead>
            <tbody>
              {PATHS.map((p) => {
                const links = buildHreflangLinks(p);
                return (
                  <tr key={p} className="border-t border-white/5 align-top">
                    <td className="px-4 py-3 font-mono text-foreground">{p}</td>
                    <td className="px-4 py-3 font-mono text-muted-foreground">
                      <a href={buildCanonical("ar", p)} target="_blank" rel="noopener noreferrer" className="hover:text-foreground">
                        {buildCanonical("ar", p)}
                      </a>
                    </td>
                    <td className="px-4 py-3">
                      <ul className="space-y-1">
                        {links.map((l) => (
                          <li key={l.hreflang} className="font-mono text-muted-foreground">
                            <span className="inline-block w-20 text-[oklch(0.85_0.18_200)]">{l.hreflang}</span>
                            <a href={l.href} target="_blank" rel="noopener noreferrer" className="hover:text-foreground">
                              {l.href}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Lang path preview */}
      <section className="glass mt-6 rounded-2xl border border-white/10 p-5">
        <h2 className="mb-3 font-display text-lg font-semibold">معاينة المسارات لكل لغة</h2>
        <div className="grid gap-2 sm:grid-cols-3">
          {SUPPORTED_LANGS.map((l) => (
            <div key={l} className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
              <div className="mb-2 text-xs font-semibold uppercase text-[oklch(0.85_0.18_200)]">{l}</div>
              <ul className="space-y-1 text-xs">
                {PATHS.map((p) => (
                  <li key={p} className="font-mono text-muted-foreground">{buildLangPath(l, p)}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </AdminLayout>
  );
}

function Stat({ label, value, ok }: { label: string; value: string; ok: boolean }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
      <div className="mb-1 flex items-center gap-1.5 text-[11px] text-muted-foreground">
        {ok ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> : <XCircle className="h-3.5 w-3.5 text-pink-400" />}
        {label}
      </div>
      <div className="font-display text-lg font-bold">{value}</div>
    </div>
  );
}