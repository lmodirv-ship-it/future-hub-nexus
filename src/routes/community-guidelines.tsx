import { createFileRoute } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/community-guidelines")({
  head: () => ({
    meta: [
      { title: "Community Guidelines — hnChat" },
      { name: "description", content: "إرشادات مجتمع hnChat لاستخدام آمن ومحترم للمنصة." },
      { property: "og:title", content: "Community Guidelines — hnChat" },
      { property: "og:description", content: "Rules for a safe and respectful hnChat community." },
    ],
  }),
  component: GuidelinesPage,
});

const content = {
  ar: {
    title: "إرشادات المجتمع",
    intro:
      "نريد أن يكون hnChat فضاءً آمناً وملهماً للجميع. باستخدامك للمنصة فإنك توافق على الالتزام بالإرشادات التالية.",
    sections: [
      { h: "١. الاحترام المتبادل", p: "تعامل مع الآخرين بأدب. يُمنع التحرش، الكراهية، التمييز، أو التهديد بأي شكل." },
      { h: "٢. المحتوى المسموح", p: "لا تنشر محتوى عنيفاً، إباحياً، يخص قاصرين، أو ينتهك حقوق الآخرين." },
      { h: "٣. الخصوصية", p: "لا تشارك بيانات شخصية لغيرك دون إذن صريح. احترم خصوصية المحادثات." },
      { h: "٤. منع السبام", p: "لا روابط مشبوهة، لا تسويق مضلل، لا حسابات وهمية أو رسائل متكررة." },
      { h: "٥. الذكاء الاصطناعي", p: "استخدم ميزات الذكاء الاصطناعي بمسؤولية. لا تستخدمها لإنشاء محتوى مضلل أو ضار." },
      { h: "٦. الإبلاغ", p: "أبلغ عن أي مخالفة عبر صفحة التواصل. كل البلاغات تُعالج بسرية." },
      { h: "٧. العقوبات", p: "قد نحذف المحتوى المخالف أو نعلّق الحساب أو نحظره نهائياً حسب جسامة المخالفة." },
    ],
  },
  en: {
    title: "Community Guidelines",
    intro:
      "We want hnChat to be a safe and inspiring space for everyone. By using the platform you agree to follow these guidelines.",
    sections: [
      { h: "1. Mutual Respect", p: "Treat others with respect. Harassment, hate speech, discrimination or threats are forbidden." },
      { h: "2. Allowed Content", p: "Do not post violent, sexual, child-related, or rights-infringing content." },
      { h: "3. Privacy", p: "Do not share other people's personal data without explicit consent. Respect chat privacy." },
      { h: "4. No Spam", p: "No suspicious links, misleading marketing, fake accounts or repeated messages." },
      { h: "5. AI Usage", p: "Use AI features responsibly. Do not use them to create misleading or harmful content." },
      { h: "6. Reporting", p: "Report any violation via the contact page. All reports are handled confidentially." },
      { h: "7. Enforcement", p: "We may remove content, suspend or permanently ban accounts depending on severity." },
    ],
  },
  fr: {
    title: "Règles de la communauté",
    intro:
      "Nous voulons que hnChat soit un espace sûr et inspirant pour tous. En utilisant la plateforme, vous acceptez ces règles.",
    sections: [
      { h: "1. Respect mutuel", p: "Traitez les autres avec respect. Harcèlement, haine, discrimination et menaces sont interdits." },
      { h: "2. Contenu autorisé", p: "Ne publiez pas de contenu violent, sexuel, impliquant des mineurs ou portant atteinte aux droits d'autrui." },
      { h: "3. Confidentialité", p: "Ne partagez pas les données personnelles d'autrui sans consentement explicite." },
      { h: "4. Anti-spam", p: "Pas de liens suspects, de marketing trompeur, de faux comptes ou de messages répétés." },
      { h: "5. Usage de l'IA", p: "Utilisez les fonctionnalités d'IA de manière responsable, sans créer de contenu trompeur ou nuisible." },
      { h: "6. Signalement", p: "Signalez toute violation via la page contact. Les signalements sont traités de manière confidentielle." },
      { h: "7. Sanctions", p: "Nous pouvons supprimer du contenu, suspendre ou bannir définitivement un compte selon la gravité." },
    ],
  },
};

function GuidelinesPage() {
  const { lang } = useI18n();
  const c = content[lang] ?? content.ar;
  return (
    <div className="mx-auto max-w-3xl px-6 pt-32 pb-20">
      <div className="glass rounded-2xl p-8 md:p-12">
        <h1 className="font-display text-4xl font-bold neon-text">{c.title}</h1>
        <p className="mt-4 text-sm leading-7 text-foreground/90">{c.intro}</p>
        <div className="mt-8 space-y-6 text-sm leading-7 text-foreground/90">
          {c.sections.map((s) => (
            <section key={s.h}>
              <h2 className="font-display text-xl font-semibold mb-2">{s.h}</h2>
              <p>{s.p}</p>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}