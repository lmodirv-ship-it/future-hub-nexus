import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowRight, ExternalLink, Check } from "lucide-react";
import { getProjectBySlug, PROJECTS, type NexusProject } from "@/data/projects";

export const Route = createFileRoute("/projects/$slug")({
  loader: ({ params }) => {
    const project = getProjectBySlug(params.slug);
    if (!project) throw notFound();
    return { project };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.project.nameAr} — نكسس` },
          { name: "description", content: loaderData.project.description },
          { property: "og:title", content: loaderData.project.nameAr },
          { property: "og:description", content: loaderData.project.description },
        ]
      : [],
  }),
  notFoundComponent: () => (
    <div className="mx-auto max-w-md px-6 pt-40 text-center">
      <h1 className="font-display text-3xl font-bold">المشروع غير موجود</h1>
      <Link to="/projects" className="mt-4 inline-block text-[oklch(0.85_0.18_200)]">عودة للمشاريع</Link>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-md px-6 pt-40 text-center">
      <p className="text-destructive">{error.message}</p>
    </div>
  ),
  component: ProjectDetail,
});

const glowMap = {
  violet: "from-[oklch(0.65_0.25_290)] to-[oklch(0.7_0.28_330)]",
  cyan: "from-[oklch(0.85_0.18_200)] to-[oklch(0.65_0.25_290)]",
  magenta: "from-[oklch(0.7_0.28_330)] to-[oklch(0.78_0.22_350)]",
  pink: "from-[oklch(0.78_0.22_350)] to-[oklch(0.65_0.25_290)]",
} as const;

function ProjectDetail() {
  const { project } = Route.useLoaderData() as { project: NexusProject };
  const Icon = project.icon;
  const related = PROJECTS.filter((p) => p.category === project.category && p.id !== project.id).slice(0, 3);

  return (
    <section className="relative mx-auto max-w-5xl px-6 pb-20 pt-32">
      <Link to="/projects" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowRight className="h-4 w-4" />
        كل المشاريع
      </Link>

      <div className="glass relative overflow-hidden rounded-3xl p-8 sm:p-12">
        <div className={`absolute -top-32 -left-32 h-64 w-64 rounded-full bg-gradient-to-br ${glowMap[project.glow]} opacity-30 blur-3xl`} />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-start">
          <div className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${glowMap[project.glow]} text-background neon-glow`}>
            <Icon className="h-10 w-10" />
          </div>
          <div className="flex-1">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-muted-foreground">
              {project.categoryLabel}
            </span>
            <h1 className="mt-3 font-display text-4xl font-bold sm:text-5xl">{project.nameAr}</h1>
            <p className="mt-1 text-sm text-muted-foreground/70">{project.name}</p>
            <p className="mt-4 text-lg text-muted-foreground">{project.tagline}</p>
          </div>
        </div>

        <p className="relative mt-8 text-base leading-relaxed text-foreground/90">
          {project.description}
        </p>

        <div className="relative mt-10">
          <h2 className="font-display text-xl font-semibold">المميزات الرئيسية</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {project.features.map((f) => (
              <li key={f} className="glass flex items-center gap-3 rounded-xl px-4 py-3">
                <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${glowMap[project.glow]}`}>
                  <Check className="h-4 w-4 text-background" />
                </div>
                <span className="text-sm">{f}</span>
              </li>
            ))}
          </ul>
        </div>

        {project.url !== "#" && (
          <a
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`relative mt-10 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r ${glowMap[project.glow]} px-6 py-3 font-medium text-background neon-glow transition-transform hover:scale-105`}
          >
            افتح المشروع
            <ExternalLink className="h-4 w-4" />
          </a>
        )}
      </div>

      {related.length > 0 && (
        <div className="mt-12">
          <h2 className="mb-5 font-display text-2xl font-bold">مشاريع <span className="neon-text">مشابهة</span></h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {related.map((r) => {
              const RIcon = r.icon;
              return (
                <Link
                  key={r.id}
                  to="/projects/$slug"
                  params={{ slug: r.slug }}
                  className="glass card-hover flex items-center gap-3 rounded-xl p-4"
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${glowMap[r.glow]}`}>
                    <RIcon className="h-5 w-5 text-background" />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold">{r.nameAr}</div>
                    <div className="truncate text-xs text-muted-foreground">{r.tagline}</div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}