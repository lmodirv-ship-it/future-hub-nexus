import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Sparkles, Zap, Crown } from "lucide-react";
import { usePlans } from "@/hooks/use-plans";
import { useCurrency } from "@/lib/currency";
import { useI18n } from "@/lib/i18n";
import { buildPageHead } from "@/lib/seo";
import { toast } from "sonner";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    ...buildPageHead({
      basePath: "/pricing",
      lang: "ar",
      title: {
        ar: "الأسعار — HN-Dev | خطط مراقبة المواقع",
        en: "Pricing — HN-Dev | Website Monitoring Plans",
        fr: "Tarifs — HN-Dev | Plans de surveillance",
      },
      description: {
        ar: "خطط اشتراك لمراقبة مواقعك 24/7. ابدأ مجاناً، ارتقِ عند الحاجة.",
        en: "Subscription plans for 24/7 website monitoring. Start free, upgrade when needed.",
        fr: "Plans d'abonnement pour la surveillance 24/7. Commencez gratuitement.",
      },
    }),
  }),
  component: PricingPage,
});

const ICONS = [Sparkles, Zap, Crown];

function PricingPage() {
  const { plans, loading } = usePlans();
  const { currency, setCurrency, format } = useCurrency();
  const { lang, t } = useI18n();

  const handleSubscribe = (slug: string) => {
    if (slug === "free") {
      toast.success(t("pricing.toast.free"));
      return;
    }
    toast.info(t("pricing.toast.gateway"));
  };

  return (
    <section className="relative mx-auto max-w-6xl px-6 pb-24 pt-32">
      <div className="mb-12 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5" />
          {t("pricing.badge")}
        </div>
        <h1 className="font-display text-4xl font-bold sm:text-5xl">
          {t("pricing.title.plans")} <span className="neon-text">{t("pricing.title.stage")}</span>
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
          {t("pricing.lead")}
        </p>

        <div className="mt-6 inline-flex rounded-xl border border-white/10 bg-white/5 p-1">
          <button
            onClick={() => setCurrency("USD")}
            className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${currency === "USD" ? "bg-white/10 text-foreground" : "text-muted-foreground"}`}
          >
            USD $
          </button>
          <button
            onClick={() => setCurrency("EUR")}
            className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${currency === "EUR" ? "bg-white/10 text-foreground" : "text-muted-foreground"}`}
          >
            EUR €
          </button>
          <button
            onClick={() => setCurrency("MAD")}
            className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${currency === "MAD" ? "bg-white/10 text-foreground" : "text-muted-foreground"}`}
          >
            MAD د.م
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="glass h-96 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((p, i) => {
            const Icon = ICONS[i] ?? Sparkles;
            const features = (p.features as string[]) ?? [];
            const name = lang === "ar" ? p.name_ar : p.name_en;
            const desc = lang === "ar" ? p.description_ar : p.description_en;
            return (
              <div
                key={p.id}
                className={`glass relative flex flex-col rounded-2xl p-6 ${p.is_featured ? "ring-2 ring-[oklch(0.75_0.2_295)]" : ""}`}
              >
                {p.is_featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-[oklch(0.75_0.2_295)] to-[oklch(0.7_0.28_330)] px-3 py-1 text-xs font-semibold text-background">
                    {t("pricing.popular")}
                  </div>
                )}
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[oklch(0.75_0.2_295)] to-[oklch(0.7_0.28_330)]">
                  <Icon className="h-6 w-6 text-background" />
                </div>
                <h3 className="font-display text-2xl font-bold">{name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="font-display text-4xl font-bold">
                    {format({ usd: p.price_usd_cents, mad: p.price_mad_cents })}
                  </span>
                  <span className="text-sm text-muted-foreground">/{t("pricing.month")}</span>
                </div>
                <ul className="mt-6 flex-1 space-y-2">
                  {features.map((f, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-[oklch(0.85_0.18_200)]" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleSubscribe(p.slug)}
                  className={`mt-6 rounded-xl px-4 py-2.5 text-sm font-medium transition-transform hover:scale-[1.02] ${
                    p.is_featured
                      ? "bg-gradient-to-r from-[oklch(0.75_0.2_295)] to-[oklch(0.7_0.28_330)] text-background neon-glow"
                      : "border border-white/10 bg-white/5 text-foreground hover:bg-white/10"
                  }`}
                >
                  {p.price_usd_cents === 0
                    ? t("pricing.startFree")
                    : t("pricing.subscribe")}
                </button>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-16 text-center">
        <p className="text-sm text-muted-foreground">
          {t("pricing.custom.text")}
          <Link to="/contact" className="text-foreground underline-offset-4 hover:underline">
            {t("pricing.custom.contact")}
          </Link>
        </p>
      </div>
    </section>
  );
}