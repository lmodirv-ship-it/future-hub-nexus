import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, MessageSquare, Send, Sparkles } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { buildPageHead } from "@/lib/seo";

export const Route = createFileRoute("/contact")({
  head: () => ({
    ...buildPageHead({
      basePath: "/contact",
      lang: "ar",
      title: {
        ar: "تواصل معنا — HN-Dev",
        en: "Contact — HN-Dev",
        fr: "Contact — HN-Dev",
      },
      description: {
        ar: "تواصل مع فريق HN-Dev لأي استفسار أو تعاون.",
        en: "Get in touch with the HN-Dev team for any inquiry or partnership.",
        fr: "Contactez l'équipe HN-Dev pour toute demande ou collaboration.",
      },
    }),
  }),
  component: ContactPage,
});

function ContactPage() {
  const { t } = useI18n();
  const [sent, setSent] = useState(false);

  return (
    <section className="relative mx-auto max-w-4xl px-6 pb-20 pt-32">
      <div className="text-center">
        <h1 className="font-display text-5xl font-bold">
          <span className="neon-text">{t("contact.title.contact")}</span> {t("contact.title.us")}
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">{t("contact.lead")}</p>
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-[1fr_2fr]">
        <div className="space-y-4">
          <div className="glass rounded-2xl p-5">
            <Mail className="h-6 w-6 text-[oklch(0.85_0.18_200)]" />
            <h3 className="mt-3 font-display font-bold">{t("contact.email")}</h3>
            <p className="mt-1 text-sm text-muted-foreground">hello@nexus.app</p>
          </div>
          <div className="glass rounded-2xl p-5">
            <MessageSquare className="h-6 w-6 text-[oklch(0.7_0.28_330)]" />
            <h3 className="mt-3 font-display font-bold">{t("contact.chat")}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{t("contact.chat.text")}</p>
          </div>
          <div className="glass rounded-2xl p-5">
            <Sparkles className="h-6 w-6 text-[oklch(0.65_0.25_290)]" />
            <h3 className="mt-3 font-display font-bold">{t("contact.assistant")}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{t("contact.assistant.text")}</p>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSent(true);
          }}
          className="glass rounded-2xl p-6"
        >
          {sent ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[oklch(0.85_0.18_200)] to-[oklch(0.65_0.25_290)] neon-glow-cyan">
                <Send className="h-7 w-7 text-background" />
              </div>
              <h3 className="mt-4 font-display text-2xl font-bold">{t("contact.sent.title")}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{t("contact.sent.text")}</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium">{t("contact.form.name")}</label>
                <input
                  required
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none transition-colors focus:border-[oklch(0.65_0.25_290)]"
                  placeholder={t("contact.form.namePlaceholder")}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">{t("contact.form.email")}</label>
                <input
                  type="email"
                  required
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none transition-colors focus:border-[oklch(0.65_0.25_290)]"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">{t("contact.form.message")}</label>
                <textarea
                  required
                  rows={5}
                  className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none transition-colors focus:border-[oklch(0.65_0.25_290)]"
                  placeholder={t("contact.form.messagePlaceholder")}
                />
              </div>
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[oklch(0.75_0.2_295)] to-[oklch(0.7_0.28_330)] px-6 py-3 font-medium text-background neon-glow transition-transform hover:scale-[1.02]"
              >
                <Send className="h-4 w-4" />
                {t("contact.form.submit")}
              </button>
            </div>
          )}
        </form>
      </div>
    </section>
  );
}
