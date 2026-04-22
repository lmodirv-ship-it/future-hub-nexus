import { createFileRoute } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { AdminGuard } from "@/components/nexus/AdminGuard";
import { useProjects } from "@/hooks/use-projects";
import { getIcon, GLOW_MAP, type GlowKey } from "@/lib/icon-map";

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

function ServicesPage() {
  return (
    <AdminGuard>
      <ServicesInner />
    </AdminGuard>
  );
}

function ServicesInner() {
  const { projects } = useProjects();
  return (
    <section className="relative mx-auto max-w-7xl px-6 pb-20 pt-32">
      <div className="mb-12 text-center">
        <h1 className="font-display text-4xl font-bold sm:text-5xl">
          كل <span className="neon-text">الخدمات</span> في مكان واحد
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
          نظرة شاملة على كل {projects.length} مشروعاً — جاهزة للاستخدام الفوري.
        </p>
      </div>

      <div className="space-y-6">
        {projects.map((p) => {
          const Icon = getIcon(p.icon);
          const glow: GlowKey = (p.glow as GlowKey) in GLOW_MAP ? (p.glow as GlowKey) : "violet";
          return (
            <div key={p.id} className="glass rounded-2xl p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${GLOW_MAP[glow]}`}>
                  <Icon className="h-5 w-5 text-background" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold">{p.name_ar}</h3>
                  <p className="text-xs text-muted-foreground">{p.category_label}</p>
                </div>
              </div>
              {p.description_ar && (
                <p className="flex items-start gap-2 rounded-lg bg-white/[0.03] px-3 py-2 text-sm text-muted-foreground">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-[oklch(0.85_0.18_200)]" />
                  <span>{p.description_ar}</span>
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}