import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Newspaper, CheckCircle2, Circle, ExternalLink, Sparkles } from "lucide-react";
import { AdminGuard } from "@/components/nexus/AdminGuard";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { CopySnippet } from "@/components/admin/CopySnippet";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/hnchat-kit")({
  head: () => ({
    meta: [
      { title: "hnChat Blog Kit — HN-Dev" },
      { name: "description", content: "حزمة ربط جميع المواقع بمدونة hnChat: عرض المقالات + نشر اختياري." },
    ],
  }),
  component: () => (<AdminGuard><HnChatKit /></AdminGuard>),
});

const HUB_URL = "https://hn-chat.com/api/public/articles";

const READER_COMPONENT_SNIPPET = `// src/components/HnChatArticles.tsx
// عرض مقالات hnChat في أي صفحة. لا يمسّ أي ملف موجود.
import { useEffect, useState } from "react";

type Article = {
  id: string;
  title: string;
  slug?: string;
  short_description?: string;
  featured_image?: string;
  language?: string;
  tags?: string[];
  source_url?: string;
  published_at?: string;
};

export function HnChatArticles({ limit = 12, lang }: { limit?: number; lang?: string }) {
  const [items, setItems] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const url = new URL("${HUB_URL}");
    url.searchParams.set("limit", String(limit));
    if (lang) url.searchParams.set("language", lang);
    fetch(url.toString())
      .then(r => r.json())
      .then(d => setItems(Array.isArray(d) ? d : (d?.articles ?? [])))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [limit, lang]);

  if (loading) return <div className="py-8 text-center text-muted-foreground">جاري التحميل…</div>;
  if (!items.length) return <div className="py-8 text-center text-muted-foreground">لا توجد مقالات بعد.</div>;

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {items.map(a => (
        <a
          key={a.id}
          href={a.source_url || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="group rounded-xl border border-white/10 bg-white/5 overflow-hidden hover:border-white/20 transition"
        >
          {a.featured_image && (
            <img src={a.featured_image} alt={a.title} className="h-40 w-full object-cover" loading="lazy" />
          )}
          <div className="p-4">
            <h3 className="font-semibold leading-snug group-hover:text-primary">{a.title}</h3>
            {a.short_description && (
              <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{a.short_description}</p>
            )}
          </div>
        </a>
      ))}
    </div>
  );
}
`;

const BLOG_PAGE_SNIPPET = `// src/routes/blog.tsx
// صفحة مدونة كاملة جاهزة للمواقع التي ليس لديها blog. لا تعدّل أي ملف موجود.
import { createFileRoute } from "@tanstack/react-router";
import { HnChatArticles } from "@/components/HnChatArticles";

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: "المدونة" },
      { name: "description", content: "آخر المقالات من شبكة hnChat." },
    ],
  }),
  component: BlogPage,
});

function BlogPage() {
  return (
    <main className="container mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">المدونة</h1>
      <p className="text-muted-foreground mb-8">آخر المقالات من شبكة hnChat.</p>
      <HnChatArticles limit={24} lang="ar" />
    </main>
  );
}
`;

const NAV_LINK_SNIPPET = `<Link to="/blog">المدونة</Link>`;

const PUBLISHER_SNIPPET = `// src/lib/hnchat-publish.ts
// استدعِ هذه الدالة بعد إنشاء أي مقال جديد لإرساله إلى hnChat.
// ضع HNCHAT_BLOG_SECRET في secrets الموقع، واستدعها من server function فقط.

export async function publishToHnChat(article: {
  title: string;
  short_description: string;
  content: string;
  featured_image?: string;
  language?: string;
  tags?: string[];
  source_project: string;   // اسم هذا الموقع، مثلاً "souk-hn"
  external_id: string;      // id المقال في قاعدة بيانات هذا الموقع
  source_url: string;       // https://<this-site>.lovable.app/blog/<slug>
}) {
  const secret = process.env.HNCHAT_BLOG_SECRET;
  if (!secret) throw new Error("HNCHAT_BLOG_SECRET غير مضبوط");

  const res = await fetch("${HUB_URL}", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-blog-secret": secret,
    },
    body: JSON.stringify({ language: "ar", ...article }),
  });
  if (!res.ok) throw new Error(\`hnChat publish failed: \${res.status}\`);
  return res.json();
}
`;

const LOVABLE_PROMPT_HAS_BLOG = `أضف عرض مقالات hnChat إلى صفحة المدونة الموجودة في هذا الموقع — بدون حذف أو تعديل أي شيء قائم.

1) أنشئ ملفاً جديداً src/components/HnChatArticles.tsx بمحتوى المكوّن المرفق.
2) في صفحة المدونة الحالية فقط، أضف <HnChatArticles limit={12} lang="ar" /> داخل قسم جديد أسفل المقالات الموجودة، دون تعديل أي شيء آخر.
3) لا تمسّ أي route، layout، أو navigation.`;

const LOVABLE_PROMPT_NO_BLOG = `أضف صفحة مدونة جديدة لهذا الموقع — بدون حذف أو تعديل أي شيء قائم.

1) أنشئ ملف src/components/HnChatArticles.tsx بمحتوى المكوّن المرفق.
2) أنشئ ملف src/routes/blog.tsx بمحتوى صفحة المدونة المرفقة.
3) في القائمة الرئيسية فقط، أضف رابطاً جديداً <Link to="/blog">المدونة</Link> بجانب الروابط الموجودة، دون حذف أو تعديل أي رابط.
4) لا تعدّل أي صفحة أو ملف آخر.`;

