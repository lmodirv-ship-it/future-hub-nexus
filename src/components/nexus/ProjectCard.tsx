import { Link } from "@tanstack/react-router";
import { ArrowUpLeft, ExternalLink } from "lucide-react";
import type { ProjectRow } from "@/hooks/use-projects";
import { getIcon, GLOW_MAP, type GlowKey } from "@/lib/icon-map";
import { supabase } from "@/integrations/supabase/client";

function logVisit(projectId: string) {
  supabase.rpc("log_project_visit", { _project_id: projectId }).then(() => {});
}

export function ProjectCard({ project, index = 0 }: { project: ProjectRow; index?: number }) {
  const Icon = getIcon(project.icon);
  const glow: GlowKey = (project.glow as GlowKey) in GLOW_MAP ? (project.glow as GlowKey) : "violet";
  const favicon = project.url && project.url !== "#"
    ? (() => { try { return `https://www.google.com/s2/favicons?domain=${new URL(project.url).hostname}&sz=128`; } catch { return null; } })()
    : null;
  return (
    <article
      className="glass card-hover group relative overflow-hidden rounded-2xl p-6 animate-float"
      style={{ animationDelay: `${index * 0.15}s` }}
    >
      <div
        className={`absolute -top-20 -left-20 h-40 w-40 rounded-full bg-gradient-to-br ${GLOW_MAP[glow]} opacity-20 blur-3xl transition-opacity group-hover:opacity-40`}
      />
      <div className="relative flex items-start justify-between">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${GLOW_MAP[glow]} text-background shadow-lg`}
        >
          {favicon ? (
            <img
              src={favicon}
              alt={`${project.name_ar} logo`}
              className="h-7 w-7 rounded-md object-contain"
              loading={index < 4 ? "eager" : "lazy"}
              decoding="async"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            <Icon className="h-6 w-6" />
          )}
        </div>
        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-muted-foreground">
          {project.category_label}
        </span>
      </div>

      <h3 className="mt-5 font-display text-xl font-bold text-foreground">
        {project.name_ar}
      </h3>
      <p className="mt-1 text-xs text-muted-foreground/70">{project.name}</p>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground line-clamp-2">
        {project.description_ar ?? project.description ?? ""}
      </p>

      <div className="mt-6 flex items-center justify-between gap-2">
        <Link
          to="/projects/$slug"
          params={{ slug: project.slug }}
          className="flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5 text-xs font-medium transition-colors hover:bg-white/10"
        >
          التفاصيل
          <ArrowUpLeft className="h-3.5 w-3.5" />
        </Link>
        {project.url !== "#" ? (
          <a
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => logVisit(project.id)}
            className={`flex items-center gap-1.5 rounded-lg bg-gradient-to-r ${GLOW_MAP[glow]} px-3 py-1.5 text-xs font-medium text-background transition-transform hover:scale-105`}
          >
            افتح
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        ) : (
          <span className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-muted-foreground">
            قريباً
          </span>
        )}
      </div>
    </article>
  );
}