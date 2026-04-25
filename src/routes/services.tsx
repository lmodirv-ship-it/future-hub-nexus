import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Sparkles, Send, Briefcase, Code, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { buildPageHead } from "@/lib/seo";
import { toast } from "sonner";

export const Route = createFileRoute("/services")({
  head: () => ({
    ...buildPageHead({
      basePath: "/services",
      lang: "ar",
      title: {
        ar: "خدمات احترافية — HN-Dev",
        en: "Professional Services — HN-Dev",
        fr: "Services Professionnels — HN-Dev",
      },
      description: {
        ar: "اطلب موقعاً مخصصاً، تطبيقاً، أو استشارة. تسليم بجودة عالية.",
        en: "Order a custom website, app, or consultation. High-quality delivery.",
        fr: "Commandez un site personnalisé, une application ou une consultation.",
      },
    }),
  }),
  component: ServicesPage,
});

function ServicesPage() {
  const { t } = useI18n();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", service_type: "website", budget_range: "1k-3k", message: "" });

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await supabase.from("service_requests").insert([form]);
    setSubmitting(false);
    if (error) {
      toast.error(t("services.error"));
      return;
    }
    toast.success(t("services.success"));
    setForm({ name: "", email: "", phone: "", service_type: "website", budget_range: "1k-3k", message: "" });
  };

  const services = [
    { icon: Code, key: "website", title: t("services.card.website"), desc: t("services.card.website.from") },
    { icon: Briefcase, key: "saas", title: t("services.card.saas"), desc: t("services.card.saas.from") },
    { icon: MessageCircle, key: "consult", title: t("services.card.consult"), desc: t("services.card.consult.from") },
  ];

  return (
    <section className="relative mx-auto max-w-5xl px-6 pb-24 pt-32">
      <div className="mb-12 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5" />
          {t("services.badge")}
        </div>
        <h1 className="font-display text-4xl font-bold sm:text-5xl">
          {t("services.title.we")} <span className="neon-text">{t("services.title.your")}</span>
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">{t("services.lead")}</p>
      </div>

      <div className="mb-10 grid gap-4 sm:grid-cols-3">
        {services.map((s) => (
          <div key={s.key} className="glass rounded-2xl p-5">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[oklch(0.75_0.2_295)] to-[oklch(0.7_0.28_330)]">
              <s.icon className="h-5 w-5 text-background" />
            </div>
            <h3 className="font-display font-bold">{s.title}</h3>
            <p className="text-sm text-muted-foreground">{s.desc}</p>
          </div>
        ))}
      </div>

      <form onSubmit={onSubmit} className="glass rounded-2xl p-6 space-y-4">
        <h2 className="font-display text-2xl font-bold">{t("services.form.title")}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={t("services.form.name")} className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm" />
          <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder={t("services.form.email")} className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm" />
          <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder={t("services.form.phone")} className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm" />
          <select value={form.service_type} onChange={(e) => setForm({ ...form, service_type: e.target.value })} className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm">
            <option value="website">{t("services.form.type.website")}</option>
            <option value="saas">{t("services.form.type.saas")}</option>
            <option value="consult">{t("services.form.type.consult")}</option>
            <option value="other">{t("services.form.type.other")}</option>
          </select>
          <select value={form.budget_range} onChange={(e) => setForm({ ...form, budget_range: e.target.value })} className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm sm:col-span-2">
            <option value="under-1k">{t("services.form.budget.under1k")}</option>
            <option value="1k-3k">$1,000 — $3,000</option>
            <option value="3k-10k">$3,000 — $10,000</option>
            <option value="10k+">{t("services.form.budget.over10k")}</option>
          </select>
        </div>
        <textarea required rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder={t("services.form.message")} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm" />
        <button disabled={submitting} type="submit" className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[oklch(0.75_0.2_295)] to-[oklch(0.7_0.28_330)] px-6 py-3 text-sm font-semibold text-background neon-glow disabled:opacity-50">
          <Send className="h-4 w-4" />
          {submitting ? t("services.form.sending") : t("services.form.send")}
        </button>
      </form>
    </section>
  );
}
