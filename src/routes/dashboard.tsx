import { createFileRoute, Link } from "@tanstack/react-router";
import { PROJECTS, CATEGORIES } from "@/data/projects";
import { Activity, Layers, Zap, Globe } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "لوحة التحكم — نكسس" },
      { name: "description", content: "نظرة عامة موحدة على كل مشاريعك مع إحصائيات وروابط سريعة." },
      { property: "og:title", content: "لوحة التحكم — نكسس" },
      { property: "og:description", content: "مركز قيادة موحد لكل مشاريعك." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const active = PROJECTS.filter((p) => p.url !== "#").length;
  const stats = [
    { icon: Layers, label: "إجمالي المشاريع", value: PROJECTS.length, color: "violet" },
    { icon: Zap, label: "نشط الآن", value: active, color: "cyan" },
    { icon: Activity, label: "الفئات", value: CATEGORIES.length - 1, color: "magenta" },
    { icon: Globe, label: "تغطية", value: "∞", color: "pink" },
  ] as const;

  const glowMap = {
    violet: "from-[oklch(0.65_0.25_290)] to-[oklch(0.7_0.28_330)]",
    cyan: "from-[oklch(0.85_0.18_200)] to-[oklch(0.65_0.25_290)]",
    magenta: "from-[oklch(0.7_0.28_330)] to-[oklch(0.78_0.22_350)]",
    pink: "from-[oklch(0.78_0.22_350)] to-[oklch(0.65_0.25_290)]",
  };

  return (
    <section className="relative mx-auto max-w-7xl px-6 pb-20 pt-32">
      <div className="mb-10">
        <h1 className="font-display text-4xl font-bold sm:text-5xl">
          <span className="neon-text">لوحة التحكم</span>
        </h1>
        <p className="mt-2 text-muted-foreground">نظرة بانورامية على منظومتك الرقمية بأكملها.</p>
      </div>

      <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="glass card-hover relative overflow-hidden rounded-2xl p-6">
            <div className={`absolute -top-10 -left-10 h-32 w-32 rounded-full bg-gradient-to-br ${glowMap[s.color]} opacity-20 blur-2xl`} />
            <s.icon className="h-6 w-6 text-[oklch(0.85_0.18_200)]" />
            <div className="mt-4 font-display text-4xl font-bold neon-text">{s.value}</div>
            <div className="mt-1 text-sm text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="glass rounded-2xl p-6">
        <h2 className="mb-5 font-display text-xl font-bold">روابط سريعة</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PROJECTS.map((p) => {
            const Icon = p.icon;
            return (
              <Link
                key={p.id}
                to="/projects/$slug"
                params={{ slug: p.slug }}
                className="group flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3 transition-all hover:border-[oklch(0.65_0.25_290)] hover:bg-white/5"
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${glowMap[p.glow]}`}>
                  <Icon className="h-5 w-5 text-background" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold">{p.nameAr}</div>
                  <div className="truncate text-xs text-muted-foreground">{p.categoryLabel}</div>
                </div>
                <span className={`h-2 w-2 rounded-full ${p.url !== "#" ? "bg-[oklch(0.85_0.18_200)] animate-pulse-glow" : "bg-muted"}`} />
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}