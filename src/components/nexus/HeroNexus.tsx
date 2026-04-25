import { Link } from "@tanstack/react-router";
import { Sparkles, ArrowLeft, Layers } from "lucide-react";
import { useProjects } from "@/hooks/use-projects";
import { useI18n } from "@/lib/i18n";

export function HeroNexus() {
  const { projects } = useProjects();
  const count = projects.length || 14;
  const { t } = useI18n();
  return (
    <section className="relative flex min-h-[92vh] items-center justify-center overflow-hidden px-6 pt-32">
      <div className="relative z-10 mx-auto max-w-5xl text-center">
        <div className="glass mx-auto mb-8 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[oklch(0.85_0.18_200)] opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[oklch(0.85_0.18_200)]" />
          </span>
          <span className="text-muted-foreground">{t("hero.badge", { n: count })}</span>
        </div>

        <h1 className="font-display text-5xl font-bold leading-tight tracking-tight sm:text-7xl md:text-8xl">
          <span className="block text-foreground">{t("hero.title1")}</span>
          <span className="block neon-text">{t("hero.title2")}</span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
          {t("hero.desc")}
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/projects"
            className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-[oklch(0.75_0.2_295)] to-[oklch(0.7_0.28_330)] px-6 py-3 font-medium text-background neon-glow transition-transform hover:scale-105"
          >
            <Layers className="h-5 w-5" />
            {t("hero.explore")}
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          </Link>
          <Link
            to="/admin"
            className="glass flex items-center gap-2 rounded-xl px-6 py-3 font-medium transition-colors hover:bg-white/10"
          >
            <Sparkles className="h-5 w-5 text-[oklch(0.85_0.18_200)]" />
            {t("hero.admin")}
          </Link>
        </div>

        {/* Stats */}
        <div className="mx-auto mt-16 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { v: count, l: t("stats.projects") },
            { v: "9", l: t("stats.categories") },
            { v: "50+", l: t("stats.services") },
            { v: "∞", l: t("stats.possibilities") },
          ].map((s, i) => (
            <div key={i} className="glass rounded-xl px-4 py-4 text-center animate-pulse-glow" style={{ animationDelay: `${i * 0.5}s` }}>
              <div className="font-display text-3xl font-bold neon-text">{s.v}</div>
              <div className="mt-1 text-xs text-muted-foreground">{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}