import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Github, GitCommit, Sparkles, ExternalLink, Loader2 } from "lucide-react";
import { listCommits, getRepoInfo, installAdSense } from "@/lib/github.functions";

type Project = {
  id: string;
  name: string;
  lovable_project_id: string;
  notes: string | null;
  adsense_installed: boolean;
  adstxt_installed: boolean;
};

export const Route = createFileRoute("/admin/github-sync")({
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/login" });
  },
  component: GitHubSyncPage,
});

function repoFromNotes(notes: string | null): string | null {
  if (!notes) return null;
  const m = notes.match(/repo:([^\s]+)/);
  return m ? m[1] : null;
}

function GitHubSyncPage() {
  const [rows, setRows] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<Record<string, string>>({});
  const [output, setOutput] = useState<Record<string, string>>({});
  const fetchCommits = useServerFn(listCommits);
  const fetchInfo = useServerFn(getRepoInfo);
  const fetchInstall = useServerFn(installAdSense);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("lovable_projects")
        .select("id, name, lovable_project_id, notes, adsense_installed, adstxt_installed")
        .order("sort_order");
      setRows((data ?? []) as Project[]);
      setLoading(false);
    })();
  }, []);

  async function inspect(id: string, repo: string) {
    setBusy((b) => ({ ...b, [id]: "fetch" }));
    try {
      const info = await fetchInfo({ data: { repo } });
      const commits = await fetchCommits({ data: { repo, branch: info.default_branch, limit: 5 } });
      setOutput((o) => ({
        ...o,
        [id]: `Branch: ${info.default_branch} · Last push: ${new Date(info.pushed_at).toLocaleString()}\n\n` +
          commits.commits.map((c) => `${c.sha} — ${c.message} (${c.author ?? ""})`).join("\n"),
      }));
    } catch (e) {
      setOutput((o) => ({ ...o, [id]: `❌ ${e instanceof Error ? e.message : String(e)}` }));
    } finally {
      setBusy((b) => ({ ...b, [id]: "" }));
    }
  }

  async function install(id: string, repo: string) {
    setBusy((b) => ({ ...b, [id]: "install" }));
    try {
      const r = await fetchInstall({ data: { repo, branch: "main" } });
      setOutput((o) => ({ ...o, [id]: "✅ AdSense:\n" + Object.entries(r.results).map(([k, v]) => `• ${k}: ${v}`).join("\n") }));
    } catch (e) {
      setOutput((o) => ({ ...o, [id]: `❌ ${e instanceof Error ? e.message : String(e)}` }));
    } finally {
      setBusy((b) => ({ ...b, [id]: "" }));
    }
  }

  return (
    <AdminLayout
      title="GitHub Sync"
      subtitle="إدارة كود المشاريع عبر GitHub: عرض آخر commits + تثبيت AdSense تلقائياً (يتطلب ربط الريبو في حقل ملاحظات المشروع بصيغة repo:owner/repo)."
    >
      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> تحميل...</div>
      ) : (
        <div className="grid gap-4">
          {rows.map((r) => {
            const repo = repoFromNotes(r.notes);
            return (
              <div key={r.id} className="glass rounded-xl p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Github className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-display font-bold">{r.name}</div>
                      <div className="text-xs text-muted-foreground">{repo ?? "لا يوجد ريبو مربوط — أضف إلى ملاحظات المشروع: repo:owner/name"}</div>
                    </div>
                  </div>
                  {repo && (
                    <div className="flex flex-wrap items-center gap-2">
                      <a href={`https://github.com/${repo}`} target="_blank" rel="noreferrer" className="rounded-lg border border-white/10 px-3 py-1.5 text-xs hover:bg-white/5">
                        <ExternalLink className="inline h-3 w-3 mr-1" /> فتح
                      </a>
                      <button
                        disabled={!!busy[r.id]}
                        onClick={() => inspect(r.id, repo)}
                        className="rounded-lg border border-white/10 px-3 py-1.5 text-xs hover:bg-white/5 disabled:opacity-50"
                      >
                        {busy[r.id] === "fetch" ? <Loader2 className="inline h-3 w-3 animate-spin mr-1" /> : <GitCommit className="inline h-3 w-3 mr-1" />}
                        آخر commits
                      </button>
                      <button
                        disabled={!!busy[r.id]}
                        onClick={() => install(r.id, repo)}
                        className="rounded-lg bg-gradient-to-r from-[oklch(0.65_0.25_290)] to-[oklch(0.7_0.28_330)] px-3 py-1.5 text-xs font-semibold text-background disabled:opacity-50"
                      >
                        {busy[r.id] === "install" ? <Loader2 className="inline h-3 w-3 animate-spin mr-1" /> : <Sparkles className="inline h-3 w-3 mr-1" />}
                        تثبيت AdSense تلقائياً
                      </button>
                    </div>
                  )}
                </div>
                {output[r.id] && (
                  <pre className="mt-3 max-h-64 overflow-auto rounded-lg bg-black/40 p-3 text-[11px] leading-relaxed whitespace-pre-wrap">{output[r.id]}</pre>
                )}
              </div>
            );
          })}
        </div>
      )}
    </AdminLayout>
  );
}