type Row = {
  id: string; name: string; lovable_project_id: string;
  lovable_url: string | null; published_url: string | null;
  has_blog: boolean; hnchat_kit_installed: boolean; sort_order: number;
};

function HnChatKit() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("lovable_projects")
      .select("id, name, lovable_project_id, lovable_url, published_url, has_blog, hnchat_kit_installed, sort_order")
      .order("sort_order");
    setRows((data ?? []) as Row[]);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function toggle(id: string, field: "has_blog" | "hnchat_kit_installed", value: boolean) {
    await supabase.from("lovable_projects").update({ [field]: value } as never).eq("id", id);
    setRows(rs => rs.map(r => r.id === id ? { ...r, [field]: value } : r));
  }

  return (
    <AdminLayout title="hnChat Blog Kit" subtitle="ربط جميع المواقع بمدونة hnChat — إضافي فقط، بدون حذف.">
      <div className="space-y-8">
        {/* Step 1 */}
        <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
          <h2 className="mb-2 flex items-center gap-2 text-lg font-semibold">
            <Newspaper className="h-5 w-5 text-primary" /> 1) مكوّن قارئ المقالات (لجميع المواقع)
          </h2>
          <p className="mb-3 text-sm text-muted-foreground">
            ألصقه كـ <code className="text-emerald-300">src/components/HnChatArticles.tsx</code>. يجلب من{" "}
            <a href={HUB_URL} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
              {HUB_URL} <ExternalLink className="h-3 w-3" />
            </a>
          </p>
          <CopySnippet value={READER_COMPONENT_SNIPPET} />
        </section>

        {/* Step 2 */}
        <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
          <h2 className="mb-2 text-lg font-semibold">2) صفحة blog كاملة (للمواقع التي لا تحتوي على مدونة)</h2>
          <p className="mb-3 text-sm text-muted-foreground">
            ألصقها كـ <code className="text-emerald-300">src/routes/blog.tsx</code>. ثم أضف الرابط أدناه إلى القائمة.
          </p>
          <CopySnippet value={BLOG_PAGE_SNIPPET} />
          <div className="mt-3">
            <CopySnippet value={NAV_LINK_SNIPPET} label="رابط القائمة" />
          </div>
        </section>

        {/* Step 3 */}
        <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
          <h2 className="mb-2 text-lg font-semibold">3) (اختياري) ناشر تلقائي إلى hnChat</h2>
          <p className="mb-3 text-sm text-muted-foreground">
            ضع <code className="text-emerald-300">HNCHAT_BLOG_SECRET</code> في secrets كل موقع، ثم استدعِ{" "}
            <code className="text-emerald-300">publishToHnChat()</code> من server function عند نشر مقال جديد.
          </p>
          <CopySnippet value={PUBLISHER_SNIPPET} />
        </section>

        {/* Prompts */}
        <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
          <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
            <Sparkles className="h-5 w-5 text-primary" /> Prompts جاهزة للصق في كل موقع Lovable
          </h2>
          <div className="grid gap-4 lg:grid-cols-2">
            <div>
              <CopySnippet value={LOVABLE_PROMPT_HAS_BLOG} label="موقع لديه blog بالفعل" />
            </div>
            <div>
              <CopySnippet value={LOVABLE_PROMPT_NO_BLOG} label="موقع بدون blog" />
            </div>
          </div>
        </section>

        {/* Status table */}
        <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
          <h2 className="mb-3 text-lg font-semibold">حالة المشاريع</h2>
          {loading ? (
            <div className="py-6 text-center text-muted-foreground">جاري التحميل…</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-right text-xs text-muted-foreground">
                  <tr className="border-b border-white/10">
                    <th className="py-2">الموقع</th>
                    <th className="py-2 text-center">يحتوي على blog</th>
                    <th className="py-2 text-center">تم تركيب الحزمة</th>
                    <th className="py-2 text-center">رابط</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(r => {
                    const url = r.published_url || r.lovable_url;
                    return (
                      <tr key={r.id} className="border-b border-white/5">
                        <td className="py-2">{r.name}</td>
                        <td className="py-2 text-center">
                          <button onClick={() => toggle(r.id, "has_blog", !r.has_blog)} className="inline-flex items-center gap-1 text-xs">
                            {r.has_blog ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <Circle className="h-4 w-4 text-muted-foreground" />}
                          </button>
                        </td>
                        <td className="py-2 text-center">
                          <button onClick={() => toggle(r.id, "hnchat_kit_installed", !r.hnchat_kit_installed)} className="inline-flex items-center gap-1 text-xs">
                            {r.hnchat_kit_installed ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <Circle className="h-4 w-4 text-muted-foreground" />}
                          </button>
                        </td>
                        <td className="py-2 text-center">
                          {url ? (
                            <a href={url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                              زيارة <ExternalLink className="h-3 w-3" />
                            </a>
                          ) : <span className="text-muted-foreground">—</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </AdminLayout>
  );
}