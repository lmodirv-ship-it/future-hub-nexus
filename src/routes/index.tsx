import { createFileRoute, Link } from "@tanstack/react-router";
import { HeroNexus } from "@/components/nexus/HeroNexus";
import { ProjectGrid } from "@/components/nexus/ProjectGrid";
import { ArrowLeft } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { buildPageHead } from "@/lib/seo";

export const Route = createFileRoute("/")({
  head: () => ({
    ...buildPageHead({
      basePath: "/",
      lang: "ar",
      title: {
        ar: "HN-Dev — مركز التحكم لكل مشاريعك",
        en: "HN-Dev — Control hub for all your digital projects",
        fr: "HN-Dev — Centre de contrôle pour tous vos projets numériques",
      },
      description: {
        ar: "منصة زجاجية من المستقبل تجمع 14 مشروعاً رقمياً في فضاء واحد. AI، تجارة، عقارات، نقل، خدمات.",
        en: "A futuristic glass platform that unites 14 digital projects in one space. AI, commerce, real estate, transport, services.",
        fr: "Une plateforme en verre futuriste qui réunit 14 projets numériques. IA, commerce, immobilier, transport, services.",
      },
    }),
  }),
  component: Index,
});

function Index() {
  const { t } = useI18n();
  return (
    <>
      <HeroNexus />
      <section className="relative mx-auto max-w-7xl px-6 py-20">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <h2 className="font-display text-3xl font-bold sm:text-4xl">
              <span className="neon-text">{t("home.activeTitle")}</span> {t("home.activePrefix")}
            </h2>
            <p className="mt-2 text-muted-foreground">{t("home.activeDesc")}</p>
          </div>
          <Link
            to="/projects"
            className="hidden items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground sm:flex"
          >
            {t("home.viewAll")}
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>
        <ProjectGrid showFilters={false} />
      </section>
    </>
  );
}
