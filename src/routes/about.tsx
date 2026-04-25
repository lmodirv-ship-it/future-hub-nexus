import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles, Layers, Globe, Zap } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "عن المنصة — HN-Dev" },
      { name: "description", content: "قصة منصة HN-Dev ورؤيتها لتوحيد كل المشاريع الرقمية في فضاء واحد." },
      { property: "og:title", content: "عن HN-Dev" },
      { property: "og:description", content: "رؤية مستقبلية لمركز تحكم رقمي موحد." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  const values = [
    { icon: Layers, title: "توحيد", text: "كل أعمالك في مكان واحد، بدون تشتت." },
    { icon: Sparkles, title: "أناقة", text: "تصميم زجاجي مستقبلي يلهم الإبداع." },
    { icon: Zap, title: "سرعة", text: "وصول فوري لأي مشروع أو خدمة." },
    { icon: Globe, title: "شمولية", text: "تغطي AI، تجارة، عقارات، نقل، وأكثر." },
  ];

  return (
    <section className="relative mx-auto max-w-4xl px-6 pb-20 pt-32">
      <div className="text-center">
        <h1 className="font-display text-5xl font-bold sm:text-6xl">
          نحن <span className="neon-text">HN-Dev</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          نؤمن بأن المستقبل الرقمي يجب أن يكون موحداً، أنيقاً، وفي متناول اليد.
          HN-Dev هو الجسر الذي يربط بين كل أفكارك ومشاريعك في فضاء زجاجي واحد.
        </p>
      </div>

      <div className="mt-16 grid gap-4 sm:grid-cols-2">
        {values.map((v) => (
          <div key={v.title} className="glass card-hover rounded-2xl p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[oklch(0.75_0.2_295)] to-[oklch(0.7_0.28_330)] neon-glow">
              <v.icon className="h-6 w-6 text-background" />
            </div>
            <h3 className="mt-4 font-display text-xl font-bold">{v.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{v.text}</p>
          </div>
        ))}
      </div>

      <div className="glass mt-12 rounded-2xl p-8 text-center">
        <h2 className="font-display text-2xl font-bold">رؤيتنا</h2>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          أن نكون البوابة الموحدة لكل صانع رقمي — حيث يلتقي الإبداع بالتنظيم،
          والجمال بالوظيفة، والحاضر بالمستقبل.
        </p>
        <Link
          to="/projects"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[oklch(0.75_0.2_295)] to-[oklch(0.7_0.28_330)] px-6 py-3 font-medium text-background neon-glow transition-transform hover:scale-105"
        >
          استكشف المشاريع
        </Link>
      </div>
    </section>
  );
}