import { createFileRoute } from "@tanstack/react-router";
import { ProjectGrid } from "@/components/nexus/ProjectGrid";
import { AdminGuard } from "@/components/nexus/AdminGuard";

export const Route = createFileRoute("/projects")({
  head: () => ({
    meta: [
      { title: "المشاريع — HN-Dev" },
      { name: "description", content: "تصفح كل المشاريع الـ 14 مع فلترة بالفئة وبحث فوري." },
      { property: "og:title", content: "المشاريع — HN-Dev" },
      { property: "og:description", content: "14 مشروعاً رقمياً في فضاء زجاجي واحد." },
    ],
  }),
  component: ProjectsPage,
});

function ProjectsPage() {
  return (
    <AdminGuard>
      <ProjectsInner />
    </AdminGuard>
  );
}

function ProjectsInner() {
  return (
    <section className="relative mx-auto max-w-7xl px-6 pb-20 pt-32">
      <div className="mb-12 text-center">
        <h1 className="font-display text-4xl font-bold sm:text-5xl">
          استكشف <span className="neon-text">كل المشاريع</span>
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          فلتر حسب الفئة، ابحث بالاسم، أو افتح أي مشروع مباشرة.
        </p>
      </div>
      <ProjectGrid />
    </section>
  );
}