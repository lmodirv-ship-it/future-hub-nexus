import { createFileRoute } from "@tanstack/react-router";
import { PROJECTS } from "@/data/projects";
import { Check } from "lucide-react";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "الخدمات — نكسس" },
      { name: "description", content: "عرض موحد لكل الخدمات المُجمَّعة من 14 مشروعاً." },
      { property: "og:title", content: "الخدمات — نكسس" },
      { property: "og:description", content: "كل خدمات منظومتك في مكان واحد." },
    ],
  }),
  component: ServicesPage,
});

const glowMap = {
  violet: "from-[oklch(0.65_0.25_290)] to-[oklch(0.7_0.28_330)]",
  cyan: "from-[oklch(0.85_0.18_200)] to-[oklch(0.65_0.25_290)]",
  magenta: "from-[oklch(0.7_0.28_330)] to-[oklch(0.78_0.22_350)]",
  pink: "from-[oklch(0.78_0.22_350)] to-[oklch(0.65_0.25_290)]",
} as const;

function ServicesPage() {
  return (
    <section className="relative mx-auto max-w-7xl px-6 pb-20 pt-32">
      <div className="mb-12 text-center">
        <h1 className="font-display text-4xl font-bold sm:text-5xl">
          كل <span className="neon-text">الخدمات</span> في مكان واحد
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
          أكثر من 50 خدمة مُجمَّعة من 14 مشروعاً — جاهزة للاستخدام الفوري.
        </p>
      </div>

      <div className="space-y-6">
        {PROJECTS.map((p) => {
          const Icon = p.icon;
          return (
            <div key={p.id} className="glass rounded-2xl p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${glowMap[p.glow]}`}>
                  <Icon className="h-5 w-5 text-background" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold">{p.nameAr}</h3>
                  <p className="text-xs text-muted-foreground">{p.categoryLabel}</p>
                </div>
              </div>
              <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 rounded-lg bg-white/[0.03] px-3 py-2 text-sm">
                    <Check className="h-4 w-4 shrink-0 text-[oklch(0.85_0.18_200)]" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}