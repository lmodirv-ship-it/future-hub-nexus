import { createFileRoute, Link } from "@tanstack/react-router";
import { HeroNexus } from "@/components/nexus/HeroNexus";
import { ProjectGrid } from "@/components/nexus/ProjectGrid";
import { ArrowLeft } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "HN-Dev — مركز التحكم لكل مشاريعك" },
      { name: "description", content: "منصة زجاجية من المستقبل تجمع 14 مشروعاً رقمياً في فضاء واحد." },
      { property: "og:title", content: "HN-Dev — كل مشاريعك في مكان واحد" },
      { property: "og:description", content: "AI، تجارة، عقارات، نقل، خدمات — كل شيء في منصة واحدة." },
    ],
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
