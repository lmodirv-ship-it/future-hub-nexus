import { createFileRoute, Link } from "@tanstack/react-router";
import { Activity, Bell, Clock, Globe, Shield, Sparkles, Zap } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/monitor")({
  head: () => ({
    meta: [
      { title: "مراقبة المواقع 24/7 — HN-Dev" },
      { name: "description", content: "راقب موقعك على مدار الساعة. تنبيهات فورية عند أي تعطل. ابدأ مجاناً." },
      { property: "og:title", content: "مراقبة المواقع — HN-Dev" },
      { property: "og:description", content: "راقب موقعك 24/7 مع تنبيهات فورية." },
    ],
  }),
  component: MonitorPage,
});

function MonitorPage() {
  const { lang } = useI18n();
  const features = lang === "ar" ? [
    { icon: Activity, title: "فحص كل دقيقة", desc: "نراقب موقعك من 5 مناطق جغرافية" },
    { icon: Bell, title: "تنبيهات فورية", desc: "بريد + WhatsApp في ثوانٍ من التعطل" },
    { icon: Clock, title: "زمن استجابة", desc: "نقيس سرعة موقعك ونرسم لك بياناً" },
    { icon: Shield, title: "شهادة SSL", desc: "ننبهك قبل انتهاء الشهادة بـ30 يوماً" },
    { icon: Globe, title: "متعدد اللغات", desc: "لوحة تحكم بالعربية والإنجليزية" },
    { icon: Zap, title: "API كامل", desc: "ادمج البيانات في تطبيقاتك" },
  ] : [
    { icon: Activity, title: "Check every minute", desc: "We monitor from 5 geo regions" },
    { icon: Bell, title: "Instant alerts", desc: "Email + WhatsApp seconds after downtime" },
    { icon: Clock, title: "Response time", desc: "Track speed with charts" },
    { icon: Shield, title: "SSL certificate", desc: "Alert 30 days before expiry" },
    { icon: Globe, title: "Bilingual", desc: "Arabic & English dashboard" },
    { icon: Zap, title: "Full API", desc: "Integrate data into your apps" },
  ];

  return (
    <>
      <section className="relative mx-auto max-w-5xl px-6 pb-20 pt-32 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5" />
          {lang === "ar" ? "خدمة جديدة من HN-Dev" : "New from HN-Dev"}
        </div>
        <h1 className="font-display text-5xl font-bold leading-tight sm:text-6xl">
          {lang === "ar" ? "موقعك " : "Your site, "}
          <span className="neon-text">{lang === "ar" ? "أونلاين دائماً" : "always online"}</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
          {lang === "ar"
            ? "نراقب موقعك 24/7 من 5 مناطق جغرافية. تنبيهات فورية بالبريد و WhatsApp قبل أن يلاحظ زبائنك أي مشكلة."
            : "We monitor your site 24/7 from 5 geo regions. Instant Email + WhatsApp alerts before your customers notice."}
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/pricing"
            className="rounded-xl bg-gradient-to-r from-[oklch(0.75_0.2_295)] to-[oklch(0.7_0.28_330)] px-6 py-3 text-sm font-semibold text-background neon-glow transition-transform hover:scale-105"
          >
            {lang === "ar" ? "اعرض الخطط" : "View pricing"}
          </Link>
          <Link
            to="/contact"
            className="rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-medium text-foreground hover:bg-white/10"
          >
            {lang === "ar" ? "تحدث مع المبيعات" : "Talk to sales"}
          </Link>
        </div>
      </section>

      <section className="relative mx-auto max-w-6xl px-6 pb-24">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="glass rounded-2xl p-6">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[oklch(0.75_0.2_295)] to-[oklch(0.7_0.28_330)]">
                <f.icon className="h-5 w-5 text-background" />
              </div>
              <h3 className="font-display text-lg font-bold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}