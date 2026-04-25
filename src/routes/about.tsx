import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles, Layers, Globe, Zap } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { buildPageHead } from "@/lib/seo";

export const Route = createFileRoute("/about")({
  head: () => ({
    ...buildPageHead({
      basePath: "/about",
      lang: "ar",
      title: {
        ar: "عن المنصة — HN-Dev",
        en: "About — HN-Dev",
        fr: "À propos — HN-Dev",
      },
      description: {
        ar: "قصة منصة HN-Dev ورؤيتها لتوحيد كل المشاريع الرقمية في فضاء واحد.",
        en: "The story of HN-Dev and our vision to unify all digital projects in one space.",
        fr: "L'histoire de HN-Dev et notre vision pour unifier tous les projets numériques.",
      },
    }),
  }),
  component: AboutPage,
});

function AboutPage() {
  const { t } = useI18n();
  const values = [
    { icon: Layers, title: t("about.value.unify"), text: t("about.value.unify.text") },
    { icon: Sparkles, title: t("about.value.elegance"), text: t("about.value.elegance.text") },
    { icon: Zap, title: t("about.value.speed"), text: t("about.value.speed.text") },
    { icon: Globe, title: t("about.value.global"), text: t("about.value.global.text") },
  ];

  return (
    <section className="relative mx-auto max-w-4xl px-6 pb-20 pt-32">
      <div className="text-center">
        <h1 className="font-display text-5xl font-bold sm:text-6xl">
          {t("about.title.we")} <span className="neon-text">{t("about.title.brand")}</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          {t("about.lead")}
        </p>
      </div>

      <div className="mt-16 grid gap-4 sm:grid-cols-2">
        {values.map((v) => (
          <div key={v.title} className="glass card-hover rounded-2xl p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[oklch(0.75_0.2_295)] to-[oklch(0.7_0.28_330)] neon-glow">
              <v.icon className="h-6 w-6 text-background" />
            </div>
            <h3 className="mt-4 font-display text-xl font-bold">{v.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{v.text}</p>
          </div>
        ))}
      </div>

      <div className="glass mt-12 rounded-2xl p-8 text-center">
        <h2 className="font-display text-2xl font-bold">{t("about.vision.title")}</h2>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">{t("about.vision.text")}</p>
        <Link
          to="/projects"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[oklch(0.75_0.2_295)] to-[oklch(0.7_0.28_330)] px-6 py-3 font-medium text-background neon-glow transition-transform hover:scale-105"
        >
          {t("about.cta.explore")}
        </Link>
      </div>
    </section>
  );
}
