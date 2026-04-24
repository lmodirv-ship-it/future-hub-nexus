import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowRight, ExternalLink } from "lucide-react";
import { useProjects } from "@/hooks/use-projects";
import { getIcon, GLOW_MAP, type GlowKey } from "@/lib/icon-map";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/projects/$slug")({
  loader: async ({ params }) => {
    const { data } = await supabase
      .from("projects_public" as "projects")
      .select("name, name_ar, description, description_ar, category_label, slug, url")
      .eq("slug", params.slug)
      .maybeSingle();
    if (!data) throw notFound();
    return { project: data };
  },
  head: ({ loaderData, params }) => {
    const p = loaderData?.project;
    const title = p ? `${p.name_ar ?? p.name} — نكسس` : `${params.slug} — نكسس`;
    const desc = (p?.description_ar ?? p?.description ?? `تفاصيل مشروع ${params.slug}`).toString().slice(0, 160);
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: desc },
      ],
    };
  },
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

function ProjectDetail() {
  const { slug } = Route.useParams();
  const { projects, loading } = useProjects();
  const project = projects.find((p) => p.slug === slug);

  if (loading) {
    return <div className="mx-auto max-w-md px-6 pt-40 text-center text-muted-foreground">جارِ التحميل...</div>;
  }
  if (!project) {
    return (
      <div className="mx-auto max-w-md px-6 pt-40 text-center">
        <h1 className="font-display text-3xl font-bold">المشروع غير موجود</h1>
        <Link to="/projects" className="mt-4 inline-block text-[oklch(0.85_0.18_200)]">عودة للمشاريع</Link>
      </div>
    );
  }

  const Icon = getIcon(project.icon);
  const glow: GlowKey = (project.glow as GlowKey) in GLOW_MAP ? (project.glow as GlowKey) : "violet";
  const favicon = project.url !== "#"
    ? (() => { try { return `https://www.google.com/s2/favicons?domain=${new URL(project.url).hostname}&sz=256`; } catch { return null; } })()
    : null;
  const related = projects.filter((p) => p.category === project.category && p.id !== project.id).slice(0, 3);

  return (
    <section className="relative mx-auto max-w-5xl px-6 pb-20 pt-32">
      <Link to="/projects" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowRight className="h-4 w-4" />
        كل المشاريع
      </Link>

      <div className="glass relative overflow-hidden rounded-3xl p-8 sm:p-12">
        <div className={`absolute -top-32 -left-32 h-64 w-64 rounded-full bg-gradient-to-br ${GLOW_MAP[glow]} opacity-30 blur-3xl`} />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-start">
          <div className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${GLOW_MAP[glow]} text-background neon-glow`}>
            {favicon ? (
              <img src={favicon} alt={`${project.name_ar} logo`} className="h-12 w-12 rounded-lg object-contain" />
            ) : (
              <Icon className="h-10 w-10" />
            )}
          </div>
          <div className="flex-1">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-muted-foreground">
              {project.category_label}
            </span>
            <h1 className="mt-3 font-display text-4xl font-bold sm:text-5xl">{project.name_ar}</h1>
            <p className="mt-1 text-sm text-muted-foreground/70">{project.name}</p>
            <p className="mt-4 text-lg text-muted-foreground">{project.description_ar ?? ""}</p>
          </div>
        </div>

        {project.description && (
          <p className="relative mt-8 text-base leading-relaxed text-foreground/90">
            {project.description}
          </p>
        )}

        {project.url !== "#" && (
          <a
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`relative mt-10 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r ${GLOW_MAP[glow]} px-6 py-3 font-medium text-background neon-glow transition-transform hover:scale-105`}
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
              const RIcon = getIcon(r.icon);
              const rGlow: GlowKey = (r.glow as GlowKey) in GLOW_MAP ? (r.glow as GlowKey) : "violet";
              return (
                <Link
                  key={r.id}
                  to="/projects/$slug"
                  params={{ slug: r.slug }}
                  className="glass card-hover flex items-center gap-3 rounded-xl p-4"
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${GLOW_MAP[rGlow]}`}>
                    <RIcon className="h-5 w-5 text-background" />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold">{r.name_ar}</div>
                    <div className="truncate text-xs text-muted-foreground">{r.category_label}</div>
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