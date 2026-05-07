import { createFileRoute, Link } from "@tanstack/react-router";
import { MessageCircle, Shield, Sparkles, Globe2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/about-hnchat")({
  head: () => ({
    meta: [
      { title: "About hnChat — منصة محادثة ذكية" },
      { name: "description", content: "تعرّف على hnChat: منصة محادثة ذكية متعددة اللغات بتصميم حديث ومعايير خصوصية عالية." },
      { property: "og:title", content: "About hnChat" },
      { property: "og:description", content: "Smart, multilingual chat platform with privacy-first design." },
    ],
  }),
  component: AboutHnChat,
});

const copy = {
  ar: {
    title: "عن hnChat",
    lead: "hnChat منصة محادثة ذكية متعددة اللغات، مصمّمة بهوية داكنة عصرية ومعايير خصوصية صارمة.",
    items: [
      { icon: MessageCircle, h: "محادثات ذكية", p: "ذكاء اصطناعي متقدم لمحادثات طبيعية وسريعة." },
      { icon: Shield, h: "خصوصية أولاً", p: "تشفير كامل والتزام بمعايير GDPR." },
      { icon: Globe2, h: "متعدد اللغات", p: "دعم العربية، الإنجليزية، والفرنسية بسلاسة." },
      { icon: Sparkles, h: "تصميم احترافي", p: "واجهة زجاجية أنيقة بتجربة مستخدم متطورة." },
    ],
    cta: "تواصل معنا",
  },
  en: {
    title: "About hnChat",
    lead: "hnChat is a smart, multilingual chat platform with a modern dark identity and strict privacy standards.",
    items: [
      { icon: MessageCircle, h: "Smart Conversations", p: "Advanced AI for fast, natural conversations." },
      { icon: Shield, h: "Privacy First", p: "Full encryption and GDPR compliance." },
      { icon: Globe2, h: "Multilingual", p: "Seamless Arabic, English and French support." },
      { icon: Sparkles, h: "Premium Design", p: "Elegant glass UI with refined UX." },
    ],
    cta: "Contact us",
  },
  fr: {
    title: "À propos de hnChat",
    lead: "hnChat est une plateforme de chat intelligente, multilingue, à l'identité sombre moderne et aux standards de confidentialité stricts.",
    items: [
      { icon: MessageCircle, h: "Conversations intelligentes", p: "IA avancée pour des échanges naturels et rapides." },
      { icon: Shield, h: "Confidentialité d'abord", p: "Chiffrement complet et conformité RGPD." },
      { icon: Globe2, h: "Multilingue", p: "Support fluide de l'arabe, l'anglais et du français." },
      { icon: Sparkles, h: "Design premium", p: "Interface verre élégante et UX raffinée." },
    ],
    cta: "Nous contacter",
  },
};

function AboutHnChat() {
  const { lang } = useI18n();
  const c = copy[lang] ?? copy.ar;
  return (
    <section className="relative mx-auto max-w-4xl px-6 pb-20 pt-32">
      <div className="text-center">
        <h1 className="font-display text-5xl font-bold sm:text-6xl">
          <span className="neon-text">{c.title}</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">{c.lead}</p>
      </div>
      <div className="mt-16 grid gap-4 sm:grid-cols-2">
        {c.items.map((v) => (
          <div key={v.h} className="glass card-hover rounded-2xl p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[oklch(0.75_0.2_295)] to-[oklch(0.7_0.28_330)] neon-glow">
              <v.icon className="h-6 w-6 text-background" />
            </div>
            <h3 className="mt-4 font-display text-xl font-bold">{v.h}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{v.p}</p>
          </div>
        ))}
      </div>
      <div className="mt-12 text-center">
        <Link
          to="/contact"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[oklch(0.75_0.2_295)] to-[oklch(0.7_0.28_330)] px-6 py-3 font-medium text-background neon-glow transition-transform hover:scale-105"
        >
          {c.cta}
        </Link>
      </div>
    </section>
  );
}