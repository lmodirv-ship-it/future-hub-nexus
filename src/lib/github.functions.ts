import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const GH = "https://api.github.com";

function admin() {
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient<Database>(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

async function ensureAdmin(sb: ReturnType<typeof admin>, userId: string) {
  const { data, error } = await sb.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("forbidden");
}

function ghHeaders(): HeadersInit {
  const token = process.env.GITHUB_PAT;
  if (!token) throw new Error("GITHUB_PAT not configured");
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "HN-Dev-Control-Hub",
  };
}

function parseRepo(input: string): { owner: string; repo: string } {
  // Accepts "owner/repo" or full URL
  const m = input.match(/(?:github\.com\/)?([^/\s]+)\/([^/\s.]+)(?:\.git)?$/);
  if (!m) throw new Error("invalid repo: " + input);
  return { owner: m[1], repo: m[2] };
}

/* List recent commits */
const listSchema = z.object({ repo: z.string().min(3), branch: z.string().default("main"), limit: z.number().min(1).max(20).default(5) });
export const listCommits = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => listSchema.parse(i))
  .handler(async ({ data, context }) => {
    await ensureAdmin(admin(), context.userId);
    const { owner, repo } = parseRepo(data.repo);
    const r = await fetch(`${GH}/repos/${owner}/${repo}/commits?sha=${encodeURIComponent(data.branch)}&per_page=${data.limit}`, { headers: ghHeaders() });
    if (!r.ok) throw new Error(`github ${r.status}`);
    const arr = (await r.json()) as Array<{ sha: string; commit: { message: string; author: { name: string; date: string } }; html_url: string }>;
    return { commits: arr.map((c) => ({ sha: c.sha.slice(0, 7), message: c.commit.message.split("\n")[0].slice(0, 120), author: c.commit.author?.name, date: c.commit.author?.date, url: c.html_url })) };
  });

/* Get default branch + last commit info */
const repoInfoSchema = z.object({ repo: z.string().min(3) });
export const getRepoInfo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => repoInfoSchema.parse(i))
  .handler(async ({ data, context }) => {
    await ensureAdmin(admin(), context.userId);
    const { owner, repo } = parseRepo(data.repo);
    const r = await fetch(`${GH}/repos/${owner}/${repo}`, { headers: ghHeaders() });
    if (!r.ok) throw new Error(`github ${r.status}`);
    const j = (await r.json()) as { default_branch: string; pushed_at: string; html_url: string; private: boolean };
    return { default_branch: j.default_branch, pushed_at: j.pushed_at, html_url: j.html_url, private: j.private };
  });

/* Helper: get file (returns sha+content or null) */
async function getFile(owner: string, repo: string, path: string, branch: string) {
  const r = await fetch(`${GH}/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}?ref=${encodeURIComponent(branch)}`, { headers: ghHeaders() });
  if (r.status === 404) return null;
  if (!r.ok) throw new Error(`github get ${path}: ${r.status}`);
  const j = (await r.json()) as { sha: string; content: string; encoding: string };
  const content = j.encoding === "base64" ? Buffer.from(j.content, "base64").toString("utf8") : j.content;
  return { sha: j.sha, content };
}

async function putFile(owner: string, repo: string, path: string, branch: string, message: string, content: string, sha?: string) {
  const r = await fetch(`${GH}/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}`, {
    method: "PUT",
    headers: { ...(ghHeaders() as Record<string, string>), "Content-Type": "application/json" },
    body: JSON.stringify({ message, branch, content: Buffer.from(content, "utf8").toString("base64"), sha }),
  });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(`github put ${path}: ${r.status} ${t.slice(0, 200)}`);
  }
  return r.json();
}

const ADS_TXT = "google.com, pub-3443455318197857, DIRECT, f08c47fec0942fa0\n";
const ADSENSE_TAG = `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3443455318197857" crossorigin="anonymous"></script>`;

/* Inject ads.txt + AdSense script tag into a repo */
const injectSchema = z.object({ repo: z.string().min(3), branch: z.string().default("main") });
export const installAdSense = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => injectSchema.parse(i))
  .handler(async ({ data, context }) => {
    await ensureAdmin(admin(), context.userId);
    const { owner, repo } = parseRepo(data.repo);
    const branch = data.branch;
    const results: Record<string, string> = {};

    // 1. ads.txt
    const existingAds = await getFile(owner, repo, "public/ads.txt", branch);
    if (!existingAds || existingAds.content.trim() !== ADS_TXT.trim()) {
      await putFile(owner, repo, "public/ads.txt", branch, "chore: add ads.txt for AdSense", ADS_TXT, existingAds?.sha);
      results.ads_txt = "updated";
    } else {
      results.ads_txt = "already correct";
    }

    // 2. Inject AdSense into __root.tsx (or index.html as fallback)
    const rootPath = "src/routes/__root.tsx";
    const root = await getFile(owner, repo, rootPath, branch);
    if (root) {
      if (root.content.includes("pagead2.googlesyndication.com")) {
        results.adsense_script = "already present in __root.tsx";
      } else {
        // Inject inside <head> via scripts array if present, else append meta tag in JSX
        // Strategy: find `scripts: [` head config or add a raw <script> element via dangerouslySetInnerHTML in head
        const injection = `\n      {\n        type: "script",\n        async: true,\n        src: "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3443455318197857",\n        crossOrigin: "anonymous",\n      },`;
        let updated = root.content;
        const scriptsRegex = /scripts:\s*\[/;
        if (scriptsRegex.test(updated)) {
          updated = updated.replace(scriptsRegex, (m) => `${m}${injection}`);
        } else {
          // Fallback: add comment marker; user may need manual touch
          results.adsense_script = "could not auto-inject — add manually to __root.tsx head";
        }
        if (updated !== root.content) {
          await putFile(owner, repo, rootPath, branch, "chore: enable Google AdSense", updated, root.sha);
          results.adsense_script = "injected into __root.tsx";
        }
      }
    } else {
      // Fallback: index.html
      const idx = await getFile(owner, repo, "index.html", branch);
      if (idx) {
        if (idx.content.includes("pagead2.googlesyndication.com")) {
          results.adsense_script = "already present in index.html";
        } else {
          const updated = idx.content.replace(/<\/head>/i, `  ${ADSENSE_TAG}\n  </head>`);
          if (updated !== idx.content) {
            await putFile(owner, repo, "index.html", branch, "chore: enable Google AdSense", updated, idx.sha);
            results.adsense_script = "injected into index.html";
          } else {
            results.adsense_script = "no </head> found";
          }
        }
      } else {
        results.adsense_script = "no __root.tsx or index.html found";
      }
    }

    // 3. Mark in lovable_projects
    const sb = admin();
    await sb.from("lovable_projects").update({
      adsense_installed: results.adsense_script?.includes("injected") || results.adsense_script?.includes("already") || false,
      adstxt_installed: true,
    }).eq("notes", `repo:${data.repo}`).then(() => undefined).catch(() => undefined);

    return { ok: true, results };
  });