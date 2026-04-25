// Central type that defines every translation key. Add new keys here first,
// then add the actual strings in ar.ts / en.ts / fr.ts.
export type Dict = {
  // Navigation
  "nav.home": string;
  "nav.projects": string;
  "nav.services": string;
  "nav.admin": string;
  "nav.about": string;
  "nav.contact": string;
  "nav.pricing": string;
  "nav.marketplace": string;
  "nav.login": string;
  "nav.logout": string;
  "nav.menu": string;

  // Hero / Home
  "hero.badge": string;
  "hero.title1": string;
  "hero.title2": string;
  "hero.desc": string;
  "hero.explore": string;
  "hero.admin": string;
  "stats.projects": string;
  "stats.categories": string;
  "stats.services": string;
  "stats.possibilities": string;
  "home.activeTitle": string;
  "home.activePrefix": string;
  "home.activeDesc": string;
  "home.viewAll": string;

  // Footer
  "footer.tagline": string;
  "footer.platform": string;
  "footer.ecosystem": string;
  "footer.follow": string;
  "footer.followText": string;
  "footer.rights": string;
  "footer.made": string;

  // About
  "about.title.we": string;
  "about.title.brand": string;
  "about.lead": string;
  "about.value.unify": string;
  "about.value.unify.text": string;
  "about.value.elegance": string;
  "about.value.elegance.text": string;
  "about.value.speed": string;
  "about.value.speed.text": string;
  "about.value.global": string;
  "about.value.global.text": string;
  "about.vision.title": string;
  "about.vision.text": string;
  "about.cta.explore": string;
  "about.meta.title": string;
  "about.meta.desc": string;

  // Contact
  "contact.title.contact": string;
  "contact.title.us": string;
  "contact.lead": string;
  "contact.email": string;
  "contact.chat": string;
  "contact.chat.text": string;
  "contact.assistant": string;
  "contact.assistant.text": string;
  "contact.form.name": string;
  "contact.form.namePlaceholder": string;
  "contact.form.email": string;
  "contact.form.message": string;
  "contact.form.messagePlaceholder": string;
  "contact.form.submit": string;
  "contact.sent.title": string;
  "contact.sent.text": string;
  "contact.meta.title": string;
  "contact.meta.desc": string;

  // Services
  "services.badge": string;
  "services.title.we": string;
  "services.title.your": string;
  "services.lead": string;
  "services.card.website": string;
  "services.card.website.from": string;
  "services.card.saas": string;
  "services.card.saas.from": string;
  "services.card.consult": string;
  "services.card.consult.from": string;
  "services.form.title": string;
  "services.form.name": string;
  "services.form.email": string;
  "services.form.phone": string;
  "services.form.type.website": string;
  "services.form.type.saas": string;
  "services.form.type.consult": string;
  "services.form.type.other": string;
  "services.form.budget.under1k": string;
  "services.form.budget.over10k": string;
  "services.form.message": string;
  "services.form.send": string;
  "services.form.sending": string;
  "services.success": string;
  "services.error": string;
  "services.meta.title": string;
  "services.meta.desc": string;

  // Pricing
  "pricing.badge": string;
  "pricing.title.plans": string;
  "pricing.title.stage": string;
  "pricing.lead": string;
  "pricing.popular": string;
  "pricing.month": string;
  "pricing.startFree": string;
  "pricing.subscribe": string;
  "pricing.custom.text": string;
  "pricing.custom.contact": string;
  "pricing.toast.free": string;
  "pricing.toast.gateway": string;
  "pricing.meta.title": string;
  "pricing.meta.desc": string;

  // Projects
  "projects.title": string;
  "projects.lead": string;
  "projects.empty": string;
  "projects.meta.title": string;
  "projects.meta.desc": string;

  // Marketplace
  "marketplace.title": string;
  "marketplace.lead": string;
  "marketplace.cta": string;
  "marketplace.meta.title": string;
  "marketplace.meta.desc": string;

  // Legal
  "legal.privacy.title": string;
  "legal.terms.title": string;
  "legal.refund.title": string;

  // Login
  "login.title": string;
  "login.email": string;
  "login.password": string;
  "login.submit": string;
  "login.with.google": string;
  "login.signup": string;
  "login.haveAccount": string;

  // Cookie consent
  "cookie.text": string;
  "cookie.accept": string;
  "cookie.decline": string;

  // 404
  "notFound.title": string;
  "notFound.text": string;
  "notFound.home": string;

  // Common
  "common.loading": string;
  "common.error": string;
  "common.retry": string;
};

export type Key = keyof Dict;