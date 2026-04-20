import { useMemo, useState } from "react";
import { PROJECTS, CATEGORIES, type ProjectCategory } from "@/data/projects";
import { ProjectCard } from "./ProjectCard";
import { Search } from "lucide-react";

export function ProjectGrid({ showFilters = true }: { showFilters?: boolean }) {
  const [cat, setCat] = useState<ProjectCategory | "all">("all");
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    return PROJECTS.filter((p) => {
      const inCat = cat === "all" || p.category === cat;
      const inQ = !q ||
        p.nameAr.includes(q) ||
        p.name.toLowerCase().includes(q.toLowerCase()) ||
        p.tagline.includes(q);
      return inCat && inQ;
    });
  }, [cat, q]);

  return (
    <section className="relative">
      {showFilters && (
        <div className="mb-8 space-y-4">
          <div className="glass mx-auto flex max-w-xl items-center gap-2 rounded-xl px-4 py-2.5">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="ابحث عن مشروع..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c.value}
                onClick={() => setCat(c.value)}
                className={`rounded-full border px-4 py-1.5 text-xs font-medium transition-all ${
                  cat === c.value
                    ? "border-transparent bg-gradient-to-r from-[oklch(0.75_0.2_295)] to-[oklch(0.7_0.28_330)] text-background neon-glow"
                    : "border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((p, i) => (
          <ProjectCard key={p.id} project={p} index={i % 4} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="glass mx-auto mt-10 max-w-md rounded-2xl p-10 text-center">
          <p className="text-muted-foreground">لا توجد مشاريع مطابقة.</p>
        </div>
      )}
    </section>
  );
}