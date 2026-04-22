import { useMemo, useState } from "react";
import { useProjects } from "@/hooks/use-projects";
import { ProjectCard } from "./ProjectCard";
import { Search } from "lucide-react";

export function ProjectGrid({ showFilters = true, limit }: { showFilters?: boolean; limit?: number }) {
  const { projects, loading } = useProjects();
  const [cat, setCat] = useState<string>("all");
  const [q, setQ] = useState("");

  const categories = useMemo(() => {
    const map = new Map<string, string>();
    map.set("all", "كل المشاريع");
    projects.forEach((p) => map.set(p.category, p.category_label));
    return Array.from(map, ([value, label]) => ({ value, label }));
  }, [projects]);

  const filtered = useMemo(() => {
    const list = projects.filter((p) => {
      const inCat = cat === "all" || p.category === cat;
      const inQ = !q ||
        p.name_ar.includes(q) ||
        p.name.toLowerCase().includes(q.toLowerCase()) ||
        (p.description_ar ?? "").includes(q);
      return inCat && inQ;
    });
    return limit ? list.slice(0, limit) : list;
  }, [projects, cat, q, limit]);

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
            {categories.map((c) => (
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

      {filtered.length === 0 && !loading && (
        <div className="glass mx-auto mt-10 max-w-md rounded-2xl p-10 text-center">
          <p className="text-muted-foreground">لا توجد مشاريع مطابقة.</p>
        </div>
      )}
    </section>
  );
}