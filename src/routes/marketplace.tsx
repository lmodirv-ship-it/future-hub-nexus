import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles, Download, ExternalLink } from "lucide-react";
import { useTemplates } from "@/hooks/use-templates";
import { useCurrency } from "@/lib/currency";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/marketplace")({
  head: () => ({
    meta: [
      { title: "السوق — قوالب جاهزة | نكسس" },
      { name: "description", content: "قوالب احترافية جاهزة للنشر — كود مصدر كامل، تصميم متجاوب، تحديثات مجانية." },
      { property: "og:title", content: "سوق نكسس — قوالب جاهزة" },
      { property: "og:description", content: "اشترِ نسختك من أي مشروع وابدأ فوراً." },
    ],
  }),
  component: MarketplacePage,
});

function MarketplacePage() {
  const { templates, loading } = useTemplates();
  const { currency, setCurrency, format } = useCurrency();
  const { lang } = useI18n();

  return (
    <section className="relative mx-auto max-w-7xl px-6 pb-24 pt-32">
      <div className="mb-10 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5" />
          {lang === "ar" ? "قوالب جاهزة • تسليم فوري" : "Ready templates • Instant delivery"}
        </div>
        <h1 className="font-display text-4xl font-bold sm:text-5xl">
          {lang === "ar" ? "" : "The "}
          <span className="neon-text">{lang === "ar" ? "السوق" : "Marketplace"}</span>
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
          {lang === "ar"
            ? "اشترِ نسخة كاملة من أي مشروع. كود مصدر + تصميم + جاهز للنشر في دقائق."
            : "Get the full source of any project. Code + design + production-ready in minutes."}
        </p>

        <div className="mt-6 inline-flex rounded-xl border border-white/10 bg-white/5 p-1">
          <button onClick={() => setCurrency("USD")} className={`rounded-lg px-4 py-1.5 text-sm font-medium ${currency === "USD" ? "bg-white/10 text-foreground" : "text-muted-foreground"}`}>USD $</button>
          <button onClick={() => setCurrency("MAD")} className={`rounded-lg px-4 py-1.5 text-sm font-medium ${currency === "MAD" ? "bg-white/10 text-foreground" : "text-muted-foreground"}`}>MAD د.م</button>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (<div key={i} className="glass h-72 rounded-2xl" />))}
        </div>
      ) : templates.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center text-muted-foreground">
          {lang === "ar" ? "لا توجد قوالب متاحة بعد." : "No templates available yet."}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((t) => {
            const title = lang === "ar" ? t.title_ar : t.title_en;
            const desc = lang === "ar" ? t.description_ar : t.description_en;
            return (
              <Link
                key={t.id}
                to="/marketplace/$slug"
                params={{ slug: t.slug }}
                className="glass group flex flex-col rounded-2xl p-5 transition-transform hover:-translate-y-1"
              >
                <div className="mb-4 aspect-video rounded-xl bg-gradient-to-br from-[oklch(0.3_0.15_295)] to-[oklch(0.2_0.2_330)] p-6 flex items-center justify-center">
                  <Sparkles className="h-12 w-12 text-white/40" />
                </div>
                <h3 className="font-display text-lg font-bold">{title}</h3>
                {desc && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{desc}</p>}
                <div className="mt-4 flex items-center justify-between">
                  <span className="font-display text-xl font-bold neon-text">
                    {format({ usd: t.price_usd_cents, mad: t.price_mad_cents })}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Download className="h-3.5 w-3.5" />
                    {t.download_count}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}