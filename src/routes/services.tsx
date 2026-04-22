import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Sparkles, Send, Briefcase, Code, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "خدمات احترافية — نكسس" },
      { name: "description", content: "اطلب موقعاً مخصصاً، تطبيقاً، أو استشارة. تسليم بجودة عالية." },
      { property: "og:title", content: "خدمات احترافية — نكسس" },
      { property: "og:description", content: "Done-For-You: نبني لك مشروعك من الصفر." },
    ],
  }),
  component: ServicesPage,
});

function ServicesPage() {
  const { lang } = useI18n();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", service_type: "website", budget_range: "1k-3k", message: "" });

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await supabase.from("service_requests").insert([form]);
    setSubmitting(false);
    if (error) {
      toast.error(lang === "ar" ? "فشل الإرسال — حاول مجدداً" : "Failed — try again");
      return;
    }
    toast.success(lang === "ar" ? "تم استلام طلبك! سنتواصل خلال 24 ساعة." : "Request received! We'll contact you within 24h.");
    setForm({ name: "", email: "", phone: "", service_type: "website", budget_range: "1k-3k", message: "" });
  };

  const services = lang === "ar" ? [
    { icon: Code, key: "website", title: "موقع مخصص", desc: "من 199$" },
    { icon: Briefcase, key: "saas", title: "تطبيق SaaS كامل", desc: "من 999$" },
    { icon: MessageCircle, key: "consult", title: "استشارة ساعة", desc: "49$" },
  ] : [
    { icon: Code, key: "website", title: "Custom website", desc: "From $199" },
    { icon: Briefcase, key: "saas", title: "Full SaaS app", desc: "From $999" },
    { icon: MessageCircle, key: "consult", title: "1h consultation", desc: "$49" },
  ];

  return (
    <section className="relative mx-auto max-w-5xl px-6 pb-24 pt-32">
      <div className="mb-12 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5" />
          {lang === "ar" ? "خدمات احترافية" : "Professional services"}
        </div>
        <h1 className="font-display text-4xl font-bold sm:text-5xl">
          {lang === "ar" ? "نبني لك " : "We build "}
          <span className="neon-text">{lang === "ar" ? "مشروعك" : "your project"}</span>
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
          {lang === "ar" ? "موقع، تطبيق، أو استشارة. أرسل طلبك وسنرد خلال 24 ساعة." : "Website, app, or consultation. Send your request, we reply within 24h."}
        </p>
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
        <h2 className="font-display text-2xl font-bold">{lang === "ar" ? "أرسل طلبك" : "Send your request"}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={lang === "ar" ? "الاسم" : "Name"} className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm" />
          <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder={lang === "ar" ? "البريد" : "Email"} className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm" />
          <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder={lang === "ar" ? "الهاتف (اختياري)" : "Phone (optional)"} className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm" />
          <select value={form.service_type} onChange={(e) => setForm({ ...form, service_type: e.target.value })} className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm">
            <option value="website">{lang === "ar" ? "موقع مخصص" : "Custom website"}</option>
            <option value="saas">{lang === "ar" ? "تطبيق SaaS" : "SaaS app"}</option>
            <option value="consult">{lang === "ar" ? "استشارة" : "Consultation"}</option>
            <option value="other">{lang === "ar" ? "أخرى" : "Other"}</option>
          </select>
          <select value={form.budget_range} onChange={(e) => setForm({ ...form, budget_range: e.target.value })} className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm sm:col-span-2">
            <option value="under-1k">{lang === "ar" ? "أقل من 1000$" : "Under $1,000"}</option>
            <option value="1k-3k">$1,000 — $3,000</option>
            <option value="3k-10k">$3,000 — $10,000</option>
            <option value="10k+">{lang === "ar" ? "أكثر من 10,000$" : "Over $10,000"}</option>
          </select>
        </div>
        <textarea required rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder={lang === "ar" ? "صف مشروعك بالتفصيل..." : "Describe your project..."} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm" />
        <button disabled={submitting} type="submit" className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[oklch(0.75_0.2_295)] to-[oklch(0.7_0.28_330)] px-6 py-3 text-sm font-semibold text-background neon-glow disabled:opacity-50">
          <Send className="h-4 w-4" />
          {submitting ? (lang === "ar" ? "جارٍ الإرسال..." : "Sending...") : (lang === "ar" ? "إرسال الطلب" : "Send request")}
        </button>
      </form>
    </section>
  );
}