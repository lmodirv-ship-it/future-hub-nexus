import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "ar" | "en";

const dict = {
  ar: {
    "nav.home": "الرئيسية",
    "nav.projects": "المشاريع",
    "nav.services": "الخدمات",
    "nav.admin": "لوحة التحكم",
    "nav.about": "عن المنصة",
    "nav.contact": "تواصل",
    "nav.login": "دخول المدير",
    "nav.logout": "خروج",
    "hero.badge": "{n} مشروع نشط الآن",
    "hero.title1": "HN-Dev",
    "hero.title2": "من المستقبل",
    "hero.desc": "مركز تحكم زجاجي يجمع كل مشاريعك الرقمية في فضاء واحد. منصة، خدمات، ذكاء اصطناعي، تجارة، عقارات، نقل — كل شيء في مكان واحد.",
    "hero.explore": "استكشف المشاريع",
    "hero.admin": "لوحة التحكم",
    "stats.projects": "مشروع",
    "stats.categories": "فئة",
    "stats.services": "خدمة",
    "stats.possibilities": "إمكانية",
    "home.activeTitle": "النشطة",
    "home.activePrefix": "المشاريع",
    "home.activeDesc": "كل أعمالك في مكان واحد، بشكل زجاجي مستقبلي.",
    "home.viewAll": "عرض الكل",
    "footer.tagline": "مركز تحكم موحد لكل مشاريعك الرقمية في فضاء واحد من المستقبل.",
    "footer.platform": "المنصة",
    "footer.ecosystem": "المنظومة",
    "footer.follow": "تابعنا",
    "footer.followText": "HN-Groupe",
    "footer.rights": "HN Groupe — جميع الحقوق محفوظة — El Hassani Moulay Ismail",
    "footer.made": "المصمم ✦ مولاي إسماعيل الحسني",
  },
  en: {
    "nav.home": "Home",
    "nav.projects": "Projects",
    "nav.services": "Services",
    "nav.admin": "Dashboard",
    "nav.about": "About",
    "nav.contact": "Contact",
    "nav.login": "Admin Login",
    "nav.logout": "Logout",
    "hero.badge": "{n} active projects now",
    "hero.title1": "HN-DEV",
    "hero.title2": "from the future",
    "hero.desc": "A glass control center that unites all your digital projects in one space. Platform, services, AI, commerce, real estate, transport — everything in one place.",
    "hero.explore": "Explore Projects",
    "hero.admin": "Dashboard",
    "stats.projects": "Projects",
    "stats.categories": "Categories",
    "stats.services": "Services",
    "stats.possibilities": "Possibilities",
    "home.activeTitle": "Projects",
    "home.activePrefix": "Active",
    "home.activeDesc": "All your work in one place, in futuristic glass style.",
    "home.viewAll": "View All",
    "footer.tagline": "A unified control hub for all your digital projects in one futuristic space.",
    "footer.platform": "Platform",
    "footer.ecosystem": "Ecosystem",
    "footer.follow": "Follow",
    "footer.followText": "HN-Groupe",
    "footer.rights": "HN Groupe — All rights reserved — El Hassani Moulay Ismail",
    "footer.made": "Designer ✦ Moulay Ismail El Hassani",
  },
} as const;

type Key = keyof typeof dict["ar"];

const Ctx = createContext<{ lang: Lang; setLang: (l: Lang) => void; t: (k: Key, vars?: Record<string, string | number>) => string }>({
  lang: "ar",
  setLang: () => {},
  t: (k) => k,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("ar");

  useEffect(() => {
    const saved = (typeof window !== "undefined" && localStorage.getItem("lang")) as Lang | null;
    const initial: Lang = saved === "en" || saved === "ar" ? saved : "ar";
    setLangState(initial);
    document.documentElement.lang = initial;
    document.documentElement.dir = initial === "ar" ? "rtl" : "ltr";
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") {
      localStorage.setItem("lang", l);
      document.documentElement.lang = l;
      document.documentElement.dir = l === "ar" ? "rtl" : "ltr";
    }
  };

  const t = (k: Key, vars?: Record<string, string | number>) => {
    let s: string = (dict[lang] as Record<string, string>)[k] ?? (dict.ar as Record<string, string>)[k] ?? k;
    if (vars) for (const [vk, vv] of Object.entries(vars)) s = s.replace(`{${vk}}`, String(vv));
    return s;
  };

  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>;
}

export const useI18n = () => useContext(Ctx);
