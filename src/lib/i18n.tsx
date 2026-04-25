import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { ar } from "./i18n-locales/ar";
import { en } from "./i18n-locales/en";
import { fr } from "./i18n-locales/fr";
import type { Dict, Key } from "./i18n-locales/keys";

export type Lang = "ar" | "en" | "fr";

export const SUPPORTED_LANGS: Lang[] = ["ar", "en", "fr"];
export const DEFAULT_LANG: Lang = "ar";

const dicts: Record<Lang, Dict> = { ar, en, fr };

const LANG_LABELS: Record<Lang, { native: string; flag: string }> = {
  ar: { native: "العربية", flag: "🇲🇦" },
  en: { native: "English", flag: "🇬🇧" },
  fr: { native: "Français", flag: "🇫🇷" },
};

export function getLangFromPath(pathname: string): Lang {
  const seg = pathname.split("/")[1];
  if (seg === "en" || seg === "fr") return seg;
  return DEFAULT_LANG;
}

export function stripLangFromPath(pathname: string): string {
  const seg = pathname.split("/")[1];
  if (seg === "en" || seg === "fr" || seg === "ar") {
    const rest = pathname.slice(seg.length + 1);
    return rest === "" ? "/" : rest;
  }
  return pathname || "/";
}

export function buildLangPath(lang: Lang, basePath: string): string {
  const clean = basePath.startsWith("/") ? basePath : `/${basePath}`;
  if (lang === DEFAULT_LANG) return clean;
  return `/${lang}${clean === "/" ? "" : clean}`;
}

function setCookie(name: string, value: string, days = 365) {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/; samesite=lax`;
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function detectBrowserLang(): Lang {
  if (typeof navigator === "undefined") return DEFAULT_LANG;
  const langs = navigator.languages?.length ? navigator.languages : [navigator.language];
  for (const l of langs) {
    const code = l.toLowerCase().slice(0, 2);
    if (code === "en" || code === "fr" || code === "ar") return code as Lang;
  }
  return DEFAULT_LANG;
}

const Ctx = createContext<{
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (k: Key, vars?: Record<string, string | number>) => string;
  langLabel: (l: Lang) => { native: string; flag: string };
}>({
  lang: DEFAULT_LANG,
  setLang: () => {},
  t: (k) => k,
  langLabel: (l) => LANG_LABELS[l],
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(DEFAULT_LANG);

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Priority: URL > cookie > localStorage > browser > default
    const fromUrl = getLangFromPath(window.location.pathname);
    const urlSeg = window.location.pathname.split("/")[1];
    const explicit = urlSeg === "en" || urlSeg === "fr" || urlSeg === "ar";

    let initial: Lang = DEFAULT_LANG;
    if (explicit) {
      initial = fromUrl;
    } else {
      const cookie = getCookie("lang") as Lang | null;
      const ls = localStorage.getItem("lang") as Lang | null;
      if (cookie && SUPPORTED_LANGS.includes(cookie)) initial = cookie;
      else if (ls && SUPPORTED_LANGS.includes(ls)) initial = ls;
      else initial = detectBrowserLang();
    }

    setLangState(initial);
    document.documentElement.lang = initial;
    document.documentElement.dir = initial === "ar" ? "rtl" : "ltr";
    setCookie("lang", initial);
    localStorage.setItem("lang", initial);
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") {
      localStorage.setItem("lang", l);
      setCookie("lang", l);
      document.documentElement.lang = l;
      document.documentElement.dir = l === "ar" ? "rtl" : "ltr";
    }
  }, []);

  const t = useCallback(
    (k: Key, vars?: Record<string, string | number>) => {
      let s: string = (dicts[lang] as Record<string, string>)[k] ?? (dicts[DEFAULT_LANG] as Record<string, string>)[k] ?? k;
      if (vars) for (const [vk, vv] of Object.entries(vars)) s = s.replace(`{${vk}}`, String(vv));
      return s;
    },
    [lang],
  );

  const langLabel = useCallback((l: Lang) => LANG_LABELS[l], []);

  const value = useMemo(() => ({ lang, setLang, t, langLabel }), [lang, setLang, t, langLabel]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useI18n = () => useContext(Ctx);
