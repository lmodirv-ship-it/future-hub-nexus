import { SUPPORTED_LANGS, type Lang, buildLangPath, DEFAULT_LANG } from "./i18n";

export const SITE_URL = "https://www.slavacall-hiba.online";
export const SITE_NAME = "HN-Dev";

/**
 * Generate alternate <link rel="alternate" hreflang="..."/> entries
 * for a given canonical (language-agnostic) path like "/services" or "/".
 */
export function buildHreflangLinks(basePath: string): Array<{ rel: string; hreflang?: string; href: string }> {
  const links: Array<{ rel: string; hreflang?: string; href: string }> = [];
  for (const l of SUPPORTED_LANGS) {
    links.push({
      rel: "alternate",
      hreflang: l === "ar" ? "ar" : l,
      href: `${SITE_URL}${buildLangPath(l, basePath)}`,
    });
  }
  links.push({
    rel: "alternate",
    hreflang: "x-default",
    href: `${SITE_URL}${buildLangPath(DEFAULT_LANG, basePath)}`,
  });
  return links;
}

/** Canonical URL for the current page in the current language. */
export function buildCanonical(lang: Lang, basePath: string): string {
  return `${SITE_URL}${buildLangPath(lang, basePath)}`;
}

/**
 * Build the full set of meta+links for a page, given its base path
 * and per-language title/description. Use inside route head().
 */
export function buildPageHead(args: {
  basePath: string;
  lang: Lang;
  title: Record<Lang, string>;
  description: Record<Lang, string>;
  image?: string;
}) {
  const { basePath, lang, title, description, image } = args;
  const meta = [
    { title: title[lang] },
    { name: "description", content: description[lang] },
    { property: "og:title", content: title[lang] },
    { property: "og:description", content: description[lang] },
    { property: "og:url", content: buildCanonical(lang, basePath) },
    { property: "og:locale", content: lang === "ar" ? "ar_MA" : lang === "fr" ? "fr_FR" : "en_US" },
    { property: "og:site_name", content: SITE_NAME },
    { name: "twitter:title", content: title[lang] },
    { name: "twitter:description", content: description[lang] },
  ];
  if (image) {
    meta.push({ property: "og:image", content: image });
    meta.push({ name: "twitter:image", content: image });
  }

  const links: Array<{ rel: string; hreflang?: string; href: string }> = [
    { rel: "canonical", href: buildCanonical(lang, basePath) },
    ...buildHreflangLinks(basePath),
  ];

  return { meta, links };
}

/** Organization schema (static, used in __root). */
export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "HN-Dev",
    legalName: "HN Groupe",
    url: SITE_URL,
    logo: `${SITE_URL}/favicon.ico`,
    founder: {
      "@type": "Person",
      name: "Moulay Ismail El Hassani",
    },
    sameAs: [],
  };
}

/** WebSite schema with SearchAction. */
export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: ["ar-MA", "en-US", "fr-FR"],
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/projects?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}