import { createFileRoute, Link, notFound, useParams } from "@tanstack/react-router";
import { ArrowLeft, Check, Download, ExternalLink, Sparkles } from "lucide-react";
import { useTemplate } from "@/hooks/use-templates";
import { useCurrency } from "@/lib/currency";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/marketplace/$slug")({
  loader: async ({ params }) => {
    const { data } = await supabase
      .from("templates")
      .select("title_ar, title_en, description_ar, description_en, cover_image, slug")
      .eq("slug", params.slug)
      .eq("is_published", true)
      .maybeSingle();
    if (!data) throw notFound();
    return { template: data };
  },
  head: ({ loaderData, params }) => {
    const t = loaderData?.template;
    const title = t ? `${t.title_ar ?? t.title_en} — قالب نكسس` : `${params.slug} — قالب نكسس`;
    const desc = (t?.description_ar ?? t?.description_en ?? "قالب احترافي جاهز للنشر").toString().slice(0, 160);
    const meta: Array<Record<string, string>> = [
      { title },
      { name: "description", content: desc },
      { property: "og:title", content: title },
      { property: "og:description", content: desc },
      { property: "og:type", content: "product" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: desc },
    ];
    if (t?.cover_image) {
      meta.push({ property: "og:image", content: t.cover_image });
      meta.push({ name: "twitter:image", content: t.cover_image });
    }
    return { meta };
  },
  notFoundComponent: () => {
    const { slug } = Route.useParams();
    return (
      <div className="mx-auto max-w-md px-6 pt-40 text-center">
        <h1 className="font-display text-3xl font-bold">القالب غير موجود</h1>
        <p className="mt-2 text-sm text-muted-foreground">{slug}</p>
        <Link to="/marketplace" className="mt-4 inline-block text-[oklch(0.85_0.18_200)]">عودة للسوق</Link>
      </div>
    );
  },
  errorComponent: ({ error, reset }) => (
    <div className="mx-auto max-w-md px-6 pt-40 text-center">
      <p className="text-destructive">{error.message}</p>
      <button onClick={reset} className="mt-4 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm">إعادة المحاولة</button>
    </div>
  ),
  component: TemplateDetail,
});

function TemplateDetail() {
  const { slug } = useParams({ from: "/marketplace/$slug" });
  const { template, loading } = useTemplate(slug);
  const { format, currency, setCurrency } = useCurrency();
  const { lang } = useI18n();

  if (loading) {
    return <div className="mx-auto max-w-4xl px-6 pt-32"><div className="glass h-96 rounded-2xl" /></div>;
  }

  if (!template) {
    return (
      <div className="mx-auto max-w-4xl px-6 pt-32 text-center">
        <p className="text-muted-foreground">{lang === "ar" ? "القالب غير موجود" : "Template not found"}</p>
        <Link to="/marketplace" className="mt-4 inline-block text-foreground underline">
          {lang === "ar" ? "العودة للسوق" : "Back to marketplace"}
        </Link>
      </div>
    );
  }

  const title = lang === "ar" ? template.title_ar : template.title_en;
  const desc = lang === "ar" ? template.description_ar : template.description_en;
  const features = (template.features as string[]) ?? [];
  const techStack = (template.tech_stack as string[]) ?? [];

  const handleBuy = () => {
    toast.info(lang === "ar" ? "بوابة الدفع قيد التفعيل — اشترك في القائمة." : "Payment gateway being activated.");
  };

  return (
    <section className="relative mx-auto max-w-5xl px-6 pb-24 pt-32">
      <Link to="/marketplace" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        {lang === "ar" ? "كل القوالب" : "All templates"}
      </Link>

      <div className="grid gap-8 md:grid-cols-5">
        <div className="md:col-span-3">
          <div className="glass mb-6 aspect-video rounded-2xl bg-gradient-to-br from-[oklch(0.3_0.15_295)] to-[oklch(0.2_0.2_330)] p-12 flex items-center justify-center">
            <Sparkles className="h-20 w-20 text-white/40" />
          </div>
          <h1 className="font-display text-3xl font-bold sm:text-4xl">{title}</h1>
          {desc && <p className="mt-3 text-muted-foreground">{desc}</p>}

          {features.length > 0 && (
            <>
              <h2 className="mt-8 font-display text-xl font-bold">{lang === "ar" ? "ما ستحصل عليه" : "What you get"}</h2>
              <ul className="mt-4 space-y-2">
                {features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[oklch(0.85_0.18_200)]" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </>
          )}

          {techStack.length > 0 && (
            <>
              <h2 className="mt-8 font-display text-xl font-bold">{lang === "ar" ? "التقنيات" : "Tech stack"}</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {techStack.map((t, i) => (
                  <span key={i} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs">{t}</span>
                ))}
              </div>
            </>
          )}
        </div>

        <aside className="md:col-span-2">
          <div className="glass sticky top-28 rounded-2xl p-6">
            <div className="mb-4 inline-flex rounded-xl border border-white/10 bg-white/5 p-1">
              <button onClick={() => setCurrency("USD")} className={`rounded-lg px-3 py-1 text-xs font-medium ${currency === "USD" ? "bg-white/10 text-foreground" : "text-muted-foreground"}`}>USD</button>
              <button onClick={() => setCurrency("MAD")} className={`rounded-lg px-3 py-1 text-xs font-medium ${currency === "MAD" ? "bg-white/10 text-foreground" : "text-muted-foreground"}`}>MAD</button>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-4xl font-bold neon-text">
                {format({ usd: template.price_usd_cents, mad: template.price_mad_cents })}
              </span>
              <span className="text-sm text-muted-foreground">{lang === "ar" ? "دفعة واحدة" : "one-time"}</span>
            </div>
            <button
              onClick={handleBuy}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[oklch(0.75_0.2_295)] to-[oklch(0.7_0.28_330)] px-4 py-3 text-sm font-semibold text-background neon-glow transition-transform hover:scale-[1.02]"
            >
              <Download className="h-4 w-4" />
              {lang === "ar" ? "شراء وتحميل فوري" : "Buy & Download"}
            </button>
            {template.demo_url && (
              <a
                href={template.demo_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-foreground hover:bg-white/10"
              >
                <ExternalLink className="h-4 w-4" />
                {lang === "ar" ? "معاينة حية" : "Live demo"}
              </a>
            )}
            <div className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
              <Download className="h-3.5 w-3.5" />
              {template.download_count} {lang === "ar" ? "تحميل" : "downloads"}
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}